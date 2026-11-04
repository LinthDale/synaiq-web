import test from 'node:test';
import assert from 'node:assert/strict';
import { syncDecisionMobile, MOBILE_FRAME_OPTIONS } from './scripts/sync-decision-mobile.mjs';
import { DECISION_POLICIES } from './decision-scroll.js';
import { PUBLIC_FILES } from './share-preview.mjs';
import { syncDecisionMobileBundles } from './scripts/sync-decision-mobile-bundles.mjs';
import { DECISION_MOBILE_BUNDLE_FILES } from './decision-frames.js';

test('mobile derivatives retain all approved frames, source hashes and the decoded memory budget', async () => {
  const manifest = await syncDecisionMobile({ check: true });
  assert.equal(manifest.files.length, 243);
  assert.ok(manifest.files.reduce((sum, frame) => sum + frame.size, 0) < 3_000_000);
  const { width, height } = MOBILE_FRAME_OPTIONS;
  const { cacheSize, concurrent, warmWholeSequence } = DECISION_POLICIES.mobile;
  // Estimate decoded RGBA frame bytes, not the browser's total memory usage.
  assert.ok(width * height * 4 * (cacheSize + concurrent) < 8 * 1024 * 1024);
  assert.equal(warmWholeSequence, false);
  const bundles = await syncDecisionMobileBundles({ check: true });
  assert.equal(bundles.files, 8); assert.equal(bundles.frames, 243);
  assert.ok(bundles.bytes < 3_100_000);
  assert.ok(width * height * 4 * (cacheSize + concurrent) + bundles.bytes * 2 < 16 * 1024 * 1024,
    'Decoded frames plus conservative UTF-16 compressed strings exceed the estimate budget');
  for (const path of DECISION_MOBILE_BUNDLE_FILES) assert.ok(PUBLIC_FILES.some(file => file.file === path));
  assert.equal(PUBLIC_FILES.filter(file => file.file.startsWith('assets/kip-d-scroll-mobile-v1/')).length, 1, 'Only the poster is individually published');
  assert.equal(PUBLIC_FILES.some(file => file.file.includes('decision-mobile-manifest')), false);
});
