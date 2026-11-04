import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { cleanUnmanaged } from './hostinger-unmanaged.mjs';
import { sha, STATE, GUIDE } from '../hostinger/core.mjs';

async function fixture(damage) {
  const work = await mkdtemp(join(tmpdir(), 'unmanaged-'));
  const keep = 'synaiq-release-current', targets = ['synaiq-release-failed', 'synaiq-release-abandoned'];
  const route = Buffer.from(`RewriteRule ^$ /${keep}/index.html [L]\n`), guide = Buffer.from('private guide');
  const remote = new Map([[`${keep}/index.html`, Buffer.from(damage === 'dependency' ? targets[0] : 'current')], ...targets.map(name => [`${name}/index.html`, Buffer.from('unused')])]);
  const record = name => ({ name, dirs: [name], files: [...remote].filter(([p]) => p.startsWith(name + '/')).map(([path, bytes]) => ({ path, size: bytes.length, sha256: sha(bytes) })) });
  const state = { active: keep, releases: [record(keep)] }, stateBytes = Buffer.from(JSON.stringify(state));
  remote.set('.htaccess', route); remote.set(STATE, stateBytes); remote.set(GUIDE, guide);
  const plan = { active: keep, routingSha256: sha(route), stateSha256: sha(stateBytes), targets: targets.map(name => ({ name, files: 1, bytes: 6 })) };
  const deleted = [], events = [];
  const client = {
    read: async path => { assert.ok(remote.has(path), path); return remote.get(path); },
    tree: async name => ({ dirs: [name], files: record(name).files.map(({ path, size }) => ({ path, size })) }),
    guard: async (path, expected) => assert.equal(sha(remote.get(path)), expected),
    meta: async path => [...remote.keys()].some(p => p.startsWith(path + '/')) ? {} : null,
    removeRelease: async name => { events.push('delete'); deleted.push(name); for (const p of remote.keys()) if (p.startsWith(name + '/')) remote.delete(p); },
  };
  const services = {
    audit: async () => ({ route, guide, state, stateBytes, unmanaged: damage === 'extra-target' ? [...targets, 'synaiq-release-other'] : targets }),
    publishBackup: async () => {
      events.push('backup');
      const archive = Buffer.from('verified encrypted archive'); await writeFile(join(work, 'backup.tar.gz.enc'), archive);
      if (damage === 'state') remote.set(STATE, Buffer.from('changed'));
      if (damage === 'retained') remote.set(`${keep}/index.html`, Buffer.from('changed'));
      if (damage === 'target') remote.set(`${targets[1]}/index.html`, Buffer.from('edited'));
      if (damage === 'backup') await writeFile(join(work, 'backup', targets[1], 'index.html'), 'edited');
      return { status: damage === 'receipt' ? 'uploaded-only' : 'download-verified', tag: 'backup-test', archiveSha256: sha(archive), planSha256: sha(await readFile(join(work, 'cleanup-plan.json'))) };
    },
    publicChecks: async () => events.push('public-verified'),
    publishEvidence: async () => events.push('evidence'),
  };
  return { work, client, plan, services, deleted, remote, route, stateBytes, guide, events };
}

test('cleanup backs up before deleting only reviewed unmanaged directories and leaves controls unchanged', async () => {
  const f = await fixture();
  await cleanUnmanaged(f.client, {}, f.work, 'test', 'source', 'key', f.plan, f.services);
  assert.deepEqual(f.deleted, f.plan.targets.map(t => t.name));
  assert.deepEqual(f.events, ['backup', 'delete', 'delete', 'public-verified', 'evidence']);
  assert.deepEqual(f.remote.get('.htaccess'), f.route);
  assert.deepEqual(f.remote.get(STATE), f.stateBytes);
  assert.deepEqual(f.remote.get(GUIDE), f.guide);
  assert.equal(JSON.parse(await readFile(join(f.work, 'cleanup-complete.json'))).status, 'verified');
});
for (const damage of ['dependency', 'extra-target', 'state', 'retained', 'target', 'backup', 'receipt']) {
  test(`cleanup stops before the first deletion on ${damage}`, async () => {
    const f = await fixture(damage);
    await assert.rejects(cleanUnmanaged(f.client, {}, f.work, 'test', 'source', 'key', f.plan, f.services));
    assert.deepEqual(f.deleted, []);
  });
}
test('cleanup never repeats an ambiguous DELETE', async () => {
  const f = await fixture(); let attempts = 0;
  f.client.removeRelease = async () => { attempts++; throw new TypeError('fetch failed'); };
  await assert.rejects(cleanUnmanaged(f.client, {}, f.work, 'test', 'source', 'key', f.plan, f.services));
  assert.equal(attempts, 1);
});
