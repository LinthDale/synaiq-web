import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { hasDeclaration } from './css-test-helpers.mjs';
import { getMessages, escapeHtml as esc } from './i18n.js';

const html = readFileSync(new URL('./page.html', import.meta.url), 'utf8');
const source = readFileSync(new URL('./prototype.js', import.meta.url), 'utf8');
const navigationSource = source.slice(source.indexOf('export function initPageNavigation')).replace('export function', 'function');

function createNavigation({ isKip = false, compact = false, locale = 'zh-Hant' } = {}) {
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
  const links = ['home', 'kip'].map(pageLink => element({ dataset: { pageLink } }));
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
    document, isKip, common: getMessages(locale).common, getMessages, esc, matchMedia: () => media,
    ResizeObserver: class { constructor(callback) { resize = callback; } observe() {} },
  });
  return { links, menu, contextNav, contextLabel, contextLinks, document, media, properties, resize };
}

test('only Home and KIP are primary page switches; context directory is outside sticky header', () => {
  const primary = html.match(/<nav class="page-navigation"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
  assert.ok(primary);
  assert.equal((primary.match(/<a /g) || []).length, 2);
  assert.match(primary, /href="\?page=home" data-page-link="home"/);
  assert.match(primary, /href="\?page=kip" data-page-link="kip"/);
  assert.doesNotMatch(primary, /Wally|產品畫面|關於/);
  assert.doesNotMatch(primary, /目前所在|<small/);
  assert.ok(html.indexOf('id="mobile-nav"') > html.indexOf('</header>'));
  assert.ok(hasDeclaration('site.css', '.page-navigation', 'grid-column', '1 / -1', '(max-width:899px)'));
  assert.ok(hasDeclaration('site.css', '.page-navigation', 'grid-row', '2', '(max-width:899px)'));
  assert.ok(hasDeclaration('site.css', 'html', 'scroll-padding-top', 'calc(var(--header-height,74px) + 18px)'));
  assert.ok(hasDeclaration('site.css', '.page-context', 'position', 'fixed', '(max-width:899px)'));
  assert.ok(hasDeclaration('site.css', '.page-context', 'inset', 'var(--header-height,112px) 0 auto', '(max-width:899px)'));
});

test('Home and KIP each expose one visible and accessible current page and only local section links', () => {
  for (const isKip of [false, true]) {
    const nav = createNavigation({ isKip });
    const current = nav.links.filter(link => link.getAttribute('aria-current') === 'page');
    assert.equal(current.length, 1);
    assert.equal(current[0].dataset.pageLink, isKip ? 'kip' : 'home');
    assert.equal(nav.contextLabel.textContent, isKip ? 'KIP 平台內容' : '首頁內容');
    assert.equal(nav.contextNav.getAttribute('aria-label'), isKip ? 'KIP 平台段落' : '首頁段落');
    assert.doesNotMatch(nav.contextLinks.innerHTML, /\?page=/);
    if (isKip) {
      for (const id of ['process', 'architecture', 'advantages', 'proof']) assert.ok(nav.contextLinks.innerHTML.includes(`href="#${id}"`));
      assert.doesNotMatch(nav.contextLinks.innerHTML, /Wally|關於/);
    } else {
      for (const id of ['wally', 'proof', 'footer']) assert.ok(nav.contextLinks.innerHTML.includes(`href="#${id}"`));
    }
    assert.equal(nav.contextNav.hidden, false);
    assert.equal(nav.properties.get('--header-height'), '75px');
  }
});

test('English navigation translates the contextual directory without changing page or section targets', () => {
  const copy = getMessages('en').common.navigation;
  for (const isKip of [false, true]) {
    const nav = createNavigation({ isKip, locale: 'en' });
    assert.equal(nav.contextLabel.textContent, isKip ? copy.kipContext : copy.homeContext);
    assert.equal(nav.contextNav.getAttribute('aria-label'), isKip ? copy.kipSections : copy.homeSections);
    assert.doesNotMatch(nav.contextLinks.innerHTML, /[\p{Script=Han}]/u);
    assert.doesNotMatch(nav.contextLinks.innerHTML, /\?page=/);
    const ids = isKip ? ['process', 'architecture', 'advantages', 'proof'] : ['wally', 'proof', 'footer'];
    for (const id of ids) assert.ok(nav.contextLinks.innerHTML.includes(`href="#${id}"`));
    const current = nav.links.filter(link => link.getAttribute('aria-current') === 'page');
    assert.equal(current.length, 1);
    assert.equal(current[0].dataset.pageLink, isKip ? 'kip' : 'home');
  }
});

test('mobile directory closes on selection, Escape and resize while primary page links remain visible', () => {
  const nav = createNavigation({ isKip: true, compact: true });
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
