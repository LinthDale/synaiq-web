import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { demoFrameAt, renderAnimatedDemo, readDemoTiming } from './demo-animation.js';
import { hasDeclaration } from './css-test-helpers.mjs';

test('animation progresses from pointer click to answer and original source', () => {
  const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');
  const timing = readDemoTiming({ getPropertyValue: name => css.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1] ?? '' });
  assert.ok(timing);
  let elapsed = 0;
  for (const [index, state] of ['question', 'click', 'answer', 'source', 'library'].entries()) {
    assert.equal(demoFrameAt(elapsed, timing), state);
    elapsed += timing.durations[index];
  }
  assert.equal(demoFrameAt(elapsed, { ...timing, count: 0 }), 'question');
});

test('demo is a labeled animation, not a functioning product form', () => {
  const html = renderAnimatedDemo();
  assert.match(html, /自動播放的操作情境動畫/);
  assert.match(html, /data-demo-pause/);
  assert.match(html, /示例資料/);
  assert.doesNotMatch(html, /<form|<input|<textarea|iframe|synaiq-ai\.com/);
});

test('narrow demo removes the hidden sidebar track and preserves a full-width chat', () => {
  const css = readFileSync(new URL('./site.css', import.meta.url), 'utf8');
  assert.ok(hasDeclaration('site.css', '.film-body', 'grid-template-columns', 'minmax(0,1fr)', '(max-width:899px)'));
  assert.doesNotMatch(css, /grid-template-columns:0 100%/);
});

test('editorial images retain aspect ratio and key quote phrases stay together', () => {
  for (const selector of ['.narrative-sketch img', '.quote-art img']) assert.ok(hasDeclaration('site.css', selector, 'height', 'auto'));
  for (const selector of ['.editorial-quote .quote-phrase', '.editorial-quote blockquote .marked']) assert.ok(hasDeclaration('site.css', selector, 'white-space', 'nowrap'));
});

test('long English copy can reflow without changing Chinese display rules', () => {
  assert.ok(hasDeclaration('site.css', 'html:lang(en) .editorial-quote .quote-phrase', 'white-space', 'normal'));
  assert.ok(hasDeclaration('site.css', '.film-citation>span', 'overflow-wrap', 'anywhere'));
  assert.ok(hasDeclaration('tokens.css', 'html:lang(en) body[data-page="kip"] .kip-opening h1', 'font-size', 'var(--kip-title-size)'));
  assert.ok(hasDeclaration('tokens.css', 'html:lang(en) body[data-page="kip"]', '--kip-title-size', 'clamp(34px,5.3vw,76px)'));
});
