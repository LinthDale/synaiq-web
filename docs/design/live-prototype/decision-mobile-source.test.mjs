import test from 'node:test';
import assert from 'node:assert/strict';
import { createDecisionMobileSource } from './decision-mobile-source.js';
const frame = 'data:image/webp;base64,UklGRg==';
const bundle = (start = 0) => ({ schema: 1, start, frames: Array(Math.min(32, 243 - start)).fill(frame) });

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
