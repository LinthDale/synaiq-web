import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { randomBytes } from 'node:crypto';
import { seal } from './backup.mjs';
import { decrypt } from './core.mjs';

test('encrypted artifact selection cannot include plaintext restore directories', async () => {
  const root = resolve(tmpdir());
  const work = await mkdtemp(join(root, 'hostinger-seal-test-'));
  try {
    await mkdir(join(work, 'artifact'));
    await writeFile(join(work, 'artifact', 'index.html'), '<h1>Fixture</h1>');
    await writeFile(join(work, 'manifest.json'), '{}');
    const key = randomBytes(32).toString('hex');
    const archive = await seal(work, key, 'failure-evidence.tar.gz.enc');
    assert.ok(decrypt(await readFile(archive.path), key).length > 0);
    const selected = (await readdir(work, { withFileTypes: true })).filter(entry => entry.name.endsWith('.enc'));
    assert.deepEqual(selected.map(entry => entry.name), ['failure-evidence.tar.gz.enc']);
    assert.ok(selected.every(entry => entry.isFile()));
    const workflow = await readFile(new URL('../../.github/workflows/hostinger.yml', import.meta.url), 'utf8');
    assert.ok(!workflow.includes('/*.enc'), 'Use explicit archive filenames, never a recursive directory glob');
  } finally {
    assert.equal(dirname(resolve(work)), root);
    assert.ok(basename(work).startsWith('hostinger-seal-test-'));
    await rm(work, { recursive: true });
  }
});
