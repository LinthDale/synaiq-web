import { DEFAULT_LOCALE, resolveLocale } from './locale-store.js';
export { DEFAULT_LOCALE, SUPPORTED_LOCALES, resolveLocale, selectLocale, getMessages, loadMessages, hasMessages } from './locale-store.js';
export const SUPPORTED_PAGES = Object.freeze(['home', 'kip', 'ems', 'pvsim', 'cases', 'about']);
export function resolvePage(value) { return SUPPORTED_PAGES.includes(value) ? value : 'home'; }
// A case identifier travels in the address, so only this fixed shape is carried over; the
// published identifiers themselves belong to cases-data.js, which this module never imports.
export const CASE_PARAM_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;
/** Parameter order is fixed: page, then case, then language. Never swapped. */
export function pageHref({ page = 'home', locale = DEFAULT_LOCALE, hash = '', caseId = null } = {}) {
  const query = new URLSearchParams({ page: resolvePage(page) });
  if (caseId !== null && CASE_PARAM_PATTERN.test(String(caseId))) query.set('case', String(caseId));
  query.set('lang', resolveLocale(locale));
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
