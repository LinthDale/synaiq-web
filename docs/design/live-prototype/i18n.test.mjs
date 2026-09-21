import test from 'node:test';
import assert from 'node:assert/strict';
import { SUPPORTED_LOCALES, SUPPORTED_PAGES, resolveLocale, resolvePage, getMessages, pageHref, localeHref, escapeHtml, messageShape } from './i18n.js';

test('locale selection is explicit, canonical and safely falls back to Traditional Chinese', () => {
  for (const value of ['', undefined, 'de', '../../private', '<script>', 'zh', 'zh-TW']) assert.equal(resolveLocale(value), 'zh-Hant');
  assert.equal(resolveLocale('EN'), 'en');
  assert.equal(resolveLocale('zh-Hant'), 'zh-Hant');
  assert.ok(SUPPORTED_LOCALES.some(item => item.code === 'zh-Hant'));
  assert.ok(SUPPORTED_LOCALES.some(item => item.code === 'en'));
  assert.equal(new Set(SUPPORTED_LOCALES.map(item => item.code)).size, SUPPORTED_LOCALES.length);
});

test('each supplied language has every semantic message key and array entry', () => {
  const baseline = messageShape(getMessages('zh-Hant'));
  for (const {code} of SUPPORTED_LOCALES) assert.deepEqual(messageShape(getMessages(code)), baseline, code);
  assert.equal(getMessages('en').common.navigation.home, 'Home');
  assert.equal(getMessages('zh-Hant').common.navigation.home, '首頁');
});

test('page links and language changes preserve page and section without choosing arbitrary resources', () => {
  assert.deepEqual(SUPPORTED_PAGES, ['home', 'kip', 'cases', 'about']);
  for (const page of SUPPORTED_PAGES) {
    assert.equal(resolvePage(page), page);
    assert.equal(pageHref({ page, locale: 'en', hash: 'contact' }), `?page=${page}&lang=en#contact`);
    assert.equal(localeHref(`https://example.com/page.html?page=${page}&lang=en#contact`, 'zh-Hant'), `/page.html?page=${page}&lang=zh-Hant#contact`);
    for (const locale of ['zh-Hant', 'en']) {
      assert.ok(getMessages(locale)[page]);
      assert.ok(getMessages(locale).common.title[page]);
      const navigation = getMessages(locale).common.navigation;
      const label = navigation[`${page}Page`] ?? navigation[page];
      // Home deliberately leads with the brand and tagline; every other page leads with its own name.
      if (page !== 'home') assert.ok(getMessages(locale).common.title[page].startsWith(`${label} — SynaiQ`), `${locale}/${page}`);
    }
  }
  for (const value of [undefined, '', 'constructor', '__proto__', '../../private']) assert.equal(resolvePage(value), 'home');
  assert.equal(pageHref({page:'kip',locale:'en',hash:'architecture'}), '?page=kip&lang=en#architecture');
  assert.equal(pageHref({page:'unknown',locale:'unknown'}), '?page=home&lang=zh-Hant');
  assert.equal(localeHref('https://example.com/live-prototype/page.html?page=kip&lang=en#proof','zh-Hant'), '/live-prototype/page.html?page=kip&lang=zh-Hant#proof');
  assert.equal(localeHref('https://example.com/live-prototype/?page=home&lang=zh-Hant#contact','en'), '/live-prototype/?page=home&lang=en#contact');
});

test('no language bundle carries local preview wording into published copy', () => {
  // The local shell is named 本機預覽／Local preview; prototype wording must never reach a published string.
  for (const { code } of SUPPORTED_LOCALES) assert.doesNotMatch(JSON.stringify(getMessages(code)), /設計原型|prototype/i, code);
});

test('plain translation strings are escaped before insertion into markup', () => {
  assert.equal(escapeHtml('<img src="x" onerror=\'x\'>&'), '&lt;img src=&quot;x&quot; onerror=&#39;x&#39;&gt;&amp;');
  assert.equal(escapeHtml('邱浩煒 Wilson'), '邱浩煒 Wilson');
});
