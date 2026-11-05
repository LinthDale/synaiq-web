import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
import { createPreviewServer } from './share-preview.mjs';
import { decisionVariantAt, DECISION_VARIANTS } from './decision-responsive.js';

test('cold scrolling paints stale first-pack results promptly and adopts the early download only once', {
  skip: !process.env.PLAYWRIGHT_EXECUTABLE_PATH,
}, async () => {
  const server = createPreviewServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH, headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
    await context.route('https://**/*', route => route.abort());
    await context.route('**/frames-*.json', async route => {
      await new Promise(resolve => setTimeout(resolve, 500)); await route.continue();
    });
    const page = await context.newPage(); let firstRequests = 0;
    page.on('request', request => { if (request.url().endsWith('/kip-d-scroll-portrait-phone-bundles-v1/frames-000.json')) firstRequests++; });
    const firstResponse = page.waitForResponse(response => response.url().endsWith('/kip-d-scroll-portrait-phone-bundles-v1/frames-000.json'));
    await page.goto(`http://127.0.0.1:${server.address().port}/page.html?page=home&lang=zh-Hant`, { waitUntil: 'domcontentloaded' });
    await page.locator('h1').waitFor();
    await page.waitForFunction(() => document.body.dataset.decisionTarget === '0');
    await page.evaluate(() => {
      const end = document.querySelector('#proof').getBoundingClientRect().bottom + scrollY - innerHeight;
      scrollTo({ top: end * 0.35, behavior: 'instant' });
    });
    await page.waitForFunction(() => Number(document.body.dataset.decisionTarget) > 32);
    await (await firstResponse).finished();
    await page.locator('body.decision-scroll-ready').waitFor({ timeout: 300 });
    assert.equal(firstRequests, 1, 'Early preload must not duplicate the first bundle');
    assert.equal(await page.locator('body').getAttribute('data-decision-variant'), 'portrait-phone');
    await context.close();
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
});

for (const [engine, executablePath] of [
  [webkit, process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE_PATH],
  [chromium, process.env.PLAYWRIGHT_EXECUTABLE_PATH],
]) test(`${engine.name()}: RWD switches portrait/landscape and small/large independently through repeated scrolling`, {
  skip: !executablePath,
}, async () => {
  const server = createPreviewServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await engine.launch({ executablePath, headless: true });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
    try {
      await context.addInitScript(() => {
        const decode = HTMLImageElement.prototype.decode; let active = 0; window.sequenceDecodePeak = 0;
        HTMLImageElement.prototype.decode = function (...args) {
          if (!this.src.startsWith('data:image/webp;base64,') && !this.src.includes('/kip-d-scroll-v5/')) return decode.apply(this, args);
          active++; window.sequenceDecodePeak = Math.max(window.sequenceDecodePeak, active);
          return decode.apply(this, args).finally(() => { active--; });
        };
      });
      await context.route('https://**/*', route => route.abort());
      const page = await context.newPage(), requests = [], errors = [], displayed = new Set();
      page.on('request', request => { if (/\/kip-d-(?:scroll|opening)-/.test(request.url())) requests.push(request.url()); });
      page.on('pageerror', error => errors.push(error.message));
      page.on('crash', () => errors.push('Page crashed'));
      await page.goto(`http://127.0.0.1:${server.address().port}/page.html?page=home&lang=zh-Hant`);
      await page.locator('html[data-i18n-ready="true"]').waitFor();
      await page.locator('body.decision-scroll-ready[data-decision-variant="portrait-phone"]').waitFor();
      await page.waitForTimeout(500);
      assert.ok(requests.length > 0);
      assert.ok(requests.every(url => url.includes('/kip-d-scroll-portrait-phone-')), 'Phone portrait must not download landscape or large portrait frames');
      for (const [width, height] of [[390,844], [844,390], [479,900], [480,900], [768,1024], [1024,1366], [899,1200], [900,1200], [1180,820], [390,844]]) {
        await page.setViewportSize({ width, height });
        const key = decisionVariantAt(width, height), variant = DECISION_VARIANTS[key];
        await page.locator(`body.decision-scroll-ready[data-decision-variant="${key}"]`).waitFor();
        assert.ok((await page.locator('.hero-thread-art img').evaluate(img => img.currentSrc)).endsWith(variant.poster));
        for (const selector of ['.home-opening', '[data-product-reveal]', '#proof', '.home-opening']) {
          const section = page.locator(selector).first();
          await section.scrollIntoViewIfNeeded();
          const expected = variant.bundles ? 'data:image/webp;base64,' : '/kip-d-scroll-v5/';
          await page.waitForFunction(({ selector, expected }) => getComputedStyle(document.querySelector(selector)).backgroundImage.includes(expected), { selector, expected });
          await page.waitForFunction(() => document.body.dataset.decisionFrame === document.body.dataset.decisionTarget);
          displayed.add(await page.locator('body').getAttribute('data-decision-frame'));
          assert.ok(Number(await page.locator('body').getAttribute('data-decision-cached')) <= (key === 'portrait-large' ? 3 : 6));
          assert.ok((await section.innerText()).trim().length > 0);
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        }
      }
      assert.ok(displayed.size > 2, 'Animation must retain multiple frames');
      assert.ok(await page.evaluate(() => window.sequenceDecodePeak <= 2), 'Touch decoding concurrency exceeded two');
      for (const variant of Object.values(DECISION_VARIANTS).filter(value => value.bundles)) {
        const names = [...variant.bundles, variant.poster];
        assert.ok(new Set(requests.filter(url => names.some(name => url.endsWith(name)))).size <= 9);
      }
      assert.deepEqual(errors, []);
    } finally { await context.close(); }
  } finally {
    await browser?.close(); await new Promise(resolve => server.close(resolve));
  }
});

test('RWD switches resolution and cache policy between desktop and phone widths while retaining animation', {
  skip: !process.env.PLAYWRIGHT_EXECUTABLE_PATH,
}, async () => {
  const server = createPreviewServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH, headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
    try {
      await context.addInitScript(() => {
        const original = HTMLImageElement.prototype.decode;
        window.desktopDecodeCalls = 0;
        HTMLImageElement.prototype.decode = function (...args) {
          if (this.src.includes('/kip-d-scroll-v5/')) window.desktopDecodeCalls++;
          return original.apply(this, args);
        };
      });
      await context.route('https://**/*', route => route.abort());
      const page = await context.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`http://127.0.0.1:${server.address().port}/page.html?page=home&lang=zh-Hant`);
      await page.locator('body.decision-scroll-ready').waitFor();
      assert.equal(await page.locator('body').getAttribute('data-decision-profile'), 'desktop');
      // Exercise a shifting look-ahead window in both directions. Evicting by
      // distance alone used to re-decode the same frame thousands of times.
      await page.evaluate(async () => {
        const bottom = document.querySelector('#proof').getBoundingClientRect().bottom + scrollY - innerHeight;
        for (const reverse of [false, true]) await new Promise(resolve => {
          let start;
          const tick = now => {
            start ??= now;
            const fraction = Math.min(1, (now - start) / 1000);
            scrollTo({ top: bottom * (reverse ? 1 - fraction : fraction), behavior: 'instant' });
            if (fraction === 1) resolve(); else requestAnimationFrame(tick);
          }; requestAnimationFrame(tick);
        });
      });
      await page.waitForTimeout(400);
      assert.ok(await page.evaluate(() => window.desktopDecodeCalls < 1000), 'Repeated decoding of evicted look-ahead frames');
      await page.setViewportSize({ width: 390, height: 844 });
      await page.locator('body.decision-scroll-ready[data-decision-profile="mobile"][data-decision-variant="portrait-phone"]').waitFor();
      assert.ok((await page.locator('.home-opening').evaluate(el => getComputedStyle(el).backgroundImage)).includes('data:image/webp;base64,'));
      assert.ok(Number(await page.locator('body').getAttribute('data-decision-cached')) <= 6);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.locator('body.decision-scroll-ready[data-decision-profile="desktop"]').waitFor();
      assert.ok((await page.locator('.home-opening').evaluate(el => getComputedStyle(el).backgroundImage)).includes('/kip-d-scroll-v5/'));
      assert.deepEqual(errors, []);
    } finally { await context.close(); }
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
});
