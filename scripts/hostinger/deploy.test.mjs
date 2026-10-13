import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { sha, STATE, GUIDE } from './core.mjs';
import { prepareCleanup, prune, verifySnapshot, deploy, audit } from './deploy.mjs';

async function setup() {
  const work = await mkdtemp(join(tmpdir(), 'hostinger-test-'));
  const route = 'RewriteRule ^$ /synaiq-release-new/index.html [L]\n';
  const records = ['new', 'second', 'third', 'old'].map(s => {
    const name = `synaiq-release-${s}`;
    return { name, dirs: [name], files: [{ path: `${name}/index.html`, size: 4, sha256: sha('test') }] };
  });
  const state = { schema: 1, active: records[0].name, routingSha256: sha(route), releases: records };
  const remote = new Map(records.flatMap(r => r.files.map(f => [f.path, Buffer.from('test')])));
  remote.set('.htaccess', Buffer.from(route)); remote.set(STATE, Buffer.from(JSON.stringify(state, null, 2)));
  const deleted = [], guards = [], config = { keepReleases: 3 };
  const client = {
    read: async path => { assert.ok(remote.has(path)); return remote.get(path); },
    guard: async (path, expected) => { assert.equal(sha(remote.get(path)), expected); guards.push(path); },
    tree: async name => ({ dirs: [name], files: [...remote].filter(([p]) => p.startsWith(name + '/')).map(([path, bytes]) => ({ path, size: bytes.length })) }),
    removeRelease: async name => { deleted.push(name); remote.delete(`${name}/index.html`); },
    replace: async (path, bytes, expected) => { assert.equal(sha(remote.get(path)), expected); remote.set(path, bytes); },
  };
  return { work, config, state, remote, client, deleted, guards };
}
async function receipt(f) {
  await prepareCleanup(f.client, f.config, f.work, f.state);
  const archive = Buffer.from('encrypted-test-archive'); await writeFile(join(f.work, 'backup.tar.gz.enc'), archive);
  return { status: 'download-verified', tag: 'test-backup', archiveSha256: sha(archive), planSha256: sha(await readFile(join(f.work, 'cleanup-plan.json'))) };
}
test('prune cannot begin without a verified durable archive', async () => {
  const f = await setup();
  await assert.rejects(prune(f.client, f.config, f.work, f.state, { status: 'uploaded-only' }, 'test'));
  assert.deepEqual(f.deleted, []);
});
test('prune stops if either a retained file or the obsolete backup changed', async () => {
  for (const kind of ['retained', 'backup', 'routing']) {
    const f = await setup(), proof = await receipt(f);
    if (kind === 'retained') f.remote.set('synaiq-release-second/index.html', Buffer.from('edit'));
    if (kind === 'backup') await writeFile(join(f.work, 'backup', 'synaiq-release-old', 'index.html'), 'edit');
    if (kind === 'routing') f.remote.set('.htaccess', Buffer.from('changed by someone else'));
    await assert.rejects(prune(f.client, f.config, f.work, f.state, proof, 'test'));
    assert.deepEqual(f.deleted, []);
  }
});
test('successful cleanup deletes only the fourth successful release and preserves routing', async () => {
  const f = await setup(), proof = await receipt(f), route = f.remote.get('.htaccess');
  const next = await prune(f.client, f.config, f.work, f.state, proof, 'test');
  assert.deepEqual(f.deleted, ['synaiq-release-old']);
  assert.deepEqual(next.releases.map(r => r.name), ['synaiq-release-new', 'synaiq-release-second', 'synaiq-release-third']);
  assert.deepEqual(f.remote.get('.htaccess'), route);
  assert.ok(f.guards.includes('.htaccess') && f.guards.includes(STATE));
});
test('audit stops before any upload when a recorded release is missing or changed', async () => {
  for (const damage of ['none', 'missing', 'changed']) {
    const f = await setup(); f.remote.set(GUIDE, Buffer.from('guide'));
    f.client.meta = async (path = '', missing = false) => {
      if (path === '') return { items: [] };
      if (f.remote.has(path) || [...f.remote.keys()].some(p => p.startsWith(`${path}/`))) return { isDir: !f.remote.has(path) };
      if (missing) return null;
      throw new assert.AssertionError({ message: `${path}: metadata HTTP 404` });
    };
    if (damage === 'missing') f.remote.delete('synaiq-release-old/index.html');
    if (damage === 'changed') f.remote.set('synaiq-release-third/extra.html', Buffer.from('test'));
    const result = audit(f.client, f.config, f.work);
    if (damage === 'none') assert.equal((await result).state.releases.length, 4);
    else await assert.rejects(result, damage === 'missing' ? /recorded release is missing/ : /file list changed/);
  }
});
test('snapshot verification rejects extra files before accepting content hashes', async () => {
  const f = await setup(); f.remote.set('synaiq-release-new/untracked.php', Buffer.from('test'));
  await assert.rejects(verifySnapshot(f.client, f.state.releases[0]));
});

test('a failed live check rolls back known routing without deleting releases', async () => {
  const f = await setup(), current = f.state.active;
  const route = `RewriteRule ^$ /${current}/index.html [L]\nRewriteRule ^robots\\.txt$ /${current}/robots.txt [L]\nRewriteRule ^sitemap\\.xml$ /${current}/sitemap.xml [L]\n# Only inspected static releases remain public.\nRewriteRule ^${current}/(?:index\\.html)$ - [L]\nRewriteRule ^ - [G,L]\n# Active folder: ${current};\nHeader always set Cache-Control "no-cache, must-revalidate"\n`;
  f.remote.set('.htaccess', Buffer.from(route)); f.remote.set(GUIDE, Buffer.from('original guide'));
  const manifest = { release: 'synaiq-release-candidate', sourceCommit: 'a'.repeat(40), files: ['index.html', 'page.html', 'robots.txt', 'sitemap.xml'].map(path => ({ path, sha256: sha('new'), size: 3 })) };
  await mkdir(join(f.work, 'artifact'));
  for (const file of manifest.files) await writeFile(join(f.work, 'artifact', file.path), 'new');
  await writeFile(join(f.work, 'browser-local.json'), JSON.stringify({ status: 'passed', release: manifest.release, sourceCommit: manifest.sourceCommit }));
  const before = { route: Buffer.from(route), guide: Buffer.from('original guide'), state: f.state, stateBytes: f.remote.get(STATE) };
  f.client.meta = async path => f.remote.has(path) ? {} : null;
  f.client.upload = async (path, bytes) => f.remote.set(path, bytes);
  let purges = 0; f.client.purge = async () => { purges++; };
  const services = {
    audit: async () => before,
    publicChecks: async () => {},
    verifyPublicAssets: async () => {},
    smoke: async (_manifest, _work, _origin, mode) => { if (mode === 'live') throw Error('simulated broken page'); },
    request: async () => new Response('test'),
  };
  await assert.rejects(deploy(f.client, f.config, f.work, manifest, 'test', services), /simulated broken page/);
  assert.equal(f.remote.get('.htaccess').toString(), route);
  assert.equal(f.remote.get(GUIDE).toString(), 'original guide');
  assert.deepEqual(f.deleted, []); assert.equal(purges, 2);
  assert.equal(JSON.parse(await readFile(join(f.work, 'rollback.json'))).status, 'verified');
});
