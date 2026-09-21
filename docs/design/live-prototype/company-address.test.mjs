import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { SUPPORTED_LOCALES, SUPPORTED_PAGES, resolveLocale, resolvePage, getMessages, localeHref, escapeHtml } from './i18n.js';
import { pageMetadata } from './page-metadata.js';
import { createHeadShim } from './head-test-helpers.mjs';

const ADDRESS_ZH = '407臺中市西屯區何安里臺灣大道二段910號10樓之2';
const ADDRESS_EN = '10F.-2, No. 910, Sec. 2, Taiwan Blvd., He’an Vil., Xitun Dist., Taichung City 407, Taiwan';
const shell = readFileSync(new URL('./page.html', import.meta.url), 'utf8');
const source = readFileSync(new URL('./prototype.js', import.meta.url), 'utf8');
const shellBootstrap = source.slice(source.indexOf('const query ='), source.indexOf('const sections ='));

test('Traditional Chinese and English catalogs contain the approved company address', () => {
  assert.equal(getMessages('zh-Hant').common.footer.address, ADDRESS_ZH);
  assert.equal(getMessages('en').common.footer.address, ADDRESS_EN);
});

test('the shared footer shows the new Chinese address even without JavaScript', () => {
  const address = shell.match(/<p[^>]*data-i18n="footer\.address"[^>]*>([^<]*)<\/p>/)?.[1];
  assert.equal(address, ADDRESS_ZH);
  assert.doesNotMatch(shell, /文心路|Wenxin/);
});

for (const page of SUPPORTED_PAGES) {
  for (const [locale, expectedAddress] of [['zh-Hant', ADDRESS_ZH], ['en', ADDRESS_EN]]) {
    test(`${page} shell bootstraps the ${locale} footer with the new address`, () => {
      const address = { dataset: { i18n: 'footer.address' }, textContent: '' };
      const language = { innerHTML: '', addEventListener() {} };
      const { head, createElement } = createHeadShim();
      const document = {
        documentElement: {},
        head,
        createElement,
        body: { dataset: {} },
        querySelectorAll: selector => selector === '[data-i18n]' ? [address] : [],
        getElementById: id => id === 'language' ? language : null,
      };
      // The bootstrap registers page functions but must not invoke them before
      // the translated shared shell has been populated.
      const pageFunctions = Object.fromEntries(['Home', 'Kip', 'Cases', 'About'].flatMap(name =>
        ['render', 'init'].map(prefix => [`${prefix}${name}`, () => { throw new Error('Page initialization must follow shell translation'); }])));
      vm.runInNewContext(shellBootstrap, {
        location: new URL(`https://example.test/page.html?page=${page}&lang=${locale}`),
        document, URLSearchParams, SUPPORTED_LOCALES, resolveLocale, resolvePage, getMessages, localeHref, esc: escapeHtml, pageMetadata,
        ...pageFunctions,
      });
      assert.equal(document.body.dataset.page, page);
      assert.equal(document.documentElement.lang, locale);
      assert.equal(document.title, getMessages(locale).common.title[page]);
      // The same bootstrap writes the crawl metadata; seo-metadata.test.mjs covers every tag.
      assert.equal(head.querySelector('link[rel="canonical"]').getAttribute('href'), pageMetadata({ page, locale }).canonical);
      assert.equal(address.textContent, expectedAddress);
      assert.doesNotMatch(address.textContent, /文心路|Wenxin/);
    });
  }
}
