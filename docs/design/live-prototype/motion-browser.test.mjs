import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { createPreviewServer } from './share-preview.mjs';

// 使用獨立 loopback 伺服器及 headless 瀏覽器，不操作登入中的分頁。
test('motion settings control real reveal, repeat, pause and final-frame behavior', {
  skip: !process.env.PLAYWRIGHT_EXECUTABLE_PATH,
}, async t => {
  const server = createPreviewServer();
  await new Promise(done => server.listen(0, '127.0.0.1', done));
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH, headless: true });
    const origin = `http://127.0.0.1:${server.address().port}`;
    const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');
    async function open(overrides = '', viewport = { width: 1440, height: 900 }, locale = 'zh-Hant', init) {
      const context = await browser.newContext({ viewport, reducedMotion: 'no-preference' });
      await context.route('https://**/*', route => route.abort());
      await context.route('**/tokens.css*', route => route.fulfill({ contentType: 'text/css', body: `${css}\n:root {${overrides}}` }));
      if (init) await context.addInitScript(init);
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${origin}/live-prototype/page.html?page=home&lang=${locale}`);
      await page.locator('[data-product-reveal]').waitFor({ state: 'attached' });
      await page.evaluate(() => {
        const root = document.querySelector('[data-product-reveal]');
        window.revealRuns = 0;
        let visible = root.classList.contains('is-visible');
        new MutationObserver(() => {
          const next = root.classList.contains('is-visible');
          if (next && !visible) window.revealRuns++;
          visible = next;
        }).observe(root, { attributes: true, attributeFilter: ['class'] });
      });
      return { page, close: async () => { await context.close(); assert.deepEqual(errors, []); } };
    }
    const settle = page => page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
    const visible = page => page.locator('[data-product-reveal]').evaluate(el => el.classList.contains('is-visible'));
    async function enter(page) {
      await page.locator('[data-product-reveal]').evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
      await page.waitForFunction(() => document.querySelector('[data-product-reveal]').classList.contains('is-visible'));
      await settle(page);
    }
    async function leave(page) {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await settle(page);
    }

    for (const locale of ['zh-Hant', 'en']) for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1440, height: 900 }]) {
      for (const count of [1, 2, 0]) await t.test(`product ${locale} ${viewport.width}x${viewport.height} count=${count}`, async () => {
        const { page, close } = await open(`--product-reveal-count:${count}; --product-reveal-threshold:0.5;`, viewport, locale);
        try {
          assert.equal(await visible(page), false);
          for (let index = 1; index <= 3; index++) {
            await enter(page);
            assert.equal(await page.evaluate(() => window.revealRuns), count === 0 ? index : Math.min(index, count));
            await leave(page);
            assert.equal(await visible(page), count > 0 && index >= count);
          }
          await page.emulateMedia({ reducedMotion: 'reduce' });
          await page.waitForFunction(() => !document.querySelector('[data-product-reveal]').classList.contains('reveal-motion'));
          assert.equal(await visible(page), true);
        } finally { await close(); }
      });
    }

    await t.test('resizing does not consume another product appearance; new CSS timings reach each layer', async () => {
      const { page, close } = await open('--product-reveal-count:2; --product-screen-duration:2s; --product-paper-duration:3s; --product-wally-duration:4s;');
      try {
        await enter(page);
        for (const [selector, expected] of [['.main-screen', '2s'], ['.source-paper', '3s'], ['.stage-devices', '4s']]) {
          const actual = await page.locator(`[data-product-reveal] ${selector}`).evaluate(el => {
            const style = getComputedStyle(el);
            return style.transitionDuration.split(',').map(x => x.trim())[style.transitionProperty.split(',').map(x => x.trim()).indexOf('transform')];
          });
          assert.equal(actual, expected);
        }
        await page.setViewportSize({ width: 1000, height: 700 });
        await settle(page);
        assert.equal(await page.evaluate(() => window.revealRuns), 1);
      } finally { await close(); }
    });

    const fastDemo = ['question', 'click', 'answer', 'source', 'library'].map(state => `--demo-${state}-hold:80ms;`).join('');
    await t.test('finite demo completes fully, handles reduced motion, and can replay', async () => {
      const { page, close } = await open(`${fastDemo} --demo-play-count:1; --demo-library-duration:0.6s;`);
      try {
        const demo = page.locator('[data-demo-animation]');
        await demo.scrollIntoViewIfNeeded();
        await page.waitForFunction(() => document.querySelector('[data-demo-animation]').classList.contains('is-complete'));
        assert.equal(await demo.getAttribute('data-state'), 'library');
        assert.equal(await page.locator('.film-library').evaluate(el => getComputedStyle(el).opacity), '1');
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.waitForFunction(() => document.querySelector('[data-demo-animation]').dataset.state === 'source');
        assert.equal(await page.locator('[data-demo-replay]').isDisabled(), true);
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.waitForFunction(() => document.querySelector('[data-demo-animation]').dataset.state === 'library');
        await page.locator('[data-demo-replay]').click();
        assert.equal(await demo.evaluate(el => el.classList.contains('is-complete')), false);
        await page.waitForFunction(() => document.querySelector('[data-demo-animation]').classList.contains('is-complete'));
      } finally { await close(); }
    });

    await t.test('demo obeys configured visibility threshold, not just any intersection', async () => {
      const { page, close } = await open('--demo-view-threshold:0.5; --demo-play-count:0;', undefined, undefined, () => {
        const Native = window.IntersectionObserver;
        window.IntersectionObserver = class extends Native {
          constructor(callback, options) { super(callback, options); this.callback = callback; }
          observe(target) {
            if (target.matches('[data-demo-animation]')) window.triggerDemo = ratio => this.callback([{ isIntersecting: ratio > 0, intersectionRatio: ratio }]);
            else super.observe(target);
          }
        };
      });
      try {
        for (const [ratio, paused] of [[0.1, true], [0.6, false], [0.1, true]]) {
          await page.evaluate(value => window.triggerDemo(value), ratio);
          assert.equal(await page.locator('[data-demo-animation]').evaluate(el => el.classList.contains('is-paused')), paused);
        }
      } finally { await close(); }
    });

    await t.test('invalid playback settings show static content instead of hiding products', async () => {
      const { page, close } = await open('--product-reveal-count:-1; --demo-question-hold:bad;');
      try {
        assert.equal(await visible(page), true);
        assert.equal(await page.locator('[data-product-reveal]').evaluate(el => el.classList.contains('reveal-motion')), false);
        assert.equal(await page.locator('[data-demo-animation]').getAttribute('data-state'), 'source');
        assert.equal(await page.locator('[data-demo-replay]').isDisabled(), true);
      } finally { await close(); }
    });

    for (const count of [0, 2]) await t.test(`demo real clock count=${count}`, async () => {
      const { page, close } = await open(`${fastDemo} --demo-play-count:${count};`);
      try {
        await page.evaluate(() => {
          const root = document.querySelector('[data-demo-animation]');
          window.demoQuestions = 1;
          let state = root.dataset.state;
          new MutationObserver(() => {
            if (root.dataset.state === 'question' && state !== 'question') window.demoQuestions++;
            state = root.dataset.state;
          }).observe(root, { attributes: true, attributeFilter: ['data-state'] });
        });
        await page.locator('[data-demo-animation]').scrollIntoViewIfNeeded();
        if (count === 2) {
          await page.waitForFunction(() => document.querySelector('[data-demo-animation]').classList.contains('is-complete'));
          assert.equal(await page.evaluate(() => window.demoQuestions), 2);
          assert.equal(await page.locator('.film-library').evaluate(el => getComputedStyle(el).opacity), '1');
        } else {
          await page.waitForFunction(() => window.demoQuestions >= 3);
          assert.equal(await page.locator('[data-demo-animation]').evaluate(el => el.classList.contains('is-complete')), false);
          await leave(page);
          await page.waitForFunction(() => document.querySelector('[data-demo-animation]').classList.contains('is-paused'));
        }
      } finally { await close(); }
    });
  } finally {
    await browser?.close();
    await new Promise(done => server.close(done));
  }
});
