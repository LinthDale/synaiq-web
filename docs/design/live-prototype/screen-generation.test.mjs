import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmdirSync, symlinkSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildScreens, renderScreen, resolveBrandAsset, syncBrandScreens } from './scripts/sync-brand-screens.mjs';
import { screenLocaleSuffixes, screenMessages } from './locale-screens.js';
import { BRAND } from './brand.js';
import { zhHant, en } from './locale-demo.js';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const screenNames = ['search', 'library'];
const expectedScreenCount = Object.keys(screenLocaleSuffixes).length * screenNames.length;

test('every screen locale supplies the same semantic text keys as Chinese', () => {
  assert.deepEqual(Object.keys(screenMessages).sort(), Object.keys(screenLocaleSuffixes).sort());
  for (const [locale, messages] of Object.entries(screenMessages)) {
    assert.deepEqual(Object.keys(messages).sort(), ['library', 'search'], locale);
    for (const screen of ['search', 'library']) {
      assert.deepEqual(Object.keys(messages[screen]).sort(), Object.keys(screenMessages['zh-Hant'][screen]).sort(), `${locale}/${screen}`);
      for (const value of Object.values(messages[screen])) assert.equal(typeof value, 'string');
    }
  }
});

test('all static product screens use the approved shared paper chrome and current purchasing copy', () => {
  for (const { locale, screen, source } of buildScreens()) {
    const demo = locale === 'en' ? en : zhHant;
    assert.match(source, /id="paper-header"/);
    assert.match(source, /id="sidebar-dialogues"/);
    assert.match(source, /id="kip-wordmark"/);
    assert.match(source, /fill="#e9e6dc"/);
    assert.doesNotMatch(source, /第\s*12\s*頁|page\s*12|保固|warranty|Procurement_Contract/i);
    assert.ok(source.includes(demo.citationFilename));
    if (screen === 'search') {
      assert.equal(screenMessages[locale].search.question, demo.question);
      assert.equal(screenMessages[locale].search.answerHeading, demo.answer);
      assert.equal(screenMessages[locale].search.answerClause, demo.answerHighlight);
      assert.equal(screenMessages[locale].search.send, demo.send);
      assert.match(source, /id="send-pen"/);
      assert.match(source, /fill="#dfe5d9"/);
    }
  }
});

test('every configured locale generates both screen assets with the current single logo master', () => {
  const generated = buildScreens();
  assert.equal(generated.length, expectedScreenCount);
  const expectedPairs = Object.keys(screenLocaleSuffixes).flatMap(locale => screenNames.map(screen => `${locale}/${screen}`));
  assert.deepEqual(generated.map(({ locale, screen }) => `${locale}/${screen}`).sort(), expectedPairs.sort());
  const master = readFileSync(new URL(BRAND.ink, import.meta.url));
  for (const { relativePath, source } of generated) {
    const embedded = source.match(/href="data:image\/svg\+xml;base64,([^"]+)"/)?.[1];
    assert.ok(embedded, relativePath);
    assert.deepEqual(Buffer.from(embedded, 'base64'), master, relativePath);
    assert.equal(read(relativePath).replaceAll('\r\n', '\n'), source.replaceAll('\r\n', '\n'), relativePath);
    assert.match(source, /width="1440" height="900" viewBox="0 0 1440 900"/);
    assert.doesNotMatch(source, /\{\{/);
  }
});

test('logo resolution rejects intermediate directory links, inside or outside assets', t => {
  const assetsDirectory = fileURLToPath(new URL('./assets/', import.meta.url));
  const fixture = mkdtempSync(join(assetsDirectory, 'logo-boundary-test-'));
  const links = [];
  t.after(() => {
    // Remove only the links created here and the now-empty exact fixture directory.
    for (const link of links) unlinkSync(link);
    rmdirSync(fixture);
  });
  try {
    const outsideAssets = join(fixture, 'outside-assets');
    symlinkSync(fileURLToPath(new URL('./screen-templates/', import.meta.url)), outsideAssets, 'junction');
    links.push(outsideAssets);
    const insideAssets = join(fixture, 'inside-assets');
    symlinkSync(assetsDirectory, insideAssets, 'junction');
    links.push(insideAssets);
  } catch (error) {
    if (['EPERM', 'EACCES', 'ENOSYS'].includes(error.code)) return t.skip('Directory links are unavailable on this host');
    throw error;
  }
  const prefix = `assets/${basename(fixture)}`;
  assert.throws(() => resolveBrandAsset(`${prefix}/outside-assets/search.svg`), /Logo master must be a local SVG inside assets/);
  assert.throws(() => resolveBrandAsset(`${prefix}/inside-assets/synaiq-logo-ink.svg`), /Logo master must be a local SVG inside assets/);
});

test('screen logo source follows brand configuration and refuses non-local or escaping paths', () => {
  assert.equal(resolveBrandAsset(BRAND.ink).href, new URL(BRAND.ink, import.meta.url).href);
  for (const invalid of [
    '', null, '../assets/logo.svg', '/assets/logo.svg', 'https://example.com/logo.svg',
    'file:///C:/outside/logo.svg', 'C:\\outside\\logo.svg', '//server/share/logo.svg',
    'assets/../../logo.svg', 'assets/./logo.svg', 'assets//logo.svg',
    'assets/%2e%2e/logo.svg', 'assets/%2flogo.svg', 'assets\\logo.svg',
    'assets/logo.svg?version=2', 'assets/logo.svg#mark', 'assets/logo.png',
  ]) {
    assert.throws(() => resolveBrandAsset(invalid), /Logo master must be a local SVG inside assets/, String(invalid));
  }
});

test('English screenshots translate all visible and accessible text, including example filenames', () => {
  for (const { locale, source } of buildScreens()) {
    if (locale !== 'en') continue;
    assert.doesNotMatch(source, /\p{Script=Han}/u);
    assert.match(source, /Equipment_Purchasing_Sample\.pdf/);
    assert.match(source, /sample|Sample|fictional/);
  }
});

test('screen templates escape text and reject missing or unused keys', () => {
  const logo = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>');
  const template = '<svg><image href="{{brand.logoDataUrl}}"/><text>{{question}}</text></svg>';
  const rendered = renderScreen(template, { question: 'A & B < C > D "quoted"' }, logo);
  assert.match(rendered, /A &amp; B &lt; C &gt; D &quot;quoted&quot;/);
  assert.throws(() => renderScreen(template, {}, logo), /Missing screen text: question/);
  assert.throws(() => renderScreen(template, { question: 'Q', extra: 'unused' }, logo), /Unused screen text: extra/);
  assert.throws(() => renderScreen(template, { question: null }, logo), /must be a string/);
  assert.throws(() => renderScreen('<svg>{{bad-key}}</svg>', {}, logo), /Unresolved screen template placeholder/);
});

test('the sync command has a read-only check mode and rejects unexpected arguments', () => {
  assert.deepEqual(syncBrandScreens({ check: true }), { generated: expectedScreenCount, changed: [] });
  const script = fileURLToPath(new URL('./scripts/sync-brand-screens.mjs', import.meta.url));
  const checked = spawnSync(process.execPath, [script, '--check'], { encoding: 'utf8' });
  assert.equal(checked.status, 0, checked.stderr);
  assert.equal(checked.stdout.trim(), `Verified ${expectedScreenCount} screens; 0 updated.`);
  const rejected = spawnSync(process.execPath, [script, '--output', '../elsewhere'], { encoding: 'utf8' });
  assert.equal(rejected.status, 1);
  assert.match(rejected.stderr, /Usage:/);
});
