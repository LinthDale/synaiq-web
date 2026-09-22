import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { pageHref, getMessages } from './i18n.js';
import { DEFAULT_CASE } from './cases-data.js';
import { renderCases } from './cases-design.js';

// The shell rebuilds every internal link for the requested language. That rewrite is the
// one place a card's case identifier could silently disappear, so the real loop is run
// here instead of a restatement of it.
const source = readFileSync(new URL('./prototype.js', import.meta.url), 'utf8');
const rewrite = (() => {
  const start = source.indexOf('for (const link of document.querySelectorAll(\'a[href^="?page="]\')');
  const end = source.indexOf('\npages[page].init(');
  assert.ok(start > 0 && end > start, 'prototype.js must still rewrite internal links before initializing the page');
  return source.slice(start, end);
})();

function rewriteHrefs(hrefs, locale, base = 'https://synaiq.com/live-prototype/page.html?page=cases&lang=zh-Hant') {
  const links = hrefs.map(href => {
    const attributes = new Map([['href', href]]);
    return {
      getAttribute: name => attributes.get(name) ?? null,
      setAttribute: (name, value) => attributes.set(name, value),
    };
  });
  vm.runInNewContext(rewrite, {
    document: { querySelectorAll: () => links }, location: new URL(base), locale, pageHref, URL,
  });
  return links.map(link => link.getAttribute('href'));
}

test('the language rewrite carries the case identifier instead of flattening the card', () => {
  assert.deepEqual(rewriteHrefs([
    `?page=cases&case=${DEFAULT_CASE}&lang=zh-Hant`,
    `?page=cases&case=${DEFAULT_CASE}&lang=zh-Hant#fieldnotes`,
    '?page=cases&lang=zh-Hant',
    '?page=home',
    '?page=home#wally',
    '?page=about&lang=zh-Hant',
  ], 'en'), [
    `?page=cases&case=${DEFAULT_CASE}&lang=en`,
    `?page=cases&case=${DEFAULT_CASE}&lang=en#fieldnotes`,
    '?page=cases&lang=en',
    '?page=home&lang=en',
    '?page=home&lang=en#wally',
    '?page=about&lang=en',
  ]);
  // Parameter order stays page, case, language whichever order the markup used.
  assert.deepEqual(rewriteHrefs([`?lang=en&case=${DEFAULT_CASE}&page=cases`], 'zh-Hant'), [`?page=cases&case=${DEFAULT_CASE}&lang=zh-Hant`]);
  // An identifier outside the approved shape is dropped, never reflected into the document.
  for (const value of ['<script>', '../../private', 'Tokyo Foodex', '__proto__']) {
    assert.deepEqual(rewriteHrefs([`?page=cases&case=${encodeURIComponent(value)}&lang=zh-Hant`], 'en'), ['?page=cases&lang=en'], value);
  }
});

test('every link the work page renders survives the rewrite with its own target', () => {
  for (const [from, to] of [['zh-Hant', 'en'], ['en', 'zh-Hant']]) {
    for (const caseId of [null, DEFAULT_CASE]) {
      const markup = renderCases({ locale: from, caseId });
      const hrefs = [...markup.matchAll(/href="(\?page=[^"]+)"/g)].map(match => match[1].replaceAll('&amp;', '&'));
      assert.ok(hrefs.length > 0, `${from}->${to}`);
      const rewritten = rewriteHrefs(hrefs, to);
      for (const [index, href] of rewritten.entries()) {
        assert.match(href, new RegExp(`(^|&)lang=${to}(&|#|$)`), href);
        // A card keeps its case; a back link keeps its absence.
        assert.equal(href.includes(`case=${DEFAULT_CASE}`), hrefs[index].includes(`case=${DEFAULT_CASE}`), hrefs[index]);
      }
    }
  }
});

test('the overview links to each case and a case links back to the overview', () => {
  for (const locale of ['zh-Hant', 'en']) {
    const overview = renderCases({ locale });
    assert.ok(overview.includes(`href="?page=cases&amp;case=${DEFAULT_CASE}&amp;lang=${locale}"`), locale);
    const detail = renderCases({ locale, caseId: DEFAULT_CASE });
    assert.ok(detail.includes(`href="?page=cases&amp;lang=${locale}"`), locale);
    assert.ok(!detail.includes(`href="?page=cases&amp;case=${DEFAULT_CASE}&amp;lang=${locale}"`), `${locale}: a case must not link to itself`);
    // The in-case anchors are the ones the legacy addresses used.
    assert.ok(detail.includes('href="#story"'), locale);
    assert.ok(detail.includes('id="fieldnotes"'), locale);
    // Section links are always in-page; the directory never changes the address.
    assert.ok(getMessages(locale).common.navigation.casesList.length > 0, locale);
  }
});
