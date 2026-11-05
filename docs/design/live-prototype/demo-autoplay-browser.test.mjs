import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { createPreviewServer } from './share-preview.mjs';

test('demo playlist advances in order and respects pause, visibility and manual navigation', {
  skip: !process.env.PLAYWRIGHT_EXECUTABLE_PATH,
}, async t => {
  const server = createPreviewServer();
  await new Promise(done => server.listen(0, '127.0.0.1', done));
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH });
  const tokens = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');
  const fast = ['question', 'move', 'click', 'thinking', 'answer', 'source', 'library'].map(state => `--demo-${state}-hold:80ms!important;`).join('');
  try {
    for (const width of [390, 1440]) await t.test(`playlist and controls at ${width}px`, async () => {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'no-preference' });
      try {
        await page.route('https://**/*', route => route.abort());
        await page.route('**/tokens.css*', route => route.fulfill({ contentType: 'text/css', body: `${tokens}\n[data-demo-animation]{${fast} --demo-next-hold:500ms!important; --demo-play-count:1!important;}` }));
        await page.goto(`http://127.0.0.1:${server.address().port}/live-prototype/page.html?page=kip&lang=zh-Hant`);
        const booth = page.locator('[data-demo-animation]');
        const click = selector => booth.locator(selector).evaluate(button => button.click());
        const complete = () => page.waitForFunction(() => document.querySelector('[data-demo-animation]').classList.contains('is-complete'));
        const scene = value => page.waitForFunction(value => document.querySelector('[data-demo-animation]').dataset.demoScene === value, value, { timeout: 8000 });
        await page.locator('[data-demo-screen]').scrollIntoViewIfNeeded();
        await click('[data-demo-replay]');
        for (const next of ['profit', 'knowledge', 'text-image', 'image-image', 'decision']) {
          await complete();
          const finished = await booth.evaluate(root => ({ scene: root.dataset.demoScene, state: root.dataset.state, turn: root.dataset.decisionTurn }));
          assert.equal(finished.state, ['decision', 'profit'].includes(finished.scene) ? 'answer' : 'library');
          if (['decision', 'profit'].includes(finished.scene)) assert.equal(finished.turn, '2', 'all three answers must finish before advancing');
          await scene(next);
          assert.equal(await booth.getAttribute('data-state'), 'question', 'next scene starts with the draft');
          assert.equal(await booth.locator('[data-demo-select][aria-pressed="true"]').getAttribute('data-demo-select'), next);
        }

        await click('[data-demo-select="knowledge"]');
        await complete();
        await click('[data-demo-pause]');
        await page.waitForTimeout(700);
        assert.equal(await booth.getAttribute('data-demo-scene'), 'knowledge', 'pause must freeze the gap before the next scene');
        await click('[data-demo-pause]');
        await scene('text-image');

        await complete();
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await page.waitForTimeout(700);
        assert.equal(await booth.getAttribute('data-demo-scene'), 'text-image', 'offscreen playback must not advance');
        await page.locator('[data-demo-screen]').scrollIntoViewIfNeeded();
        await scene('image-image');

        await complete();
        await click('[data-demo-replay]');
        assert.equal(await booth.getAttribute('data-demo-scene'), 'image-image');
        assert.equal(await booth.getAttribute('data-state'), 'question');
        await click('[data-demo-pause]');
        await page.waitForTimeout(700);
        assert.equal(await booth.getAttribute('data-demo-scene'), 'image-image', 'replay must cancel the completed scene transition');
        await click('[data-demo-select="knowledge"]');
        await click('[data-demo-pause]');
        await page.waitForTimeout(700);
        assert.equal(await booth.getAttribute('data-demo-scene'), 'knowledge', 'manual navigation must cancel any old advance');

        await page.emulateMedia({ reducedMotion: 'reduce' });
        await click('[data-demo-select="text-image"]');
        await page.waitForTimeout(1200);
        assert.equal(await booth.getAttribute('data-demo-scene'), 'text-image');
        assert.equal(await booth.locator('[data-demo-replay]').isDisabled(), true);
      } finally { await page.close(); }
    });
  } finally {
    await browser.close();
    await new Promise(done => server.close(done));
  }
});
