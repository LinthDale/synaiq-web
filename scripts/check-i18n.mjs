// Real-browser acceptance for shared three-language pages. No production access.
import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { chromium } from 'playwright';
import { createPreviewServer, PUBLIC_FILES } from '../docs/design/live-prototype/share-preview.mjs';
import { SUPPORTED_LOCALES, loadMessages, getMessages } from '../docs/design/live-prototype/i18n.js';
import { crawlTargets, canonicalUrl } from '../docs/design/live-prototype/page-metadata.js';
import { transformSource } from './hostinger/core.mjs';

await Promise.all(SUPPORTED_LOCALES.map(({ code }) => loadMessages(code)));
const output = new URL(`../out/i18n-migration/acceptance-${new Date().toISOString().replace(/[:.]/g, '-')}/`, import.meta.url);
await mkdir(output, { recursive: true });
const source = createPreviewServer();
await new Promise(resolve => source.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${source.address().port}`;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [], failures = [], captures = [];
const check = async (name, run) => {
  try { await run(); results.push({ name, status: 'passed' }); }
  catch (error) { failures.push({ name, error: error.stack }); console.error(name, error.message); }
};
const newPage = async (width = 1440, locale = 'de-DE') => {
  const context = await browser.newContext({ viewport: { width, height: 900 }, locale, reducedMotion: 'reduce' });
  const page = await context.newPage();
  // External fonts are independent of this change; use the same installed fallbacks in all checks.
  await page.route(/https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com)\//, route => route.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  return { page, context };
};
try {
  for (const target of crawlTargets()) for (const width of [320, 390, 835, 1440]) {
    await check(`${target.page}/${target.caseId ?? 'overview'}/${target.locale}/${width}`, async () => {
      const { page, context } = await newPage(width);
      try {
        const errors = [], requests = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('response', response => { if (response.url().startsWith(origin) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
        page.on('request', request => { if (SUPPORTED_LOCALES.some(({ code }) => new URL(request.url()).pathname.endsWith(`/locales/generated/${code}.js`))) requests.push(request.url()); });
        const query = new URL(canonicalUrl(target)).search;
        await page.goto(`${origin}/page.html${query}`);
        await page.waitForSelector('html[data-i18n-ready]');
        assert.equal(await page.locator('html').getAttribute('lang'), target.locale);
        assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), canonicalUrl(target));
        assert.equal(await page.locator('link[hreflang]').count(), SUPPORTED_LOCALES.length + 1);
        assert.equal(new Set(requests).size, 1, 'one selected full catalog');
        assert.ok(requests.every(url => url.endsWith(`/${target.locale}.js`)));
        const overflow = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, elements: [...document.querySelectorAll('body *')].filter(el => { const r = el.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1) && getComputedStyle(el).position !== 'absolute'; }).slice(0, 8).map(el => ({ tag: el.tagName, class: el.className, text: el.textContent.slice(0, 70) })) }));
        assert.ok(overflow.scroll <= width, JSON.stringify(overflow));
        if (['home', 'kip'].includes(target.page)) {
          for (const scene of ['knowledge', 'text-image', 'image-image']) {
            await page.locator(`[data-demo-select="${scene}"]`).click();
            assert.equal(await page.locator('[data-demo-animation]').getAttribute('data-demo-scene'), scene);
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
          }
        }
        if (['ems', 'pvsim'].includes(target.page)) {
          await page.locator('[data-energy-step]').last().click();
          await page.locator('[data-product-screen]').last().click();
        }
        if (target.locale === 'de' && (width === 1440 || (width === 390 && target.page === 'home'))) {
          // Trigger lazy images before capturing a full-page review.
          await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 800) { scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } scrollTo(0, 0); });
          await page.waitForTimeout(250);
          const file = `${target.page}-${target.caseId ?? 'overview'}-${width}.png`;
          await page.screenshot({ path: new URL(file, output).pathname.replace(/^\/([A-Za-z]:)/, '$1'), fullPage: true });
          captures.push(file);
        }
        assert.deepEqual(errors, []);
      } finally { await context.close(); }
    });
  }
  await check('browser detection, explicit choice, case and hash retention', async () => {
    const { page, context } = await newPage();
    try {
      await page.addInitScript(() => Object.defineProperty(navigator, 'languages', { get: () => ['not-supported', 'de-AT', 'en-US'] }));
      await page.goto(`${origin}/page.html?page=cases&case=tokyo-foodex-2026#fieldnotes`);
      await page.waitForSelector('html[data-i18n-ready]');
      assert.equal(await page.locator('html').getAttribute('lang'), 'de');
      for (const lang of ['en', 'zh-Hant', 'de']) {
        await page.locator('#language').selectOption(lang);
        await page.waitForURL(url => url.searchParams.get('lang') === lang);
        await page.waitForSelector(`html[lang="${lang}"][data-i18n-ready]`);
        assert.equal(new URL(page.url()).hash, '#fieldnotes');
        assert.equal(new URL(page.url()).searchParams.get('case'), 'tokyo-foodex-2026');
      }
      await page.goto(`${origin}/page.html?lang=invalid`);
      await page.waitForSelector('html[lang="zh-Hant"][data-i18n-ready]');
      await page.goto(`${origin}/live-prototype/?page=kip`);
      await page.waitForSelector('html[lang="de"][data-i18n-ready]');
      await page.locator('#language').selectOption('en');
      await page.waitForFunction(() => document.documentElement.lang === 'en');
      await page.frameLocator('#preview').locator('html[lang="en"][data-i18n-ready]').waitFor();
    } finally { await context.close(); }
  });
  await check('failed catalog offers localized retry and a fresh reload recovers', async () => {
    const { page, context } = await newPage();
    try {
      await page.route('**/locales/generated/de.js', route => route.abort());
      await page.goto(`${origin}/page.html?lang=de`);
      await page.locator('#locale-status[role="alert"]').waitFor();
      assert.equal(await page.locator('#locale-status button').textContent(), getMessages('de').startup.retry);
      assert.equal(await page.locator('#language').isVisible(), false);
      await page.unroute('**/locales/generated/de.js');
      await page.locator('#locale-status button').click();
      await page.waitForSelector('html[lang="de"][data-i18n-ready]');
    } finally { await context.close(); }
  });
  await check('production-style release paths load all three catalogs from the release directory', async () => {
    const release = 'synaiq-release-i18n-review', files = new Map();
    for (const entry of PUBLIC_FILES.filter(entry => !['index.html', 'preview.js'].includes(entry.file))) {
      const path = entry.root === 'brand' ? `brand/${entry.file}` : entry.file;
      const file = new URL(entry.root === 'brand' ? `../public/brand/${entry.file}` : `../docs/design/live-prototype/${entry.file}`, import.meta.url);
      files.set(`/${release}/${path}`, transformSource(await readFile(file), path, release));
    }
    files.set('/', files.get(`/${release}/page.html`));
    const server = createServer((req, res) => {
      const path = new URL(req.url, 'http://local.test').pathname, data = files.get(path);
      res.writeHead(data ? 200 : 404, { 'Content-Type': path === '/' || path.endsWith('.html') ? 'text/html' : path.endsWith('.js') ? 'text/javascript' : path.endsWith('.css') ? 'text/css' : path.endsWith('.svg') ? 'image/svg+xml' : 'application/octet-stream' });
      res.end(data ?? 'Not found');
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
      for (const { code } of SUPPORTED_LOCALES) {
        const { page, context } = await newPage();
        try {
          const errors = [];
          page.on('response', response => { if (response.status() >= 400) errors.push(response.url()); });
          await page.goto(`http://127.0.0.1:${server.address().port}/?page=kip&lang=${code}`);
          await page.waitForSelector(`html[lang="${code}"][data-i18n-ready]`);
          assert.deepEqual(errors, []);
        } finally { await context.close(); }
      }
    } finally { await new Promise(resolve => server.close(resolve)); }
  });
} finally {
  await browser.close(); await new Promise(resolve => source.close(resolve));
  const report = { results, failures, captures };
  await writeFile(new URL('report.json', output), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ output: output.href, passed: results.length, failed: failures.length }));
  if (failures.length) process.exitCode = 1;
}
