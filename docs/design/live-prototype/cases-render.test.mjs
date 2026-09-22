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
const count = (markup, needle) => markup.split(needle).length - 1;

test('the overview introduces the work as a whole and leads to each case by its own address', () => {
  for (const locale of ['zh-Hant', 'en']) {
    const copy = getMessages(locale).cases;
    const markup = render({ locale });
    assert.match(markup, /data-cases-state="overview"/, locale);
    assert.ok(has(markup, copy.overview.intro), locale);
    assert.ok(has(markup, copy.overview.listTitle), locale);
    assert.ok(ids(markup).includes('cases-list'), locale);
    assert.match(markup, /class="case-rows"/, locale);
    for (const entry of publishedCases()) {
      const text = copy.cases[entry.id];
      assert.ok(markup.includes(`href="?page=cases&amp;case=${entry.id}&amp;lang=${locale}"`), `${locale}/${entry.id}`);
      assert.ok(has(markup, text.name), `${locale}/${entry.id}`);
      assert.ok(has(markup, text.summary), `${locale}/${entry.id}`);
      assert.ok(has(markup, text.dateLabel), `${locale}/${entry.id}`);
      assert.ok(markup.includes(`href="${entry.cover.image}"`), `${locale}/${entry.id}`);
      assert.ok(markup.includes(`href="${entry.hero.sketch}"`), `${locale}/${entry.id} sketch`);
      for (const tag of entry.tags) assert.ok(has(markup, copy.tags[tag]), `${locale}/${tag}`);
    }
    // The overview carries no case interior: no story, no field notes, no coverage.
    for (const id of ['story', 'fieldnotes', 'press']) assert.ok(!ids(markup).includes(id), `${locale}: ${id}`);
    assert.ok(!has(markup, copy.cases[DEFAULT_CASE].story.paragraphs[0]), locale);
    assert.ok(markup.endsWith(CONTACT), locale);
    assert.ok(has(markup, copy.overview.closing), locale);
  }
});

test('the overview lists cases as full-width rows that alternate sides and keep their own ratio', () => {
  const rows = [...render({ locale: 'zh-Hant' }).matchAll(/<article class="case-card ([^"]+)" data-case-row="(\d+)">/g)];
  assert.equal(rows.length, publishedCases().length);
  // Row 1 keeps its cover on the left, row 2 on the right, and so on down the list.
  assert.deepEqual(rows.map(row => row[2]), publishedCases().map((entry, index) => String(index + 1)));
  assert.deepEqual(rows.map(row => row[1].includes('case-card--left') ? 'left' : 'right'), ['left', 'right']);
  assert.deepEqual(rows.map(row => row[1]), [
    'case-card--portrait case-card--left',
    'case-card--landscape case-card--right',
  ]);
  // Native ratios, not one shared crop: the portrait cover stays 3:4, the landscape 16:9.
  const markup = render({ locale: 'zh-Hant' });
  assert.ok(markup.includes('--ink-photo-aspect:3 / 4'));
  assert.ok(markup.includes('--ink-photo-aspect:16 / 9'));
  assert.ok(!markup.includes('--ink-photo-aspect:3 / 2'));
  assert.ok(!markup.includes('case-card-grid'));
  assert.ok(!markup.includes('case-card--featured'));
});

test('overview reveal controls stay outside navigation links and retain separate story links', () => {
  for (const locale of ['zh-Hant', 'en']) {
    const markup = render({ locale });
    const buttons = [...markup.matchAll(/<button\b[^>]*data-ink-photo[^>]*>/g)];
    assert.equal(buttons.length, publishedCases().length);
    for (const link of markup.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)) {
      assert.doesNotMatch(link[0], /<button\b/);
    }
    for (const entry of publishedCases()) {
      assert.ok(markup.includes(`id="cover-${entry.id}"`));
      assert.ok(markup.includes(`class="case-card-copy case-card-link" href="?page=cases&amp;case=${entry.id}&amp;lang=${locale}"`));
    }
    assert.equal(new Set(ids(markup)).size, ids(markup).length);
  }
});

test('only the overview covers invite the reveal, and they ship both pointer wordings', () => {
  // Each wording is shipped and CSS shows the one matching the pointer, so both must exist.
  const revealable = publishedCases().filter(entry => entry.hero.sketch);
  assert.ok(revealable.length > 0);
  for (const locale of ['zh-Hant', 'en']) {
    const hint = getMessages(locale).cases.overview.photoHint;
    const markup = render({ locale });
    assert.equal(count(markup, '<span class="ink-photo__hint" aria-hidden="true">'), revealable.length, locale);
    assert.equal(count(markup, `<span class="ink-photo__hint-touch">${escapeHtml(hint.touch)}</span>`), revealable.length, locale);
    assert.equal(count(markup, `<span class="ink-photo__hint-hover">${escapeHtml(hint.hover)}</span>`), revealable.length, locale);
    // The drawn arrow travels with the wording, inside the decoration the reader ignores.
    const blocks = [...markup.matchAll(/<span class="ink-photo__hint" aria-hidden="true">([\s\S]*?)<\/span>\s*<\/button>/g)];
    assert.equal(blocks.length, revealable.length, locale);
    for (const [, body] of blocks) {
      assert.match(body, /<svg[^>]*viewBox="0 0 80 60"/, locale);
      assert.ok(!body.includes('<button'), locale);
    }
    // The other wording never leaks: no case page and no dead end carries a hint.
    for (const caseId of [...publishedCases().map(entry => entry.id), 'not-a-case']) {
      const page = render({ locale, caseId });
      assert.equal(count(page, 'ink-photo__hint'), 0, `${locale}/${caseId}`);
      assert.ok(!has(page, hint.touch), `${locale}/${caseId}`);
      assert.ok(!has(page, hint.hover), `${locale}/${caseId}`);
    }
  }
});

test('the Tainan case shows its story, field record and its own three articles', () => {
  const id = 'tainan-tech-forum-2026';
  const entry = publishedCases().find(item => item.id === id);
  for (const locale of ['zh-Hant', 'en']) {
    const copy = getMessages(locale).cases;
    const text = copy.cases[id];
    const markup = render({ locale, caseId: id });
    assert.match(markup, /data-cases-state="detail"/, locale);
    assert.ok(markup.includes(`<h1 id="cases-title">${escapeHtml(text.name)}</h1>`), locale);
    assert.ok(has(markup, text.summary), locale);
    // Orientation controls sizing within the shared side-by-side hero layout.
    assert.match(markup, /cases-hero-layout--landscape/, locale);
    // This case has its own coverage, kept separate from the other case's articles.
    assert.deepEqual(ids(markup).filter(item => ['story', 'fieldnotes', 'press'].includes(item)), ['story', 'fieldnotes', 'press'], locale);
    assert.deepEqual([...caseSectionIds({ caseId: id, messages: getMessages(locale) })], ['story', 'fieldnotes', 'press'], locale);
    assert.deepEqual(entry.media, [
      'https://money.udn.com/money/story/5635/9766564',
      'https://www.setn.com/news/1906433',
      'https://cnews.com.tw/204260917a05/',
    ]);
    for (const [index, url] of entry.media.entries()) {
      assert.ok(markup.includes(`href="${url}" target="_blank" rel="noopener noreferrer"`), `${locale}: ${url}`);
      // Each address keeps the publisher and headline that belong to it.
      assert.ok(markup.indexOf(url) < markup.indexOf(escapeHtml(text.press.links[index][1])), `${locale}: ${url} pairing`);
    }
    for (const [publisher, title] of text.press.links) {
      assert.ok(has(markup, publisher), `${locale}: ${publisher}`);
      assert.ok(has(markup, title), `${locale}: ${title}`);
    }
    // No address from the other case appears here.
    for (const other of publishedCases().find(item => item.id === DEFAULT_CASE).media) {
      assert.ok(!markup.includes(other), `${locale}: ${other}`);
    }
    // Both illustrations reveal their original photographs within the same case.
    assert.equal([...markup.matchAll(/data-ink-photo\b/g)].length, 2, locale);
    assert.ok(!markup.includes('<img class="case-photo"'), locale);
    assert.match(markup, /--ink-photo-aspect:16 \/ 9/, locale);
    assert.match(markup, /--ink-photo-aspect:4 \/ 3/, locale);
    for (const photo of [entry.hero, ...entry.field.photos]) {
      assert.ok(markup.includes(`href="${photo.photo}"`), `${locale}/${photo.key} photo`);
      assert.ok(markup.includes(`href="${photo.sketch}"`), `${locale}/${photo.key} sketch`);
      assert.ok(markup.includes(`aria-label="${escapeHtml(text.photos[photo.key].label)}"`), `${locale}/${photo.key} control`);
      assert.ok(has(markup, text.photos[photo.key].caption), `${locale}/${photo.key}`);
    }
    for (const [title] of text.field.notes) assert.ok(has(markup, title), locale);
    for (const [, value] of text.facts) assert.ok(has(markup, value), locale);
    assert.ok(markup.includes(`href="?page=cases&amp;lang=${locale}"`), locale);
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

// Owner-approved wording. Pinned literally so a silent revert fails instead of shipping.
test('the approved journey wording is the name of the overview in every slot', () => {
  const zh = getMessages('zh-Hant');
  const en = getMessages('en');
  assert.equal(zh.cases.overview.listTitle, '一起見證我們的旅途');
  assert.equal(en.cases.overview.listTitle, 'Walk the journey with us');
  assert.equal(zh.cases.overview.back, '回到旅途');
  assert.equal(en.cases.overview.back, 'Back to the journey');
  assert.equal(zh.common.navigation.casesList, '我們的旅途');
  assert.equal(en.common.navigation.casesList, 'The journey');
  assert.equal(zh.cases.overview.notFound.body, '這一站還沒有故事。回到旅途，看看其他現場。');
  assert.equal(en.cases.overview.notFound.body, 'No story at this stop yet. Return to the journey and see the other fields.');
  // The card link and the hero link keep their own approved wording.
  assert.equal(zh.cases.overview.readCase, '翻開這個故事');
  assert.equal(zh.cases.overview.action, '翻開這些故事');
  // The heading appears over the cards, the back link only inside a case.
  const overview = render({ locale: 'zh-Hant' });
  assert.ok(overview.includes(`<h2 id="cases-list-title">${zh.cases.overview.listTitle}</h2>`));
  assert.ok(!overview.includes(zh.cases.overview.back));
  // The back link keeps its arrow glyph beside the new wording.
  assert.ok(render({ locale: 'zh-Hant', caseId: DEFAULT_CASE }).includes(`<span aria-hidden="true">←</span> ${zh.cases.overview.back}`));
  assert.ok(render({ locale: 'en', caseId: 'not-a-case' }).includes(`<span aria-hidden="true">←</span> ${en.cases.overview.back}`));
  // One sentence, one home: the field heading no longer repeats the overview intro.
  for (const messages of [zh, en]) {
    const field = messages.cases.cases[DEFAULT_CASE].field;
    assert.equal(messages.cases.overview.intro.includes(field.title.join('')), false);
  }
  assert.deepEqual(zh.cases.cases[DEFAULT_CASE].field.title, ['在東京的現場，', '對話真的發生了。']);
  assert.deepEqual(en.cases.cases[DEFAULT_CASE].field.title, ['In Tokyo,', 'the conversations happened.']);
  // No tag list borrows the overview heading as its accessible name.
  assert.ok(!overview.includes('class="case-tags" aria-label'));
});

test('the default message catalog and locale keep the renderer usable without arguments', () => {
  const markup = renderCases();
  assert.match(markup, /data-cases-state="overview"/);
  assert.ok(has(markup, getMessages('zh-Hant').cases.overview.listTitle));
});
