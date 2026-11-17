/**
 * EMS 公開轉送器（ems/server.mjs）的 cookie 邊界：
 * twin 路由只收到 ems_bff_session，BFF 路由照舊收到工作階段與提示 cookie（EMS ADR-060）。
 * 轉送器從副本執行，日誌寫在暫存目錄，不碰 ems/logs。
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { copyFile, mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ems = fileURLToPath(new URL('../ems/', import.meta.url));

function stub(handler) {
  const seen = [];
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => { seen.push({ method: req.method, url: req.url, headers: req.headers, body }); handler(req, res); });
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok({ server, seen, port: server.address().port })));
}
const freePort = () => new Promise((ok) => { const s = http.createServer().listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => ok(port)); }); });

test('twin routes receive only ems_bff_session; BFF routes keep both EMS cookies', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'ems-relay-'));
  const bff = await stub((req, res) => {
    const ops = /(?:^|; )ems_bff_session=ops-cookie(?:;|$)/.test(req.headers.cookie || '');
    res.writeHead(ops ? 200 : 401, { 'content-type': 'application/json' });
    res.end(JSON.stringify(ops ? { username: 'fixture', role: 'ops' } : { detail: 'unauthenticated' }));
  });
  const twin = await stub((req, res) => { res.writeHead(200, { 'content-type': 'application/json' }); res.end('{}'); });
  let relay;
  t.after(async () => {
    relay?.kill();
    await new Promise((ok) => bff.server.close(ok));
    await new Promise((ok) => twin.server.close(ok));
    await rm(dir, { recursive: true, force: true });
  });
  for (const name of ['server.mjs', 'water-policy.mjs']) await copyFile(join(ems, name), join(dir, name));
  await mkdir(join(dir, 'release', 'public'), { recursive: true });
  await writeFile(join(dir, 'release', 'public', 'index.html'), '<!doctype html><title>EMS</title>');
  await mkdir(join(dir, 'release', 'public', 'skyline'));
  await writeFile(join(dir, 'release', 'public', 'skyline', 'basin.webp'), 'RIFF');
  await writeFile(join(dir, 'release', 'manifest.json'), JSON.stringify({ files: [{ path: 'index.html' }, { path: 'skyline/basin.webp' }] }));
  const port = await freePort();
  await writeFile(join(dir, 'config.json'), JSON.stringify({
    port, tailscaleAddress: '127.0.0.2', release: 'release', dajiaTwin: true,
    bffTarget: `http://127.0.0.1:${bff.port}`, twinTarget: `http://127.0.0.1:${twin.port}`,
  }));
  relay = spawn(process.execPath, [join(dir, 'server.mjs'), 'config.json'], { stdio: 'ignore' });
  const base = `http://127.0.0.1:${port}/ems`;
  for (let i = 0; ; i++) {
    try { if ((await fetch(base + '/')).ok) break; } catch {}
    assert.ok(i < 100, 'relay did not start');
    await new Promise((ok) => setTimeout(ok, 100));
  }
  const page = await fetch(base + '/');
  assert.match(page.headers.get('content-security-policy'), /connect-src 'self' https:\/\/api\.open-meteo\.com;/, 'login weather is the only extra connection');
  const texture = await fetch(base + '/skyline/basin.webp');
  assert.equal(texture.status, 200);
  assert.equal(texture.headers.get('content-type'), 'image/webp');
  const cookie = 'theme=dark; ems_bff_session=ops-cookie; ems_hint_device=hint-cap; other=1';

  assert.equal((await fetch(base + '/api/twin/state', { headers: { cookie } })).status, 200);
  // A relay without twinTarget would reach the shared 127.0.0.1:4783 twin; stop before any POST.
  assert.equal(twin.seen.length, 1, 'relay must honour twinTarget before this test sends commands');
  assert.equal(twin.seen.at(-1).headers.cookie, 'ems_bff_session=ops-cookie');

  assert.equal((await fetch(base + '/api/twin/state', { headers: { cookie: 'theme=dark; ems_hint_device=hint-cap' } })).status, 200);
  assert.equal(twin.seen.at(-1).headers.cookie, undefined, 'no session means no cookie header at the twin');

  const post = await fetch(base + '/api/twin/command', { method: 'POST', body: '{"action":"meter","cut":true,"run":"live"}',
    headers: { cookie, origin: `http://127.0.0.1:${port}`, 'content-type': 'application/json' } });
  assert.equal(post.status, 200);
  assert.equal(bff.seen.at(-1).headers.cookie, 'ems_bff_session=ops-cookie; ems_hint_device=hint-cap', 'the OPS check is unchanged');
  assert.equal(twin.seen.at(-1).headers.cookie, 'ems_bff_session=ops-cookie');
  assert.equal(twin.seen.at(-1).headers.origin, `http://127.0.0.1:${twin.port}`);

  const before = twin.seen.length;
  assert.equal((await fetch(base + '/api/auth/session', { headers: { cookie } })).status, 200);
  assert.equal(bff.seen.at(-1).headers.cookie, 'ems_bff_session=ops-cookie; ems_hint_device=hint-cap');
  assert.equal(twin.seen.length, before, 'BFF routes never reach the twin');
});
