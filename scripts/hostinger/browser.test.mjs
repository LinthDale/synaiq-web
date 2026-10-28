import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { smokeMatrix, smokeQuery } from './browser.mjs';
import { SUPPORTED_LOCALES } from '../../docs/design/live-prototype/i18n.js';

const check = item => `${smokeQuery(item)}@${item.width}`;

test('the browser smoke keeps every page check and adds each case page listed in the sitemap', async () => {
  const matrix = smokeMatrix();
  const pages = matrix.filter(item => !item.caseId);
  const expected = ['home', 'kip', 'ems', 'pvsim', 'cases', 'about'].flatMap(page => SUPPORTED_LOCALES.flatMap(({code: lang}) => [390, 1440].map(width => ({ page, lang, width }))));
  expected.push(...['ems', 'pvsim'].flatMap(page => [320, 835].map(width => ({ page, lang: 'zh-Hant', width }))));
  assert.deepEqual(pages, expected);
  // The published sitemap is the reference: every case address in it, at phone and desktop width.
  const sitemap = await readFile(new URL('../../docs/design/live-prototype/sitemap.xml', import.meta.url), 'utf8');
  const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(([, loc]) => new URL(loc.replaceAll('&amp;', '&')))
    .filter(url => url.searchParams.has('case'));
  assert.ok(listed.length >= 2, 'the sitemap lists at least one case in both languages');
  assert.deepEqual(matrix.filter(item => item.caseId).map(check).sort(), listed.flatMap(url => [390, 1440].map(width => `${url.search}@${width}`)).sort());
  assert.equal(new Set(matrix.map(check)).size, matrix.length, 'no check is repeated');
});

test('case checks follow the crawl targets they are given, so only published cases are visited', () => {
  const targets = [
    { page: 'home', locale: 'zh-Hant', caseId: null },
    { page: 'cases', locale: 'en', caseId: null },
    { page: 'cases', locale: 'zh-Hant', caseId: 'example-case-2026' },
    { page: 'cases', locale: 'en', caseId: 'example-case-2026' },
  ];
  assert.deepEqual(smokeMatrix(targets).filter(item => item.caseId), [
    { page: 'cases', caseId: 'example-case-2026', lang: 'zh-Hant', width: 390 },
    { page: 'cases', caseId: 'example-case-2026', lang: 'zh-Hant', width: 1440 },
    { page: 'cases', caseId: 'example-case-2026', lang: 'en', width: 390 },
    { page: 'cases', caseId: 'example-case-2026', lang: 'en', width: 1440 },
  ]);
  // With no published case there is nothing extra to visit; the page checks stay unchanged.
  assert.deepEqual(smokeMatrix([]), smokeMatrix(targets).filter(item => !item.caseId));
});

test('smoke addresses keep the canonical parameter order', () => {
  assert.equal(smokeQuery({ page: 'home', lang: 'zh-Hant' }), '?page=home&lang=zh-Hant');
  assert.equal(smokeQuery({ page: 'cases', caseId: 'tainan-tech-forum-2026', lang: 'en' }), '?page=cases&case=tainan-tech-forum-2026&lang=en');
});
