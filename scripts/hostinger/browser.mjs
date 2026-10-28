import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { canonicalUrl, crawlTargets } from '../../docs/design/live-prototype/page-metadata.js';
import { sha } from './core.mjs';
import { SUPPORTED_LOCALES } from '../../docs/design/live-prototype/locale-store.js';

const PAGES = ['home', 'kip', 'ems', 'pvsim', 'cases', 'about'];
const LANGS = SUPPORTED_LOCALES.map(({ code }) => code);
const WIDTHS = [390, 1440];

/**
 * Every page in both languages at phone and desktop width, the energy pages at two narrower
 * widths, then each published case page in both languages. Case pages come from the same crawl
 * targets that sitemap.xml must equal, so a newly published case is checked without editing here.
 */
export function smokeMatrix(targets = crawlTargets()) {
  const matrix = PAGES.flatMap(page => LANGS.flatMap(lang => WIDTHS.map(width => ({ page, lang, width }))));
  matrix.push(...['ems', 'pvsim'].flatMap(page => [320, 835].map(width => ({ page, lang: 'zh-Hant', width }))));
  matrix.push(...targets.filter(target => target.page === 'cases' && target.caseId)
    .flatMap(({ caseId, locale }) => WIDTHS.map(width => ({ page: 'cases', caseId, lang: locale, width }))));
  return matrix;
}

/** The address of one check, in the canonical parameter order: page, case, language. */
export function smokeQuery({ page, caseId, lang }) {
  const query = new URLSearchParams({ page });
  if (caseId) query.set('case', caseId);
  query.set('lang', lang);
  return `?${query}`;
}

export async function smoke(manifest, work, origin, mode) {
  let server, browser;
  const cases = [];
  try {
    if (mode === 'local') {
      const assets = new Map();
      const types = { html: 'text/html', js: 'text/javascript', css: 'text/css', webp: 'image/webp', jpg: 'image/jpeg', png: 'image/png', svg: 'image/svg+xml', xml: 'application/xml', txt: 'text/plain', glb: 'model/gltf-binary' };
      for (const file of manifest.files) {
        const bytes = await readFile(join(work, 'artifact', file.path));
        assert.equal(sha(bytes), file.sha256);
        assets.set(`/${manifest.release}/${file.path}`, { bytes, type: types[file.path.split('.').at(-1)] });
      }
      assets.set('/', assets.get(`/${manifest.release}/index.html`));
      server = createServer((req, res) => {
        const asset = assets.get(new URL(req.url, 'http://localhost').pathname);
        res.writeHead(asset ? 200 : 404, { 'Content-Type': asset?.type || 'text/plain' }); res.end(asset?.bytes);
      });
      await new Promise(done => server.listen(0, '127.0.0.1', done));
      origin = `http://127.0.0.1:${server.address().port}`;
    }
    browser = await chromium.launch({ headless: true, ...(process.env.HOSTINGER_BROWSER_CHANNEL ? { channel: process.env.HOSTINGER_BROWSER_CHANNEL } : {}), args: ['--enable-unsafe-swiftshader'] });
    for (const item of smokeMatrix()) {
      const context = await browser.newContext({ viewport: { width: item.width, height: 950 }, reducedMotion: 'reduce' });
      const page = await context.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('requestfailed', req => { if (new URL(req.url()).origin === origin) errors.push(`Resource failed: ${new URL(req.url()).pathname}`); });
      page.on('response', res => { if (new URL(res.url()).origin === origin && res.status() >= 400) errors.push(`HTTP ${res.status()}: ${new URL(res.url()).pathname}`); });
      const path = mode === 'staged' ? `/${manifest.release}/index.html` : '/';
      const response = await page.goto(`${origin}${path}${smokeQuery(item)}`, { waitUntil: 'networkidle', timeout: 60000 });
      assert.equal(response.status(), 200);
      // A working older release is not a successful deployment of this commit.
      assert.equal(sha(await response.body()), manifest.files.find(f => f.path === 'index.html').sha256);
      await page.locator(`body[data-page="${item.page}"]`).waitFor();
      assert.equal(await page.locator('h1').count(), 1);
      assert.doesNotMatch(await page.title(), /preview|預覽/i);
      assert.equal(await page.locator('html').getAttribute('lang'), item.lang);
      assert.equal(await page.locator('.page-navigation [aria-current="page"]').getAttribute('data-page-link'), item.page);
      if (item.caseId) {
        // A published case renders its own detail page and canonical, never the stated miss.
        await page.locator('.cases-page[data-cases-state="detail"]').waitFor();
        assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), canonicalUrl({ page: 'cases', locale: item.lang, caseId: item.caseId }));
      }
      for (const img of await page.locator('img').all()) if (await img.isVisible()) {
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(i => Promise.race([i.decode(), new Promise((_, reject) => setTimeout(() => reject(Error('Image timeout')), 15000))]));
      }
      if (item.page === 'ems' || item.page === 'pvsim') {
        const buttons = page.locator('[data-product-screen]');
        assert.equal(await buttons.count(), item.page === 'ems' ? 3 : 4);
        for (const button of await buttons.all()) {
          await button.click(); await page.locator('.product-screen-open img').evaluate(i => i.decode());
        }
      }
      if (item.page === 'pvsim') {
        await page.locator('[data-product-screen="0"]').click(); await page.locator('[data-pvsim-start]').click();
        const canvas = page.locator('[data-pvsim-viewer] canvas');
        await canvas.waitFor({ state: 'visible', timeout: 45000 });
        const before = sha(await canvas.screenshot());
        await page.locator('[data-pvsim-action="in"]').click();
        await page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
        assert.notEqual(sha(await canvas.screenshot()), before, '3D zoom did not render');
        await page.locator('[data-pvsim-action="home"]').click();
        await page.locator('[data-product-screen="3"]').click();
        assert.equal(await canvas.isVisible(), false);
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Horizontal overflow');
      const opposite = LANGS[(LANGS.indexOf(item.lang) + 1) % LANGS.length];
      await page.locator('#language').selectOption(opposite);
      await page.waitForURL(url => url.searchParams.get('lang') === opposite);
      assert.equal(new URL(page.url()).searchParams.get('page'), item.page);
      if (item.caseId) assert.equal(new URL(page.url()).searchParams.get('case'), item.caseId);
      assert.deepEqual(errors, []);
      cases.push({ ...item, status: 'passed' }); await context.close();
    }
    await writeFile(join(work, `browser-${mode}.json`), JSON.stringify({ status: 'passed', release: manifest.release, sourceCommit: manifest.sourceCommit, cases }, null, 2));
    console.log(`${mode}: ${cases.length} browser checks passed`);
  } finally { await browser?.close(); server?.close(); }
}
