import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { createPreviewServer } from './share-preview.mjs';

test('cinema booth starts a newly selected film without replay or inherited pause', {
  skip: !process.env.PLAYWRIGHT_EXECUTABLE_PATH,
}, async t => {
  const server = createPreviewServer();
  await new Promise(done => server.listen(0, '127.0.0.1', done));
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH, headless: true });
    const origin = `http://127.0.0.1:${server.address().port}`;
    const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');
    const fast = ['question', 'move', 'click', 'thinking', 'answer', 'source', 'library'].map(state => `--demo-${state}-hold:120ms!important;`).join('');
    for (const name of ['home', 'kip']) for (const locale of ['zh-Hant', 'en']) for (const width of [320, 390, 768, 1440]) {
      await t.test(`${name}/${locale}/${width}`, async () => {
        const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'no-preference' });
        try {
          // These are behavior checks; visual review separately loads the actual fonts.
          await context.route('https://**/*', route => route.abort());
          await context.route('**/tokens.css*', route => route.fulfill({ contentType: 'text/css', body: `${css}\n[data-demo-animation] {${fast} --demo-play-count:1;}` }));
          const page = await context.newPage();
          const errors = [], requests = [];
          page.on('pageerror', error => errors.push(error.message));
          page.on('request', request => { if (request.method() !== 'GET') requests.push(request.url()); });
          await page.goto(`${origin}/live-prototype/page.html?page=${name}&lang=${locale}`);
          const booth = page.locator('[data-demo-animation]');
          await booth.scrollIntoViewIfNeeded();
          for (const scene of ['profit', 'decision', 'knowledge', 'text-image', 'image-image']) {
            await page.locator(`[data-demo-select="${scene}"]`).click();
            // The controls can fill a narrow screen; playback intentionally waits
            // until the film itself crosses the configured visibility threshold.
            await page.locator('[data-demo-screen]').scrollIntoViewIfNeeded();
            await page.waitForFunction(() => document.querySelector('[data-demo-animation]').classList.contains('is-complete'));
            assert.equal(await booth.getAttribute('data-demo-scene'), scene);
            assert.equal(await booth.getAttribute('data-state'), ['decision', 'profit'].includes(scene) ? 'answer' : 'library');
            assert.equal(await page.locator('.demo-film').count(), 1);
            assert.equal(await page.locator('[data-demo-select][aria-pressed="true"]').count(), 1);
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
            if (['text-image', 'image-image'].includes(scene)) {
              await page.waitForFunction(() => [...document.querySelectorAll('.image-search-film img')].every(img => img.complete && img.naturalWidth > 0));
              const geometry = await booth.evaluate(root => {
                const film = root.querySelector('.demo-film').getBoundingClientRect();
                const preview = root.querySelector('.image-search-preview').getBoundingClientRect();
                const button = root.querySelector('.image-preview-open').getBoundingClientRect();
                const cursor = root.querySelector('.film-cursor').getBoundingClientRect();
                return { film: { left: film.left, right: film.right, bottom: film.bottom }, preview: { left: preview.left, right: preview.right }, buttonBottom: button.bottom, cursorX: cursor.x, cursorRight: cursor.right };
              });
              assert.ok(geometry.preview.left >= geometry.film.left - 1);
              assert.ok(geometry.preview.right <= geometry.film.right + 1);
              assert.ok(geometry.buttonBottom <= geometry.film.bottom + 1, 'asset details clipped');
              assert.ok(geometry.cursorX >= geometry.film.left && geometry.cursorRight <= geometry.film.right, 'cursor outside image film');
              if (locale === 'en') assert.doesNotMatch(await booth.innerText(), /\p{Script=Han}/u);
            }
          }
          await page.locator('[data-demo-next]').click();
          assert.equal(await booth.getAttribute('data-demo-scene'), 'decision');
          await page.locator('[data-demo-prev]').click();
          assert.equal(await booth.getAttribute('data-demo-scene'), 'image-image');
          await page.locator('[data-demo-select="image-image"]').focus();
          await page.keyboard.press('ArrowLeft');
          assert.equal(await booth.getAttribute('data-demo-scene'), 'text-image');
          assert.equal(await page.evaluate(() => document.activeElement.dataset.demoSelect), 'text-image');
          await page.locator('[data-demo-pause]').click();
          await page.locator('[data-demo-next]').click();
          await page.locator('[data-demo-screen]').scrollIntoViewIfNeeded();
          await page.waitForFunction(() => !document.querySelector('[data-demo-animation]').classList.contains('is-paused'));
          await booth.evaluate(root => { root.style.setProperty('--demo-step-size', '25px'); root.style.setProperty('--demo-step-number-size', '31px'); });
          assert.equal(await page.locator('.demo-chapters').evaluate(el => getComputedStyle(el).fontSize), '25px');
          assert.equal(await page.locator('.demo-chapters button > span').first().evaluate(el => getComputedStyle(el).fontSize), '31px');
          await page.emulateMedia({ reducedMotion: 'reduce' });
          await page.locator('[data-demo-prev]').click();
          assert.equal(await booth.getAttribute('data-state'), 'source');
          assert.equal(await page.locator('[data-demo-replay]').isDisabled(), true);
          assert.equal(await page.locator('.image-results').isVisible(), true);
          assert.equal(await page.locator('.film-cursor').isVisible(), false);
          assert.deepEqual(errors, []);
          assert.deepEqual(requests, []);
        } finally { await context.close(); }
      });
    }
    await t.test('conversation chapters autoplay from the selected turn after pause or completion', async () => {
      const context = await browser.newContext({ viewport: { width: 1003, height: 884 }, reducedMotion: 'no-preference' });
      try {
        await context.route('https://**/*', route => route.abort());
        await context.route('**/tokens.css*', route => route.fulfill({ contentType: 'text/css', body: `${css}\n[data-demo-animation] {${fast} --demo-question-hold:800ms!important; --demo-play-count:1;}` }));
        const page = await context.newPage();
        await page.goto(`${origin}/live-prototype/page.html?page=home&lang=zh-Hant`);
        const booth = page.locator('[data-demo-animation]');
        for (const scene of ['decision', 'profit']) {
          await page.locator(`[data-demo-select="${scene}"]`).click();
          await page.locator('[data-demo-replay]').click();
          await page.locator('[data-demo-pause]').click();
          for (const [chapter, turn] of [['source', 1], ['library', 2], ['question', 0]]) {
            await page.locator(`[data-demo-chapter="${chapter}"]`).click();
            assert.equal(await booth.getAttribute('data-decision-turn'), String(turn));
            assert.equal(await booth.getAttribute('data-state'), 'question');
            assert.equal(await page.locator(`[data-demo-animation].is-paused`).count(), 0);
            await page.waitForFunction(turn => {
              const root = document.querySelector('[data-demo-animation]');
              return root.dataset.decisionTurn === String(turn) && root.dataset.state === 'answer';
            }, turn);
            await page.waitForFunction(() => document.querySelector('[data-demo-animation]').classList.contains('is-complete'));
          }
          await page.emulateMedia({ reducedMotion: 'reduce' });
          await page.locator('[data-demo-chapter="source"]').click();
          assert.equal(await booth.getAttribute('data-decision-turn'), '1');
          assert.equal(await booth.getAttribute('data-state'), 'answer');
          assert.equal(await page.locator('[data-demo-pause]').isDisabled(), true);
          await page.emulateMedia({ reducedMotion: 'no-preference' });
        }
      } finally { await context.close(); }
    });
    await t.test('image selection precedes original-asset panel and pause resumes the same chat', async () => {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      try {
        await context.route('https://**/*', route => route.abort());
        await context.route('**/tokens.css*', route => route.fulfill({ contentType:'text/css', body:`${css}\n[data-demo-animation] {${fast} --demo-source-hold:1.5s!important; --demo-play-count:1;}` }));
        const page = await context.newPage();
        await page.goto(`${origin}/live-prototype/page.html?page=home&lang=zh-Hant`);
        const booth = page.locator('[data-demo-animation]');
        await booth.scrollIntoViewIfNeeded();
        for (const scene of ['text-image','image-image']) {
          await page.locator(`[data-demo-select="${scene}"]`).click();
          await page.locator('[data-demo-replay]').click();
          await page.waitForFunction(() => document.querySelector('[data-demo-animation]').dataset.state === 'source');
          await page.locator('[data-demo-pause]').click();
          const geometry = await booth.evaluate(root => ({
            filmRight:root.querySelector('.demo-film').getBoundingClientRect().right,
            panelLeft:root.querySelector('.image-search-preview').getBoundingClientRect().left,
            captionRight:root.querySelector('.image-result figcaption').getBoundingClientRect().right,
          }));
          assert.ok(geometry.panelLeft >= geometry.filmRight - 1, 'original asset must not cover the selected image yet');
          assert.ok(geometry.captionRight < geometry.panelLeft);
          await page.waitForTimeout(200);
          assert.equal(await booth.getAttribute('data-state'), 'source', 'pause must freeze the current phase');
          await page.locator('[data-demo-pause]').click();
          await page.waitForFunction(() => document.querySelector('[data-demo-animation]').classList.contains('is-complete'));
          assert.equal(await booth.getAttribute('data-state'), 'library');
          assert.equal(await page.locator('.film-input').count(), 1);
        }
      } finally { await context.close(); }
    });
  } finally {
    await browser?.close();
    await new Promise(done => server.close(done));
  }
});
