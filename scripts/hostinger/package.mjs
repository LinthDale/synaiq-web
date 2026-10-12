import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { PUBLIC_FILES } from '../../docs/design/live-prototype/share-preview.mjs';
import { sha, transformSource, safePath, releaseName } from './core.mjs';

export async function packageSite(work, name) {
  releaseName(name);
  const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  if (process.env.GITHUB_SHA) assert.equal(sourceCommit, process.env.GITHUB_SHA);
  // Preserve unrelated staged work, but never silently package uncommitted site inputs.
  const changed = execFileSync('git', ['status', '--porcelain', '--', 'docs/design/live-prototype', 'public/brand'], { encoding: 'utf8' });
  assert.equal(changed, '', 'Commit website inputs before packaging');
  const files = [];
  for (const entry of PUBLIC_FILES.filter(entry => !['index.html', 'preview.js'].includes(entry.file))) {
    const source = entry.root === 'brand' ? `public/brand/${entry.file}` : `docs/design/live-prototype/${entry.file}`;
    const path = safePath(entry.root === 'brand' ? `brand/${entry.file}` : entry.file);
    // git show makes Windows CRLF and Linux checkouts produce the same payload.
    const original = execFileSync('git', ['show', `${sourceCommit}:${source}`], { maxBuffer: 40 * 1024 * 1024 });
    const bytes = transformSource(original, path, name);
    if (path === 'robots.txt') {
      assert.match(bytes.toString(), /^Sitemap: https:\/\/taistro\.com\.tw\/sitemap\.xml\s*$/m);
      assert.doesNotMatch(bytes.toString(), /^Disallow:\s*\/\s*$/m);
    }
    if (path === 'sitemap.xml') {
      const urls = [...bytes.toString().matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
      assert.ok(urls.length > 0 && urls.every(u => u.startsWith('https://taistro.com.tw/') && !u.includes('synaiq-release-')));
    }
    for (const output of path === 'page.html' ? ['page.html', 'index.html'] : [path]) {
      const target = join(work, 'artifact', output);
      await mkdir(join(target, '..'), { recursive: true }); await writeFile(target, bytes, { flag: 'wx' });
      files.push({ path: output, size: bytes.length, sha256: sha(bytes), source });
    }
  }
  const manifest = { release: name, sourceCommit, createdAt: new Date().toISOString(), files };
  await writeFile(join(work, 'manifest.json'), JSON.stringify(manifest, null, 2), { flag: 'wx' });
  for (const file of files) assert.equal(sha(await readFile(join(work, 'artifact', file.path))), file.sha256);
  return manifest;
}
