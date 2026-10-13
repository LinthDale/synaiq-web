import assert from 'node:assert/strict';
import { readFile, mkdir, appendFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';
import { connect, transportCode } from './client.mjs';
import { packageSite } from './package.mjs';
import { smoke, smokeMatrix } from './browser.mjs';
import { audit, deploy, prepareCleanup, prune, publicChecks, save } from './deploy.mjs';
import { publishBackup, publishEvidence, seal } from './backup.mjs';
import { decrypt } from './core.mjs';

export async function main() {
  const [mode, input] = process.argv.slice(2);
  const config = JSON.parse(await readFile(new URL('./config.json', import.meta.url)));
  if (mode === 'decrypt') {
    assert.ok(input && process.argv.length === 4, 'decrypt requires one .enc archive path');
    await writeFile(`${input}.tar.gz`, decrypt(await readFile(input), process.env.HOSTINGER_BACKUP_KEY), { flag: 'wx' });
    return;
  }
  assert.ok(['package', 'local', 'audit', 'deploy', 'seal-failure'].includes(mode));
  const id = input || `local-${randomUUID()}`; assert.match(id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  const work = resolve('out', 'hostinger-ci', id);
  await mkdir(work, { recursive: true });
  const manifestFile = join(work, 'manifest.json');
  let phase = mode;
  try {
    if (mode === 'package') {
      const name = `synaiq-release-ci-${id}`;
      const manifest = await packageSite(work, name);
      console.log(`Packaged ${manifest.files.length} files from ${manifest.sourceCommit} into ${work}`);
      return;
    }
    if (mode === 'seal-failure') { await seal(work, process.env.HOSTINGER_BACKUP_KEY, 'failure-evidence.tar.gz.enc'); return; }
    if (mode === 'local') {
      await smoke(JSON.parse(await readFile(manifestFile)), work, config.origin, 'local'); return;
    }
    const client = await connect(config, process.env.HOSTINGER_API_TOKEN);
    if (mode === 'audit') { const result = await audit(client, config, work); console.log(JSON.stringify({ active: result.state.active, managed: result.state.releases.length, unmanaged: result.unmanaged })); return; }
    // Production mutations are only exposed on GitHub's protected main deployment job.
    assert.equal(process.env.GITHUB_ACTIONS, 'true');
    assert.equal(process.env.GITHUB_REPOSITORY, config.repository);
    assert.equal(process.env.GITHUB_REF, `refs/heads/${config.branch}`);
    assert.ok(['push', 'workflow_dispatch'].includes(process.env.GITHUB_EVENT_NAME));
    assert.match(process.env.HOSTINGER_BACKUP_KEY || '', /^[a-f0-9]{64}$/i);
    const manifest = JSON.parse(await readFile(manifestFile));
    assert.equal(manifest.sourceCommit, process.env.GITHUB_SHA);
    phase = 'deploy'; const state = await deploy(client, config, work, manifest, id);
    phase = 'prepare-cleanup'; const plan = await prepareCleanup(client, config, work, state);
    phase = 'backup'; const receipt = await publishBackup(config, work, manifest, process.env.HOSTINGER_BACKUP_KEY, id);
    phase = 'prune'; await prune(client, config, work, state, receipt, id);
    phase = 'public-checks'; await client.purge(); await publicChecks(config, manifest);
    phase = 'evidence'; await publishEvidence(config, work, process.env.HOSTINGER_BACKUP_KEY, id);
    // Each browser pass runs the whole matrix or throws, so its size is what every pass verified.
    const checks = smokeMatrix().length;
    const summary = `### Hostinger deployment verified\n\n- Website: ${config.origin}/\n- Release: ${manifest.release}\n- Source: ${manifest.sourceCommit}\n- Retained: ${plan.keep.join(', ')}\n- Archived and removed: ${plan.remove.join(', ') || 'none'}\n- Encrypted backup: ${receipt.tag} (draft Release)\n- Browser checks: ${checks} local + ${checks} staged + ${checks} live\n`;
    await save(work, 'summary.md', summary);
    if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, summary);
    console.log('Deployment, backup and retention verified.');
  } catch (error) {
    // Raw fetch errors/stacks can include signed session URLs. Only controlled assertions, the phase
    // and a transport code such as ECONNRESET are reported; no messages, bodies, environment or tokens.
    const code = [error.code || error.name || 'unknown', transportCode(error)].filter(Boolean).join('/');
    const message = error instanceof assert.AssertionError ? error.message : `Operation failed during ${phase} (${code}); inspect phase evidence`;
    await save(work, 'failure.json', { status: 'failed', mode, phase, message, at: new Date().toISOString() });
    console.error(message); process.exitCode = 1;
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
