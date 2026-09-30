import test from 'node:test';
import assert from 'node:assert/strict';
import { renderEms, renderPvsim } from './energy-design.js';
import { getMessages } from './i18n.js';

for (const [product, render, destination] of [
  ['ems', renderEms, 'https://synaiq-ai.com/ems/#Monitor'],
  ['pvsim', renderPvsim, 'https://synaiq-ai.com/solar/'],
]) for (const locale of ['zh-Hant', 'en']) {
  test(`${product}/${locale} has a story, workflow, capabilities and an explicitly illustrative demo`, () => {
    const messages = getMessages(locale), m = messages[product];
    const html = render({ locale, messages });
    for (const id of ['story', 'process', 'capabilities', 'proof', 'contact']) assert.ok(html.includes(`id="${id}"`));
    assert.equal((html.match(/<h1 /g) ?? []).length, 1);
    assert.equal((html.match(/data-energy-step=/g) ?? []).length, 6);
    assert.equal((html.match(/aria-pressed="true"/g) ?? []).length, 2);
    assert.equal((html.match(/data-product-screen=/g) ?? []).length, product === 'ems' ? 3 : 4);
    assert.ok(html.includes(m.screens.note));
    assert.ok(html.includes('class="product-screen-open"'));
    assert.ok(html.includes('data-screen-enlarge'));
    assert.ok(html.includes(m.demoNote));
    assert.ok(html.includes(m.status));
    assert.ok(html.indexOf(destination) > html.indexOf('id="proof"'));
    assert.ok(html.includes(`href="${destination}" target="_blank" rel="noopener noreferrer"`));
    assert.ok(html.includes('mailto:service@taistro.com.tw'));
    assert.doesNotMatch(html, /<iframe|<form|\son[a-z]+=/);
    if (locale === 'en') assert.doesNotMatch(html, /[\p{Script=Han}]/u);
  });
}

test('editorial product copy is escaped when rendered', () => {
  const messages = structuredClone(getMessages());
  messages.ems.story[0] = '<img src=x onerror=alert(1)>';
  const html = renderEms({ messages });
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.doesNotMatch(html, /<img src=x/);
});
