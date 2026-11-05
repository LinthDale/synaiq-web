import test from 'node:test';
import assert from 'node:assert/strict';
import { createDecisionMobileSource } from './decision-mobile-source.js';
import { DECISION_MOBILE_BUNDLE_FILES } from './decision-frames.js';
const frame = 'data:image/webp;base64,UklGRg==';
const bundle = (start = 0) => ({ schema: 1, start, frames: Array(Math.min(32, 243 - start)).fill(frame) });

test('the early first bundle is adopted without a second fetch and cancelled with its owning animation', async () => {
  let requests = 0, cancelled = 0;
  const controller = new AbortController();
  const source = createDecisionMobileSource({ signal: controller.signal, initial: {
    url: new URL(DECISION_MOBILE_BUNDLE_FILES[0], import.meta.url).href,
    text: Promise.resolve(JSON.stringify(bundle())), cancel: () => { cancelled++; },
  }, fetcher: async () => { requests++; return Response.json(bundle()); } });
  assert.equal(await source.frame(0), frame); await source.prepare(31);
  assert.equal(requests, 0);
  source.clear(); controller.abort(); assert.equal(cancelled, 1);
});

test('rotating before initialization cancels a mismatched early bundle rather than painting the wrong composition', async () => {
  let cancelled = 0, requests = 0;
  const source = createDecisionMobileSource({ initial: {
    url: new URL('assets/kip-d-scroll-portrait-small-bundles-v1/frames-000.json', import.meta.url).href,
    text: Promise.resolve(JSON.stringify(bundle())), cancel: () => { cancelled++; },
  }, fetcher: async () => { requests++; return Response.json(bundle()); } });
  assert.equal(cancelled, 1); assert.equal(await source.frame(0), frame); assert.equal(requests, 1);
  source.clear(); assert.equal(cancelled, 1);
});

test('nearby frames share one compressed download without decoding images', async () => {
  const requests = [];
  const source = createDecisionMobileSource({ fetcher: async url => {
    requests.push(String(url));
    const id = Number(String(url).match(/frames-(\d+)\.json$/)[1]);
    return Response.json(bundle(id * 32));
  } });
  assert.deepEqual(await Promise.all([source.frame(0), source.frame(31)]), [frame, frame]);
  assert.equal(requests.length, 1);
  await source.prepare(32); await source.frame(63);
  assert.equal(requests.length, 2);
  assert.equal(await source.frame(242), frame);
  assert.equal(requests.length, 3);
  await assert.rejects(source.frame(243), RangeError);
  source.clear();
});

test('bad or failed bundles stop without a retry storm and can recover on explicit retry', async () => {
  let requests = 0, online = false;
  const source = createDecisionMobileSource({ fetcher: async () => {
    requests++;
    if (!online) return new Response(null, { status: 503 });
    return Response.json(bundle());
  } });
  await assert.rejects(source.frame(0));
  await assert.rejects(source.prepare(1));
  assert.equal(requests, 1);
  online = true; source.retryFailed();
  assert.equal(await source.frame(1), frame);
  assert.equal(requests, 2);
  for (const invalid of [{ ...bundle(), start: 32 }, { ...bundle(), frames: ['data:text/html;base64,AAAA'] }, { ...bundle(), schema: 2 }]) {
    const bad = createDecisionMobileSource({ fetcher: async () => Response.json(invalid) });
    await assert.rejects(bad.frame(0), /Invalid mobile frame bundle/);
  }
});
