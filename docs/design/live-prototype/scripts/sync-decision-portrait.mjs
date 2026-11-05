import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { DECISION_VARIANTS } from '../decision-responsive.js';

const root = new URL('../', import.meta.url);
const manifestPath = new URL('decision-portrait-manifest.json', import.meta.url);
const sha = data => createHash('sha256').update(data).digest('hex');
const keys = ['portrait-large', 'portrait-small'];
export async function syncDecisionPortrait({ check = false, source = 'out/mobile-loading-20261104/portrait-v1' } = {}) {
  const manifest = check ? JSON.parse(await readFile(manifestPath)) : {
    schema: 1, promptId: 'f8ceac10-330e-495f-93b7-5437b7f11bea', count: 243,
    smallOptions: { width: 432, height: 768, quality: 68, effort: 5 }, variants: {},
  };
  const original = check ? null : JSON.parse(await readFile(resolve(source, 'animation-manifest.json')));
  if (original) { assert.equal(original.prompt_id, manifest.promptId); assert.equal(original.count, 243); }
  for (const key of keys) {
    const variant = DECISION_VARIANTS[key], records = [], buffers = [];
    if (check) {
      for (const [id, file] of variant.bundles.entries()) {
        assert.equal((await lstat(new URL(file, root))).isSymbolicLink(), false);
        const text = (await readFile(new URL(file, root), 'utf8')).replaceAll('\r\n', '\n');
        const bundle = JSON.parse(text);
        assert.equal(bundle.schema, 1); assert.equal(bundle.start, id * 32);
        assert.equal(bundle.frames.length, Math.min(32, 243 - id * 32));
        assert.ok(Buffer.byteLength(text) < 3_000_000);
        for (const value of bundle.frames) {
          assert.match(value, /^data:image\/webp;base64,[A-Za-z0-9+/]+={0,2}$/);
          assert.ok(value.length < 100_000);
          buffers.push(Buffer.from(value.split(',')[1], 'base64'));
        }
      }
      assert.equal(buffers.length, 243);
    }
    for (let index = 0; index < 243; index++) {
      let bytes;
      if (check) bytes = buffers[index];
      else {
        const record = original.frames[index];
        assert.equal(record.file, `frame-${String(index).padStart(3, '0')}.webp`);
        const raw = await readFile(resolve(source, 'frames', record.file));
        assert.equal(sha(raw), record.sha256);
        bytes = key === 'portrait-large' ? raw : await sharp(raw).resize(432, 768).webp({ quality: 68, effort: 5 }).toBuffer();
        buffers.push(bytes);
      }
      const metadata = await sharp(bytes).metadata();
      assert.equal(metadata.width, variant.width); assert.equal(metadata.height, variant.height);
      const record = { index, bytes: bytes.length, sha256: sha(bytes) };
      if (check) assert.deepEqual(record, manifest.variants[key].frames[index]);
      records.push(record);
    }
    if (!check) {
      for (const [id, file] of variant.bundles.entries()) {
        const frames = buffers.slice(id * 32, id * 32 + 32).map(bytes => `data:image/webp;base64,${bytes.toString('base64')}`);
        const data = Buffer.from(JSON.stringify({ schema: 1, start: id * 32, frames }) + '\n');
        assert.ok(data.length < 3_000_000);
        await mkdir(new URL('./', new URL(file, root)), { recursive: true });
        await writeFile(new URL(file, root), data, { flag: 'wx' });
      }
      await mkdir(new URL('./', new URL(variant.poster, root)), { recursive: true });
      await writeFile(new URL(variant.poster, root), buffers[0], { flag: 'wx' });
      manifest.variants[key] = { width: variant.width, height: variant.height, frames: records };
    } else {
      assert.equal((await lstat(new URL(variant.poster, root))).isSymbolicLink(), false);
      assert.equal(sha(await readFile(new URL(variant.poster, root))), records[0].sha256);
    }
  }
  if (!check) await writeFile(manifestPath, JSON.stringify(manifest, null, 2), { flag: 'wx' });
  return manifest;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const manifest = await syncDecisionPortrait({ check: process.argv.includes('--check') });
  console.log(JSON.stringify(Object.fromEntries(keys.map(key => [key, { count: manifest.variants[key].frames.length, bytes: manifest.variants[key].frames.reduce((sum, frame) => sum + frame.bytes, 0) }]))));
}
