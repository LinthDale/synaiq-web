import test from 'node:test';
import assert from 'node:assert/strict';
import { renderCases, caseSectionIds } from './cases-design.js';
import { DEFAULT_CASE, publishedCases } from './cases-data.js';
import { getMessages, escapeHtml } from './i18n.js';

const CONTACT = '<div id="contact"></div>';
const render = options => renderCases({ contact: () => CONTACT, ...options });
const ids = markup => [...markup.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
// Approved copy contains ampersands and quotes, so it is compared in its escaped form.
const has = (markup, value) => markup.includes(escapeHtml(value));

test('the overview introduces the work as a whole and leads to each case by its own address', () => {
  for (const locale of ['zh-Hant', 'en']) {
    const copy = getMessages(locale).cases;
    const markup = render({ locale });
    assert.match(markup, /data-cases-state="overview"/, locale);
    assert.ok(has(markup, copy.overview.intro), locale);
    assert.ok(has(markup, copy.overview.listTitle), locale);
    assert.ok(ids(markup).includes('cases-list'), locale);
    // One published case reads as a single full-width feature, not a lonely grid cell.
    assert.equal(publishedCases().length, 1, 'this expectation is written for the first case only');
    assert.match(markup, /case-card-grid--single/, locale);
    assert.match(markup, /case-card--featured/, locale);
    for (const entry of publishedCases()) {
      const text = copy.cases[entry.id];
      assert.ok(markup.includes(`href="?page=cases&amp;case=${entry.id}&amp;lang=${locale}"`), `${locale}/${entry.id}`);
      assert.ok(has(markup, text.name), `${locale}/${entry.id}`);
      assert.ok(has(markup, text.summary), `${locale}/${entry.id}`);
      assert.ok(has(markup, text.dateLabel), `${locale}/${entry.id}`);
      assert.ok(markup.includes(`src="${entry.cover.image}"`), `${locale}/${entry.id}`);
      assert.ok(markup.includes(`--case-cover-focus:${entry.cover.focus}`), `${locale}/${entry.id}`);
      for (const tag of entry.tags) assert.ok(has(markup, copy.tags[tag]), `${locale}/${tag}`);
    }
    // The overview carries no case interior: no story, no field notes, no coverage.
    for (const id of ['story', 'fieldnotes', 'press']) assert.ok(!ids(markup).includes(id), `${locale}: ${id}`);
    assert.ok(!has(markup, copy.cases[DEFAULT_CASE].story.paragraphs[0]), locale);
    assert.ok(markup.endsWith(CONTACT), locale);
    assert.ok(has(markup, copy.overview.closing), locale);
  }
});

test('one case detail holds its story, field record and coverage, and leads back to the overview', () => {
  for (const locale of ['zh-Hant', 'en']) {
    const copy = getMessages(locale).cases;
    const text = copy.cases[DEFAULT_CASE];
    const entry = publishedCases().find(item => item.id === DEFAULT_CASE);
    const markup = render({ locale, caseId: DEFAULT_CASE });
    assert.match(markup, /data-cases-state="detail"/, locale);
    assert.ok(markup.includes(`<h1 id="cases-title">${escapeHtml(text.name)}</h1>`), locale);
    assert.ok(has(markup, text.summary), locale);
    assert.deepEqual(ids(markup).filter(id => ['story', 'fieldnotes', 'press'].includes(id)), ['story', 'fieldnotes', 'press'], locale);
    // The section markers the case already uses stay exactly as approved.
    assert.ok(has(markup, text.story.eyebrow), locale);
    assert.ok(has(markup, text.field.eyebrow), locale);
    for (const paragraph of text.story.paragraphs) assert.ok(has(markup, paragraph), locale);
    for (const [title] of text.field.notes) assert.ok(has(markup, title), locale);
    for (const [, value] of text.facts) assert.ok(has(markup, value), locale);
    // Both photographs keep their paired sketch and their caption.
    for (const photo of [entry.hero, ...entry.field.photos]) {
      assert.ok(markup.includes(`href="${photo.sketch}"`), `${locale}/${photo.key} sketch`);
      assert.ok(markup.includes(`href="${photo.photo}"`), `${locale}/${photo.key} photo`);
      assert.ok(has(markup, text.photos[photo.key].caption), `${locale}/${photo.key} caption`);
    }
    assert.match(markup, /cases-hero-layout--portrait/, locale);
    for (const url of entry.media) assert.ok(markup.includes(`href="${url}"`), `${locale}: ${url}`);
    assert.ok(markup.includes(`href="?page=cases&amp;lang=${locale}"`), locale);
    assert.ok(has(markup, copy.overview.back), locale);
    assert.ok(markup.endsWith(CONTACT), locale);
    // The overview's own list never appears inside a case.
    assert.ok(!ids(markup).includes('cases-list'), locale);
    assert.ok(!markup.includes('case-card-grid'), locale);
  }
});

test('the in-page directory names only the sections a case renders', () => {
  const messages = getMessages('zh-Hant');
  assert.deepEqual([...caseSectionIds({ messages })], ['cases-list']);
  assert.deepEqual([...caseSectionIds({ caseId: DEFAULT_CASE, messages })], ['story', 'fieldnotes', 'press']);
  assert.deepEqual([...caseSectionIds({ caseId: 'not-a-case', messages })], []);
  assert.deepEqual([...caseSectionIds({ caseState: 'notFound', messages })], []);
});

test('an unknown identifier says so, offers the overview and shows no case content', () => {
  for (const locale of ['zh-Hant', 'en']) {
    const copy = getMessages(locale).cases;
    const markup = render({ locale, caseId: 'not-a-case' });
    assert.match(markup, /data-cases-state="notFound"/, locale);
    assert.ok(has(markup, copy.overview.notFound.title), locale);
    assert.ok(has(markup, copy.overview.notFound.body), locale);
    assert.ok(markup.includes(`href="?page=cases&amp;lang=${locale}"`), locale);
    // Not a trace of a real case, and no closing flourish on a dead end.
    const text = copy.cases[DEFAULT_CASE];
    for (const value of [text.name, text.summary, text.story.paragraphs[0]]) assert.ok(!has(markup, value), locale);
    assert.ok(!markup.includes('editorial-closing'), locale);
    assert.ok(!markup.includes('assets/cases/'), locale);
    assert.ok(markup.endsWith(CONTACT), locale);
    // An explicit not-found state renders the same page as an unresolvable identifier.
    assert.equal(render({ locale, caseId: 'not-a-case', caseState: 'notFound' }), markup, locale);
  }
});

test('the default message catalog and locale keep the renderer usable without arguments', () => {
  const markup = renderCases();
  assert.match(markup, /data-cases-state="overview"/);
  assert.ok(has(markup, getMessages('zh-Hant').cases.overview.listTitle));
});
