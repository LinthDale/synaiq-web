import assert from 'node:assert/strict';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, loadMessages, getMessages } from '../../docs/design/live-prototype/locale-store.js';
import { escapeHtml as e, pageHref } from '../../docs/design/live-prototype/i18n.js';
import { crawlTargets, pageMetadata } from '../../docs/design/live-prototype/page-metadata.js';
import { renderHome } from '../../docs/design/live-prototype/home-design.js';
import { renderKip } from '../../docs/design/live-prototype/kip-design.js';
import { renderEms, renderPvsim } from '../../docs/design/live-prototype/energy-design.js';
import { renderCases, caseSectionIds } from '../../docs/design/live-prototype/cases-design.js';
import { renderAbout } from '../../docs/design/live-prototype/about-design.js';
import { renderContact, renderAdvantageSection } from '../../docs/design/live-prototype/shared-design.js';
import { prerenderFile } from './prerender-routing.mjs';
export { prerenderPath, prerenderRules } from './prerender-routing.mjs';

const renderers = { home: renderHome, kip: renderKip, ems: renderEms, pvsim: renderPvsim, cases: renderCases, about: renderAbout };
function replaceOnce(html, pattern, replacement) {
  assert.equal([...html.matchAll(new RegExp(pattern.source, 'g'))].length, 1, `Missing or duplicate shell slot: ${pattern}`);
  return html.replace(pattern, () => replacement);
}
function sectionLinks(page, options) {
  const nav = options.messages.common.navigation;
  const labels = { 'cases-list': nav.casesList, story: nav.productStory, process: page === 'ems' ? nav.energyWorkflow : nav.solarWorkflow,
    capabilities: nav.capabilities, proof: nav.demo, advantages: nav.advantages, footer: nav.about,
    architecture: nav.architecture, approach: nav.approach, leadership: nav.leadership, technical: nav.technical };
  const ids = { home: ['proof', 'advantages', 'footer'], kip: ['process', 'architecture', 'advantages', 'proof'],
    ems: ['story', 'process', 'capabilities', 'proof'], pvsim: ['story', 'process', 'capabilities', 'proof'],
    about: ['approach', 'leadership', 'technical'] };
  if (page === 'home') labels.proof = nav.proof;
  if (page === 'kip') labels.process = nav.process;
  if (page === 'cases') Object.assign(labels, { story: nav.caseStory, fieldnotes: nav.fieldnotes, press: nav.casePress });
  return (page === 'cases' ? caseSectionIds(options) : ids[page]).map(id => `<a href="#${id}">${e(labels[id])}</a>`).join('');
}
function renderDocument(source, target) {
  const auto = target.locale === 'auto', locale = auto ? DEFAULT_LOCALE : target.locale;
  const messages = getMessages(locale), common = messages.common;
  const missing = target.caseId === '_missing';
  const options = { page: target.page, locale, messages, caseId: missing ? null : target.caseId,
    caseState: missing ? 'notFound' : target.caseId ? 'detail' : 'overview',
    contact: () => renderContact(common), advantageSection: () => renderAdvantageSection(common) };
  const meta = pageMetadata({ page: target.page, locale, caseId: target.caseId });
  let html = source.replaceAll('\r\n', '\n');
  html = replaceOnce(html, /<html lang="[^"]*">/, `<html lang="${locale}" dir="${SUPPORTED_LOCALES.find(item => item.code === locale).dir}">`);
  html = replaceOnce(html, /<title>[\s\S]*?<\/title>/, `<title>${e(meta.title)}</title>`);
  // The source document carries Home fallbacks. Replace them before publishing any page.
  for (const [attribute, key, value] of [['name', 'description', meta.description], ['property', 'og:title', meta.title],
    ['property', 'og:description', meta.description], ['property', 'og:locale', meta.og.locale]]) {
    html = replaceOnce(html, new RegExp(`<meta ${attribute}="${key}"[^>]*>`), `<meta ${attribute}="${key}" content="${e(value)}">`);
  }
  html = replaceOnce(html, /<meta property="og:url"[^>]*>/, !auto && meta.canonical ? `<meta property="og:url" content="${e(meta.canonical)}">` : '');
  html = replaceOnce(html, /<!-- generated-locale-alternates:start -->[\s\S]*?<!-- generated-locale-alternates:end -->/,
    meta.og.localeAlternate.map(code => `<meta property="og:locale:alternate" content="${code}">`).join('\n'));
  const head = [`<meta name="robots" content="${meta.robots}">`];
  // Public asset checks fetch these files directly. Give their client renderer the
  // same route as the initial HTML while normal root/staged query URLs stay intact.
  const file = prerenderFile(target), query = new URLSearchParams({ page: target.page });
  if (target.caseId) query.set('case', target.caseId);
  if (!auto) query.set('lang', locale);
  head.push(`<script data-prerender-entry>if (location.pathname.endsWith(${JSON.stringify('/' + file)})) history.replaceState(null, '', location.pathname.slice(0, -${file.length}) + ${JSON.stringify('index.html?' + query)} + location.hash);</script>`);
  if (!auto && meta.canonical) head.push(`<link rel="canonical" href="${e(meta.canonical)}">`);
  for (const alt of meta.alternates) head.push(`<link rel="alternate" hreflang="${alt.hreflang}" href="${e(alt.href)}">`);
  html = html.replace('</head>', `${head.join('\n')}\n</head>`);
  const message = key => key.split('.').reduce((value, part) => value[part], common);
  html = html.replace(/<([a-z]+)([^>]*\bdata-i18n="([^"]+)"[^>]*)>[\s\S]*?<\/\1>/g,
    (_, tag, attributes, key) => `<${tag}${attributes}>${e(message(key))}</${tag}>`);
  html = html.replace(/<[^>]+data-i18n-aria="([^"]+)"[^>]*>/g,
    (tag, key) => tag.replace(/aria-label="[^"]*"/, `aria-label="${e(message(key))}"`));
  html = replaceOnce(html, /<body>/, `<body data-page="${target.page}">`);
  html = replaceOnce(html, /<main id="main"><\/main>/, `<main id="main">${renderers[target.page](options)}</main>`);
  html = replaceOnce(html, /<select id="language"[\s\S]*?<\/select>/,
    `<select id="language" class="language language-select" aria-label="${e(common.navigation.language)}" data-i18n-aria="navigation.language">${SUPPORTED_LOCALES.map(item => `<option value="${item.code}" lang="${item.code}"${item.code === locale ? ' selected' : ''}>${e(item.shortLabel)}</option>`).join('')}</select>`);
  html = replaceOnce(html, /<p class="page-context-label" id="page-context-label">[\s\S]*?<\/p>/,
    `<p class="page-context-label" id="page-context-label">${e(common.navigation[`${target.page}Context`])}</p>`);
  html = replaceOnce(html, /<div class="page-context-links" id="page-context-links">[\s\S]*?<\/div>/,
    `<div class="page-context-links" id="page-context-links">${sectionLinks(target.page, options)}</div>`);
  html = html.replace(/(<nav id="mobile-nav"[^>]*aria-label=")[^"]*"/, `$1${e(common.navigation[`${target.page}Sections`])}"`);
  html = html.replace(/<a ([^>]*data-page-link="([^"]+)"[^>]*)>/g,
    (_, attributes, page) => `<a ${attributes}${page === target.page ? ' aria-current="page"' : ''}>`);
  html = html.replace(/href="(\?page=[^"]+)"/g, (_, href) => {
    const url = new URL(href.replaceAll('&amp;', '&'), 'https://taistro.com.tw');
    return `href="/${e(pageHref({ page: url.searchParams.get('page'), locale, caseId: url.searchParams.get('case'), hash: url.hash }))}"`;
  });
  return html;
}

export async function createPrerenderedPages(shell) {
  await Promise.all(SUPPORTED_LOCALES.map(({ code }) => loadMessages(code)));
  const targets = [...crawlTargets()];
  const unique = new Map(targets.map(target => [`${target.page}/${target.caseId || ''}`, { ...target, locale: 'auto' }]));
  targets.push(...unique.values(), ...[...SUPPORTED_LOCALES.map(item => item.code), 'auto'].map(locale => ({ page: 'cases', locale, caseId: '_missing' })));
  const result = new Map(targets.map(target => [prerenderFile(target), renderDocument(shell, target)]));
  result.set('index.html', result.get(prerenderFile({ page: 'home', locale: 'auto' })));
  return result;
}
