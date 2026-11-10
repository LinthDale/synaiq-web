import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { createPrerenderedPages, prerenderPath, prerenderRules } from './prerender.mjs';
import { crawlTargets, pageMetadata } from '../../docs/design/live-prototype/page-metadata.js';
import { escapeHtml } from '../../docs/design/live-prototype/i18n.js';
import { buildRouting, activeRelease } from './core.mjs';

const shell = await readFile(new URL('../../docs/design/live-prototype/page.html', import.meta.url), 'utf8');
const pages = await createPrerenderedPages(shell);
const paths = [...pages.keys()];

test('every sitemap URL supplies its own full content and metadata before JavaScript', () => {
  for (const target of crawlTargets()) {
    const meta = pageMetadata(target);
    const file = prerenderPath(new URL(meta.canonical).search, paths);
    const html = pages.get(file);
    assert.ok(html, meta.canonical);
    assert.ok(html.includes(`<title>${escapeHtml(meta.title)}</title>`));
    assert.ok(html.includes(`<meta name="description" content="${escapeHtml(meta.description)}">`));
    assert.ok(html.includes(`<link rel="canonical" href="${escapeHtml(meta.canonical)}">`));
    assert.ok(html.includes(`<meta property="og:url" content="${escapeHtml(meta.canonical)}">`));
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.doesNotMatch(html, /<main id="main"><\/main>/);
    assert.ok(html.includes(`data-page="${target.page}"`));
    assert.ok(html.includes(`<html lang="${target.locale}"`));
    if (target.page === 'pvsim') {
      const main = html.match(/<main id="main">([\s\S]*?)<\/main>/)[1];
      assert.doesNotMatch(main, /Synaiq/i);
      assert.match(main, /PVsim/);
      assert.match(html, />Synaiq KIP<\/a>/, 'Keep the distinct KIP product name');
    }
  }
});

test('language-neutral URLs keep product content without a canonical that fights browser preference', () => {
  const html = pages.get(prerenderPath('?page=pvsim', paths));
  assert.match(html, /<title>PVsim/);
  assert.doesNotMatch(html, /rel="canonical"|property="og:url"/);
  assert.match(html, /data-energy-product="pvsim"/);
  assert.equal(pages.get('index.html'), pages.get(prerenderPath('', paths)));
  assert.equal(prerenderPath('?page=pvsim&lang=EN', paths), prerenderPath('?page=pvsim&lang=en', paths));
});

test('direct generated documents retain their page when client rendering starts', () => {
  for (const [file, html] of pages) {
    if (!file.startsWith('prerender/')) continue;
    const script = html.match(/<script data-prerender-entry>([\s\S]*?)<\/script>/)?.[1];
    assert.ok(script, file);
    let replaced;
    const run = pathname => runInNewContext(script, {
      location: { pathname, search: '', hash: '#story' },
      history: { replaceState: (_, __, url) => { replaced = url; } },
    });
    run('/');
    assert.equal(replaced, undefined, 'Canonical query entry remains untouched');
    run(`/synaiq-release-test/${file}`);
    assert.ok(replaced.startsWith('/synaiq-release-test/index.html?page='));
    assert.ok(replaced.endsWith('#story'));
    assert.equal(prerenderPath(new URL(replaced, 'https://example.test').search, paths), file);
    assert.doesNotMatch(html, /href="\?page=/, 'No-JS links must also leave the generated document');
  }
});

test('unknown cases are a pre-rendered noindex miss; query values cannot become file paths', () => {
  for (const value of ['missing-case', '../private', '<script>', 'not%2Ffound']) {
    const html = pages.get(prerenderPath(`?page=cases&case=${encodeURIComponent(value)}&lang=en`, paths));
    assert.match(html, /content="noindex, nofollow"/);
    assert.doesNotMatch(html, /rel="canonical"/);
    assert.match(html, /data-cases-state="notFound"/);
  }
  assert.equal(prerenderPath('?page=pvsim&lang=en&lang=de', paths), prerenderPath('?page=pvsim&lang=en', paths));
  assert.equal(prerenderPath('?page=unknown&lang=en', paths), prerenderPath('?page=home&lang=en', paths));
});

// Execute the generated RewriteCond/RewriteRule subset against request queries, independently
// of the JS selector used by local previews. This catches root/staged mismatches before upload.
function routedFile(rules, pathname, query) {
  let conditions = [];
  for (const line of rules.split('\n')) {
    if (line.startsWith('RewriteCond %{QUERY_STRING} ')) {
      const [, pattern, flags] = line.match(/^RewriteCond %\{QUERY_STRING\} (\S+)(?: \[(\w+)\])?$/);
      const negative = pattern.startsWith('!');
      const matches = new RegExp(negative ? pattern.slice(1) : pattern, flags === 'NC' ? 'i' : '').test(query);
      conditions.push(negative ? !matches : matches);
    } else if (line.startsWith('RewriteRule ')) {
      const [, pattern, target] = line.split(' ');
      if (conditions.every(Boolean) && new RegExp(pattern).test(pathname)) return target;
      conditions = [];
    }
  }
}

test('Apache rules match query order, tracking parameters, first duplicate values and fallbacks', () => {
  const release = 'synaiq-release-test';
  const rules = prerenderRules(release, paths, 'root');
  const queries = [
    '', 'page=pvsim', 'lang=en&page=pvsim&utm_source=google', 'page=pvsim&lang=de',
    'page=pvsim&lang=EN', 'page=pvsim&lang=bad', 'page=unknown&lang=en',
    'page=pvsim&page=kip&lang=en', 'page=kip&page=pvsim&lang=de',
    'page=pvsim&lang=en&lang=de', 'page=cases&case=missing&lang=en', 'page=cases&case=&lang=en',
    'page=%70vsim&lang=%45N', '%70age=pvsim&%6Cang=en', 'LANG=en&page=pvsim',
    'page=pvsim&lang&lang=en', 'page&page=pvsim&lang=en', 'page=cases&case&case=missing&lang=en',
    ...crawlTargets().map(t => new URL(pageMetadata(t).canonical).search.slice(1)),
  ];
  for (const query of queries) {
    const expected = `/${release}/${prerenderPath(query, paths)}`;
    assert.equal(routedFile(rules, '', query), expected, query);
    assert.equal(routedFile(prerenderRules(release, paths, 'entry'), `${release}/index.html`, query), expected);
    assert.equal(routedFile(prerenderRules(release, paths, 'entry'), `${release}/page.html`, query), expected);
  }
  assert.equal(routedFile(rules, 'unpublished', 'page=pvsim'), undefined);
});

test('staging retains old root routes; activation and later releases replace complete route blocks', () => {
  const old = 'synaiq-release-old', next = 'synaiq-release-next';
  const required = [...paths, 'page.html', 'robots.txt', 'sitemap.xml'];
  const base = `RewriteRule ^$ /${old}/index.html [L]\nRewriteRule ^robots\\.txt$ /${old}/robots.txt [L]\nRewriteRule ^sitemap\\.xml$ /${old}/sitemap.xml [L]\n# Only inspected static releases remain public.\nRewriteRule ^${old}/(?:index\\.html|page\\.html)$ - [L]\nRewriteRule ^ - [G,L]\n# Active folder: ${old};\nHeader always set Cache-Control "no-cache, must-revalidate"\n`;
  const first = buildRouting(base, next, required);
  assert.equal(activeRelease(first.preview), old);
  assert.equal(routedFile(first.preview, '', 'page=pvsim&lang=en'), `/${old}/index.html`);
  assert.equal(routedFile(first.preview, `${next}/index.html`, 'page=pvsim&lang=en'), `/${next}/${prerenderPath('?page=pvsim&lang=en', paths)}`);
  assert.equal(routedFile(first.live, '', 'page=pvsim&lang=en'), `/${next}/${prerenderPath('?page=pvsim&lang=en', paths)}`);
  const last = buildRouting(first.live, 'synaiq-release-last', required);
  assert.equal(routedFile(last.preview, '', 'page=pvsim&lang=en'), `/${next}/${prerenderPath('?page=pvsim&lang=en', paths)}`);
  assert.equal(routedFile(last.live, '', 'page=pvsim&lang=en'), `/synaiq-release-last/${prerenderPath('?page=pvsim&lang=en', paths)}`);
  const fourth = buildRouting(last.live, 'synaiq-release-fourth', required);
  assert.ok(!fourth.live.includes(`${next}/`), 'No orphaned RewriteCond blocks from retired entries');
});
