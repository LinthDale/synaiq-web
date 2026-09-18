import test from 'node:test';
import assert from 'node:assert/strict';
import { renderAbout } from './about-design.js';
import { getMessages } from './i18n.js';

for (const locale of ['zh-Hant', 'en']) {
  test(`${locale}: public titles never use the local preview name`, () => {
    const titles = getMessages(locale).common.title;
    for (const title of Object.values(titles)) assert.doesNotMatch(title, /設計原型|prototype|live design/i);
  });
  test(`${locale}: About shows seven static color portraits and restores Daniel`, () => {
    const markup = renderAbout({ locale, contact: () => '' });
    assert.equal((markup.match(/class="team-profile"/g) || []).length, 7);
    assert.equal((markup.match(/class="team-photo"/g) || []).length, 7);
    assert.match(markup, /Daniel Shih/);
    assert.match(markup, /\/brand\/team\/daniel-web-1\.jpg/);
    assert.doesNotMatch(markup, /Celestine|celestine|data-ink|<button|<mask|sketch\.webp/);
    assert.match(markup, /viewBox="310 76 435 435"/);
    assert.match(markup, /dale-tuxedo-kitten-photo\.webp/);
  });
}
