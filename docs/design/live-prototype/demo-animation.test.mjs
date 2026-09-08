import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { demoFrameAt, renderAnimatedDemo } from './demo-animation.js';

test('animation progresses from pointer click to answer and original source', () => {
  assert.equal(demoFrameAt(0), 'question');
  assert.equal(demoFrameAt(2400), 'click');
  assert.equal(demoFrameAt(3800), 'answer');
  assert.equal(demoFrameAt(7600), 'source');
  assert.equal(demoFrameAt(11800), 'library');
  assert.equal(demoFrameAt(16000), 'question');
});

test('demo is a labeled animation, not a functioning product form', () => {
  const html = renderAnimatedDemo();
  assert.match(html, /自動播放的操作情境動畫/);
  assert.match(html, /data-demo-pause/);
  assert.match(html, /示例資料/);
  assert.doesNotMatch(html, /<form|<input|<textarea|iframe|synaiq-ai\.com/);
});

test('narrow demo removes the hidden sidebar track and preserves a full-width chat', () => {
  const css = readFileSync(new URL('./demo-animation.css', import.meta.url), 'utf8');
  assert.match(css, /@media\(max-width:899px\)\{\.film-body\{[^}]*grid-template-columns:minmax\(0,1fr\)/);
  assert.doesNotMatch(css, /grid-template-columns:0 100%/);
});

test('editorial images retain aspect ratio and key quote phrases stay together', () => {
  const css = readFileSync(new URL('./editorial-design.css', import.meta.url), 'utf8');
  assert.match(css, /\.narrative-sketch img,\.quote-art img\{height:auto\}/);
  assert.match(css, /\.editorial-quote \.quote-phrase,\.editorial-quote blockquote \.marked\{white-space:nowrap\}/);
});

test('long English copy can reflow without changing Chinese display rules', () => {
  const editorial = readFileSync(new URL('./editorial-design.css', import.meta.url), 'utf8');
  const demo = readFileSync(new URL('./demo-animation.css', import.meta.url), 'utf8');
  const kip = readFileSync(new URL('./kip-design.css', import.meta.url), 'utf8');
  assert.match(editorial, /html:lang\(en\) \.editorial-quote \.quote-phrase\{white-space:normal\}/);
  assert.match(demo, /\.film-citation>span\{overflow-wrap:anywhere\}/);
  assert.match(kip, /html:lang\(en\) body\[data-page="kip"\] \.kip-opening h1 \{ font-size: clamp\(34px, 5.3vw, 76px\); \}/);
});
