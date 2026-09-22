import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderCases, caseSectionIds } from './cases-design.js';
import { CASES, DEFAULT_CASE, publishedCases, findCase } from './cases-data.js';
import { crawlUrls } from './page-metadata.js';
import { getMessages } from './i18n.js';
import { PUBLIC_FILES } from './share-preview.mjs';

// A second case exists only inside this file. It proves the shared templates take another
// entry — a landscape cover, no paired sketch, no field record, no coverage — without any
// change to them. It is never published, never allowlisted and never written to disk, so no
// invented case can reach the site through the public data modules.
const FIXTURE_ID = 'fixture-landscape-case';
const FIXTURE = Object.freeze({
  id: FIXTURE_ID, published: true, featured: true,
  date: Object.freeze({ start: '2026-09', end: '2026-09', precision: 'month' }),
  tags: Object.freeze(['exhibition']),
  cover: Object.freeze({ image: 'assets/cases/fixture-wide.jpg', focus: '50% 40%' }),
  hero: Object.freeze({ key: 'hero', photo: 'assets/cases/fixture-wide.jpg', aspect: '16 / 9', kind: 'scene', eager: true }),
  media: Object.freeze([]),
});
// A hostile name also checks that every case string is escaped before it reaches markup.
const FIXTURE_TEXT = Object.freeze({
  name: '<script>alert(1)</script> 橫式測試',
  dateLabel: '2026.09',
  summary: '僅用於測試擴充能力的第二筆資料。',
  chapter: '02 / FIXTURE', journey: 'FIXTURE',
  photos: Object.freeze({ hero: Object.freeze({ alt: 'fixture landscape alt', caption: 'fixture caption' }) }),
  facts: Object.freeze([Object.freeze(['場域', '測試資料', '僅用於測試'])]),
  story: Object.freeze({ eyebrow: '01 / FIXTURE', title: Object.freeze(['測試標題']), paragraphs: Object.freeze(['測試段落。']) }),
});

/** A copy of the catalog with the fixture added; the shipped catalog is never mutated. */
function messagesWith(locale) {
  const base = getMessages(locale);
  return { ...base, cases: { ...base.cases, cases: { ...base.cases.cases, [FIXTURE_ID]: FIXTURE_TEXT } } };
}

const twoCases = Object.freeze([findCase(DEFAULT_CASE), FIXTURE]);
const classesOf = markup => [...markup.matchAll(/\sclass="([^"]+)"/g)].map(match => match[1]);
const idsOf = markup => [...markup.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]).filter(id => !id.startsWith('ink-'));

test('a second case turns the overview into a grid with one shared cover ratio', () => {
  const markup = renderCases({ locale: 'zh-Hant', messages: messagesWith('zh-Hant'), cases: twoCases });
  assert.match(markup, /case-card-grid"/);
  assert.ok(!markup.includes('case-card-grid--single'));
  assert.ok(!markup.includes('case-card--featured'));
  // Every cover in the grid is cropped to the same box, so mixed orientations stay even.
  assert.equal([...markup.matchAll(/--case-cover-aspect:3 \/ 2/g)].length, 2);
  assert.equal([...markup.matchAll(/case-card--grid/g)].length, 2);
  assert.ok(markup.includes('--case-cover-focus:50% 40%'), 'the fixture keeps its own focus');
  assert.ok(markup.includes('--case-cover-focus:50% 32%'), 'the shipped case keeps its own focus');
  // The featured case leads, then newest first.
  assert.ok(markup.indexOf(FIXTURE_ID) < markup.indexOf(DEFAULT_CASE));
  assert.ok(markup.includes('href="?page=cases&amp;case=fixture-landscape-case&amp;lang=zh-Hant"'));
  // Escaped, not executed.
  assert.ok(markup.includes('&lt;script&gt;alert(1)&lt;/script&gt; 橫式測試'));
  assert.ok(!markup.includes('<script>alert(1)'));
});

test('a landscape case leads with a full-width photograph and needs no sketch', () => {
  const messages = messagesWith('zh-Hant');
  const markup = renderCases({ locale: 'zh-Hant', messages, caseId: FIXTURE_ID, cases: twoCases });
  assert.match(markup, /data-cases-state="detail"/);
  assert.match(markup, /cases-hero-layout--landscape/);
  assert.ok(!markup.includes('cases-hero-layout--portrait'));
  // No paired sketch: the plain photograph is shown, with no reveal control at all.
  assert.match(markup, /<img class="case-photo" src="assets\/cases\/fixture-wide\.jpg"/);
  assert.match(markup, /--case-photo-aspect:16 \/ 9/);
  assert.ok(!markup.includes('data-ink-photo'));
  assert.ok(markup.includes(FIXTURE_TEXT.photos.hero.caption));
  // Absent blocks leave no heading behind, and the directory agrees with the page.
  assert.deepEqual(idsOf(markup).filter(id => ['story', 'fieldnotes', 'press'].includes(id)), ['story']);
  assert.deepEqual([...caseSectionIds({ caseId: FIXTURE_ID, messages, cases: twoCases })], ['story']);
  assert.ok(!markup.includes('case-field'));
  assert.ok(!markup.includes('case-press'));
  assert.ok(!markup.includes('case-notes'));
});

test('adding a case leaves the existing case detail structurally untouched', () => {
  const shipped = renderCases({ locale: 'zh-Hant', caseId: DEFAULT_CASE });
  const alongside = renderCases({ locale: 'zh-Hant', messages: messagesWith('zh-Hant'), caseId: DEFAULT_CASE, cases: twoCases });
  assert.deepEqual(classesOf(alongside), classesOf(shipped));
  assert.deepEqual(idsOf(alongside), idsOf(shipped));
  const text = getMessages('zh-Hant').cases.cases[DEFAULT_CASE];
  for (const value of [text.name, text.summary, text.story.paragraphs[0], text.field.eyebrow, text.press.title]) {
    assert.ok(alongside.includes(value), value);
  }
  assert.ok(!alongside.includes(FIXTURE_ID));
});

test('the test fixture is isolated from everything the site publishes', () => {
  assert.equal(publishedCases().find(entry => entry.id === FIXTURE_ID), undefined);
  assert.equal(CASES.find(entry => entry.id === FIXTURE_ID), undefined);
  assert.equal(findCase(FIXTURE_ID), null);
  for (const locale of ['zh-Hant', 'en']) {
    assert.equal(getMessages(locale).cases.cases[FIXTURE_ID], undefined, locale);
  }
  assert.equal(PUBLIC_FILES.find(entry => entry.file.includes('fixture')), undefined);
  assert.ok(!crawlUrls().some(url => url.includes(FIXTURE_ID)));
  const sitemap = readFileSync(new URL('./sitemap.xml', import.meta.url), 'utf8');
  assert.ok(!sitemap.includes(FIXTURE_ID));
  assert.ok(!sitemap.includes('fixture'));
});
