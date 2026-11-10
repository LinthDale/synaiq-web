import assert from 'node:assert/strict';
import { SUPPORTED_PAGES, resolvePage } from '../../docs/design/live-prototype/i18n.js';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, resolveLocale } from '../../docs/design/live-prototype/locale-store.js';

const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const codes = SUPPORTED_LOCALES.map(item => item.code);
export function prerenderFile({ page, locale, caseId = null }) {
  assert.ok(SUPPORTED_PAGES.includes(page));
  assert.ok([...codes, 'auto'].includes(locale));
  assert.ok(caseId === null || (page === 'cases' && /^(?:_missing|[a-z0-9][a-z0-9-]{0,63})$/.test(caseId)));
  return `prerender/${page}${caseId ? `.${caseId}` : ''}.${locale}.html`;
}

export function prerenderPath(search, paths) {
  const params = new URLSearchParams(search);
  const page = resolvePage(params.get('page'));
  const locale = params.has('lang') ? resolveLocale(params.get('lang')) : 'auto';
  const requested = page === 'cases' ? params.get('case') : null;
  let caseId = requested || null;
  if (caseId && (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(caseId) || !paths.includes(prerenderFile({ page, locale, caseId })))) caseId = '_missing';
  const file = prerenderFile({ page, locale, caseId });
  return paths.includes(file) ? file : 'index.html';
}

// Match the first decoded query key, like URLSearchParams.get(). Values are fixed build
// inputs, never substitutions from requests. Percent-encoded ASCII works as well.
function literal(value, insensitive = false) {
  return [...value].map(char => {
    const variants = insensitive ? [...new Set([char.toLowerCase(), char.toUpperCase()])] : [char];
    return `(?:${variants.flatMap(c => [escape(c), '%' + c.charCodeAt(0).toString(16).split('').map(h => /[a-f]/.test(h) ? `[${h}${h.toUpperCase()}]` : h).join('')]).join('|')})`;
  }).join('');
}
function first(key, value) {
  const k = literal(key);
  const bare = new RegExp(`^(?:${value})$`).test('') ? '|(?=&|$)' : '';
  return `^(?:(?!${k}(?:=|&|$))[^&]*&)*${k}(?:=${value}${bare})(?:&|$)`;
}
const condition = (pattern, negative = false) => `RewriteCond %{QUERY_STRING} ${negative ? '!' : ''}${pattern}`;

export function prerenderRules(release, paths, mode) {
  assert.match(release, /^synaiq-release-[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.ok(['root', 'entry'].includes(mode));
  const entries = paths.filter(path => path.startsWith('prerender/')).map(path => {
    const match = path.match(/^prerender\/([a-z]+)(?:\.([a-z0-9_-]+))?\.([A-Za-z-]+)\.html$/);
    assert.ok(match, 'Invalid prerender filename');
    const [, page, id, locale] = match;
    assert.equal(prerenderFile({ page, locale, caseId: id || null }), path);
    return { page, caseId: id || null, locale, path };
  });
  if (!entries.length) return '';
  // Specific case IDs precede the noindex miss, which precedes the overview.
  entries.sort((a, b) => (a.page === 'home') - (b.page === 'home') ||
    Number(!a.caseId) - Number(!b.caseId) || Number(a.caseId === '_missing') - Number(b.caseId === '_missing'));
  const lines = [`# BEGIN prerender ${mode} ${release}`];
  for (const entry of entries) {
    const { page, locale, caseId } = entry;
    lines.push(page === 'home'
      ? condition(first('page', `(?:${SUPPORTED_PAGES.filter(p => p !== 'home').map(p => literal(p)).join('|')})`), true)
      : condition(first('page', literal(page))));
    if (locale === 'auto') lines.push(condition(first('lang', '[^&]*'), true));
    else if (locale === DEFAULT_LOCALE) {
      lines.push(condition(first('lang', '[^&]*')));
      const others = codes.filter(code => code !== DEFAULT_LOCALE);
      if (others.length) lines.push(condition(first('lang', `(?:${others.map(code => literal(code, true)).join('|')})`), true));
    } else lines.push(condition(first('lang', literal(locale, true))));
    if (caseId) lines.push(condition(first('case', caseId === '_missing' ? '[^&]+' : literal(caseId))));
    const route = mode === 'root' ? '^$' : `^${escape(release)}/(?:index|page)\\.html$`;
    lines.push(`RewriteRule ${route} /${release}/${entry.path} [L]`);
  }
  lines.push(`# END prerender ${mode} ${release}`);
  return lines.join('\n');
}

export function retainPrerenderBlocks(base, current) {
  return base.replace(/^# BEGIN prerender (entry|root) (synaiq-release-[a-z0-9-]+)\r?\n[\s\S]*?^# END prerender \1 \2\r?\n?/gm,
    (block, mode, release) => release === current ? block : '');
}
export function replaceRootPrerender(base, release, paths, eol) {
  const clean = base.replace(/^# BEGIN prerender root (synaiq-release-[a-z0-9-]+)\r?\n[\s\S]*?^# END prerender root \1\r?\n?/gm, '');
  const rules = prerenderRules(release, paths, 'root').replaceAll('\n', eol);
  return rules ? clean.replace(/^RewriteRule \^\$ /m, `${rules}${eol}RewriteRule ^$ `) : clean;
}
