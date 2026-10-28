import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTranslation, generateLocales } from './scripts/build-locales.mjs';
import { generateSitemap } from './scripts/build-sitemap.mjs';
import { LOCALE_CONFIG } from './locale-config.js';

test('translation validation rejects missing, extra, blank, wrong-type and mismatched placeholders', () => {
  const baseline = { text: 'Hello {name}', list: ['one', 'two'], nativeName: '' };
  validateTranslation(baseline, { text: 'Hallo {name}', list: ['eins', 'zwei'], nativeName: '' });
  for (const invalid of [
    { ...baseline, text: 'Hallo' }, { ...baseline, text: '' },
    { ...baseline, text: 1 }, { ...baseline, list: ['eins'] },
    { ...baseline, extra: 'x' }, { list: ['eins', 'zwei'], nativeName: '' },
  ]) assert.throws(() => validateTranslation(baseline, invalid));
});

test('all generated language modules match their JSON sources', async () => {
  const result = await generateLocales({ check: true });
  assert.equal(result.languages, LOCALE_CONFIG.length);
  assert.equal(result.changed.length, 0);
  await generateSitemap({ check: true });
});
