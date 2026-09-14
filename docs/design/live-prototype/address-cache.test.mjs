import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { PUBLIC_FILES } from './share-preview.mjs';

const TEAM_CONTENT_VERSION = '20260911-team-content';
const root = new URL('.', import.meta.url);
const edges = [
  ['page.html', /<script\s+type="module"\s+src="([^"]+)"/, 'prototype.js', TEAM_CONTENT_VERSION],
  ['prototype.js', /from ['"]([^'"]*i18n\.js[^'"]*)['"]/, 'i18n.js', TEAM_CONTENT_VERSION],
  ['i18n.js', /from ['"]([^'"]*locale-about\.js[^'"]*)['"]/, 'locale-about.js', TEAM_CONTENT_VERSION],
  ['i18n.js', /from ['"]([^'"]*locale-common\.js[^'"]*)['"]/, 'locale-common.js', TEAM_CONTENT_VERSION],
  ['i18n.js', /from ['"]([^'"]*locale-home\.js[^'"]*)['"]/, 'locale-home.js', TEAM_CONTENT_VERSION],
  ['i18n.js', /from ['"]([^'"]*locale-kip\.js[^'"]*)['"]/, 'locale-kip.js', TEAM_CONTENT_VERSION],
  ['i18n.js', /from ['"]([^'"]*locale-cases\.js[^'"]*)['"]/, 'locale-cases.js', TEAM_CONTENT_VERSION],
  ['i18n.js', /from ['"]([^'"]*locale-demo\.js[^'"]*)['"]/, 'locale-demo.js', TEAM_CONTENT_VERSION],
];

for (const [source, pattern, target, version] of edges) {
  test(`${source} bypasses stale content caches when loading ${target}`, () => {
    const sourceUrl = new URL(source, root);
    const specifier = readFileSync(sourceUrl, 'utf8').match(pattern)?.[1];
    assert.ok(specifier, `${source} must load ${target}`);
    const targetUrl = new URL(specifier, sourceUrl);
    assert.equal(targetUrl.search, `?v=${version}`);
    assert.equal(targetUrl.hash, '');
    targetUrl.search = '';
    assert.equal(targetUrl.href, new URL(target, root).href);
    assert.ok(statSync(targetUrl).isFile());
    assert.ok(PUBLIC_FILES.some(entry => entry.root === 'prototype' && entry.file === target));
  });
}

test('versioned locale imports resolve with the approved bilingual address', async () => {
  const { getMessages } = await import(`./i18n.js?v=${TEAM_CONTENT_VERSION}`);
  assert.equal(getMessages('zh-Hant').common.footer.address, '407臺中市西屯區何安里臺灣大道二段910號10樓之2');
  assert.equal(getMessages('en').common.footer.address, '10F.-2, No. 910, Sec. 2, Taiwan Blvd., He’an Vil., Xitun Dist., Taichung City 407, Taiwan');
});
