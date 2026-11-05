import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createPreviewServer } from './share-preview.mjs';

test('every demo keeps the draft until the pointer has arrived and completed Send', {
  skip: !process.env.PLAYWRIGHT_EXECUTABLE_PATH,
}, async t => {
  const server = createPreviewServer();
  await new Promise(done => server.listen(0, '127.0.0.1', done));
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH });
  try {
    for (const [width, locale, name] of [[390, 'zh-Hant', 'home'], [1440, 'zh-Hant', 'kip'], [390, 'en', 'kip'], [1440, 'de', 'home']]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'no-preference' });
      await page.route('https://**/*', route => route.abort());
      await page.goto(`http://127.0.0.1:${server.address().port}/live-prototype/page.html?page=${name}&lang=${locale}`);
      const booth = page.locator('[data-demo-animation]');
      await booth.scrollIntoViewIfNeeded();
      await page.addStyleTag({ content: `[data-demo-animation] {
        --demo-question-hold:400ms!important; --demo-move-hold:350ms!important;
        --demo-click-hold:200ms!important; --demo-thinking-hold:300ms!important;
        --demo-answer-hold:400ms!important; --demo-source-hold:200ms!important;
        --demo-library-hold:200ms!important; --demo-typing-duration:200ms!important;
        --demo-pointer-duration:350ms!important; --demo-pointer-click-duration:100ms!important;
      }` });
      for (const scene of ['knowledge', 'text-image', 'image-image', 'decision', 'profit']) {
        await t.test(`${scene}/${locale}/${width}`, async () => {
          const samples = await booth.evaluate(async (root, scene) => {
            root.querySelector(`[data-demo-select="${scene}"]`).click();
            root.querySelector('[data-demo-replay]').click();
            const visible = el => {
              if (!el || !el.getClientRects().length) return false;
              const style = getComputedStyle(el);
              return style.visibility !== 'hidden' && Number(style.opacity) > 0.01;
            };
            const samples = [];
            await new Promise((resolve, reject) => {
              const deadline = performance.now() + 15000;
              function sample() {
                const turn = root.querySelector(`[data-decision-turn="${root.dataset.decisionTurn}"]`) || root;
                const send = root.querySelector('.film-send').getBoundingClientRect();
                const cursor = root.querySelector('.film-cursor').getBoundingClientRect();
                samples.push({ state: root.dataset.state, turn: root.dataset.decisionTurn || '0',
                  draft: visible(root.querySelector('.film-input-draft')),
                  question: visible(turn.querySelector('.film-question')),
                  thinking: visible(turn.querySelector('.film-thinking')),
                  answer: visible(turn.querySelector('.film-answer')),
                  onSend: cursor.x >= send.left && cursor.x <= send.right && cursor.y >= send.top && cursor.y <= send.bottom,
                });
                if (root.classList.contains('is-complete')) resolve();
                else if (performance.now() > deadline) reject(new Error('demo did not finish'));
                else requestAnimationFrame(sample);
              }
              requestAnimationFrame(sample);
            });
            return samples;
          }, scene);
          const turns = ['decision', 'profit'].includes(scene) ? ['0', '1', '2'] : ['0'];
          for (const turn of turns) {
            const frames = samples.filter(frame => frame.turn === turn);
            for (const state of ['question', 'move', 'click', 'thinking', 'answer']) {
              const phase = frames.filter(frame => frame.state === state);
              assert.ok(phase.length, `turn ${turn}: missing ${state}`);
              if (['question', 'move', 'click'].includes(state)) {
                assert.ok(phase.every(frame => frame.draft && !frame.question && !frame.thinking && !frame.answer),
                  `turn ${turn}/${state}: message or response appeared before Send completed`);
              }
              if (state === 'click') assert.ok(phase.every(frame => frame.onSend), 'click must happen on Send');
              if (state === 'thinking') assert.ok(phase.every(frame => !frame.draft && frame.question && frame.thinking && !frame.answer));
              if (state === 'answer') assert.ok(phase.some(frame => frame.answer && !frame.thinking && frame.question));
            }
          }
        });
      }
      await page.close();
    }
    await t.test('pause freezes draft and pointer; replay and chapter selection restart the draft', async () => {
      const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });
      await page.route('https://**/*', route => route.abort());
      await page.goto(`http://127.0.0.1:${server.address().port}/live-prototype/page.html?page=home&lang=zh-Hant`);
      const booth = page.locator('[data-demo-animation]');
      await booth.scrollIntoViewIfNeeded();
      for (const scene of ['knowledge', 'text-image', 'image-image', 'decision', 'profit']) {
        await booth.evaluate((root, scene) => {
          root.querySelector(`[data-demo-select="${scene}"]`).click();
          root.querySelector('[data-demo-replay]').click();
        }, scene);
        await page.waitForTimeout(150);
        await booth.locator('[data-demo-pause]').evaluate(button => button.click());
        await page.waitForTimeout(60);
        const animationTimes = () => booth.evaluate(root => root.querySelector('.film-input-draft').getAnimations({ subtree: true }).map(a => a.currentTime));
        const before = await animationTimes();
        assert.ok(before.length, `${scene}: draft animation must not be cancelled by pause`);
        await page.waitForTimeout(250);
        assert.deepEqual(await animationTimes(), before, `${scene}: paused draft moved`);
        assert.equal(await booth.getAttribute('data-state'), 'question');
        await booth.locator('[data-demo-replay]').evaluate(button => button.click());
        await page.waitForTimeout(60);
        const replayTimes = await animationTimes();
        assert.ok(replayTimes[0] < before[0], `${scene}: replay must restart typing from the beginning`);
        await page.waitForFunction(() => document.querySelector('[data-demo-animation]').dataset.state === 'move');
        await page.waitForTimeout(180);
        await booth.locator('[data-demo-pause]').evaluate(button => button.click());
        await page.waitForTimeout(60);
        const pointer = () => booth.locator('.film-cursor').evaluate(el => {
          const rect = el.getBoundingClientRect();
          return { x: rect.x, y: rect.y, time: el.getAnimations()[0]?.currentTime };
        });
        const frozen = await pointer();
        await page.waitForTimeout(250);
        assert.deepEqual(await pointer(), frozen, `${scene}: paused pointer moved`);
        assert.equal(await booth.getAttribute('data-state'), 'move');
        await booth.locator('[data-demo-pause]').evaluate(button => button.click());
        await page.waitForFunction(() => document.querySelector('[data-demo-animation]').dataset.state === 'thinking');
        await booth.locator('[data-demo-pause]').evaluate(button => button.click());
        await booth.locator('[data-demo-chapter="question"]').evaluate(button => button.click());
        assert.equal(await booth.getAttribute('data-state'), 'question');
        assert.equal(await booth.locator('.film-input-draft').isVisible(), true);
        if (['decision', 'profit'].includes(scene)) {
          await booth.locator('.film-nav-library').evaluate(button => button.click());
          const answer = booth.locator('[data-decision-turn="1"] .film-answer');
          assert.equal(await answer.evaluate(el => getComputedStyle(el).opacity), '1', 'manual inspection must show the full answer');
        }
      }
      await page.close();
    });
  } finally {
    await browser.close();
    await new Promise(done => server.close(done));
  }
});
