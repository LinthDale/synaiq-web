import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import postcss from 'postcss';
import sharp from 'sharp';

const stylesheetName = 'site.css';
const assetName = 'torn-paper-cotton-v2.webp';
const stylesheetUrl = new URL(stylesheetName, import.meta.url);
const assetUrl = new URL(`assets/${assetName}`, import.meta.url);
const homeScope = /\[\s*data-page\s*=\s*(?:"home"|'home'|home)\s*\]/i;

async function readStylesheet() {
  const source = await readFile(stylesheetUrl, 'utf8');
  const start = source.indexOf('/* BEGIN HOME PAPER /');
  const end = source.indexOf('/* END HOME PAPER */');
  assert.ok(start >= 0 && end > start, 'The Home paper section remains identifiable in site.css');
  return postcss.parse(source.slice(start, end), { from: stylesheetUrl.pathname });
}

function isKeyframeStep(rule) {
  for (let ancestor = rule.parent; ancestor; ancestor = ancestor.parent) {
    if (ancestor.type === 'atrule' && /(?:^|-)keyframes$/i.test(ancestor.name)) return true;
  }
  return false;
}

function declarations(rule, property) {
  return rule.nodes.filter(node => node.type === 'decl' && node.prop === property);
}

test('the paper material section follows Home and precedes KIP within site.css', async () => {
  const html = await readFile(new URL('page.html', import.meta.url), 'utf8');
  const links = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map(([tag]) => Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*(["'])(.*?)\2/g)].map(([, key, , value]) => [key.toLowerCase(), value])))
    .filter(link => link.rel?.split(/\s+/).includes('stylesheet'))
    .map(link => link.href?.split(/[?#]/)[0]);
  assert.ok(links.includes('site.css'), 'page.html loads the single CSS entry');
  const entry = await readFile(new URL('site.css', import.meta.url), 'utf8');
  const materialIndex = entry.indexOf('/* BEGIN HOME PAPER /');
  assert.ok(materialIndex >= 0, 'The material section must exist');
  for (const previous of ['BASE', 'COMPONENTS', 'HOME', 'DEMO']) {
    const previousIndex = entry.indexOf(`/* BEGIN ${previous} /`);
    assert.ok(previousIndex >= 0 && previousIndex < materialIndex, `${previous} must precede the material overrides`);
  }
  assert.ok(materialIndex < entry.indexOf('/* BEGIN KIP /'), 'KIP styling follows the Home-only paper layer');
});

test('paper material selectors remain scoped to the homepage, including responsive overrides', async () => {
  const css = await readStylesheet();
  let checked = 0;
  css.walkRules(rule => {
    if (isKeyframeStep(rule)) return;
    for (const selector of postcss.list.comma(rule.selector)) {
      assert.match(selector, homeScope, `Unscoped selector could alter the KIP page: ${selector}`);
      checked += 1;
    }
  });
  assert.ok(checked > 0, 'The stylesheet must define actual homepage material rules');
});

test('the torn boundary uses the raster material without tiled polygon or SVG teeth', async () => {
  const css = await readStylesheet();
  const materialDeclarations = [];
  const repeatDeclarations = [];
  css.walkDecls(declaration => {
    if (declaration.value.includes(assetName)) materialDeclarations.push(declaration);
    if (/(?:background|mask)-repeat$/.test(declaration.prop)) repeatDeclarations.push(declaration);
    assert.doesNotMatch(declaration.value, /torn-letter-edge\.svg|polygon\s*\(/i, 'Do not restore the old artificial torn contour');
  });
  assert.ok(materialDeclarations.length > 0, 'The new raster material must be used in CSS');
  assert.ok(repeatDeclarations.some(declaration => /\bno-repeat\b/.test(declaration.value)), 'The material must explicitly disable tiling');
  for (const declaration of repeatDeclarations) {
    assert.doesNotMatch(declaration.value.replace(/\bno-repeat\b/g, ''), /\b(?:repeat(?:-[xy])?|round|space)\b/, 'Paper boundaries must not have a periodically repeated pattern');
  }
  for (const declaration of materialDeclarations) {
    assert.doesNotMatch(declaration.value.replace(/\bno-repeat\b/g, ''), /\b(?:repeat(?:-[xy])?|round|space)\b/, 'Raster background shorthand must not enable tiling');
  }
});

test('created decorative pseudo-elements cannot intercept clicks', async () => {
  const css = await readStylesheet();
  let decorativeLayers = 0;
  css.walkRules(rule => {
    if (isKeyframeStep(rule) || !/::?(?:before|after)\b/.test(rule.selector)) return;
    const createsLayer = declarations(rule, 'content').some(declaration => !/^(?:none|normal)$/i.test(declaration.value.trim()));
    if (!createsLayer) return;
    assert.ok(declarations(rule, 'pointer-events').some(declaration => declaration.value.trim() === 'none'), `Decorative layer must allow pointer events through: ${rule.selector}`);
    decorativeLayers += 1;
  });
  assert.ok(decorativeLayers > 0, 'The material should create at least one decorative boundary layer');
});

test('the paper raster is a lightweight wide strip with genuine transparent and opaque regions', async () => {
  const bytes = await readFile(assetUrl);
  const metadata = await sharp(bytes).metadata();
  assert.equal(metadata.format, 'webp');
  assert.ok(metadata.width > 1500, `The strip must remain detailed on desktop, got ${metadata.width}px`);
  assert.ok(metadata.height < 400, `The strip should not carry an entire background image, got ${metadata.height}px`);
  assert.ok((await stat(assetUrl)).size < 500_000, 'The decorative strip must stay below 500 KB');
  assert.equal(metadata.hasAlpha, true, 'Transparency must not be flattened onto a rectangle');

  const { data, info } = await sharp(bytes).ensureAlpha().extractChannel('alpha').raw().toBuffer({ resolveWithObject: true });
  let transparent = 0;
  let opaque = 0;
  for (const alpha of data) {
    if (alpha <= 5) transparent += 1;
    if (alpha >= 250) opaque += 1;
  }
  const pixels = info.width * info.height;
  assert.ok(transparent / pixels > 0.02, 'At least 2% of the strip must be effectively transparent around the tear');
  assert.ok(opaque / pixels > 0.02, 'At least 2% of the strip must preserve the opaque paper body');
});
