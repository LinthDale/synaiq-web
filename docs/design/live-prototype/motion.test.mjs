import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { readMotionNumber, readDemoTiming, demoFrameAt } from './demo-animation.js';

const tokens = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');
const site = readFileSync(new URL('./site.css', import.meta.url), 'utf8');
const values = new Map();
postcss.parse(tokens).walkDecls(decl => {
  if (decl.prop.startsWith('--')) values.set(decl.prop, decl.value);
});
const style = { getPropertyValue: name => values.get(name) ?? '' };

test('animation timing is authored only in tokens.css, not repeated in selectors or JS', () => {
  postcss.parse(site).walkDecls(decl => {
    if (/^(animation|transition)(-|$)/.test(decl.prop)) {
      assert.doesNotMatch(decl.value, /(?:^|[\s,(])(?:\d*\.)?\d+(?:ms|s)\b/,
        `Move ${decl.prop} at site.css:${decl.source.start.line} into tokens.css`);
    }
  });
  for (const file of ['home-design.js', 'demo-animation.js']) {
    const source = readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /threshold:\s*0\.\d+|%\s*16000|t\s*<\s*(2400|3800|7600|11800)/);
  }
  for (const name of ['--product-reveal-count', '--product-reveal-threshold', '--product-screen-duration', '--product-paper-duration', '--product-wally-duration', '--demo-play-count', '--hero-letters-duration']) {
    assert.ok(values.has(name), `Missing maintenance setting ${name}`);
  }
});

test('motion values accept seconds or milliseconds and reject invalid settings', () => {
  const read = value => ({ getPropertyValue: () => value });
  assert.equal(readMotionNumber(read('1.15s'), '--time', { time: true }), 1150);
  assert.equal(readMotionNumber(read('250ms'), '--time', { time: true }), 250);
  assert.equal(readMotionNumber(read('2'), '--count', { integer: true }), 2);
  for (const value of ['', 'NaN', '-1s', '2px', 'infinity', '2seconds']) {
    assert.equal(readMotionNumber(read(value), '--time', { time: true }), null);
  }
  assert.equal(readMotionNumber(read('2.5'), '--count', { integer: true }), null);
  assert.equal(readMotionNumber(read('1.2'), '--threshold', { max: 1 }), null);
});

test('demo uses CSS phase durations, finite repeats end on the last frame', () => {
  const timing = readDemoTiming(style);
  assert.ok(timing);
  const names = ['question', 'click', 'answer', 'source', 'library'];
  let elapsed = 0;
  for (let i = 0; i < names.length; i++) {
    assert.equal(demoFrameAt(elapsed, timing), names[i]);
    elapsed += timing.durations[i];
  }
  assert.equal(demoFrameAt(elapsed, { ...timing, count: 0 }), 'question');
  assert.equal(demoFrameAt(elapsed, { ...timing, count: 1 }), 'library');
  assert.equal(demoFrameAt(elapsed, { ...timing, count: 2 }), 'question');
  assert.equal(demoFrameAt(elapsed * 2, { ...timing, count: 2 }), 'library');
  assert.equal(readDemoTiming({ getPropertyValue: () => '' }), null);
});
