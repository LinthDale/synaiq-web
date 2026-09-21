import test from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { mkdtemp, mkdir, readFile, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPreviewServer, PUBLIC_FILES } from './share-preview.mjs';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'synaiq-share-preview-'));
  const prototypeRoot = join(root, 'prototype');
  const brandRoot = join(root, 'brand');
  await mkdir(prototypeRoot);
  await mkdir(brandRoot);
  for (const entry of PUBLIC_FILES) {
    const path = join(entry.root === 'prototype' ? prototypeRoot : brandRoot, entry.file);
    await mkdir(join(path, '..'), { recursive: true });
    await writeFile(path, `fixture:${entry.file}`);
  }
  const server = createPreviewServer({ prototypeRoot, brandRoot });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    await rm(root, { recursive: true, force: true });
  });
  return { root, prototypeRoot, brandRoot, port: server.address().port };
}

function fetchRaw(port, path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = request({ hostname: '127.0.0.1', port, path, method }, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString() }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('serves the review shell at both public entry points and resolves its relative dependencies', async t => {
  const { port } = await fixture(t);
  assert.equal(PUBLIC_FILES.length, 66);
  assert.ok(PUBLIC_FILES.some(entry => entry.url === '/live-prototype/assets/synaiq-logo-ink.svg'));
  assert.ok(PUBLIC_FILES.some(entry => entry.url === '/live-prototype/assets/kip-connected-work-v1.webp'));
  for (const file of ['page-metadata.js', 'robots.txt', 'sitemap.xml']) {
    assert.ok(PUBLIC_FILES.some(entry => entry.url === `/live-prototype/${file}`), file);
  }
  for (const path of ['/', '/live-prototype/', '/live-prototype/index.html', '/page.html?page=kip', '/live-prototype/page.html?page=kip', '/live-prototype/page.html?page=cases', '/live-prototype/page.html?page=about&lang=en']) {
    const res = await fetchRaw(port, path);
    assert.equal(res.status, 200, path);
    assert.match(res.headers['content-type'], /text\/html/);
  }
  for (const entry of PUBLIC_FILES) {
    const res = await fetchRaw(port, entry.url);
    assert.equal(res.status, 200, entry.url);
    assert.equal(res.body, `fixture:${entry.file}`);
  }
});

test('uses no-store, noindex, same-origin framing and a narrow content security policy', async t => {
  const { port } = await fixture(t);
  const { headers } = await fetchRaw(port, '/');
  assert.equal(headers['cache-control'], 'no-store');
  assert.match(headers['x-robots-tag'], /noindex/);
  assert.equal(headers['x-content-type-options'], 'nosniff');
  assert.equal(headers['x-frame-options'], 'SAMEORIGIN');
  assert.equal(headers['referrer-policy'], 'no-referrer');
  assert.match(headers['content-security-policy'], /connect-src 'none'/);
  assert.match(headers['content-security-policy'], /frame-ancestors 'self'/);
  assert.doesNotMatch(headers['content-security-policy'], /unsafe-eval|\*|https:;/);
  // The published robots.txt allows crawling; this loopback review server must not.
  assert.match((await fetchRaw(port, '/robots.txt')).body, /Disallow: \//);
  const published = await fetchRaw(port, '/live-prototype/robots.txt');
  assert.equal(published.status, 200);
  assert.match(published.headers['content-type'], /text\/plain/);
  assert.match((await fetchRaw(port, '/live-prototype/sitemap.xml')).headers['content-type'], /application\/xml/);
});

test('HEAD has the GET length and headers but no body', async t => {
  const { port } = await fixture(t);
  const get = await fetchRaw(port, '/live-prototype/prototype.js');
  const head = await fetchRaw(port, '/live-prototype/prototype.js', 'HEAD');
  assert.equal(head.status, 200);
  assert.equal(head.body, '');
  assert.equal(head.headers['content-length'], get.headers['content-length']);
  assert.match(head.headers['content-type'], /text\/javascript/);
});

test('rejects every method except GET and HEAD', async t => {
  const { port } = await fixture(t);
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'TRACE']) {
    const res = await fetchRaw(port, '/', method);
    assert.equal(res.status, 405, method);
    assert.equal(res.headers.allow, 'GET, HEAD');
  }
});

test('denies non-runtime sources, private assets, directories and development endpoints', async t => {
  const { port } = await fixture(t);
  const denied = [
    '/.git/config', '/.env', '/docs/prd/PRD-001.md', '/live-prototype/README.md',
    '/live-prototype/content-sources.md', '/live-prototype/ceo-sketch-notes.md',
    '/live-prototype/share-preview.mjs', '/live-prototype/home-content.test.mjs',
    '/live-prototype/assets/kb-entry-redacted.png', '/live-prototype/assets/wilson-reference.png',
    '/live-prototype/assets/synaiq-logo-cis-6.jpg', '/assets/synaiq-logo-cis-6.jpg',
    '/live-prototype/assets/synaiq-logo-cis-5.jpg', '/assets/synaiq-logo-cis-5.jpg',
    '/live-prototype/assets/CIS-5.jpg', '/assets/CIS-5.jpg',
    '/live-prototype/assets/', '/brand/', '/brand/team/',
    '/brand/team/dale-web-1.jpg', '/live-prototype/assets/team/dale-sketch.webp',
    '/out/team-deck-20260911/company-introduction.pptx', '/out/team-deck-20260911/ppt/media/image11.png',
    '/live-prototype/assets/team/', '/live-prototype/assets/cases/',
    '/live-prototype/assets/cases/tokyo-1-1.jpg',
    '/live-prototype/ink-photo.test.mjs',
    '/brand/knowledge-base.png', '/@vite/client', '/@fs/C:/Users/User/.env',
    '/live-prototype/prototype.js.map', '/live-prototype/vite.config.mjs',
    '/live-prototype/scripts/sync-brand-screens.mjs', '/live-prototype/screen-templates/search.svg',
    '/live-prototype/locale-screens.js', '/live-prototype/localization-and-brand-guide.md',
  ];
  for (const path of denied) {
    const res = await fetchRaw(port, path);
    assert.equal(res.status, 404, path);
    assert.doesNotMatch(res.body, /[A-Z]:\\|Users|stack|ENOENT|fixture:/);
  }
});

test('the new pages expose only the explicitly selected portraits, field photos and runtime modules', () => {
  const allowed = new Set(PUBLIC_FILES.map(entry => entry.url));
  for (const file of ['cases-design.js', 'about-design.js', 'locale-cases.js', 'locale-about.js', 'ink-photo.js']) {
    assert.ok(allowed.has(`/live-prototype/${file}`), file);
  }
  const portraits = PUBLIC_FILES.filter(entry => entry.url.startsWith('/brand/team/')).map(entry => entry.file);
  assert.deepEqual(portraits, ['team/wilson-web-1.jpg', 'team/sunny-web-1.1.jpg', 'team/leff-web-1.jpg', 'team/lou-web-1.jpg', 'team/daniel-web-1.jpg']);
  assert.equal(PUBLIC_FILES.filter(entry => entry.url.startsWith('/live-prototype/assets/team/')).length, 10);
  assert.equal(PUBLIC_FILES.filter(entry => entry.url.startsWith('/live-prototype/assets/cases/')).length, 4);
  assert.equal(allowed.has('/live-prototype/assets/cases/tokyo-1-1.jpg'), false);
  assert.equal(allowed.has('/brand/team/daniel-web-1.jpg'), true);
});

test('rejects raw, encoded and double-encoded traversal and malformed URLs before normalization', async t => {
  const { port } = await fixture(t);
  for (const path of [
    '/../page.html', '/live-prototype/../page.html', '/live-prototype/%2e%2e/page.html',
    '/live-prototype/%252e%252e/page.html', '/live-prototype/%2fpage.html',
    '/live-prototype/%5cpage.html', '/live-prototype/./page.html',
    '/live-prototype//page.html', '//example.com/page.html', '/%00', '/%zz',
    '/live-prototype/page.html?bad=%GG', '/live-prototype/page.html#fragment',
    'http://example.com/live-prototype/page.html',
  ]) {
    const res = await fetchRaw(port, path);
    assert.equal(res.status, 400, path);
  }
});

test('does not read allowlisted file paths if replaced by a symlink outside the serving root', async t => {
  const { port, root, prototypeRoot } = await fixture(t);
  const outside = join(root, 'private.txt');
  await writeFile(outside, 'secret outside serving root');
  const candidate = join(prototypeRoot, 'prototype.js');
  await rm(candidate);
  try { await symlink(outside, candidate); }
  catch (error) {
    if (error.code === 'EPERM') { t.skip('This Windows user cannot create file symlinks'); return; }
    throw error;
  }
  const res = await fetchRaw(port, '/live-prototype/prototype.js');
  assert.equal(res.status, 404);
  assert.doesNotMatch(res.body, /secret|private/);
});

test('does not follow an allowlisted asset directory replaced by a junction', async t => {
  const { port, root, prototypeRoot } = await fixture(t);
  const outside = join(root, 'private-assets');
  await mkdir(outside);
  await writeFile(join(outside, 'ceo-speaking-sketch-v1.webp'), 'secret outside serving root');
  await rm(join(prototypeRoot, 'assets'), { recursive: true });
  await symlink(outside, join(prototypeRoot, 'assets'), process.platform === 'win32' ? 'junction' : 'dir');
  const res = await fetchRaw(port, '/live-prototype/assets/ceo-speaking-sketch-v1.webp');
  assert.equal(res.status, 404);
  assert.doesNotMatch(res.body, /secret|private/);
});

test('rejects junctions even when their target is still inside the serving root', async t => {
  const { port, prototypeRoot } = await fixture(t);
  const otherAssets = join(prototypeRoot, 'unreviewed-assets');
  await mkdir(otherAssets);
  await writeFile(join(otherAssets, 'ceo-speaking-sketch-v1.webp'), 'unreviewed replacement');
  await rm(join(prototypeRoot, 'assets'), { recursive: true });
  await symlink(otherAssets, join(prototypeRoot, 'assets'), process.platform === 'win32' ? 'junction' : 'dir');
  const res = await fetchRaw(port, '/live-prototype/assets/ceo-speaking-sketch-v1.webp');
  assert.equal(res.status, 404);
});

test('every local dependency named by the real design runtime is allowlisted', async () => {
  const allowed = new Set(PUBLIC_FILES.map(entry => entry.url));
  for (const entry of PUBLIC_FILES.filter(item => item.root === 'prototype' && /\.(?:js|css|html)$/.test(item.file))) {
    const source = await readFile(new URL(entry.file, import.meta.url), 'utf8');
    const dependencies = [
      ...source.matchAll(/(?:src|href)=["']((?:assets\/|\/brand\/|\.?\/?)[^"'<>]*\.(?:js|css|html|svg|png|jpg|webp))(?:\?[^"']*)?["']/g),
      ...source.matchAll(/(?:from\s+|url\()["']((?:\.\/)?(?:assets\/)?[^"']+\.(?:js|css|svg|png|jpg|webp))["']/g),
    ];
    for (const [, dependency] of dependencies) {
      if (/^https?:/.test(dependency)) continue;
      const pathname = new URL(dependency, `http://preview.test${entry.url}`).pathname;
      assert.ok(allowed.has(pathname), `${entry.file} references an unshared dependency: ${dependency}`);
    }
  }
});

test('the actual approved design runtime and every asset resolve through the real handler', async t => {
  const server = createPreviewServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  for (const entry of PUBLIC_FILES) {
    const res = await fetchRaw(server.address().port, entry.url, 'HEAD');
    assert.equal(res.status, 200, entry.url);
    assert.ok(Number(res.headers['content-length']) > 0, entry.url);
  }
});

test('missing and non-regular allowlisted files return generic 404 responses', async t => {
  const { port, prototypeRoot } = await fixture(t);
  await rm(join(prototypeRoot, 'home-design.js'));
  await rm(join(prototypeRoot, 'prototype.js'));
  await mkdir(join(prototypeRoot, 'prototype.js'));
  for (const path of ['/live-prototype/home-design.js', '/live-prototype/prototype.js']) {
    const res = await fetchRaw(port, path);
    assert.equal(res.status, 404);
    assert.equal(res.body, 'Not found\n');
  }
});
