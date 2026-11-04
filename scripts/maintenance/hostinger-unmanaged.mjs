import assert from 'node:assert/strict';
import { readFile, mkdir, appendFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { connect, transportCode } from '../hostinger/client.mjs';
import { audit, snapshot, verifySnapshot, save, publicChecks } from '../hostinger/deploy.mjs';
import { sha, releaseName, assertNoDependencies, STATE, GUIDE } from '../hostinger/core.mjs';
import { publishBackup, publishEvidence, seal } from '../hostinger/backup.mjs';

export const reviewedPlan = {
  active: 'synaiq-release-ci-41780885191-1',
  routingSha256: 'cc92dbc61f62cf9f23a05e32204610789748864c45a90defaaa794304de2f347',
  stateSha256: 'bb3050d53b77dcb0ac569099dee4ab7d4df9d9ed753d8ad7dfbf33a25b20ef46',
  targets: [
    { name: 'synaiq-release-20260930-screens-anon', files: 83, bytes: 29512489 },
    { name: 'synaiq-release-ci-38196226321-1', files: 88, bytes: 38831882 },
    { name: 'synaiq-release-ci-41778203133-2', files: 339, bytes: 33163908 },
  ],
};

// One reviewed cleanup, never a broad root-directory deletion. Reusable deployment helpers
// provide authenticated hashes, durable encrypted restore verification and non-retried DELETE.
export async function cleanUnmanaged(client, config, work, id, sourceCommit, key, plan = reviewedPlan, services = {}) {
  const inspect = services.audit || audit, backup = services.publishBackup || publishBackup;
  const evidence = services.publishEvidence || publishEvidence, checkPublic = services.publicChecks || publicChecks;
  const before = await inspect(client, config, work);
  const names = plan.targets.map(t => releaseName(t.name));
  assert.equal(new Set(names).size, names.length);
  assert.equal(before.state.active, plan.active);
  assert.equal(sha(before.route), plan.routingSha256, 'Reviewed routing changed');
  assert.equal(sha(before.stateBytes), plan.stateSha256, 'Reviewed state changed');
  assert.deepEqual([...before.unmanaged].sort(), [...names].sort(), 'Unmanaged inventory changed; review it before cleanup');
  assert.ok(!before.state.releases.some(r => names.includes(r.name)), 'A target is now managed');
  assertNoDependencies([['routing.txt', before.route]], names);
  const controls = { '.htaccess': sha(before.route), [STATE]: sha(before.stateBytes), [GUIDE]: sha(before.guide) };
  const guard = async () => { for (const [path, hash] of Object.entries(controls)) await client.guard(path, hash); };
  const retained = async () => {
    for (const record of before.state.releases) {
      await verifySnapshot(client, record, (path, bytes) => assertNoDependencies([[path, bytes]], names));
      console.log(`Verified retained ${record.name}`);
    }
  };
  await retained();
  const records = [];
  for (const target of plan.targets) {
    const record = await snapshot(client, target.name, join(work, 'backup'));
    assert.equal(record.files.length, target.files, `${target.name}: file count changed`);
    assert.equal(record.files.reduce((total, f) => total + f.size, 0), target.bytes, `${target.name}: size changed`);
    records.push(record); console.log(`Backed up ${target.name}`);
  }
  await guard();
  const manifest = { operation: 'remove-reviewed-unmanaged', sourceCommit, release: before.state.active, files: [], records };
  await save(work, 'manifest.json', manifest);
  await save(work, 'cleanup-plan.json', { ...plan, controls, records });
  const receipt = await backup(config, work, manifest, key, id);
  assert.equal(receipt.status, 'download-verified');
  assert.equal(receipt.planSha256, sha(await readFile(join(work, 'cleanup-plan.json'))));
  assert.equal(receipt.archiveSha256, sha(await readFile(join(work, 'backup.tar.gz.enc'))));
  await guard(); await retained();
  // Validate every target and its restored backup before deleting the first directory.
  for (const record of records) {
    await verifySnapshot(client, record, async (path, bytes) => assert.equal(sha(await readFile(join(work, 'backup', path))), sha(bytes)));
  }
  for (const record of records) {
    await guard();
    await verifySnapshot(client, record);
    await appendFile(join(work, 'cleanup-operations.jsonl'), JSON.stringify({ phase: 'delete-intent', name: record.name, archiveSha256: receipt.archiveSha256 }) + '\n');
    await client.removeRelease(record.name);
    assert.equal(await client.meta(record.name, true), null);
    await appendFile(join(work, 'cleanup-operations.jsonl'), JSON.stringify({ phase: 'delete-verified', name: record.name }) + '\n');
    console.log(`Removed backed-up ${record.name}`);
  }
  await guard();
  const current = before.state.releases[0];
  await checkPublic(config, { release: current.name, files: current.files.map(f => ({ ...f, path: f.path.slice(current.name.length + 1) })) });
  await save(work, 'cleanup-complete.json', { status: 'verified', removed: names, bytes: plan.targets.reduce((n, t) => n + t.bytes, 0), retained: before.state.releases.map(r => r.name), controls, backup: receipt.tag });
  await evidence(config, work, key, id);
  return { removed: names, backup: receipt.tag };
}

export async function main() {
  const config = JSON.parse(await readFile(new URL('../hostinger/config.json', import.meta.url)));
  assert.equal(process.env.GITHUB_ACTIONS, 'true');
  assert.equal(process.env.GITHUB_REPOSITORY, config.repository);
  assert.equal(process.env.GITHUB_REF, `refs/heads/${config.branch}`);
  assert.equal(process.env.GITHUB_EVENT_NAME, 'workflow_dispatch');
  assert.match(process.env.GITHUB_SHA || '', /^[a-f0-9]{40}$/);
  assert.match(process.env.HOSTINGER_BACKUP_KEY || '', /^[a-f0-9]{64}$/i);
  const id = `cleanup-${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT}`;
  assert.match(id, /^cleanup-\d+-\d+$/);
  const work = resolve('out', 'hostinger-maintenance', id); await mkdir(work, { recursive: true });
  try {
    const client = await connect(config, process.env.HOSTINGER_API_TOKEN);
    const result = await cleanUnmanaged(client, config, work, id, process.env.GITHUB_SHA, process.env.HOSTINGER_BACKUP_KEY);
    const summary = `Removed ${result.removed.length} backed-up unmanaged release directories (101,508,279 bytes).\n\nRetained current + two rollback versions. Routing, state and maintenance guide unchanged; public website verified.\n\nEncrypted draft Release: ${result.backup}\n`;
    await save(work, 'summary.md', summary);
    if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, summary);
  } catch (error) {
    const message = error instanceof assert.AssertionError ? error.message : `Maintenance failed (${transportCode(error) || error.name})`;
    await save(work, 'failure.json', { status: 'failed', message });
    // Best effort encrypted evidence. No plaintext artifacts or authenticated URLs are published.
    try { await seal(work, process.env.HOSTINGER_BACKUP_KEY, 'failure-evidence.tar.gz.enc'); } catch {}
    console.error(message); process.exitCode = 1;
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
