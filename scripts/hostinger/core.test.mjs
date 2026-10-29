import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { activeRelease, buildRouting, transformSource, retentionPlan, assertNoDependencies, encrypt, decrypt, safePath } from './core.mjs';

const current = 'synaiq-release-a', name = 'synaiq-release-b';
const base = `# BEGIN LSCACHE\nKeep vendor directives\n# END LSCACHE\nRewriteRule ^$ /${current}/index.html [L]\nRewriteRule ^robots\\.txt$ /${current}/robots.txt [L]\nRewriteRule ^sitemap\\.xml$ /${current}/sitemap.xml [L]\n# Only inspected static releases remain public.\nRewriteRule ^${current}/(?:index\\.html|page\\.html|robots\\.txt|sitemap\\.xml)$ - [L]\nRewriteRule ^synaiq-release-older/(?:index\\.html)$ - [L]\nRewriteRule ^wp-content/uploads/2026/03/toutou-2\\.png$ - [L]\nRewriteRule ^ - [G,L]\n# Active folder: ${current};\nHeader always set Cache-Control "no-cache, must-revalidate"\n`;
const paths = ['index.html', 'page.html', 'robots.txt', 'sitemap.xml', 'assets/a.png'];
test('nested generated catalogs retain explicit routing and cache rules', () => {
  const nested = [...paths, 'locales/generated/de.js', 'locale-bootstrap.js'];
  const { live } = buildRouting(base, name, nested);
  assert.ok(live.includes('locales/generated/de\\.js'));
  const matcher = new RegExp(live.match(/<FilesMatch "([^"]+)">/)[1]);
  for (const file of ['de.js', 'fr.js', 'ja.js', 'zh-Hant.js', 'pt-BR.js', 'startup.js', 'registry.js', 'loaders.js']) assert.ok(matcher.test(file));
  const next = buildRouting(live, 'synaiq-release-c', nested).live;
  assert.equal(next.split('# Generated translation module cache policy').length, 2);
  const html = transformSource(Buffer.from('<link rel="modulepreload" href="locale-bootstrap.js"><script type="module" src="locale-bootstrap.js"></script>'), 'page.html', name).toString();
  assert.ok(html.includes(`href="/${name}/locale-bootstrap.js"`));
  assert.ok(html.includes(`src="/${name}/locale-bootstrap.js"`));
});

test('a later release upgrades the old three-language cache block without duplicating it', () => {
  const old = `${base}\n# Generated translation module cache policy\n<IfModule mod_headers.c>\n<FilesMatch "^(?:zh-Hant|en|de|startup)\\.js$">\nHeader always set Cache-Control "no-cache, must-revalidate"\n</FilesMatch>\n</IfModule>\n`;
  const { live } = buildRouting(old, name, paths);
  assert.equal(live.split('# Generated translation module cache policy').length, 2);
  assert.ok(new RegExp(live.match(/<FilesMatch "([^"]+)">/)[1]).test('ja.js'));
  assert.ok(live.includes('Keep vendor directives'));
});
test('staging leaves root unchanged and activation moves root plus crawl files together', () => {
  const { preview, live } = buildRouting(base, name, paths);
  assert.equal(activeRelease(preview), current); assert.equal(activeRelease(live), name);
  assert.ok(!live.includes('synaiq-release-older'));
  assert.ok(live.startsWith(base.slice(0, base.indexOf('RewriteRule'))));
  assert.ok(live.includes('RewriteRule ^wp-content/uploads/2026/03/toutou-2\\.png$ - [L]'));
  assert.ok(live.includes(`RewriteRule ^robots\\.txt$ /${name}/robots.txt [L]`));
  assert.ok(live.includes(`RewriteRule ^sitemap\\.xml$ /${name}/sitemap.xml [L]`));
});
test('unknown routes, duplicate roots, missing crawl payload and path traversal fail closed', () => {
  for (const text of [base + `RewriteRule ^$ /${current}/index.html [L]\n`, base.replace('RewriteRule ^ - [G,L]', ''), base.replace('RewriteRule ^robots', 'DifferentRule ^robots')]) assert.throws(() => buildRouting(text, name, paths));
  assert.throws(() => buildRouting(base, name, paths.filter(p => p !== 'robots.txt')));
  for (const path of ['../secret', '/absolute', 'a//b', 'a/../b', 'a\\b', 'a?x']) assert.throws(() => safePath(path));
});
test('packaging rewrites cache-busted entry URLs and never includes preview runtime', () => {
  const input = Buffer.from('<link href="site.css?v=42"><script src="prototype.js?v=42"></script><img src="assets/a.png"><img src="/brand/a.svg">');
  const output = transformSource(input, 'page.html', name).toString();
  assert.ok(output.includes(`href="/${name}/site.css?v=42"`));
  assert.ok(output.includes(`src="/${name}/prototype.js?v=42"`));
  assert.ok(output.includes(`src="/${name}/assets/a.png"`));
  assert.throws(() => transformSource(Buffer.from('Local preview'), 'page.html', name));
});
test('retention uses successful activation order and protects referenced versions', () => {
  const releases = ['a', 'z', 'c', 'd'].map(s => ({ name: `synaiq-release-${s}` }));
  const state = { schema: 1, active: current, releases };
  assert.deepEqual(retentionPlan(state, base), { keep: releases.slice(0, 3).map(r => r.name), remove: ['synaiq-release-d'] });
  assert.throws(() => retentionPlan(state, base + '/synaiq-release-d/a.png'));
  assert.throws(() => retentionPlan(state, base, 1));
  assert.throws(() => assertNoDependencies([['a.js', Buffer.from('"/synaiq-release-d/a.png"')]], ['synaiq-release-d']));
  assert.doesNotThrow(() => assertNoDependencies([['a.js', Buffer.from('"/wp-content/a.png"')]], ['synaiq-release-d']));
});
test('encrypted archives authenticate content, key and nonce with AES-GCM', () => {
  const key = randomBytes(32).toString('hex'), plain = randomBytes(2048), ciphertext = encrypt(plain, key);
  assert.deepEqual(decrypt(ciphertext, key), plain);
  const corrupt = Buffer.from(ciphertext); corrupt[40] ^= 1;
  assert.throws(() => decrypt(corrupt, key));
  assert.throws(() => decrypt(ciphertext, randomBytes(32).toString('hex')));
  assert.throws(() => encrypt(plain, 'bad'));
  assert.notDeepEqual(encrypt(plain, key), ciphertext);
});
test('workflow isolates PRs from secrets and serializes production mutations', async () => {
  const workflow = await readFile(new URL('../../.github/workflows/hostinger.yml', import.meta.url), 'utf8');
  assert.ok(workflow.includes('cancel-in-progress: false'));
  assert.ok(workflow.includes("github.event_name != 'pull_request'"));
  assert.ok(workflow.includes('name: production'));
  assert.ok(!workflow.split('  deploy:')[0].includes('secrets.'));
  assert.ok(!workflow.includes('pull_request_target'));
});
