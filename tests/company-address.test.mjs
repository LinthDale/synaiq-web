import assert from 'node:assert/strict';
import test from 'node:test';
import { decodeEntities, htmlFor } from './lib/dist.mjs';

const ADDRESS = '407臺中市西屯區何安里臺灣大道二段910號10樓之2';

// The Astro English pages remain Chinese draft copies until their separate translation milestone.
for (const route of ['/', '/contact/', '/en/', '/en/contact/']) {
  test(`${route} publishes the updated company address, without the former address`, () => {
    const html = decodeEntities(htmlFor(route));
    assert.ok(html.includes(ADDRESS), `${route} is missing the approved company address`);
    assert.doesNotMatch(html, /文心路|Wenxin/);
  });
}
