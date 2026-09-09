import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { PUBLIC_FILES } from './share-preview.mjs';

const ADDRESS_VERSION = '20260909-address';
const root = new URL('.', import.meta.url);
const edges = [
  ['page.html', /<script\s+type="module"\s+src="([^"]+)"/, 'prototype.js'],
  ['prototype.js', /from ['"]([^'"]*i18n\.js[^'"]*)['"]/, 'i18n.js'],
  ['i18n.js', /from ['"]([^'"]*locale-common\.js[^'"]*)['"]/, 'locale-common.js'],
];

for (const [source, pattern, target] of edges) {
  test(`${source} bypasses stale address caches when loading ${target}`, () => {
    const sourceUrl = new URL(source, root);
    const specifier = readFileSync(sourceUrl, 'utf8').match(pattern)?.[1];
    assert.ok(specifier, `${source} must load ${target}`);
    const targetUrl = new URL(specifier, sourceUrl);
    assert.equal(targetUrl.search, `?v=${ADDRESS_VERSION}`);
    assert.equal(targetUrl.hash, '');
    targetUrl.search = '';
    assert.equal(targetUrl.href, new URL(target, root).href);
    assert.ok(statSync(targetUrl).isFile());
    assert.ok(PUBLIC_FILES.some(entry => entry.root === 'prototype' && entry.file === target));
  });
}

test('versioned locale imports resolve with the approved bilingual address', async () => {
  const { getMessages } = await import(`./i18n.js?v=${ADDRESS_VERSION}`);
  assert.equal(getMessages('zh-Hant').common.footer.address, '407臺中市西屯區何安里臺灣大道二段910號10樓之2');
  assert.equal(getMessages('en').common.footer.address, '10F.-2, No. 910, Sec. 2, Taiwan Blvd., He’an Vil., Xitun Dist., Taichung City 407, Taiwan');
});
