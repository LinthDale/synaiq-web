import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { sha } from './core.mjs';
import { request } from './client.mjs';

export async function imageEquivalent(source, actual, approved = false) {
  const a = await sharp(source).metadata(), b = await sharp(actual).metadata();
  assert.ok(b.width > 0 && b.height > 0 && b.width <= a.width && b.height <= a.height, 'Unexpected CDN image dimensions');
  assert.ok(Math.abs(b.width / b.height - a.width / a.height) < 0.005, 'CDN image aspect ratio changed');
  const sample = bytes => sharp(bytes).rotate().flatten({ background: '#ffffff' }).resize(64, 64, { fit: 'fill' }).raw().toBuffer();
  const [x, y] = await Promise.all([sample(source), sample(actual)]);
  assert.equal(x.length, y.length);
  const error = x.reduce((sum, value, i) => sum + Math.abs(value - y[i]), 0) / x.length;
  assert.ok(error < 3 || approved, `Unreviewed CDN image difference: ${error.toFixed(3)}`);
  return { width: b.width, height: b.height, meanPixelError: error, approvedExactPair: approved };
}
export async function verifyPublicAssets(config, manifest, work) {
  const approvals = JSON.parse(await readFile(new URL('./cdn-approved-images.json', import.meta.url)));
  const results = [];
  // Small concurrent batches keep the shared Hostinger server load bounded.
  for (let index = 0; index < manifest.files.length; index += 4) {
    results.push(...await Promise.all(manifest.files.slice(index, index + 4).map(async file => {
      const response = await request(new URL(`/${manifest.release}/${file.path}`, config.origin));
      assert.equal(response.status, 200, `${file.path}: public HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer()), actual = sha(bytes);
      const result = { path: file.path, sha256: actual };
      if (actual !== file.sha256 && /\.(png|jpe?g|webp)$/.test(file.path)) {
        assert.match(response.headers.get('content-type') || '', /^image\//);
        const source = await readFile(join(work, 'artifact', file.path));
        assert.equal(sha(source), file.sha256);
        const approved = approvals.some(p => p.path === file.path && p.sourceSha256 === file.sha256 && p.sha256 === actual);
        Object.assign(result, await imageEquivalent(source, bytes, approved));
      } else assert.equal(actual, file.sha256, `${file.path}: public content differs`);
      if (/^locale-.*\.js$/.test(file.path)) assert.match(response.headers.get('cache-control') || '', /no-cache/, 'Locale cache policy missing');
      return result;
    })));
  }
  await writeFile(join(work, 'public-assets.json'), JSON.stringify({ status: 'passed', release: manifest.release, files: results }, null, 2));
  console.log(`Verified ${results.length} public assets including CDN image content`);
}
