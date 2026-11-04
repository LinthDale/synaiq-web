import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { sha, sharedPath, assetPath, buildRouting, ASSET_ROOT, ASSET_MAP, STATE } from './core.mjs';
import { uploadPayload, mapLimit, verifySnapshot, prepareCleanup, prune } from './deploy.mjs';

const current = 'synaiq-release-first', candidate = 'synaiq-release-second';
const base = `# provider directive\nRewriteRule ^$ /${current}/index.html [L]\nRewriteRule ^robots\\.txt$ /${current}/robots.txt [L]\nRewriteRule ^sitemap\\.xml$ /${current}/sitemap.xml [L]\n# Only inspected static releases remain public.\nRewriteRule ^${current}/(?:index\\.html|page\\.html|robots\\.txt|sitemap\\.xml)$ - [L]\nRewriteRule ^ - [G,L]\n# Active folder: ${current};\nHeader always set Cache-Control "no-cache, must-revalidate"\n`;
const entryPaths = ['index.html', 'page.html', 'robots.txt', 'sitemap.xml'];
function media(path, bytes) { const sha256 = sha(bytes); return { path, size: bytes.length, sha256, sharedPath: sharedPath(path, sha256) }; }
function resolveRewrite(text, path) {
  for (let pass = 0; pass < 5; pass++) {
    let changed = false;
    for (const line of text.split('\n')) {
      const [, pattern, target, flags] = line.match(/^RewriteRule (\S+) (\S+) (\S+)$/) || [];
      if (!pattern || !new RegExp(pattern).test(path)) continue;
      if (flags.includes('G')) return null;
      if (target === '-') return path;
      path = target.slice(1); changed = true; break;
    }
    if (!changed) return null;
  }
  throw Error('rewrite loop');
}

test('media aliases preserve browser URLs, deny unknown paths, and keep the current release during staging', () => {
  const files = Array.from({ length: 243 }, (_, n) => media(`assets/frames/frame-${n}.webp`, Buffer.from(`frame${n}`)));
  const paths = [...entryPaths, ...files.map(f => f.path)];
  const first = buildRouting(base, candidate, paths, files);
  for (const file of files) assert.equal(resolveRewrite(first.preview, `${candidate}/${file.path}`), file.sharedPath);
  for (const path of [`${candidate}/${ASSET_MAP}`, `${candidate}/assets/frames/frame-243.webp`, `${ASSET_ROOT}/${'f'.repeat(64)}.webp`, `${ASSET_ROOT}/anything.php`, `${candidate}/assets/frames/frame-1Xwebp`]) assert.equal(resolveRewrite(first.preview, path), null);
  assert.equal(resolveRewrite(first.preview, ''), `${current}/index.html`);
  assert.equal(resolveRewrite(first.live, ''), `${candidate}/index.html`);
  const third = 'synaiq-release-third', changed = media('assets/frames/frame-0.webp', Buffer.from('changed'));
  const next = buildRouting(first.live, third, [...entryPaths, changed.path], [changed]);
  assert.equal(resolveRewrite(next.preview, `${candidate}/${files[0].path}`), files[0].sharedPath);
  assert.equal(resolveRewrite(next.live, `${third}/${changed.path}`), changed.sharedPath);
  assert.ok(next.live.includes('# provider directive'));
  assert.ok(next.live.split('\n').every(line => Buffer.byteLength(line) < 8000));
  const final = buildRouting(next.live, 'synaiq-release-fourth', entryPaths);
  assert.equal(resolveRewrite(final.live, files[1].sharedPath), null, 'A stale asset is no longer publicly allowed');
});

test('shared storage accepts only allowlisted static extensions and exact hash addresses', () => {
  assert.equal(sharedPath('index.html', sha('html')), null);
  assert.ok(sharedPath('prototype.js', sha('js')).endsWith('.js'));
  assert.ok(sharedPath('site.css', sha('css')).endsWith('.css'));
  assert.ok(sharedPath('brand/logo.svg', sha('svg')).endsWith('.svg'));
  for (const path of ['../outside.png', '/image.png']) assert.throws(() => sharedPath(path, sha('x')));
  for (const path of ['synaiq-assets-v1/x.png', `synaiq-assets-v1/${sha('x')}.php`, `${ASSET_ROOT}/../x.webp`]) assert.throws(() => assetPath(path));
  const bad = media('assets/a.png', Buffer.from('a')); bad.sharedPath = sharedPath(bad.path, sha('other'));
  assert.throws(() => buildRouting(base, candidate, [...entryPaths, bad.path], [bad]));
  const long = media(`assets/${'x'.repeat(8000)}.webp`, Buffer.from('a'));
  assert.throws(() => buildRouting(base, candidate, [...entryPaths, long.path], [long]), /line limit/);
  const routed = buildRouting(base, candidate, [...entryPaths, 'catalog.js'], [media('catalog.js', Buffer.from('module'))]);
  const matcher = new RegExp(routed.live.match(/<FilesMatch "([^"]+)">/)[1]);
  assert.ok(matcher.test(`${sha('module')}.js`), 'Internally rewritten catalog JS must retain no-cache headers');
});

async function payloadFixture() {
  const work = await mkdtemp(join(tmpdir(), 'storage-')); await mkdir(join(work, 'artifact/assets'), { recursive: true });
  const bytes = Buffer.from('unchanged large image'), file = media('assets/image.webp', bytes);
  await writeFile(join(work, 'artifact', file.path), bytes); await writeFile(join(work, 'artifact/index.html'), 'entry');
  const manifest = { release: candidate, sourceCommit: 'test', files: [file, { path: 'index.html', size: 5, sha256: sha('entry') }] };
  const remote = new Map(), uploaded = [];
  const client = {
    meta: async path => remote.has(path) ? { size: remote.get(path).length } : null,
    read: async path => remote.get(path),
    upload: async (path, bytes) => { assert.ok(!remote.has(path)); remote.set(path, bytes); uploaded.push(path); },
  };
  return { work, file, manifest, client, remote, uploaded };
}
test('cold deployment stores media once; warm deployment reuses verified bytes; a changed image creates one new object', async () => {
  const f = await payloadFixture();
  await uploadPayload(f.client, f.work, f.manifest);
  assert.ok(f.uploaded.includes(f.file.sharedPath));
  f.uploaded.length = 0;
  await uploadPayload(f.client, f.work, { ...f.manifest, release: 'synaiq-release-third' });
  assert.deepEqual(f.uploaded.sort(), [`synaiq-release-third/${ASSET_MAP}`, 'synaiq-release-third/index.html'].sort());
  const stats = JSON.parse(await readFile(join(f.work, 'transfer.json')));
  assert.equal(stats.reusedFiles, 1); assert.equal(stats.reusedBytes, f.file.size);
  const bytes = Buffer.from('updated image'); await writeFile(join(f.work, 'artifact/assets/image.webp'), bytes);
  const changed = media(f.file.path, bytes); f.uploaded.length = 0;
  await uploadPayload(f.client, f.work, { ...f.manifest, release: 'synaiq-release-fourth', files: [changed] });
  assert.deepEqual(f.uploaded.sort(), [changed.sharedPath, `synaiq-release-fourth/${ASSET_MAP}`].sort());
  assert.ok(f.remote.has(f.file.sharedPath), 'Previous rollback media remains available');
});
test('existing media is hash checked before reuse and is never overwritten on corruption', async () => {
  const f = await payloadFixture(); f.remote.set(f.file.sharedPath, Buffer.alloc(f.file.size));
  await assert.rejects(uploadPayload(f.client, f.work, f.manifest), /shared hash differs/);
  assert.ok(!f.uploaded.includes(f.file.sharedPath));
});
test('concurrent upload failure drains in-flight work and stops scheduling more files', async () => {
  let finish; const pending = new Promise(resolve => { finish = resolve; }); const events = [];
  const operation = mapLimit([0, 1, 2, 3], async n => {
    events.push(`start${n}`);
    if (!n) throw Error('failed');
    await pending; events.push(`end${n}`);
  }, 2);
  await new Promise(resolve => setImmediate(resolve)); assert.deepEqual(events, ['start0', 'start1']);
  finish(); await assert.rejects(operation, /failed/);
  assert.deepEqual(events, ['start0', 'start1', 'end1']);
});
test('snapshot verification checks pooled media as well as physical release files', async () => {
  const file = media('assets/a.png', Buffer.from('image'));
  const record = { name: current, dirs: [current], files: [{ path: `${current}/index.html`, size: 5, sha256: sha('entry') }], assets: [file] };
  const client = { tree: async () => ({ dirs: record.dirs, files: record.files.map(({ path, size }) => ({ path, size })) }), read: async path => Buffer.from(path === file.sharedPath ? 'image' : 'entry') };
  await verifySnapshot(client, record);
  client.read = async () => Buffer.from('entry');
  await assert.rejects(verifySnapshot(client, record), /shared asset changed/);
});

test('pool garbage collection backs up orphan objects, preserves retained media, and stops for unknown candidates', async () => {
  for (const unknown of [false, true]) {
    const work = await mkdtemp(join(tmpdir(), 'pool-gc-'));
    const kept = media('assets/keep.png', Buffer.from('kept')), orphan = media('assets/orphan.png', Buffer.from('orphan'));
    const record = { name: current, dirs: [current], files: [{ path: `${current}/index.html`, size: 5, sha256: sha('entry') }], assets: [kept] };
    const state = { schema: 1, active: current, routingSha256: sha(base), releases: [record] };
    const remote = new Map([['.htaccess', Buffer.from(base)], [STATE, Buffer.from(JSON.stringify(state, null, 2))], [record.files[0].path, Buffer.from('entry')], [kept.sharedPath, Buffer.from('kept')], [orphan.sharedPath, Buffer.from('orphan')]]);
    const deleted = [];
    const client = {
      meta: async () => ({ items: unknown ? [{ name: 'synaiq-release-unknown', isDir: true }] : [] }),
      read: async path => remote.get(path),
      guard: async (path, hash) => assert.equal(sha(remote.get(path)), hash),
      tree: async name => ({ dirs: [name], files: [...remote].filter(([p]) => p.startsWith(name + '/')).map(([path, b]) => ({ path, size: b.length })).sort((a, b) => a.path.localeCompare(b.path)) }),
      removeAsset: async path => { deleted.push(path); remote.delete(path); },
      replace: async (path, bytes, expected) => { assert.equal(sha(remote.get(path)), expected); remote.set(path, bytes); },
    };
    await prepareCleanup(client, { keepReleases: 3 }, work, state);
    const plan = JSON.parse(await readFile(join(work, 'cleanup-plan.json')));
    if (unknown) { assert.deepEqual(plan.pool.remove, []); assert.equal(plan.pool.blockedByUnmanaged.length, 1); continue; }
    assert.deepEqual(plan.pool.remove.map(f => f.path), [orphan.sharedPath]);
    assert.equal((await readFile(join(work, 'backup', orphan.sharedPath))).toString(), 'orphan');
    await writeFile(join(work, 'backup.tar.gz.enc'), 'archive');
    const receipt = { status: 'download-verified', tag: 'test', planSha256: sha(await readFile(join(work, 'cleanup-plan.json'))), archiveSha256: sha('archive') };
    await prune(client, { keepReleases: 3 }, work, state, receipt, 'test');
    assert.deepEqual(deleted, [orphan.sharedPath]); assert.ok(remote.has(kept.sharedPath));
  }
});
