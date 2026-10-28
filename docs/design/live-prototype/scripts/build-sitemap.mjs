import { writeFile, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { crawlTargets, canonicalUrl, alternateUrls } from '../page-metadata.js';
const escape = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
export function renderSitemap() {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${crawlTargets().map(target => `  <url>\n    <loc>${escape(canonicalUrl(target))}</loc>\n${alternateUrls(target.page, target.caseId).map(({hreflang, href}) => `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${escape(href)}" />`).join('\n')}\n  </url>`).join('\n')}\n</urlset>\n`;
}
export async function generateSitemap({ check = false } = {}) {
  const path = new URL('../sitemap.xml', import.meta.url), source = renderSitemap();
  if (check) assert.equal((await readFile(path, 'utf8')).replaceAll('\r\n', '\n'), source, 'Run build-sitemap.mjs to refresh sitemap.xml');
  else await writeFile(path, source);
}
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  assert.ok(process.argv.slice(2).every(value => value === '--check'));
  await generateSitemap({ check: process.argv.includes('--check') });
}
