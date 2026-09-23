import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BRAND, PRODUCT_BRAND } from './brand.js';

const read = file => readFileSync(new URL(file, import.meta.url), 'utf8');

test('company artwork is independent from the Synaiq product identity', () => {
  assert.equal(BRAND.name, 'tAistro');
  assert.equal(PRODUCT_BRAND.ink, 'assets/synaiq-logo-ink.svg');
  assert.notEqual(BRAND.ink, PRODUCT_BRAND.ink);
  for (const asset of [BRAND.ink, BRAND.light]) {
    const svg = read(asset);
    assert.match(svg, /viewBox="0 0 374 75"/);
    assert.equal((svg.match(/<path /g) || []).length, 9);
    assert.doesNotMatch(svg, /<script|<image|<foreignObject|\bon\w+=/i);
  }
  assert.match(read('demo-animation.js'), /messages\.common\.productBrand\.ink/);
  assert.match(read('kip-design.js'), /messages\.common\.productBrand\.ink/);
});

test('site header and footer use the supplied official mark instead of a typographic imitation', () => {
  const page = read('page.html');
  assert.equal((page.match(/class="brand"/g) || []).length, 2);
  assert.equal((page.match(/class="brand-logo"/g) || []).length, 2);
  assert.doesNotMatch(page, /SynaiQ<span>⌁<\/span>/);
  assert.match(page, /href="site\.css"/);
  assert.match(read('site.css'), /\/\* BEGIN KIP \//);
  assert.match(page, /class="brand-logo" src="assets\/taistro-logo-ink\.svg"/);
  assert.doesNotMatch(read('site.css'), /background:\s*#151515/);
});

test('product demonstration uses an image for the same official brand', () => {
  assert.match(read('demo-animation.js'), /class="film-logo"[^>]*><img /);
  for (const name of ['assets/kip-search-demo.svg', 'assets/kip-library-demo.svg']) {
    const svg = read(name);
    assert.match(svg, /<image[^>]+data:image\/svg\+xml;base64,/);
    assert.doesNotMatch(svg, /font-family="Georgia,serif">SynaiQ<\/text>/);
    assert.doesNotMatch(svg, /fill="#151515"/);
  }
});

test('CIS ink variant changes only the approved letter color, preserving vector geometry and gold', () => {
  const original = read('../../../public/brand/synaiq-logo-light.svg').trim().replace(/\r\n/g, '\n');
  const ink = read('assets/synaiq-logo-ink.svg').trim().replace(/\r\n/g, '\n');
  assert.equal(ink, original.replace('fill: #fff;', 'fill: #000;'));
  assert.doesNotMatch(ink, /<rect|<image/);
});
