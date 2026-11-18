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
const roles = { 'ops-cookie': 'ops', 'readonly-cookie': 'readonly' };
const json = (res) => { res.writeHead(200, { 'content-type': 'application/json' }); res.end('{}'); };

// Starts a copy of the relay between a stub BFF (sessions above) and a stub twin.
async function relayFixture(t, twinHandler = (req, res) => json(res)) {
  const dir = await mkdtemp(join(tmpdir(), 'ems-relay-'));
  const bff = await stub((req, res) => {
    const role = roles[/(?:^|; )ems_bff_session=([^;]*)/.exec(req.headers.cookie || '')?.[1]];
    res.writeHead(role ? 200 : 401, { 'content-type': 'application/json' });
    res.end(JSON.stringify(role ? { username: 'fixture', role } : { detail: 'unauthenticated' }));
  });
  const twin = await stub(twinHandler);
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
  return { base, port, bff, twin };
}

test('twin routes receive only ems_bff_session; BFF routes keep both EMS cookies', async (t) => {
  const { base, port, bff, twin } = await relayFixture(t);
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

test('forecast and journal reads reach the twin; reports need OPS and keep their download headers', async (t) => {
  const id = 'ops-' + 'a1'.repeat(12);
  const pdf = Buffer.from('%PDF-1.7 fixture');
  const { base, port, bff, twin } = await relayFixture(t, (req, res) => {
    if (req.method === 'POST' && req.url === '/api/twin/documents') {
      res.writeHead(201, { 'content-type': 'application/json', location: '/api/twin/documents/' + id });
      res.end(JSON.stringify({ id }));
    } else if (req.url.endsWith('/files/report.pdf')) {
      res.writeHead(200, { 'content-type': 'application/pdf', 'content-length': pdf.length, 'content-disposition': `attachment; filename="${id}-report.pdf"` });
      res.end(pdf);
    } else json(res);
  });
  const get = (path, cookie) => fetch(base + path, { headers: cookie ? { cookie } : {} });
  const post = (path, cookie, body) => fetch(base + path, { method: 'POST', body,
    headers: { cookie, origin: `http://127.0.0.1:${port}`, 'content-type': 'application/json' } });
  const ops = 'ems_bff_session=ops-cookie; ems_hint_device=hint-cap';

  // Reads open to every signed-in role: the twin confirms the session itself, so the relay adds no check.
  for (const path of ['/api/twin/forecast', '/api/twin/journal?id=incident-4']) {
    const checks = bff.seen.length;
    assert.equal((await get(path, 'theme=dark; ems_bff_session=readonly-cookie')).status, 200, path);
    assert.equal(twin.seen.at(-1).url, path);
    assert.equal(twin.seen.at(-1).headers.cookie, 'ems_bff_session=readonly-cookie');
    assert.equal(bff.seen.length, checks, path + ' is not checked twice');
  }
  // A relay without twinTarget would reach the shared 127.0.0.1:4783 twin; stop before creating a report.
  assert.equal(twin.seen.length, 2, 'relay must honour twinTarget before this test creates a report');

  const reached = twin.seen.length;
  assert.equal((await get('/api/twin/documents')).status, 401);
  assert.equal((await get('/api/twin/benefits?period=today', 'ems_bff_session=readonly-cookie')).status, 403);
  assert.equal((await post('/api/twin/documents', 'ems_bff_session=readonly-cookie', '{"from":"2026-11-01","to":"2026-11-17"}')).status, 403);
  assert.equal(twin.seen.length, reached, 'reports stop at the relay without an OPS session');

  assert.equal((await get('/api/twin/benefits?period=today', ops)).status, 200);
  assert.equal(twin.seen.at(-1).url, '/api/twin/benefits?period=today');
  assert.equal(twin.seen.at(-1).headers.cookie, 'ems_bff_session=ops-cookie');
  assert.equal(bff.seen.at(-1).headers.cookie, ops, 'the OPS check is the one used for commands');
  assert.equal((await get('/api/twin/documents', ops)).status, 200);
  assert.equal((await get('/api/twin/documents/bill-11402-v1', ops)).status, 200);

  const created = await post('/api/twin/documents', ops, '{"from":"2026-11-01","to":"2026-11-17"}');
  assert.equal(created.status, 201);
  assert.equal(created.headers.get('location'), '/ems/api/twin/documents/' + id, 'Location stays under /ems/');
  assert.equal(twin.seen.at(-1).headers.origin, `http://127.0.0.1:${twin.port}`);
  assert.equal(twin.seen.at(-1).body, '{"from":"2026-11-01","to":"2026-11-17"}');

  const file = await get(`/api/twin/documents/${id}/files/report.pdf`, ops);
  assert.equal(file.status, 200);
  assert.equal(file.headers.get('content-type'), 'application/pdf');
  assert.equal(file.headers.get('content-length'), String(pdf.length));
  assert.equal(file.headers.get('content-disposition'), `attachment; filename="${id}-report.pdf"`);
  assert.deepEqual(Buffer.from(await file.arrayBuffer()), pdf);

  const allowed = twin.seen.length;
  for (const path of [`/api/twin/documents/${id}/files/secret.txt`, `/api/twin/documents/${id}/files`, '/api/twin/documents/ops-zz/files/report.pdf',
    `/api/twin/documents/${id}/files/report.pdf/x`, '/api/twin/benefits/today', '/api/twin/journal/incident-4']) {
    assert.equal((await get(path, ops)).status, 404, path);
  }
  assert.equal((await post('/api/twin/journal', ops, '{}')).status, 404, 'journal entries are written through command only');
  assert.equal((await post('/api/twin/benefits', ops, '{}')).status, 404);
  assert.equal(twin.seen.length, allowed, 'other twin paths stay closed');
});
