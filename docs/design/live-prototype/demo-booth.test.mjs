import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderAnimatedDemo, renderDemoFilm, demoSceneAt } from './demo-animation.js';
import { getMessages } from './i18n.js';
import { hasDeclaration } from './css-test-helpers.mjs';

test('one cinema screen offers three manually selected films in both languages', () => {
  for (const locale of ['zh-Hant', 'en']) {
    const html = renderAnimatedDemo({ locale });
    assert.equal((html.match(/class="demo-film/g) ?? []).length, 1);
    assert.match(html, /data-demo-prev/);
    assert.match(html, /data-demo-next/);
    assert.equal((html.match(/data-demo-select=/g) ?? []).length, 3);
    assert.match(html, /data-demo-scene="knowledge"/);
    assert.match(html, /aria-live="polite"/);
    assert.doesNotMatch(html, /<form|<input|<textarea|iframe/);
    if (locale === 'en') assert.doesNotMatch(html, /\p{Script=Han}/u);
  }
});

test('image search films use public sample assets and no upload or search endpoint', () => {
  for (const locale of ['zh-Hant', 'en']) for (const scene of ['text-image', 'image-image']) {
    const html = renderDemoFilm(scene, getMessages(locale));
    assert.match(html, /class="image-results"/);
    assert.equal((html.match(/class="image-result"/g) ?? []).length, 3);
    assert.match(html, /\/brand\/wally/);
    assert.match(html, /image-search-preview/);
    for (const part of ['film-top', 'film-sidebar', 'film-chat', 'film-input', 'film-send']) assert.ok(html.includes(`class="${part}"`), `Same chat interface must include ${part}`);
    assert.doesNotMatch(html, /image-search-canvas|class="image-query"|image-search-action/);
    assert.doesNotMatch(html, /<form|<input|<textarea|iframe|synaiq-ai\.com/);
    if (scene === 'image-image') assert.match(html, /image-query-thumb/);
    if (locale === 'en') assert.doesNotMatch(html, /\p{Script=Han}/u);
  }
});

test('previous and next wrap safely over exactly the supported scenes', () => {
  assert.equal(demoSceneAt(0), 'knowledge');
  assert.equal(demoSceneAt(1), 'text-image');
  assert.equal(demoSceneAt(2), 'image-image');
  assert.equal(demoSceneAt(3), 'knowledge');
  assert.equal(demoSceneAt(-1), 'image-image');
});

test('chapter labels and numbers have independent searchable controls', () => {
  const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');
  assert.match(css, /01 用自然語言提問/);
  for (const name of ['--demo-step-font', '--demo-step-size', '--demo-step-color', '--demo-step-active-color', '--demo-step-number-font', '--demo-step-number-size']) assert.ok(css.includes(`${name}:`), name);
  assert.ok(hasDeclaration('tokens.css', '.demo-chapters', 'font-size', 'var(--demo-step-size)'));
  assert.ok(hasDeclaration('tokens.css', '.demo-chapters li > span', 'font-size', 'var(--demo-step-number-size)'));
});
