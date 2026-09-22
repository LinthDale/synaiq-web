import { renderHome, initHome } from './home-design.js';
import { renderKip, initKip } from './kip-design.js';
import { renderCases, initCases, caseSectionIds } from './cases-design.js';
import { renderAbout, initAbout } from './about-design.js';
import { renderAdvantageSection, renderContact } from './shared-design.js';
import { SUPPORTED_LOCALES, resolveLocale, resolvePage, getMessages, pageHref, localeHref, escapeHtml as esc } from './i18n.js?v=20260922-cases-expansion';
import { pageMetadata } from './page-metadata.js?v=20260922-cases-expansion';
import { DEFAULT_CASE, resolveCaseId } from './cases-data.js?v=20260922-cases-expansion';
const query = new URLSearchParams(location.search);
const page = resolvePage(query.get('page'));
const pages = {
  home: { render: renderHome, init: initHome },
  kip: { render: renderKip, init: initKip },
  cases: { render: renderCases, init: initCases },
  about: { render: renderAbout, init: initAbout },
};
const locale = resolveLocale(query.get('lang'));
const messages = getMessages(locale);
const common = messages.common;
const localeMetadata = SUPPORTED_LOCALES.find(item => item.code === locale);
document.documentElement.dir = localeMetadata.dir;

// The work page answers both ?page=cases (the overview) and ?page=cases&case=<id> (one
// case). An unknown or unpublished identifier becomes a stated miss; it never falls back to
// showing a different case. Links published before the case addresses existed carried the
// section anchor alone, so those keep working by moving to the case that owns the section.
const requestedCase = page === 'cases' ? query.get('case') : null;
const legacySection = requestedCase === null && page === 'cases' && ['#story', '#fieldnotes'].includes(location.hash);
const caseId = legacySection ? DEFAULT_CASE : requestedCase === null ? null : resolveCaseId(requestedCase);
const caseState = caseId ? 'detail' : requestedCase ? 'notFound' : 'overview';
// Replace rather than push: the browser's back button leaves the site instead of looping.
if (legacySection && typeof history !== 'undefined') {
  history.replaceState(null, '', pageHref({ page, locale, caseId, hash: location.hash }));
}

// One document answers eight page/locale addresses, so page.html carries no canonical and
// no per-page description; they are written here for the address actually requested.
// Every tag is updated in place, so a language switch or page link never duplicates one.
function upsertHeadTag(tag, identity, attributes) {
  const selector = tag + Object.entries(identity).map(([name, value]) => `[${name}="${value}"]`).join('');
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement(tag);
    for (const [name, value] of Object.entries(identity)) element.setAttribute(name, value);
    document.head.append(element);
  }
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  return element;
}
function applyPageMetadata(crawl) {
  document.documentElement.lang = crawl.lang;
  document.title = crawl.title;
  upsertHeadTag('meta', { name: 'description' }, { content: crawl.description });
  upsertHeadTag('meta', { name: 'robots' }, { content: crawl.robots });
  // A stated miss withdraws its canonical, alternates and og:url instead of pointing them
  // at another address, so a mistyped case identifier never merges into a real page.
  if (crawl.canonical === null) {
    for (const selector of ['link[rel="canonical"]', 'link[rel="alternate"]', 'meta[property="og:url"]']) {
      for (const stale of document.head.querySelectorAll(selector)) stale.remove();
    }
  } else {
    upsertHeadTag('link', { rel: 'canonical' }, { href: crawl.canonical });
    for (const alternate of crawl.alternates) {
      upsertHeadTag('link', { rel: 'alternate', hreflang: alternate.hreflang }, { href: alternate.href });
    }
    upsertHeadTag('meta', { property: 'og:url' }, { content: crawl.og.url });
  }
  for (const [property, content] of [['og:title', crawl.og.title], ['og:description', crawl.og.description], ['og:locale', crawl.og.locale]]) {
    upsertHeadTag('meta', { property }, { content });
  }
  // Repeated property: replace the whole set rather than update one tag in place.
  for (const stale of document.head.querySelectorAll('meta[property="og:locale:alternate"]')) stale.remove();
  for (const content of crawl.og.localeAlternate) {
    const element = document.createElement('meta');
    element.setAttribute('property', 'og:locale:alternate');
    element.setAttribute('content', content);
    document.head.append(element);
  }
}
applyPageMetadata(pageMetadata({ page, locale, caseId: caseId ?? requestedCase }));
document.body.dataset.page = page;

// Static shell labels use the same catalog as the page content.
function shellMessage(key) { return key.split('.').reduce((value, part) => value[part], common); }
for (const element of document.querySelectorAll('[data-i18n]')) element.textContent = shellMessage(element.dataset.i18n);
for (const element of document.querySelectorAll('[data-i18n-aria]')) element.setAttribute('aria-label', shellMessage(element.dataset.i18nAria));
for (const element of document.querySelectorAll('[data-brand-variant]')) element.src = common.brand[element.dataset.brandVariant];
const language = document.getElementById('language');
language.innerHTML = SUPPORTED_LOCALES.map(item => `<option value="${esc(item.code)}" lang="${esc(item.code)}" ${item.code === locale ? 'selected' : ''}>${esc(item.shortLabel)}</option>`).join('');
language.addEventListener('change', () => { location.href = localeHref(location.href, language.value); });
const sections = { advantageSection: () => renderAdvantageSection(common), contact: () => renderContact(common), locale, messages, caseId, caseState };
document.getElementById('main').innerHTML = pages[page].render(sections);
// Internal links are rebuilt for the requested language, so the rewrite has to carry the
// case identifier a card or a back link already chose; dropping it would flatten every card
// back to the overview.
for (const link of document.querySelectorAll('a[href^="?page="]')) {
  const target = new URL(link.getAttribute('href'), location.href);
  link.setAttribute('href', pageHref({ page: target.searchParams.get('page'), caseId: target.searchParams.get('case'), locale, hash: target.hash }));
}
pages[page].init({ locale, messages });
if (location.hash) {
  const destination = document.getElementById(location.hash.slice(1));
  if (destination) requestAnimationFrame(() => destination.scrollIntoView({ behavior: 'instant' }));
}
export function initPageNavigation(pageName, navigation = getMessages().common.navigation, caseSections = null) {
  const page = resolvePage(pageName);
  // The work page's directory depends on the address: the overview lists itself, a case
  // lists the sections it actually renders, and a stated miss has no sections at all.
  const caseLabels = { 'cases-list': navigation.casesList, story: navigation.caseStory, fieldnotes: navigation.fieldnotes, press: navigation.casePress };
  for (const link of document.querySelectorAll('[data-page-link]')) {
    const current = link.dataset.pageLink === page;
    if (current) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }

  const menu = document.getElementById('menu');
  const contextNav = document.getElementById('mobile-nav');
  const contextLabel = document.getElementById('page-context-label');
  const contextLinks = document.getElementById('page-context-links');
  contextLabel.textContent = navigation[`${page}Context`];
  contextNav.setAttribute('aria-label', navigation[`${page}Sections`]);
  const sections = {
    home: [['wally', navigation.wally], ['proof', navigation.proof], ['footer', navigation.about]],
    kip: [['process', navigation.process], ['architecture', navigation.architecture], ['advantages', navigation.advantages], ['proof', navigation.demo]],
    cases: (caseSections ?? ['cases-list']).map(id => [id, caseLabels[id]]),
    about: [['approach', navigation.approach], ['leadership', navigation.leadership], ['technical', navigation.technical]],
  }[page];
  contextLinks.innerHTML = sections.map(([id, label]) => `<a href="#${id}">${esc(label)}</a>`).join('');

  const compact = matchMedia('(max-width: 899px)');
  // With no sections there is nothing to open, so the control is withdrawn rather than
  // left as a button that opens an empty directory.
  menu.hidden = sections.length === 0;
  const setContextOpen = open => {
    const expanded = sections.length > 0 && compact.matches && open;
    contextNav.hidden = sections.length === 0 || (compact.matches && !expanded);
    menu.setAttribute('aria-expanded', String(expanded));
  };
  setContextOpen(false);
  menu.addEventListener('click', () => setContextOpen(menu.getAttribute('aria-expanded') !== 'true'));
  contextNav.addEventListener('click', event => {
    if (event.target.closest('a')) setContextOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      setContextOpen(false);
      menu.focus();
    }
  });
  compact.addEventListener('change', () => setContextOpen(false));

  // Only the primary header sticks; the contextual directory scrolls with the page.
  // Measure the mobile two-row header so section anchors stay below it, also at larger text sizes.
  const header = document.querySelector('.site-header');
  const syncHeaderHeight = () => document.documentElement.style.setProperty('--header-height', `${header.getBoundingClientRect().height}px`);
  syncHeaderHeight();
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(syncHeaderHeight).observe(header);
  else addEventListener('resize', syncHeaderHeight, { passive: true });
}
initPageNavigation(page, common.navigation, page === 'cases' ? caseSectionIds({ caseId, caseState, messages }) : null);
