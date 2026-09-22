// Crawl metadata for the published site. Pure functions only: no DOM, no location, no
// network. One document answers every page/locale/case address, so every URL here is built
// on the apex origin and on the same link logic as the navigation — a www host, a release
// folder (/synaiq-release-*/page.html) or a local preview all point crawlers at synaiq.com.
import { SUPPORTED_PAGES, SUPPORTED_LOCALES, DEFAULT_LOCALE, resolvePage, resolveLocale, getMessages, pageHref } from './i18n.js?v=20260922-cases-expansion';
import { publishedCases, resolveCaseId } from './cases-data.js?v=20260922-cases-expansion';

export const SITE_ORIGIN = 'https://synaiq.com';
// Open Graph wants POSIX-style locales; the site's own codes stay the source of truth.
export const OG_LOCALES = Object.freeze({ 'zh-Hant': 'zh_TW', en: 'en_US' });
export const INDEXABLE = 'index, follow';
// A requested case that is unknown or unpublished is a real miss, so it leaves the index.
export const NOT_INDEXABLE = 'noindex, nofollow';

/** True when this request asked for a specific case, whether or not that case exists. */
function requestsCase(page, caseId) {
  return page === 'cases' && caseId !== null && caseId !== undefined && String(caseId) !== '';
}

/** Canonical address of one page, case and language, always on the apex origin. */
export function canonicalUrl({ page, locale, caseId } = {}) {
  const name = resolvePage(page);
  const code = resolveLocale(locale);
  const id = requestsCase(name, caseId) ? resolveCaseId(caseId) : null;
  // The bare site root already serves the default page in the default language.
  if (!id && name === 'home' && code === DEFAULT_LOCALE) return `${SITE_ORIGIN}/`;
  return new URL(pageHref({ page: name, locale: code, caseId: id }), `${SITE_ORIGIN}/`).href;
}

/** One hreflang alternate per language, plus x-default on the default language. */
export function alternateUrls(page, caseId = null) {
  const name = resolvePage(page);
  const entry = (hreflang, locale) => Object.freeze({ hreflang, href: canonicalUrl({ page: name, locale, caseId }) });
  return Object.freeze([
    ...SUPPORTED_LOCALES.map(item => entry(item.code, item.code)),
    entry('x-default', DEFAULT_LOCALE),
  ]);
}

/** Every address a crawler should know: the four pages plus each published case. */
export function crawlTargets() {
  const perLocale = (page, caseId) => SUPPORTED_LOCALES.map(item => Object.freeze({ page, locale: item.code, caseId }));
  return Object.freeze(SUPPORTED_PAGES.flatMap(page => page === 'cases'
    ? [...perLocale(page, null), ...publishedCases().flatMap(entry => perLocale(page, entry.id))]
    : perLocale(page, null)));
}

export function crawlUrls() {
  return Object.freeze(crawlTargets().map(target => canonicalUrl(target)));
}

/** Title and summary for one case, or for the address of a case that does not exist. */
function caseHead(code, id, notFound) {
  const messages = getMessages(code);
  const section = messages.common.navigation.casesPage;
  const overview = messages.cases.overview;
  const text = notFound ? overview.notFound : messages.cases.cases[id];
  const name = notFound ? text.title : text.name;
  return { title: `${name} — ${section} — SynaiQ`, description: notFound ? text.body : text.summary };
}

/** Everything the document head needs for one page/locale/case request. */
export function pageMetadata({ page, locale, caseId } = {}) {
  const name = resolvePage(page);
  const code = resolveLocale(locale);
  const requested = requestsCase(name, caseId);
  const id = requested ? resolveCaseId(caseId) : null;
  const notFound = requested && id === null;
  const common = getMessages(code).common;
  const canonical = notFound ? null : canonicalUrl({ page: name, locale: code, caseId: id });
  const { title, description } = id || notFound
    ? caseHead(code, id, notFound)
    : { title: common.title[name], description: common.description[name] };
  return Object.freeze({
    page: name,
    caseId: id,
    notFound,
    robots: notFound ? NOT_INDEXABLE : INDEXABLE,
    locale: code,
    lang: code,
    title,
    description,
    canonical,
    alternates: notFound ? Object.freeze([]) : alternateUrls(name, id),
    og: Object.freeze({
      title,
      description,
      url: canonical,
      locale: OG_LOCALES[code],
      localeAlternate: Object.freeze(SUPPORTED_LOCALES.filter(item => item.code !== code).map(item => OG_LOCALES[item.code])),
    }),
  });
}
