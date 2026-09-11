import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { hasDeclaration } from './css-test-helpers.mjs';
import { getMessages, resolvePage, escapeHtml as esc } from './i18n.js';

const html = readFileSync(new URL('./page.html', import.meta.url), 'utf8');
const source = readFileSync(new URL('./prototype.js', import.meta.url), 'utf8');
const navigationSource = source.slice(source.indexOf('export function initPageNavigation')).replace('export function', 'function');

function createNavigation({ page = 'home', compact = false, locale = 'zh-Hant' } = {}) {
  function element(extra = {}) {
    const attributes = new Map();
    const handlers = new Map();
    return {
      attributes, handlers, hidden: false,
      setAttribute: (name, value) => attributes.set(name, value),
      getAttribute: name => attributes.get(name),
      removeAttribute: name => attributes.delete(name),
      addEventListener: (name, handler) => handlers.set(name, handler),
      ...extra,
    };
  }
  const links = ['home', 'kip', 'cases', 'about'].map(pageLink => element({ dataset: { pageLink } }));
  const menu = element({ focused: false, focus() { this.focused = true; } });
  const contextNav = element();
  const contextLabel = element();
  const contextLinks = element();
  const header = element({ getBoundingClientRect: () => ({ height: compact ? 113 : 75 }) });
  const nodes = { menu, 'mobile-nav': contextNav, 'page-context-label': contextLabel, 'page-context-links': contextLinks };
  const properties = new Map();
  const document = element({
    querySelectorAll: () => links,
    getElementById: id => nodes[id],
    querySelector: () => header,
    documentElement: { style: { setProperty: (key, value) => properties.set(key, value) } },
  });
  const media = element({ matches: compact });
  let resize;
  vm.runInNewContext(navigationSource, {
    document, page, common: getMessages(locale).common, getMessages, resolvePage, esc, matchMedia: () => media,
    ResizeObserver: class { constructor(callback) { resize = callback; } observe() {} },
  });
  return { links, menu, contextNav, contextLabel, contextLinks, document, media, properties, resize };
}

test('all four primary page switches are present; context directory is outside sticky header', () => {
  const primary = html.match(/<nav class="page-navigation"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
  assert.ok(primary);
  assert.equal((primary.match(/<a /g) || []).length, 4);
  for (const page of ['home', 'kip', 'cases', 'about']) {
    assert.ok(primary.includes(`href="?page=${page}" data-page-link="${page}"`));
  }
  assert.match(primary, /navigation\.casesPage/);
  assert.match(primary, /navigation\.aboutPage/);
  assert.doesNotMatch(primary, /Wally|產品畫面/);
  assert.doesNotMatch(primary, /目前所在|<small/);
  assert.ok(html.indexOf('id="mobile-nav"') > html.indexOf('</header>'));
  assert.ok(hasDeclaration('site.css', '.page-navigation', 'grid-column', '1 / -1', '(max-width:899px)'));
  assert.ok(hasDeclaration('site.css', '.page-navigation', 'grid-row', '2', '(max-width:899px)'));
  assert.ok(hasDeclaration('site.css', 'html', 'scroll-padding-top', 'calc(var(--header-height,74px) + 18px)'));
  assert.ok(hasDeclaration('site.css', '.page-context', 'position', 'fixed', '(max-width:899px)'));
  assert.ok(hasDeclaration('site.css', '.page-context', 'inset', 'var(--header-height,112px) 0 auto', '(max-width:899px)'));
});

const pageSections = {
  home: ['wally', 'proof', 'footer'],
  kip: ['process', 'architecture', 'advantages', 'proof'],
  cases: ['story', 'fieldnotes'],
  about: ['approach', 'leadership', 'technical'],
};

test('every page exposes one accessible current page and its own local section links', () => {
  const copy = getMessages().common.navigation;
  for (const [page, ids] of Object.entries(pageSections)) {
    const nav = createNavigation({ page });
    const current = nav.links.filter(link => link.getAttribute('aria-current') === 'page');
    assert.equal(current.length, 1);
    assert.equal(current[0].dataset.pageLink, page);
    assert.equal(nav.contextLabel.textContent, copy[`${page}Context`]);
    assert.equal(nav.contextNav.getAttribute('aria-label'), copy[`${page}Sections`]);
    assert.doesNotMatch(nav.contextLinks.innerHTML, /\?page=/);
    assert.deepEqual([...nav.contextLinks.innerHTML.matchAll(/href="#([^"]+)"/g)].map(match => match[1]), ids);
    assert.equal(nav.contextNav.hidden, false);
    assert.equal(nav.properties.get('--header-height'), '75px');
  }
});

test('English navigation translates the contextual directory without changing page or section targets', () => {
  const copy = getMessages('en').common.navigation;
  for (const [page, ids] of Object.entries(pageSections)) {
    const nav = createNavigation({ page, locale: 'en' });
    assert.equal(nav.contextLabel.textContent, copy[`${page}Context`]);
    assert.equal(nav.contextNav.getAttribute('aria-label'), copy[`${page}Sections`]);
    assert.doesNotMatch(nav.contextLinks.innerHTML, /[\p{Script=Han}]/u);
    assert.doesNotMatch(nav.contextLinks.innerHTML, /\?page=/);
    for (const id of ids) assert.ok(nav.contextLinks.innerHTML.includes(`href="#${id}"`));
    const current = nav.links.filter(link => link.getAttribute('aria-current') === 'page');
    assert.equal(current.length, 1);
    assert.equal(current[0].dataset.pageLink, page);
  }
});

test('mobile directory closes on selection, Escape and resize while primary page links remain visible', () => {
  const nav = createNavigation({ page: 'about', compact: true });
  assert.equal(nav.contextNav.hidden, true);
  assert.equal(nav.menu.getAttribute('aria-expanded'), 'false');
  assert.equal(nav.properties.get('--header-height'), '113px');
  assert.ok(nav.links.every(link => !link.hidden));
  nav.menu.handlers.get('click')();
  assert.equal(nav.contextNav.hidden, false);
  assert.equal(nav.menu.getAttribute('aria-expanded'), 'true');
  nav.contextNav.handlers.get('click')({ target: { closest: () => ({}) } });
  assert.equal(nav.contextNav.hidden, true);
  nav.menu.handlers.get('click')();
  nav.document.handlers.get('keydown')({ key: 'Escape' });
  assert.equal(nav.contextNav.hidden, true);
  assert.equal(nav.menu.focused, true);
  nav.media.matches = false;
  nav.media.handlers.get('change')();
  assert.equal(nav.contextNav.hidden, false);
  assert.equal(nav.menu.getAttribute('aria-expanded'), 'false');
  nav.media.matches = true;
  nav.media.handlers.get('change')();
  assert.equal(nav.contextNav.hidden, true);
});
