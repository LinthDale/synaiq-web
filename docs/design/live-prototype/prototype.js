import { renderHome, initHome } from './home-design.js';
import { renderKip, initKip } from './kip-design.js';
import { renderCases, initCases } from './cases-design.js';
import { renderAbout, initAbout } from './about-design.js';
import { renderAdvantageSection, renderContact } from './shared-design.js';
import { SUPPORTED_LOCALES, resolveLocale, resolvePage, getMessages, pageHref, localeHref, escapeHtml as esc } from './i18n.js?v=20260911-team-content';
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
const metadata = SUPPORTED_LOCALES.find(item => item.code === locale);
document.documentElement.lang = locale;
document.documentElement.dir = metadata.dir;
document.title = common.title[page];
document.body.dataset.page = page;

// Static shell labels use the same catalog as the page content.
function shellMessage(key) { return key.split('.').reduce((value, part) => value[part], common); }
for (const element of document.querySelectorAll('[data-i18n]')) element.textContent = shellMessage(element.dataset.i18n);
for (const element of document.querySelectorAll('[data-i18n-aria]')) element.setAttribute('aria-label', shellMessage(element.dataset.i18nAria));
for (const element of document.querySelectorAll('[data-brand-variant]')) element.src = common.brand[element.dataset.brandVariant];
const language = document.getElementById('language');
language.innerHTML = SUPPORTED_LOCALES.map(item => `<option value="${esc(item.code)}" lang="${esc(item.code)}" ${item.code === locale ? 'selected' : ''}>${esc(item.shortLabel)}</option>`).join('');
language.addEventListener('change', () => { location.href = localeHref(location.href, language.value); });
const sections = { advantageSection: () => renderAdvantageSection(common), contact: () => renderContact(common), locale, messages };
document.getElementById('main').innerHTML = pages[page].render(sections);
for (const link of document.querySelectorAll('a[href^="?page="]')) {
  const target = new URL(link.getAttribute('href'), location.href);
  link.setAttribute('href', pageHref({ page: target.searchParams.get('page'), locale, hash: target.hash }));
}
pages[page].init({ locale, messages });
if (location.hash) {
  const destination = document.getElementById(location.hash.slice(1));
  if (destination) requestAnimationFrame(() => destination.scrollIntoView({ behavior: 'instant' }));
}
export function initPageNavigation(pageName, navigation = getMessages().common.navigation) {
  const page = resolvePage(pageName);
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
    cases: [['story', navigation.story], ['fieldnotes', navigation.fieldnotes]],
    about: [['approach', navigation.approach], ['leadership', navigation.leadership], ['technical', navigation.technical]],
  }[page];
  contextLinks.innerHTML = sections.map(([id, label]) => `<a href="#${id}">${esc(label)}</a>`).join('');

  const compact = matchMedia('(max-width: 899px)');
  const setContextOpen = open => {
    const expanded = compact.matches && open;
    contextNav.hidden = compact.matches && !expanded;
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
initPageNavigation(page, common.navigation);
