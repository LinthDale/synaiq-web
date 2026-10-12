import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, readdir, lstat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { sha, encrypt, decrypt, safePath } from './core.mjs';
import { save } from './deploy.mjs';

const gh = args => execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 4 * 1024 * 1024 }).trim();
export async function seal(work, key, filename = 'backup.tar.gz.enc') {
  // Explicit selection: never archive environment files, session URLs, or encryption keys.
  const entries = (await readdir(work)).filter(name => ['artifact', 'backup'].includes(name) || /^(?:manifest|audit|state-before|state-original|state-deployed|deployed|public-assets|cleanup-plan|cleanup-complete|cleanup-operations|backup-receipt|rollback|browser-(?:local|staged|live)|failure)\.(?:json|jsonl)$/.test(name) || /^routing-(?:before|preview|live)\.htaccess$/.test(name) || name === 'guide-before.txt');
  assert.ok(entries.includes('manifest.json'));
  const inventory = [];
  async function collect(path) {
    safePath(path); const info = await lstat(join(work, path)); assert.equal(info.isSymbolicLink(), false);
    if (info.isDirectory()) for (const child of await readdir(join(work, path))) await collect(`${path}/${child}`);
    else inventory.push({ path, sha256: sha(await readFile(join(work, path))) });
  }
  for (const entry of entries) await collect(entry);
  await save(work, 'archive-inventory.json', inventory);
  const plain = join(work, `.${filename}.tar.gz`);
  execFileSync('tar', ['-czf', plain, '-C', work, ...entries, 'archive-inventory.json']);
  const bytes = await readFile(plain), encrypted = encrypt(bytes, key);
  assert.equal(sha(decrypt(encrypted, key)), sha(bytes));
  const target = join(work, filename); await writeFile(target, encrypted, { flag: 'wx' });
  // Never give a plaintext directory an .enc suffix: artifact globs can recurse into it.
  const verifyDir = join(work, `verify-${filename}.restored`); await mkdir(verifyDir);
  execFileSync('tar', ['-xzf', plain, '-C', verifyDir]);
  for (const file of inventory) assert.equal(sha(await readFile(join(verifyDir, file.path))), file.sha256, `Archive restore differs: ${file.path}`);
  return { path: target, sha256: sha(encrypted), plaintextSha256: sha(bytes), files: inventory.length };
}
export async function publishBackup(config, work, manifest, key, id) {
  const archive = await seal(work, key);
  const tag = `hostinger-backup-${id}`;
  const notes = join(work, 'backup-notes.txt');
  await writeFile(notes, `Encrypted Hostinger deployment and retention backup.\nSource: ${manifest.sourceCommit}\nAES-256-GCM; restore instructions: docs/operations/hostinger-cicd.md\nSHA-256: ${archive.sha256}\nKeep this draft and HOSTINGER_BACKUP_KEY for recovery.\n`);
  gh(['release', 'create', tag, '--repo', config.repository, '--target', manifest.sourceCommit, '--draft', '--title', `Hostinger backup ${id}`, '--notes-file', notes]);
  gh(['release', 'upload', tag, archive.path, '--repo', config.repository]);
  const download = join(work, 'download-verified'); await mkdir(download);
  gh(['release', 'download', tag, '--repo', config.repository, '--pattern', 'backup.tar.gz.enc', '--dir', download]);
  const remote = await readFile(join(download, 'backup.tar.gz.enc'));
  assert.equal(sha(remote), archive.sha256, 'Downloaded GitHub backup differs');
  assert.equal(sha(decrypt(remote, key)), archive.plaintextSha256, 'Downloaded backup cannot be decrypted');
  const receipt = { status: 'download-verified', tag, archiveSha256: archive.sha256, files: archive.files, planSha256: sha(await readFile(join(work, 'cleanup-plan.json'))) };
  await save(work, 'backup-receipt.json', receipt);
  return receipt;
}
export async function publishEvidence(config, work, key, id) {
  const archive = await seal(work, key, 'evidence.tar.gz.enc');
  gh(['release', 'upload', `hostinger-backup-${id}`, archive.path, '--repo', config.repository]);
}
