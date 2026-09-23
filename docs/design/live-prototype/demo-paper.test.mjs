import test from 'node:test';
import assert from 'node:assert/strict';
import { renderDemoFilm } from './demo-animation.js';
import { getMessages } from './i18n.js';
import { PUBLIC_FILES } from './share-preview.mjs';

test('approved paper shell and send pen are shared by all scenes and languages', () => {
  for (const locale of ['zh-Hant', 'en']) for (const scene of ['knowledge', 'text-image', 'image-image']) {
    const html = renderDemoFilm(scene, getMessages(locale));
    assert.match(html, /class="film-wordmark"/);
    assert.match(html, /assets\/synaiq-logo-ink.svg/);
    assert.match(html, /assets\/demo-sidebar-dialogues.webp/);
    assert.match(html, /assets\/demo-send-pen.webp/);
    assert.match(html, /data-demo-sidebar-toggle/);
    assert.match(html, /class="film-send"><span>(寄出|Send)<\/span>/);
    assert.doesNotMatch(html, /送出|Send ↑|sample-|data:image|<form|<input|<textarea/);
    if (locale === 'en') assert.doesNotMatch(html, /\p{Script=Han}/u);
  }
});

test('only knowledge citations use the ruled notebook with matching localized annotation', () => {
  for (const locale of ['zh-Hant', 'en']) {
    const html = renderDemoFilm('knowledge', getMessages(locale));
    assert.match(html, /class="film-source film-note"/);
    assert.match(html, /class="film-note-body"/);
    assert.match(html, /data-demo-source-close/);
    assert.match(html, /先核准，再採購|Approval before purchase/);
    for (const scene of ['text-image', 'image-image']) assert.doesNotMatch(renderDemoFilm(scene, getMessages(locale)), /film-note-body/);
  }
});

test('approved artwork is allowlisted without exposing the standalone design mockup', () => {
  for (const file of ['assets/kip-wordmark.png', 'assets/demo-sidebar-dialogues.webp', 'assets/demo-send-pen.webp']) {
    assert.ok(PUBLIC_FILES.some(entry => entry.file === file), file);
  }
  assert.ok(PUBLIC_FILES.every(entry => !/sample-v4|\.md$|\.test\.|\.env/.test(entry.file)));
});
