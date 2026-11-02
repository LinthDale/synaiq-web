import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderAnimatedDemo, renderDemoFilm, demoSceneAt, demoChapterStart, demoFrameAt } from './demo-animation.js';
import { decisionFrameAt } from './decision-demo.js';
import { getMessages } from './i18n.js';
import { hasDeclaration } from './css-test-helpers.mjs';

test('one cinema screen offers five manually selected films in both languages', () => {
  for (const locale of ['zh-Hant', 'en']) {
    const html = renderAnimatedDemo({ locale });
    assert.equal((html.match(/class="demo-film/g) ?? []).length, 1);
    assert.match(html, /data-demo-prev/);
    assert.match(html, /data-demo-next/);
    assert.equal((html.match(/data-demo-select=/g) ?? []).length, 5);
    assert.match(html, /data-demo-scene="decision"/);
    assert.match(html, /aria-live="polite"/);
    assert.doesNotMatch(html, /<form|<input|<textarea|iframe/);
    if (locale === 'en') assert.doesNotMatch(html, /\p{Script=Han}/u);
  }
});

test('image search films use public sample assets and no upload or search endpoint', () => {
  for (const locale of ['zh-Hant', 'en']) for (const scene of ['text-image', 'image-image']) {
    const html = renderDemoFilm(scene, getMessages(locale));
    assert.match(html, /class="image-results"/);
    assert.equal((html.match(/class="image-result"/g) ?? []).length, 3);
    assert.match(html, /assets\/kip-decision-demo(?:-en)?\.svg/);
    assert.doesNotMatch(html, /wally|接待機器人/i);
    assert.match(html, /image-search-preview/);
    for (const part of ['film-top', 'film-sidebar', 'film-chat', 'film-input', 'film-send']) assert.ok(html.includes(`class="${part}"`), `Same chat interface must include ${part}`);
    assert.doesNotMatch(html, /image-search-canvas|class="image-query"|image-search-action/);
    assert.doesNotMatch(html, /<form|<input|<textarea|iframe|synaiq-ai\.com/);
    if (scene === 'image-image') assert.match(html, /image-query-thumb/);
    if (locale === 'en') assert.doesNotMatch(html, /\p{Script=Han}/u);
  }
});

test('previous and next wrap safely over exactly the supported scenes', () => {
  assert.equal(demoSceneAt(0), 'decision');
  assert.equal(demoSceneAt(1), 'profit');
  assert.equal(demoSceneAt(2), 'knowledge');
  assert.equal(demoSceneAt(3), 'text-image');
  assert.equal(demoSceneAt(4), 'image-image');
  assert.equal(demoSceneAt(5), 'decision');
  assert.equal(demoSceneAt(-1), 'image-image');
});

test('chapter labels and numbers have independent searchable controls', () => {
  const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');
  assert.match(css, /01 用自然語言提問/);
  for (const name of ['--demo-step-font', '--demo-step-size', '--demo-step-color', '--demo-step-active-color', '--demo-step-number-font', '--demo-step-number-size']) assert.ok(css.includes(`${name}:`), name);
  assert.ok(hasDeclaration('tokens.css', '.demo-chapters', 'font-size', 'var(--demo-step-size)'));
  assert.ok(hasDeclaration('tokens.css', '.demo-chapters button > span', 'font-size', 'var(--demo-step-number-size)'));
});

test('all five demos share three compact chapter buttons below the screen and the same playback hint', () => {
  for (const locale of ['zh-Hant', 'en', 'de']) for (let index = 0; index < 5; index++) {
    const html = renderAnimatedDemo({ locale, initialScene: demoSceneAt(index) });
    assert.equal((html.match(/data-demo-chapter=/g) ?? []).length, 3);
    assert.ok(html.indexOf('class="demo-chapters"') > html.indexOf('id="demo-screen"'));
    assert.ok(html.indexOf('class="demo-chapter-hint"') > html.indexOf('class="demo-chapters"'));
    assert.ok(html.includes(getMessages(locale).demo.chapterHint));
    assert.doesNotMatch(html, /data-decision-chapter|decision-scroll-hint/);
  }
});

test('chapter seeking starts the selected dialogue or visual phase in every demo', () => {
  const timing = { durations: [2400, 1400, 4600, 800, 800], total: 10000, count: 1 };
  const chapters = ['question', 'source', 'library'];
  for (const scene of ['decision', 'profit']) for (const [turn, chapter] of chapters.entries()) {
    const start = demoChapterStart(scene, chapter, timing);
    assert.deepEqual(start, { turn, state: 'question', elapsed: turn * timing.total });
    assert.deepEqual(decisionFrameAt(start.elapsed, timing), { turn, state: 'question' });
  }
  for (const scene of ['knowledge', 'text-image', 'image-image']) for (const chapter of chapters) {
    const start = demoChapterStart(scene, chapter, timing);
    const expected = chapter === 'source' && scene !== 'knowledge' ? 'answer' : chapter;
    assert.equal(start.state, expected);
    assert.equal(demoFrameAt(start.elapsed, timing), expected);
    assert.ok(start.elapsed < timing.total);
  }
  assert.equal(demoChapterStart('unknown', 'source', timing), null);
  assert.equal(demoChapterStart('knowledge', 'unknown', timing), null);
  assert.deepEqual(demoChapterStart('profit', 'library', null), { turn: 2, state: 'question', elapsed: 0 });
});
