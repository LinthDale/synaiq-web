import test from 'node:test';
import assert from 'node:assert/strict';
import { decisionVariantAt, DECISION_VARIANTS } from './decision-responsive.js';
import { scenePlacement, DECISION_POLICIES } from './decision-scroll.js';
import { syncDecisionPortrait } from './scripts/sync-decision-portrait.mjs';
import { syncDecisionPhone } from './scripts/sync-decision-phone.mjs';
import { readFile } from 'node:fs/promises';

test('orientation chooses composition independently of the 480px and 900px resolution breakpoints', () => {
  for (const [width, height, expected] of [
    [390, 844, 'portrait-phone'], [479, 900, 'portrait-phone'], [480, 900, 'portrait-small'], [844, 390, 'landscape-small'],
    [768, 1024, 'portrait-small'], [1024, 1366, 'portrait-large'],
    [899, 1200, 'portrait-small'], [900, 1200, 'portrait-large'],
    [899, 600, 'landscape-small'], [900, 600, 'landscape-large'],
    [932, 430, 'landscape-small'], [932, 500, 'landscape-large'],
    [1440, 900, 'landscape-large'], [1200, 1600, 'portrait-large'],
    [900, 900, 'portrait-large'],
  ]) assert.equal(decisionVariantAt(width, height), expected);
  assert.ok(DECISION_VARIANTS['portrait-small'].width < DECISION_VARIANTS['portrait-large'].width);
  const policy = DECISION_POLICIES.portraitLarge;
  assert.ok(864 * 1536 * 4 * (policy.cacheSize + policy.concurrent) < 24 * 1024 * 1024);
});

test('portrait bundles preserve every generated frame, small derivative and bounded pixel memory', async () => {
  const manifest = await syncDecisionPortrait({ check: true });
  for (const key of ['portrait-small', 'portrait-large']) {
    const variant = DECISION_VARIANTS[key];
    assert.equal(manifest.variants[key].frames.length, 243);
    let bytes = 0;
    for (const file of variant.bundles) bytes += (await readFile(new URL(file, import.meta.url))).length;
    const policy = key === 'portrait-small' ? DECISION_POLICIES.mobile : DECISION_POLICIES.portraitLarge;
    const estimate = variant.width * variant.height * 4 * (policy.cacheSize + policy.concurrent) + bytes * 2;
    assert.ok(estimate < (key === 'portrait-small' ? 16 : 64) * 1024 * 1024);
    assert.equal(policy.warmWholeSequence, false);
  }
});

test('portrait positioning keeps the typewriter, fingertips and bulb inside phone and tablet viewports', () => {
  for (const [width, height] of [[320, 694], [390, 770], [768, 950], [1024, 1292], [900, 826]]) {
    const scene = scenePlacement(width, height, 864, 1536);
    for (const [x, y] of [[0.20, 0.82], [0.40, 0.93], [0.68, 0.66], [0.68, 0.52]]) {
      assert.ok(scene.x + scene.width * x >= 0 && scene.x + scene.width * x <= width);
      assert.ok(scene.y + scene.height * y >= 0 && scene.y + scene.height * y <= height);
    }
  }
});

test('the phone tier preserves all 243 portrait frames with the earlier lightweight pixel budget', async () => {
  const manifest = await syncDecisionPhone({ check: true });
  assert.equal(manifest.frames.length, 243);
  assert.ok(manifest.frames.reduce((sum, frame) => sum + frame.bytes, 0) < 1_500_000);
  assert.ok(360 * 640 <= 576 * 384 * 1.05);
  assert.equal(decisionVariantAt(390, 844), 'portrait-phone');
});
