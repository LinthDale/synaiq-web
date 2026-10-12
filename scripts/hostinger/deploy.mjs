import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, appendFile } from 'node:fs/promises';
import { join } from 'node:path';
import { sha, activeRelease, buildRouting, retentionPlan, assertNoDependencies, STATE, GUIDE } from './core.mjs';
import { request } from './client.mjs';
import { smoke } from './browser.mjs';

const json = data => Buffer.from(JSON.stringify(data, null, 2));
export async function save(work, path, bytes) {
  const target = join(work, path); await mkdir(join(target, '..'), { recursive: true });
  await writeFile(target, Buffer.isBuffer(bytes) || typeof bytes === 'string' ? bytes : json(bytes));
}
export async function mapLimit(items, fn, concurrency = 4) {
  let next = 0; const results = new Array(items.length);
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) { const index = next++; results[index] = await fn(items[index]); }
  }));
  return results;
}
export async function snapshot(client, name, backupDirectory) {
  const tree = await client.tree(name);
  const files = await mapLimit(tree.files, async file => {
    const bytes = await client.read(file.path, file.size);
    if (backupDirectory) await save(backupDirectory, file.path, bytes);
    return { ...file, sha256: sha(bytes) };
  });
  return { name, dirs: tree.dirs, files };
}
export async function verifySnapshot(client, record, onFile = () => {}) {
  const tree = await client.tree(record.name);
  assert.deepEqual(tree.dirs, record.dirs, `${record.name}: directories changed`);
  assert.deepEqual(tree.files, record.files.map(({ path, size }) => ({ path, size })), `${record.name}: file list changed`);
  await mapLimit(record.files, async file => {
    const bytes = await client.read(file.path, file.size);
    assert.equal(sha(bytes), file.sha256, `${file.path}: changed outside CI`);
    await onFile(file.path, bytes);
  });
}
export async function audit(client, config, work) {
  const route = await client.read('.htaccess'), active = activeRelease(route.toString());
  const stateItem = await client.meta(STATE, true);
  let state, stateBytes = null;
  if (stateItem) {
    stateBytes = await client.read(STATE); state = JSON.parse(stateBytes);
    assert.equal(state.schema, 1); assert.equal(state.active, active);
    assert.equal(state.routingSha256, sha(route), 'Routing differs from last CI deployment');
    retentionPlan(state, route.toString(), config.keepReleases);
    await verifySnapshot(client, state.releases[0]);
  } else {
    assert.equal(sha(route), config.bootstrapRoutingSha256, 'Legacy routing differs from reviewed bootstrap');
    assert.equal(active, config.bootstrapReleasesNewestFirst[0]);
    const releases = [];
    for (const name of config.bootstrapReleasesNewestFirst) {
      releases.push(await snapshot(client, name)); console.log(`Audited ${name}`);
    }
    // Seed from reviewed local manifests, including the documented targeted patches.
    const expected = JSON.parse(await readFile(new URL('./bootstrap-hashes.json', import.meta.url)));
    for (const record of releases) {
      assert.deepEqual(record.files.map(({ path, sha256 }) => ({ path, sha256 })), expected[record.name], `${record.name}: differs from reviewed legacy release`);
    }
    state = { schema: 1, active, routingSha256: sha(route), releases };
  }
  await client.guard('.htaccess', sha(route));
  const guide = await client.read(GUIDE);
  await save(work, 'routing-before.htaccess', route); await save(work, 'guide-before.txt', guide);
  await save(work, 'state-before.json', state); if (stateBytes) await save(work, 'state-original.json', stateBytes);
  const root = await client.meta();
  const unmanaged = root.items.filter(i => i.isDir && i.name.startsWith('synaiq-release-') && !state.releases.some(r => r.name === i.name)).map(i => i.name);
  await save(work, 'audit.json', { active, routingSha256: sha(route), stateSha256: stateBytes ? sha(stateBytes) : null, guideSha256: sha(guide), unmanaged });
  return { route, guide, state, stateBytes, unmanaged };
}
export async function publicChecks(config, manifest, root = true) {
  const paths = root ? ['/', '/?page=ems&lang=en', '/?page=pvsim&lang=zh-Hant', '/robots.txt', '/sitemap.xml'] : [`/${manifest.release}/index.html`];
  for (const path of paths) {
    const response = await request(new URL(path, config.origin));
    assert.equal(response.status, 200, `${path}: public HTTP ${response.status}`);
    const file = /\.(txt|xml)$/.test(path) ? path.slice(1) : 'index.html';
    assert.equal(sha(Buffer.from(await response.arrayBuffer())), manifest.files.find(f => f.path === file).sha256, `${path}: public version mismatch`);
    assert.match(response.headers.get('cache-control') || '', /no-cache/, `${path}: document cache policy missing`);
  }
  for (const path of ['/' + STATE, '/' + GUIDE, '/wp-admin/', '/wp-json/', '/index.php']) {
    const response = await request(new URL(path, config.origin));
    assert.equal(response.status, 410, `${path}: private or retired path exposed`);
  }
  assert.equal((await request(new URL('/wp-content/uploads/2026/03/toutou-2.png', config.origin))).status, 200);
}
export async function deploy(client, config, work, manifest, id, services = {}) {
  const inspect = services.audit || audit, browserCheck = services.smoke || smoke;
  const checkPublic = services.publicChecks || publicChecks, getPublic = services.request || request;
  const takeSnapshot = services.snapshot || snapshot;
  const local = JSON.parse(await readFile(join(work, 'browser-local.json')));
  assert.equal(local.status, 'passed'); assert.equal(local.release, manifest.release); assert.equal(local.sourceCommit, manifest.sourceCommit);
  const before = await inspect(client, config, work);
  assert.equal(await client.meta(manifest.release, true), null, 'Release exists; inspect instead of replaying upload');
  const route = buildRouting(before.route.toString(), manifest.release, manifest.files.map(f => f.path));
  await save(work, 'routing-preview.htaccess', route.preview); await save(work, 'routing-live.htaccess', route.live);
  let routeAttempted = false, committed = false, nextStateBytes, nextGuideBytes;
  try {
    for (const file of manifest.files) {
      const bytes = await readFile(join(work, 'artifact', file.path)); assert.equal(sha(bytes), file.sha256);
      await client.upload(`${manifest.release}/${file.path}`, bytes);
    }
    routeAttempted = true;
    await client.replace('.htaccess', Buffer.from(route.preview), sha(before.route), `${id}-preview`);
    await checkPublic(config, manifest, false);
    await browserCheck(manifest, work, config.origin, 'staged');
    // The old homepage must still be served during staging.
    const root = await getPublic(config.origin);
    assert.equal(root.status, 200);
    assert.equal(sha(Buffer.from(await root.arrayBuffer())), before.state.releases[0].files.find(f => f.path.endsWith('/index.html')).sha256);
    await client.replace('.htaccess', Buffer.from(route.live), sha(route.preview), `${id}-live`);
    await client.purge();
    await checkPublic(config, manifest);
    await browserCheck(manifest, work, config.origin, 'live');
    const current = await takeSnapshot(client, manifest.release);
    const state = { schema: 1, active: manifest.release, routingSha256: sha(route.live), sourceCommit: manifest.sourceCommit, updatedAt: new Date().toISOString(), releases: [current, ...before.state.releases] };
    const note = `Hostinger production — managed by GitHub Actions\nWebsite: ${config.origin}/\nActive: public_html/${manifest.release}/\nSource: ${manifest.sourceCommit}\nWorkflow: https://github.com/${config.repository}/actions/runs/${process.env.GITHUB_RUN_ID || 'local'}\nRetention: current + two previous successful releases; encrypted backup before deletion.\nEdit docs/design/live-prototype/, then push/merge to GitHub main.\nDo not upload local preview index.html or manually edit managed releases.\n`;
    nextGuideBytes = Buffer.from(note); nextStateBytes = json(state);
    await client.replace(GUIDE, nextGuideBytes, sha(before.guide), `${id}-guide`);
    await client.replace(STATE, nextStateBytes, before.stateBytes ? sha(before.stateBytes) : null, `${id}-state`);
    committed = true;
    await save(work, 'state-deployed.json', state);
    await save(work, 'deployed.json', { status: 'verified', release: manifest.release, routingSha256: state.routingSha256, stateSha256: sha(json(state)), guideSha256: sha(note) });
    return state;
  } catch (error) {
    // Ambiguous rename failures are reconciled by reading the host, never replayed blindly.
    if (routeAttempted && !committed) {
      const actual = await client.read('.htaccess');
      if ([sha(route.preview), sha(route.live)].includes(sha(actual))) {
        await client.replace('.htaccess', before.route, sha(actual), `${id}-rollback`);
        await client.purge();
        const response = await getPublic(config.origin);
        assert.equal(response.status, 200);
        assert.equal(sha(Buffer.from(await response.arrayBuffer())), before.state.releases[0].files.find(f => f.path.endsWith('/index.html')).sha256);
        await save(work, 'rollback.json', { status: 'verified', active: before.state.active, routingSha256: sha(before.route) });
      } else assert.equal(sha(actual), sha(before.route), 'Routing changed externally; automatic rollback stopped');
      // If control files were already updated, restore only this run's known content.
      const liveState = await client.meta(STATE, true);
      if (liveState && nextStateBytes) {
        const bytes = await client.read(STATE);
        if (sha(bytes) === sha(nextStateBytes)) await client.replace(STATE, before.stateBytes || json(before.state), sha(bytes), `${id}-rollback-state`);
      }
      const liveGuide = await client.read(GUIDE);
      if (nextGuideBytes && sha(liveGuide) === sha(nextGuideBytes)) await client.replace(GUIDE, before.guide, sha(liveGuide), `${id}-rollback-guide`);
    }
    throw error;
  }
}
export async function prepareCleanup(client, config, work, state) {
  await client.guard('.htaccess', state.routingSha256);
  const routing = (await client.read('.htaccess')).toString();
  const plan = retentionPlan(state, routing, config.keepReleases);
  for (const record of state.releases.filter(r => plan.keep.includes(r.name))) {
    await verifySnapshot(client, record, (path, bytes) => assertNoDependencies([[path, bytes]], plan.remove));
  }
  for (const record of state.releases.filter(r => plan.remove.includes(r.name))) {
    await verifySnapshot(client, record, (path, bytes) => save(join(work, 'backup'), path, bytes));
    console.log(`Backed up ${record.name}`);
  }
  await client.guard('.htaccess', state.routingSha256);
  await save(work, 'cleanup-plan.json', { ...plan, routingSha256: state.routingSha256, stateSha256: sha(json(state)) });
  return plan;
}
export async function prune(client, config, work, state, receipt, id) {
  assert.equal(receipt.status, 'download-verified');
  const planBytes = await readFile(join(work, 'cleanup-plan.json'));
  assert.equal(receipt.planSha256, sha(planBytes), 'Backup receipt belongs to another cleanup plan');
  assert.equal(receipt.archiveSha256, sha(await readFile(join(work, 'backup.tar.gz.enc'))));
  const plan = JSON.parse(planBytes);
  await client.guard('.htaccess', plan.routingSha256); await client.guard(STATE, plan.stateSha256);
  assert.deepEqual(retentionPlan(state, (await client.read('.htaccess')).toString(), config.keepReleases), { keep: plan.keep, remove: plan.remove });
  // Recheck dependencies and retained bytes after the durable backup was uploaded.
  for (const record of state.releases.filter(r => plan.keep.includes(r.name))) await verifySnapshot(client, record, (path, bytes) => assertNoDependencies([[path, bytes]], plan.remove));
  for (const name of plan.remove) {
    const record = state.releases.find(r => r.name === name);
    await verifySnapshot(client, record, async (path, bytes) => assert.equal(sha(await readFile(join(work, 'backup', path))), sha(bytes)));
    await client.guard('.htaccess', plan.routingSha256); await client.guard(STATE, plan.stateSha256);
    await appendFile(join(work, 'cleanup-operations.jsonl'), JSON.stringify({ phase: 'delete-intent', name, archiveSha256: receipt.archiveSha256 }) + '\n');
    await client.removeRelease(name);
    await appendFile(join(work, 'cleanup-operations.jsonl'), JSON.stringify({ phase: 'delete-verified', name }) + '\n');
  }
  const next = { ...state, releases: state.releases.filter(r => plan.keep.includes(r.name)), lastBackup: receipt.tag };
  await client.replace(STATE, json(next), plan.stateSha256, `${id}-pruned-state`);
  await client.guard('.htaccess', plan.routingSha256);
  await save(work, 'cleanup-complete.json', { status: 'verified', ...plan, backup: receipt.tag });
  return next;
}
