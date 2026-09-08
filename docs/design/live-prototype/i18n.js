import { zhHant as homeZh, en as homeEn } from './locale-home.js';
import { zhHant as kipZh, en as kipEn } from './locale-kip.js';
import { zhHant as demoZh, en as demoEn } from './locale-demo.js';
import { zhHant as commonZh, en as commonEn } from './locale-common.js';
import { BRAND } from './brand.js';

// Add a reviewed language bundle here; no language parameter is used as a file path.
const catalog = {
  'zh-Hant': { label: '繁體中文', shortLabel: 'ZH', dir: 'ltr', messages: { home: homeZh, kip: kipZh, demo: demoZh, common: commonZh } },
  en: { label: 'English', shortLabel: 'EN', dir: 'ltr', messages: { home: homeEn, kip: kipEn, demo: demoEn, common: commonEn } },
};
export const DEFAULT_LOCALE = 'zh-Hant';
export const SUPPORTED_LOCALES = Object.freeze(Object.entries(catalog).map(([code, entry]) => Object.freeze({ code, label: entry.label, shortLabel: entry.shortLabel, dir: entry.dir })));
export function resolveLocale(value) {
  return SUPPORTED_LOCALES.find(item => item.code.toLowerCase() === String(value ?? '').toLowerCase())?.code ?? DEFAULT_LOCALE;
}
export function getMessages(locale = DEFAULT_LOCALE) {
  const messages = catalog[resolveLocale(locale)].messages;
  return { ...messages, common: { ...messages.common, brand: BRAND } };
}
export function pageHref({ page = 'home', locale = DEFAULT_LOCALE, hash = '' } = {}) {
  const query = new URLSearchParams({ page: page === 'kip' ? 'kip' : 'home', lang: resolveLocale(locale) });
  return `?${query}${hash ? `#${encodeURIComponent(hash.replace(/^#/, ''))}` : ''}`;
}
export function localeHref(currentUrl, locale) {
  const url = new URL(currentUrl, 'https://design.invalid');
  url.searchParams.set('lang', resolveLocale(locale));
  return `${url.pathname}${url.search}${url.hash}`;
}
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
// Translation shape checks fail tests when a new language misses any key or list item.
export function messageShape(value, path = '') {
  if (Array.isArray(value)) return value.flatMap((item, index) => messageShape(item, `${path}[${index}]`));
  if (value !== null && typeof value === 'object') return Object.keys(value).sort().flatMap(key => messageShape(value[key], path ? `${path}.${key}` : key));
  return [`${path}:${typeof value}`];
}
