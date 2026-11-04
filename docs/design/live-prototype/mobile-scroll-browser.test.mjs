import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
import { createPreviewServer } from './share-preview.mjs';

for (const [engine, executablePath] of [
  [webkit, process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE_PATH],
  [chromium, process.env.PLAYWRIGHT_EXECUTABLE_PATH],
]) test(`${engine.name()}: touch homepage animates with mobile frames and bounded decoding through repeated scrolling`, {
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
        const original = HTMLImageElement.prototype.decode;
        let active = 0; window.mobileDecodePeak = 0;
        HTMLImageElement.prototype.decode = function (...args) {
          if (!this.src.includes('/kip-d-scroll-mobile-v1/') && !this.src.startsWith('data:image/webp;base64,')) return original.apply(this, args);
          active++; window.mobileDecodePeak = Math.max(window.mobileDecodePeak, active);
          return original.apply(this, args).finally(() => { active--; });
        };
      });
      await context.route('https://**/*', route => route.abort());
      const page = await context.newPage(), desktopFrames = [], mobileFrames = new Set(), errors = [], displayed = new Set();
      page.on('request', request => {
        if (/\/kip-d-scroll-v5\/frame-\d+\.webp/.test(request.url())) desktopFrames.push(request.url());
        if (/\/kip-d-scroll-mobile(?:-bundles)?-v1\//.test(request.url())) mobileFrames.add(request.url());
      });
      page.on('pageerror', error => errors.push(error.message));
      page.on('crash', () => errors.push('Page crashed'));
      await page.goto(`http://127.0.0.1:${server.address().port}/page.html?page=home&lang=zh-Hant`);
      await page.locator('html[data-i18n-ready="true"]').waitFor();
      await page.locator('body.decision-scroll-ready[data-decision-profile="mobile"]').waitFor();
      await page.waitForTimeout(1500);
      assert.deepEqual(desktopFrames, [], 'Touch devices must use the lower-resolution sequence');
      assert.ok(mobileFrames.size > 0 && mobileFrames.size <= 3, 'Idle touch homepage prepares at most two nearby compressed bundles and its poster');
      assert.ok((await page.locator('.hero-thread-art img').evaluate(img => img.currentSrc)).includes('/kip-d-scroll-mobile-v1/'));
      for (const viewport of [{ width: 390, height: 844 }, { width: 1180, height: 820 }, { width: 390, height: 844 }]) {
        await page.setViewportSize(viewport);
        for (let pass = 0; pass < 2; pass++) {
          for (const selector of ['.home-opening', '#introduction', '[data-product-reveal]', '#proof', '.advantages', '#people', '.contact']) {
            const section = page.locator(selector).first();
            await section.scrollIntoViewIfNeeded();
            // scrollIntoView can resolve before the scroll event's animation frame.
            // Observe the painted surface too; the preceding target may still match.
            if (await section.getAttribute('data-decision-surface') !== null) await page.waitForFunction(selector =>
              getComputedStyle(document.querySelector(selector)).backgroundImage.includes('data:image/webp;base64,'), selector, { timeout: 10000 });
            assert.equal(await section.isVisible(), true, selector);
            assert.ok((await section.innerText()).trim().length > 0, selector);
            await page.waitForFunction(() => document.body.dataset.decisionFrame === document.body.dataset.decisionTarget);
            displayed.add(await page.locator('body').getAttribute('data-decision-frame'));
            assert.ok(Number(await page.locator('body').getAttribute('data-decision-cached')) <= 6);
            if (await section.getAttribute('data-decision-surface') !== null) assert.ok((await section.evaluate(el => getComputedStyle(el).backgroundImage)).includes('data:image/webp;base64,'), `${selector}: missing mobile background`);
          }
          await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
          assert.equal(await page.locator('h1').isVisible(), true);
          await page.waitForFunction(() => document.body.dataset.decisionFrame === document.body.dataset.decisionTarget);
        }
      }
      assert.deepEqual(desktopFrames, []);
      assert.ok(displayed.size > 2, 'Scrolling must retain the animation rather than a static replacement');
      assert.ok(mobileFrames.size <= 9, '243 mobile frames must use at most eight bundle requests and one poster');
      assert.ok(await page.evaluate(() => window.mobileDecodePeak <= 2));
      assert.equal(await page.locator('body').getAttribute('data-decision-profile'), 'mobile');
      assert.deepEqual(errors, []);
    } finally { await context.close(); }
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
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
      await page.locator('body.decision-scroll-ready[data-decision-profile="mobile"]').waitFor();
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
