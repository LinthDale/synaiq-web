import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { SUPPORTED_PAGES, SUPPORTED_LOCALES, resolveLocale, resolvePage, getMessages, localeHref, pageHref, escapeHtml } from './i18n.js';
import { pageMetadata, canonicalUrl, crawlTargets, crawlUrls, SITE_ORIGIN, INDEXABLE, NOT_INDEXABLE } from './page-metadata.js';
import { DEFAULT_CASE, resolveCaseId, publishedCases } from './cases-data.js';
import { createHeadShim } from './head-test-helpers.mjs';
import { PUBLIC_FILES } from './share-preview.mjs';

const read = name => readFile(new URL(name, import.meta.url), 'utf8');
const markup = readFileSync(new URL('./page.html', import.meta.url), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
const metaTags = [...markup.matchAll(/<meta\b[^>]*>/gi)]
  .map(([tag]) => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)].map(([, key, value]) => [key.toLowerCase(), value])));
// The tags the published document already ships: re-applying must update these in place.
const staticHead = metaTags.map(attributes => ['meta', attributes]);
// The local review shell is named 本機預覽／Local preview; this wording once reached a
// published Google result and must never return through markup, art or generated copy.
const PREVIEW_WORDING = /設計原型|prototype|live design/i;
const combinations = SUPPORTED_PAGES.flatMap(page => SUPPORTED_LOCALES.map(({ code }) => ({ page, locale: code })));
// Roughly what Google shows before truncating; Traditional Chinese needs far fewer characters.
const DESCRIPTION_LIMIT = Object.freeze({ 'zh-Hant': 80, en: 160 });
const brandRoot = new URL('../../../public/brand/', import.meta.url);

test('canonical addresses keep one stable form: page before language, bare root for the default page', () => {
  assert.equal(combinations.length, 8);
  assert.deepEqual(combinations.map(pair => canonicalUrl(pair)), [
    'https://synaiq.com/',
    'https://synaiq.com/?page=home&lang=en',
    'https://synaiq.com/?page=kip&lang=zh-Hant',
    'https://synaiq.com/?page=kip&lang=en',
    'https://synaiq.com/?page=cases&lang=zh-Hant',
    'https://synaiq.com/?page=cases&lang=en',
    'https://synaiq.com/?page=about&lang=zh-Hant',
    'https://synaiq.com/?page=about&lang=en',
  ]);
  // Unknown input falls back to the default address instead of inventing a new one.
  for (const pair of [undefined, {}, { page: '../../private', locale: '<script>' }, { page: '__proto__', locale: 'de' }]) {
    assert.equal(canonicalUrl(pair), 'https://synaiq.com/');
  }
  // Each published case adds one address per language, inserted after the overview pair.
  assert.equal(crawlTargets().length, combinations.length + 2 * publishedCases().length);
  assert.deepEqual(crawlUrls(), [
    'https://synaiq.com/',
    'https://synaiq.com/?page=home&lang=en',
    'https://synaiq.com/?page=kip&lang=zh-Hant',
    'https://synaiq.com/?page=kip&lang=en',
    'https://synaiq.com/?page=cases&lang=zh-Hant',
    'https://synaiq.com/?page=cases&lang=en',
    'https://synaiq.com/?page=cases&case=tokyo-foodex-2026&lang=zh-Hant',
    'https://synaiq.com/?page=cases&case=tokyo-foodex-2026&lang=en',
    'https://synaiq.com/?page=about&lang=zh-Hant',
    'https://synaiq.com/?page=about&lang=en',
  ]);
  assert.equal(new Set(crawlUrls()).size, crawlUrls().length);
  // A case identifier that is unknown, unpublished or malformed never reaches an address.
  for (const caseId of ['not-a-case', 'tainan-tech-forum-2026', '../../private', '__proto__']) {
    assert.equal(canonicalUrl({ page: 'cases', locale: 'en', caseId }), 'https://synaiq.com/?page=cases&lang=en', caseId);
  }
});

test('every published case has its own crawl identity and keeps the section page in its title', () => {
  for (const entry of publishedCases()) {
    for (const { code } of SUPPORTED_LOCALES) {
      const label = `${entry.id}/${code}`;
      const messages = getMessages(code);
      const text = messages.cases.cases[entry.id];
      const crawl = pageMetadata({ page: 'cases', locale: code, caseId: entry.id });
      assert.equal(crawl.caseId, entry.id, label);
      assert.equal(crawl.notFound, false, label);
      assert.equal(crawl.robots, INDEXABLE, label);
      assert.equal(crawl.canonical, `${SITE_ORIGIN}/?page=cases&case=${entry.id}&lang=${code}`, label);
      assert.equal(crawl.og.url, crawl.canonical, label);
      // Same rule as the other pages: the section name, then the brand.
      assert.equal(crawl.title, `${text.name} — ${messages.common.navigation.casesPage} — SynaiQ`, label);
      assert.equal(crawl.description, text.summary, label);
      assert.ok([...crawl.description].length <= DESCRIPTION_LIMIT[code], `${label}: ${[...crawl.description].length} characters`);
      assert.doesNotMatch(crawl.title, PREVIEW_WORDING, label);
      assert.doesNotMatch(crawl.description, PREVIEW_WORDING, label);
      assert.deepEqual(crawl.alternates.map(item => item.hreflang), ['zh-Hant', 'en', 'x-default'], label);
      assert.equal(crawl.alternates.find(item => item.hreflang === code).href, crawl.canonical, label);
      assert.equal(crawl.alternates.at(-1).href, canonicalUrl({ page: 'cases', locale: 'zh-Hant', caseId: entry.id }), label);
      // A case keeps its own address; it never collapses into the overview.
      assert.notEqual(crawl.canonical, canonicalUrl({ page: 'cases', locale: code }), label);
    }
  }
});

test('an unknown case identifier states the miss, leaves the index and carries no canonical', () => {
  for (const caseId of ['not-a-case', 'tainan-tech-forum-2026', '../../private', '<script>', '__proto__']) {
    for (const { code } of SUPPORTED_LOCALES) {
      const label = `${caseId}/${code}`;
      const overview = getMessages(code).cases.overview;
      const crawl = pageMetadata({ page: 'cases', locale: code, caseId });
      assert.equal(crawl.notFound, true, label);
      assert.equal(crawl.caseId, null, label);
      assert.equal(crawl.robots, NOT_INDEXABLE, label);
      assert.equal(crawl.canonical, null, label);
      assert.equal(crawl.og.url, null, label);
      assert.deepEqual(crawl.alternates, [], label);
      assert.equal(crawl.title, `${overview.notFound.title} — ${getMessages(code).common.navigation.casesPage} — SynaiQ`, label);
      assert.equal(crawl.description, overview.notFound.body, label);
      // No real case copy may leak into a miss.
      assert.doesNotMatch(crawl.title, /FOODEX|東京/, label);
      assert.doesNotMatch(crawl.description, /FOODEX|東京/, label);
    }
  }
  // An absent or empty parameter is the overview, not a miss.
  for (const caseId of [undefined, null, '']) {
    const crawl = pageMetadata({ page: 'cases', locale: 'zh-Hant', caseId });
    assert.equal(crawl.notFound, false);
    assert.equal(crawl.robots, INDEXABLE);
    assert.equal(crawl.canonical, canonicalUrl({ page: 'cases', locale: 'zh-Hant' }));
  }
  // The other three pages ignore a stray case parameter entirely.
  for (const page of ['home', 'kip', 'about']) {
    const crawl = pageMetadata({ page, locale: 'en', caseId: DEFAULT_CASE });
    assert.equal(crawl.caseId, null, page);
    assert.equal(crawl.notFound, false, page);
    assert.equal(crawl.canonical, canonicalUrl({ page, locale: 'en' }), page);
  }
});

test('every page and language resolves one absolute canonical, three alternates and a usable description', () => {
  const canonicals = new Set();
  for (const { page, locale } of combinations) {
    const label = `${page}/${locale}`;
    const crawl = pageMetadata({ page, locale });
    assert.equal(crawl.lang, locale, label);
    assert.equal(new URL(crawl.canonical).origin, SITE_ORIGIN, label);
    assert.equal(crawl.og.url, crawl.canonical, label);
    canonicals.add(crawl.canonical);

    assert.deepEqual(crawl.alternates.map(item => item.hreflang), ['zh-Hant', 'en', 'x-default'], label);
    for (const alternate of crawl.alternates) assert.equal(new URL(alternate.href).origin, SITE_ORIGIN, label);
    assert.equal(crawl.alternates.find(item => item.hreflang === locale).href, crawl.canonical, label);
    assert.equal(crawl.alternates.at(-1).href, canonicalUrl({ page, locale: 'zh-Hant' }), label);

    assert.equal(crawl.title, getMessages(locale).common.title[page], label);
    assert.equal(crawl.og.title, crawl.title, label);
    assert.equal(crawl.og.description, crawl.description, label);
    assert.ok(crawl.description.trim().length > 0, label);
    assert.ok([...crawl.description].length <= DESCRIPTION_LIMIT[locale], `${label}: ${[...crawl.description].length} characters`);
    assert.doesNotMatch(crawl.description, PREVIEW_WORDING, label);
    assert.doesNotMatch(crawl.title, PREVIEW_WORDING, label);
    assert.deepEqual(crawl.og.localeAlternate, [locale === 'en' ? 'zh_TW' : 'en_US'], label);
  }
  assert.equal(canonicals.size, 8);
});

test('the published markup carries static home metadata and never a static canonical', () => {
  const home = getMessages('zh-Hant').common;
  const byKey = new Map(metaTags.filter(tag => tag.name ?? tag.property).map(tag => [tag.name ?? tag.property, tag.content]));

  assert.equal(byKey.get('description'), home.description.home, 'the static description is the zh-Hant home description');
  assert.equal(byKey.get('og:title'), home.title.home);
  assert.equal(byKey.get('og:description'), home.description.home);
  assert.equal(byKey.get('og:url'), canonicalUrl({ page: 'home', locale: 'zh-Hant' }));
  assert.equal(byKey.get('og:type'), 'website');
  assert.equal(byKey.get('og:site_name'), 'SynaiQ');
  assert.equal(byKey.get('og:locale'), 'zh_TW');
  assert.equal(byKey.get('og:locale:alternate'), 'en_US');
  assert.equal(byKey.get('twitter:card'), 'summary');
  assert.match(markup, /<html lang="zh-Hant">/);

  // One document answers eight addresses, so a fixed canonical or hreflang would merge them.
  assert.equal(/<link\b[^>]*rel\s*=\s*"canonical"/i.test(markup), false, 'canonical belongs to the runtime, not the markup');
  assert.equal(/<link\b[^>]*hreflang/i.test(markup), false, 'hreflang alternates belong to the runtime');
});

test('no published markup value carries local preview wording', () => {
  // Values only: the module filename prototype.js is a legitimate src attribute.
  const values = [
    ...[...markup.matchAll(/<title>([\s\S]*?)<\/title>/gi)].map(match => match[1]),
    ...[...markup.matchAll(/<meta\b[^>]*\scontent\s*=\s*"([^"]*)"/gi)].map(match => match[1]),
    ...[...markup.matchAll(/\s(?:alt|aria-label|title)\s*=\s*"([^"]*)"/gi)].map(match => match[1]),
  ];
  assert.ok(values.length >= 15, `Only ${values.length} markup values were inspected`);
  for (const value of values) assert.doesNotMatch(value, PREVIEW_WORDING, value);
});

test('shipped vector art and stylesheets carry no preview wording in their own text', async () => {
  const shipped = PUBLIC_FILES.filter(entry => /\.(?:svg|css)$/.test(entry.file));
  assert.ok(shipped.length >= 9, `Only ${shipped.length} shipped vector or style files were inspected`);
  for (const entry of shipped) {
    const source = await readFile(new URL(entry.file, entry.root === 'brand' ? brandRoot : new URL('.', import.meta.url)), 'utf8');
    for (const [, label] of source.matchAll(/<(?:title|desc)\b[^>]*>([\s\S]*?)<\/(?:title|desc)>/gi)) {
      assert.doesNotMatch(label, PREVIEW_WORDING, `${entry.file}: vector label`);
    }
    for (const match of source.matchAll(/content:\s*"([^"]*)"|content:\s*'([^']*)'/g)) {
      assert.doesNotMatch(match[1] ?? match[2], PREVIEW_WORDING, `${entry.file}: generated text`);
    }
  }
});

test('robots.txt invites crawling and never blocks the release folder Googlebot must render', async () => {
  const robots = await read('robots.txt');
  const directives = robots.split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#'));
  assert.deepEqual(directives, ['User-agent: *', 'Allow: /', 'Sitemap: https://synaiq.com/sitemap.xml']);
  assert.equal(/^\s*Disallow:/im.test(robots.replace(/^[^\n]*#[^\n]*$/gm, '')), false, 'no Disallow rule may reach the release folder');
  for (const line of directives) assert.doesNotMatch(line, /synaiq-release/);
});

test('the sitemap lists exactly the canonical addresses of the four pages and every published case', async () => {
  const xml = await read('sitemap.xml');
  const decode = value => value.replaceAll('&amp;', '&');
  const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, block]) => ({
    loc: decode(block.match(/<loc>([\s\S]*?)<\/loc>/)[1].trim()),
    alternates: [...block.matchAll(/<xhtml:link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"\s*\/>/g)]
      .map(([, hreflang, href]) => ({ hreflang, href: decode(href) })),
  }));
  const targets = crawlTargets();
  assert.deepEqual(entries.map(entry => entry.loc), [...crawlUrls()]);
  for (const [index, entry] of entries.entries()) {
    const expected = pageMetadata(targets[index]).alternates.map(({ hreflang, href }) => ({ hreflang, href }));
    assert.deepEqual(entry.alternates, expected, entry.loc);
  }
  // A miss has no canonical, so nothing that is not indexable can appear in the sitemap.
  assert.doesNotMatch(xml, /case=(?!tokyo-foodex-2026)/);
  assert.equal(/<lastmod>/.test(xml), false, 'a guessed lastmod is worse than none');
  assert.doesNotMatch(xml, PREVIEW_WORDING);
});

// The shell bootstrap is the part of prototype.js that runs before any page renders.
const bootstrap = (() => {
  const source = readFileSync(new URL('./prototype.js', import.meta.url), 'utf8');
  return source.slice(source.indexOf('const query ='), source.indexOf('const sections ='));
})();
const pageFunctions = Object.fromEntries(['Home', 'Kip', 'Cases', 'About']
  .flatMap(name => ['render', 'init'].map(prefix => [`${prefix}${name}`, () => ''])));

/** Run the bootstrap against a head shim and hand back its metadata writer. */
function runShell({ page, locale, url, history }) {
  const { head, createElement, nodes } = createHeadShim(staticHead);
  const document = {
    documentElement: {}, head, createElement, body: { dataset: {} },
    querySelectorAll: () => [],
    getElementById: () => ({ innerHTML: '', addEventListener() {} }),
  };
  const context = {
    location: new URL(url ?? `https://synaiq.com/?page=${page}&lang=${locale}`),
    document, URLSearchParams, SUPPORTED_LOCALES, resolveLocale, resolvePage, getMessages,
    localeHref, pageHref, esc: escapeHtml, pageMetadata, resolveCaseId, DEFAULT_CASE,
    ...pageFunctions,
  };
  // Left out unless a test supplies one: the bootstrap guards its own history access, so a
  // context without history must still boot every address.
  if (history) context.history = history;
  const apply = vm.runInNewContext(`${bootstrap}\napplyPageMetadata;`, context);
  return { document, head, nodes, apply };
}

test('the shell writes apex-origin crawl tags for the requested address, whatever URL served the document', () => {
  for (const { page, locale } of combinations) {
    const label = `${page}/${locale}`;
    const expected = pageMetadata({ page, locale });
    // A www host and a release-folder path must not leak into anything a crawler reads.
    const url = `https://www.synaiq.com/synaiq-release-20260921-site-update/page.html?page=${page}&lang=${locale}`;
    const { document, head } = runShell({ page, locale, url });
    assert.equal(document.documentElement.lang, locale, label);
    assert.equal(document.title, expected.title, label);
    assert.equal(head.querySelector('meta[name="description"]').getAttribute('content'), expected.description, label);
    assert.equal(head.querySelector('link[rel="canonical"]').getAttribute('href'), expected.canonical, label);
    for (const alternate of expected.alternates) {
      assert.equal(head.querySelector(`link[rel="alternate"][hreflang="${alternate.hreflang}"]`).getAttribute('href'), alternate.href, `${label}/${alternate.hreflang}`);
    }
    assert.equal(head.querySelector('meta[property="og:url"]').getAttribute('content'), expected.canonical, label);
    assert.equal(head.querySelector('meta[property="og:title"]').getAttribute('content'), expected.title, label);
    assert.equal(head.querySelector('meta[property="og:description"]').getAttribute('content'), expected.description, label);
    assert.equal(head.querySelector('meta[property="og:locale"]').getAttribute('content'), expected.og.locale, label);
    assert.equal(head.querySelector('meta[name="robots"]').getAttribute('content'), INDEXABLE, label);
    assert.deepEqual(head.querySelectorAll('meta[property="og:locale:alternate"]').map(node => node.getAttribute('content')), [...expected.og.localeAlternate], label);
  }
});

test('the shell writes each published case address from the identifier in the query', () => {
  for (const entry of publishedCases()) {
    for (const { code } of SUPPORTED_LOCALES) {
      const label = `${entry.id}/${code}`;
      const expected = pageMetadata({ page: 'cases', locale: code, caseId: entry.id });
      const url = `https://www.synaiq.com/synaiq-release-20260922-cases/page.html?page=cases&case=${entry.id}&lang=${code}`;
      const { document, head } = runShell({ page: 'cases', locale: code, url });
      assert.equal(document.title, expected.title, label);
      assert.equal(head.querySelector('link[rel="canonical"]').getAttribute('href'), expected.canonical, label);
      assert.equal(head.querySelector('meta[property="og:url"]').getAttribute('content'), expected.canonical, label);
      assert.equal(head.querySelector('meta[name="description"]').getAttribute('content'), expected.description, label);
      assert.equal(head.querySelector('meta[name="robots"]').getAttribute('content'), INDEXABLE, label);
      for (const alternate of expected.alternates) {
        assert.equal(head.querySelector(`link[rel="alternate"][hreflang="${alternate.hreflang}"]`).getAttribute('href'), alternate.href, `${label}/${alternate.hreflang}`);
      }
    }
  }
});

test('the shell withdraws canonical, alternates and og:url for a case that does not exist', () => {
  const url = 'https://synaiq.com/?page=cases&case=not-a-case&lang=en';
  const { document, head, apply } = runShell({ page: 'cases', locale: 'en', url });
  const miss = pageMetadata({ page: 'cases', locale: 'en', caseId: 'not-a-case' });
  assert.equal(document.title, miss.title);
  assert.equal(head.querySelector('meta[name="robots"]').getAttribute('content'), NOT_INDEXABLE);
  assert.equal(head.querySelector('link[rel="canonical"]'), null);
  assert.deepEqual(head.querySelectorAll('link[rel="alternate"]'), []);
  assert.equal(head.querySelector('meta[property="og:url"]'), null);
  // Returning to a real address restores every withdrawn tag exactly once.
  const real = pageMetadata({ page: 'cases', locale: 'en', caseId: DEFAULT_CASE });
  apply(real);
  assert.equal(head.querySelectorAll('link[rel="canonical"]').length, 1);
  assert.equal(head.querySelectorAll('link[rel="alternate"]').length, 3);
  assert.equal(head.querySelectorAll('meta[property="og:url"]').length, 1);
  assert.equal(head.querySelector('link[rel="canonical"]').getAttribute('href'), real.canonical);
  assert.equal(head.querySelector('meta[name="robots"]').getAttribute('content'), INDEXABLE);
});

test('a legacy work-page anchor without a case moves to the case that owns that section', () => {
  for (const hash of ['#story', '#fieldnotes']) {
    const replaced = [];
    const history = { replaceState: (state, title, href) => replaced.push(href) };
    const url = `https://synaiq.com/?page=cases&lang=zh-Hant${hash}`;
    const { document, head } = runShell({ page: 'cases', locale: 'zh-Hant', url, history });
    // replaceState, so the browser's back button leaves the site instead of looping.
    assert.deepEqual(replaced, [`?page=cases&case=${DEFAULT_CASE}&lang=zh-Hant${hash}`], hash);
    const expected = pageMetadata({ page: 'cases', locale: 'zh-Hant', caseId: DEFAULT_CASE });
    assert.equal(document.title, expected.title, hash);
    assert.equal(head.querySelector('link[rel="canonical"]').getAttribute('href'), expected.canonical, hash);
  }
  // Any other address on the work page is left exactly as requested.
  for (const url of ['https://synaiq.com/?page=cases&lang=zh-Hant', 'https://synaiq.com/?page=cases&lang=zh-Hant#contact', 'https://synaiq.com/?page=home&lang=zh-Hant#story']) {
    const replaced = [];
    const history = { replaceState: (state, title, href) => replaced.push(href) };
    const { head } = runShell({ page: new URL(url).searchParams.get('page'), locale: 'zh-Hant', url, history });
    assert.deepEqual(replaced, [], url);
    assert.equal(head.querySelector('link[rel="canonical"]').getAttribute('href'), canonicalUrl({ page: new URL(url).searchParams.get('page'), locale: 'zh-Hant' }), url);
  }
});

test('re-applying metadata rewrites the existing tags instead of adding a second set', () => {
  const { head, nodes, apply } = runShell({ page: 'home', locale: 'zh-Hant' });
  const count = nodes.length;
  for (const pair of [{ page: 'about', locale: 'en' }, { page: 'kip', locale: 'zh-Hant' }, { page: 'home', locale: 'en' }]) {
    apply(pageMetadata(pair));
    assert.equal(nodes.length, count, `${pair.page}/${pair.locale} changed the tag count`);
  }
  const last = pageMetadata({ page: 'home', locale: 'en' });
  assert.equal(head.querySelector('link[rel="canonical"]').getAttribute('href'), last.canonical);
  assert.equal(head.querySelector('meta[property="og:url"]').getAttribute('content'), last.canonical);
  assert.equal(head.querySelectorAll('link[rel="canonical"]').length, 1);
  assert.equal(head.querySelectorAll('link[rel="alternate"]').length, 3);
  assert.equal(head.querySelectorAll('meta[name="description"]').length, 1);
  assert.equal(head.querySelectorAll('meta[property="og:locale:alternate"]').length, 1);
  assert.equal(head.querySelector('meta[property="og:locale:alternate"]').getAttribute('content'), 'zh_TW');
});
