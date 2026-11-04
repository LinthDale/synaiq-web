import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
import { createPreviewServer } from './share-preview.mjs';

for (const [engine, executablePath] of [
  [webkit, process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE_PATH],
  [chromium, process.env.PLAYWRIGHT_EXECUTABLE_PATH],
]) test(`${engine.name()}: touch homepage stays readable through repeated scrolling without decoding the frame sequence`, {
  skip: !executablePath,
}, async () => {
  const server = createPreviewServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await engine.launch({ executablePath, headless: true });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
    try {
      await context.route('https://**/*', route => route.abort());
      const page = await context.newPage(), frames = [], errors = [];
      page.on('request', request => { if (/\/kip-d-scroll-v5\/frame-\d+\.webp/.test(request.url())) frames.push(request.url()); });
      page.on('pageerror', error => errors.push(error.message));
      page.on('crash', () => errors.push('Page crashed'));
      await page.goto(`http://127.0.0.1:${server.address().port}/page.html?page=home&lang=zh-Hant`);
      await page.locator('html[data-i18n-ready="true"]').waitFor();
      assert.deepEqual(frames, [], 'A touch device must not decode or preload the 243-frame background');
      for (const viewport of [{ width: 390, height: 844 }, { width: 1180, height: 820 }, { width: 390, height: 844 }]) {
        await page.setViewportSize(viewport);
        for (let pass = 0; pass < 2; pass++) {
          for (const selector of ['.home-opening', '#introduction', '[data-product-reveal]', '#proof', '.advantages', '#people', '.contact']) {
            const section = page.locator(selector).first();
            await section.scrollIntoViewIfNeeded();
            assert.equal(await section.isVisible(), true, selector);
            assert.ok((await section.innerText()).trim().length > 0, selector);
          }
          await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
          assert.equal(await page.locator('h1').isVisible(), true);
          assert.equal(await page.locator('.hero-thread-art img').isVisible(), true);
        }
      }
      assert.deepEqual(frames, []);
      assert.equal(await page.locator('body').evaluate(body => body.classList.contains('decision-scroll-ready')), false);
      assert.deepEqual(errors, []);
    } finally { await context.close(); }
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
});

test('desktop background resumes after resizing and releases animated surfaces at phone width', {
  skip: !process.env.PLAYWRIGHT_EXECUTABLE_PATH,
}, async () => {
  const server = createPreviewServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH, headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
    try {
      await context.route('https://**/*', route => route.abort());
      const page = await context.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`http://127.0.0.1:${server.address().port}/page.html?page=home&lang=zh-Hant`);
      await page.locator('body.decision-scroll-ready').waitFor();
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForFunction(() => !document.body.classList.contains('decision-scroll-ready'));
      assert.equal(await page.locator('.hero-thread-art img').isVisible(), true);
      assert.deepEqual(await page.locator('[data-decision-surface]').evaluateAll(nodes => nodes.map(node => node.style.getPropertyValue('--decision-frame'))), ['', '', '']);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.locator('body.decision-scroll-ready').waitFor();
      assert.deepEqual(errors, []);
    } finally { await context.close(); }
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
});
