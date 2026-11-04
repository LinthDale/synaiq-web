// Resize the approved sequence without changing its frames, crop, order or timing.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, lstat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { DECISION_FRAME_COUNT, decisionFrameFile, decisionMobileFrameFile } from '../decision-frames.js';

export const MOBILE_FRAME_OPTIONS = Object.freeze({ width: 576, height: 384, quality: 68, effort: 5 });
const root = new URL('../', import.meta.url);
const manifestPath = new URL('./decision-mobile-manifest.json', import.meta.url);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

export async function syncDecisionMobile({ check = false } = {}) {
  const manifest = check ? JSON.parse(await readFile(manifestPath)) : { schema: 1, source: 'kip-d-scroll-v5', options: MOBILE_FRAME_OPTIONS, files: [] };
  assert.deepEqual(manifest.options, MOBILE_FRAME_OPTIONS);
  if (check) assert.equal(manifest.files.length, DECISION_FRAME_COUNT);
  else {
    const directory = new URL('assets/kip-d-scroll-mobile-v1/', root);
    await mkdir(directory, { recursive: true }); assert.equal((await lstat(directory)).isSymbolicLink(), false);
  }
  for (let index = 0; index < DECISION_FRAME_COUNT; index++) {
    const sourcePath = decisionFrameFile(index), targetPath = decisionMobileFrameFile(index);
    const original = await readFile(new URL(sourcePath, root));
    if (check) {
      const record = manifest.files[index];
      assert.equal(record.source, sourcePath); assert.equal(record.path, targetPath);
      assert.equal(record.sourceSha256, sha(original), `${sourcePath}: regenerate mobile derivatives`);
      const target = new URL(targetPath, root); assert.equal((await lstat(target)).isSymbolicLink(), false);
      const bytes = await readFile(target), metadata = await sharp(bytes).metadata();
      assert.equal(sha(bytes), record.sha256); assert.equal(bytes.length, record.size);
      assert.equal(metadata.width, MOBILE_FRAME_OPTIONS.width); assert.equal(metadata.height, MOBILE_FRAME_OPTIONS.height);
    } else {
      const bytes = await sharp(original).resize({ width: MOBILE_FRAME_OPTIONS.width, height: MOBILE_FRAME_OPTIONS.height, fit: 'inside', withoutEnlargement: true }).webp({ quality: MOBILE_FRAME_OPTIONS.quality, effort: MOBILE_FRAME_OPTIONS.effort }).toBuffer();
      const target = new URL(targetPath, root);
      await writeFile(target, bytes, { flag: 'wx' }); // A new immutable asset version is required for changed settings.
      manifest.files.push({ source: sourcePath, path: targetPath, sourceSha256: sha(original), sha256: sha(bytes), size: bytes.length });
    }
  }
  if (!check) await writeFile(manifestPath, JSON.stringify(manifest, null, 2), { flag: 'wx' });
  return manifest;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const manifest = await syncDecisionMobile({ check: process.argv.includes('--check') });
  console.log(`${manifest.files.length} mobile frames ${process.argv.includes('--check') ? 'verified' : 'created'}; ${manifest.files.reduce((n, f) => n + f.size, 0)} bytes`);
}
