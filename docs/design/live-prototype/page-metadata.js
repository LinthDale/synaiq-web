// Crawl metadata for the published site. Pure functions only: no DOM, no location, no
// network. One document answers eight page/locale addresses, so every URL here is built on
// the apex origin and on the same link logic as the navigation — a www host, a release
// folder (/synaiq-release-*/page.html) or a local preview all point crawlers at synaiq.com.
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, resolvePage, resolveLocale, getMessages, pageHref } from './i18n.js?v=20260911-team-content';

export const SITE_ORIGIN = 'https://synaiq.com';
// Open Graph wants POSIX-style locales; the site's own codes stay the source of truth.
export const OG_LOCALES = Object.freeze({ 'zh-Hant': 'zh_TW', en: 'en_US' });

/** Canonical address of one page in one language, always on the apex origin. */
export function canonicalUrl({ page, locale } = {}) {
  const name = resolvePage(page);
  const code = resolveLocale(locale);
  // The bare site root already serves the default page in the default language.
  if (name === 'home' && code === DEFAULT_LOCALE) return `${SITE_ORIGIN}/`;
  return new URL(pageHref({ page: name, locale: code }), `${SITE_ORIGIN}/`).href;
}

/** One hreflang alternate per language, plus x-default on the default language. */
export function alternateUrls(page) {
  const name = resolvePage(page);
  const entry = (hreflang, locale) => Object.freeze({ hreflang, href: canonicalUrl({ page: name, locale }) });
  return Object.freeze([
    ...SUPPORTED_LOCALES.map(item => entry(item.code, item.code)),
    entry('x-default', DEFAULT_LOCALE),
  ]);
}

/** Everything the document head needs for one page/locale request. */
export function pageMetadata({ page, locale } = {}) {
  const name = resolvePage(page);
  const code = resolveLocale(locale);
  const common = getMessages(code).common;
  const canonical = canonicalUrl({ page: name, locale: code });
  const title = common.title[name];
  const description = common.description[name];
  return Object.freeze({
    page: name,
    locale: code,
    lang: code,
    title,
    description,
    canonical,
    alternates: alternateUrls(name),
    og: Object.freeze({
      title,
      description,
      url: canonical,
      locale: OG_LOCALES[code],
      localeAlternate: Object.freeze(SUPPORTED_LOCALES.filter(item => item.code !== code).map(item => OG_LOCALES[item.code])),
    }),
  });
}
