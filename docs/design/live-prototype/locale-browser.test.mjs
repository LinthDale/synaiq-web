import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
import { createPreviewServer } from './share-preview.mjs';
import { SUPPORTED_LOCALES } from './locale-store.js';

// Set PLAYWRIGHT_WEBKIT_EXECUTABLE_PATH to run WebKit as well as Chrome.
// For legacy WebKit (e.g. affected 26.0), use its matching Playwright runtime too.
for (const [engine, executablePath] of [
  [webkit, process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE_PATH],
  [chromium, process.env.PLAYWRIGHT_EXECUTABLE_PATH],
]) test(`${engine.name()}: mobile pages finish loading with a delayed language catalog`, {
  skip: !executablePath,
}, async () => {
  const server = createPreviewServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await engine.launch({ executablePath, headless: true });
    const origin = `http://127.0.0.1:${server.address().port}`;
    for (const { code } of SUPPORTED_LOCALES) {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
        locale: code, reducedMotion: 'reduce',
      });
      try {
        // Fonts are independent of startup. Delay the real catalog so the two module
        // graphs overlap: this reproduces WebKit 242740 with the former HTML entry.
        await context.route('https://**/*', route => route.abort());
        await context.route(`**/locales/generated/${code}.js`, async route => {
          await new Promise(resolve => setTimeout(resolve, 400));
          await route.continue();
        });
        const page = await context.newPage(), errors = [];
        page.on('pageerror', error => errors.push(error.message));
        for (const name of ['home', 'kip', 'ems', 'pvsim', 'cases', 'about']) {
          await page.goto(`${origin}/page.html?page=${name}&lang=${code}`, { waitUntil: 'domcontentloaded' });
          await page.locator('html[data-i18n-ready="true"]').waitFor({ timeout: 5000 });
          assert.equal(await page.locator('#locale-status').count(), 0);
          assert.equal(await page.locator('h1').count(), 1);
          assert.equal(await page.locator('h1').isVisible(), true);
          assert.equal(await page.locator('body').getAttribute('data-page'), name);
          assert.equal(await page.locator('html').getAttribute('lang'), code);
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        }
        const next = SUPPORTED_LOCALES.find(locale => locale.code !== code).code;
        await page.locator('#language').selectOption(next);
        await page.locator(`html[lang="${next}"][data-i18n-ready="true"]`).waitFor({ timeout: 5000 });
        assert.equal(await page.locator('body').getAttribute('data-page'), 'about');
        assert.deepEqual(errors, []);
      } finally { await context.close(); }
    }
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
});
