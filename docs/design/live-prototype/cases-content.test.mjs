import test from 'node:test';
import assert from 'node:assert/strict';
import { CASES, DEFAULT_CASE, CASE_ID_PATTERN, publishedCases, caseIds, findCase, resolveCaseId, parseAspect, aspectOrientation } from './cases-data.js';
import { SUPPORTED_LOCALES, getMessages } from './i18n.js';
import { PUBLIC_FILES } from './share-preview.mjs';

const shared = new Set(PUBLIC_FILES.filter(entry => entry.root === 'prototype').map(entry => entry.file));
const photosOf = entry => [entry.hero, ...(entry.field?.photos ?? [])];
const DATE_SHAPES = Object.freeze({ day: /^\d{4}-\d{2}-\d{2}$/, month: /^\d{4}-\d{2}$/, year: /^\d{4}$/ });

test('every published case carries one permanent identifier in the approved shape', () => {
  const published = publishedCases();
  assert.ok(published.length >= 1);
  assert.deepEqual(caseIds(), published.map(entry => entry.id));
  assert.equal(new Set(CASES.map(entry => entry.id)).size, CASES.length, 'a case identifier is repeated');
  for (const entry of CASES) {
    assert.match(entry.id, CASE_ID_PATTERN, entry.id);
    assert.equal(typeof entry.published, 'boolean', entry.id);
    assert.equal(typeof entry.featured, 'boolean', entry.id);
    assert.ok(Object.isFrozen(entry), `${entry.id} must be frozen`);
  }
  // The legacy section anchors point at this case, so it has to be published.
  assert.ok(findCase(DEFAULT_CASE), `${DEFAULT_CASE} must be published`);
  // At most one featured case, and it leads whatever its date; the rest are newest first.
  assert.ok(published.filter(entry => entry.featured).length <= 1);
  if (published.some(entry => entry.featured)) assert.equal(published[0].featured, true);
  const rest = published.filter(entry => !entry.featured);
  for (const [index, entry] of rest.entries()) {
    if (index === 0) continue;
    assert.ok(rest[index - 1].date.start >= entry.date.start, `${entry.id} is out of date order`);
  }
});

test('every published case is described in both languages with the same keys', () => {
  for (const entry of publishedCases()) {
    for (const { code } of SUPPORTED_LOCALES) {
      const label = `${entry.id}/${code}`;
      const copy = getMessages(code).cases;
      const text = copy.cases[entry.id];
      assert.ok(text, `${label} has no copy`);
      for (const field of ['name', 'dateLabel', 'summary']) {
        assert.equal(typeof text[field], 'string', `${label}.${field}`);
        assert.ok(text[field].trim().length > 0, `${label}.${field} is empty`);
      }
      // Every photograph the data names has its own alternative text, label and caption.
      for (const photo of photosOf(entry)) {
        const photoCopy = text.photos[photo.key];
        assert.ok(photoCopy, `${label} has no copy for photo ${photo.key}`);
        for (const field of ['alt', 'caption']) assert.ok(photoCopy[field]?.trim(), `${label}.${photo.key}.${field}`);
        if (photo.sketch) assert.ok(photoCopy.label?.trim(), `${label}.${photo.key}.label`);
      }
      for (const tag of entry.tags ?? []) assert.ok(copy.tags[tag]?.trim(), `${label}: tag ${tag} has no label`);
      assert.ok(Array.isArray(text.facts) && text.facts.length > 0, `${label}.facts`);
      for (const fact of text.facts) assert.equal(fact.length, 3, `${label}.facts entry`);
      assert.ok(text.story.paragraphs.length > 0, `${label}.story`);
    }
  }
});

test('optional blocks are absent rather than empty, and every block has its counterpart', () => {
  for (const entry of publishedCases()) {
    for (const { code } of SUPPORTED_LOCALES) {
      const label = `${entry.id}/${code}`;
      const text = getMessages(code).cases.cases[entry.id];
      // Field notes and coverage are optional; a heading never appears without content.
      if (entry.field) assert.ok(entry.field.photos.length > 0, `${label}: an empty field block`);
      if (text.field) {
        assert.ok(text.field.title.length > 0, `${label}.field.title`);
        assert.ok(text.field.notes.length > 0 || (entry.field?.photos ?? []).length > 0, `${label}: a field heading with nothing under it`);
      }
      if (text.press) {
        assert.ok(text.press.title.trim(), `${label}.press.title`);
        assert.equal(text.press.links.length, (entry.media ?? []).length, `${label}: coverage titles and addresses disagree`);
      } else {
        assert.equal((entry.media ?? []).length, 0, `${label}: coverage addresses with no titles`);
      }
    }
  }
});

test('dates keep the precision the case actually has', () => {
  for (const entry of CASES) {
    const { start, end, precision } = entry.date;
    assert.ok(DATE_SHAPES[precision], `${entry.id}: unknown precision ${precision}`);
    assert.match(start, DATE_SHAPES[precision], entry.id);
    assert.match(end, DATE_SHAPES[precision], entry.id);
    assert.ok(end >= start, `${entry.id}: ends before it starts`);
  }
});

test('every case asset is a reviewed file under assets/cases', () => {
  for (const entry of publishedCases()) {
    const files = [entry.cover.image, ...photosOf(entry).flatMap(photo => [photo.photo, photo.sketch].filter(Boolean))];
    for (const file of files) {
      assert.match(file, /^assets\/cases\/[\w./-]+$/, `${entry.id}: ${file}`);
      assert.ok(!file.includes('..'), `${entry.id}: ${file}`);
      assert.ok(shared.has(file), `${entry.id}: ${file} is not in the public allowlist`);
    }
    // Photo keys are how the copy finds its picture, so they cannot repeat within a case.
    const keys = photosOf(entry).map(photo => photo.key);
    assert.equal(new Set(keys).size, keys.length, `${entry.id}: a photo key is repeated`);
  }
});

test('coverage addresses are https and unique per case', () => {
  for (const entry of publishedCases()) {
    const media = entry.media ?? [];
    assert.equal(new Set(media).size, media.length, `${entry.id}: a coverage address is repeated`);
    for (const url of media) {
      assert.equal(new URL(url).protocol, 'https:', `${entry.id}: ${url}`);
    }
  }
});

test('an unknown identifier resolves to null and never becomes a path', () => {
  // 'kaohsiung-expo-2027' is the shape a future case would use; until it is published it is
  // a miss like any other, so an identifier can never be reached before its content exists.
  for (const value of [undefined, null, '', 'not-a-case', 'kaohsiung-expo-2027', '../../private', '/etc/passwd', '<script>', '__proto__', 'constructor', 'TOKYO-FOODEX-2026', 'a'.repeat(65)]) {
    assert.equal(resolveCaseId(value), null, String(value));
    assert.equal(findCase(value), null, String(value));
  }
  assert.equal(resolveCaseId(DEFAULT_CASE), DEFAULT_CASE);
  // An unpublished entry is not reachable even when it is present in the module.
  const hidden = Object.freeze([...CASES, Object.freeze({ ...findCase(DEFAULT_CASE), id: 'hidden-case', published: false })]);
  assert.equal(resolveCaseId('hidden-case', hidden), null);
  assert.equal(publishedCases(hidden).length, publishedCases().length);
});

test('aspect ratios are parsed, and orientation follows the ratio', () => {
  assert.deepEqual({ ...parseAspect('16 / 9') }, { width: 16, height: 9 });
  assert.deepEqual({ ...parseAspect('3 / 4') }, { width: 3, height: 4 });
  for (const value of ['', '3/0', '0 / 4', 'wide', '3 4', undefined, null, '-3 / 4']) assert.equal(parseAspect(value), null, String(value));
  for (const value of ['16 / 9', '3 / 2', '1 / 1', '5712 / 3213']) assert.equal(aspectOrientation(value), 'landscape', value);
  for (const value of ['3 / 4', '2 / 3', '9 / 16']) assert.equal(aspectOrientation(value), 'portrait', value);
  // An unusable ratio falls back to the layout the existing case already uses.
  assert.equal(aspectOrientation('nonsense'), 'portrait');
  for (const entry of CASES) {
    for (const photo of photosOf(entry)) assert.ok(parseAspect(photo.aspect), `${entry.id}/${photo.key}`);
  }
});
