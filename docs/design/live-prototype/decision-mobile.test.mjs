import test from 'node:test';
import assert from 'node:assert/strict';
import { syncDecisionMobile, MOBILE_FRAME_OPTIONS } from './scripts/sync-decision-mobile.mjs';
import { DECISION_POLICIES } from './decision-scroll.js';
import { PUBLIC_FILES } from './share-preview.mjs';

test('mobile derivatives retain all approved frames, source hashes and the decoded memory budget', async () => {
  const manifest = await syncDecisionMobile({ check: true });
  assert.equal(manifest.files.length, 243);
  assert.ok(manifest.files.reduce((sum, frame) => sum + frame.size, 0) < 3_000_000);
  const { width, height } = MOBILE_FRAME_OPTIONS;
  const { cacheSize, concurrent, warmWholeSequence } = DECISION_POLICIES.mobile;
  // Estimate decoded RGBA frame bytes, not the browser's total memory usage.
  assert.ok(width * height * 4 * (cacheSize + concurrent) < 8 * 1024 * 1024);
  assert.equal(warmWholeSequence, false);
  for (const frame of manifest.files) assert.ok(PUBLIC_FILES.some(file => file.url === `/live-prototype/${frame.path}`));
  assert.equal(PUBLIC_FILES.some(file => file.file.includes('decision-mobile-manifest')), false);
});
