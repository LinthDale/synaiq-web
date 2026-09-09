import test from 'node:test';
import assert from 'node:assert/strict';
import { renderHome } from './home-design.js';
import { zhHant, en } from './locale-home.js';
import { getMessages, escapeHtml } from './i18n.js';

const render = (locale, messages = getMessages(locale)) => renderHome({
  locale, messages, advantageSection: () => '<section data-shared-advantages></section>',
  contact: () => '<section data-shared-contact></section>',
});

function paths(value, prefix = '') {
  if (typeof value === 'string') return [prefix];
  return Object.entries(value).flatMap(([key, item]) => paths(item, `${prefix}.${key}`));
}

test('Home language catalogs have matching semantic keys and plain-text values', () => {
  assert.deepEqual(paths(en), paths(zhHant));
  for (const catalog of [en, zhHant]) {
    const visit = value => {
      if (typeof value === 'string') {
        assert.doesNotMatch(value, /<\/?[a-z][^>]*>/i);
        return;
      }
      for (const item of Object.values(value)) visit(item);
    };
    visit(catalog);
  }
});

test('English Home translates visible copy, labels and product illustration source', () => {
  const html = render('en');
  assert.match(html, /Scattered company documents</);
  assert.match(html, /assets\/kip-search-demo-en\.svg/);
  assert.match(html, /166 CIOs/);
  assert.match(html, /not realized results/);
  assert.match(html, /邱浩煒 Wilson/);
  assert.doesNotMatch(html.replaceAll('邱浩煒', ''), /[\p{Script=Han}]/u);
  assert.match(html, /data-shared-advantages/);
  assert.match(html, /data-shared-contact/);
});

test('English Home keeps the language when opening KIP', () => {
  const html = render('en');
  assert.equal((html.match(/href="\?page=kip&amp;lang=en(?:#[^"]*)?"/g) || []).length, 2);
  assert.doesNotMatch(html, /href="\?page=kip"/);
});

test('English retains spaces when responsive paragraph line breaks are hidden', () => {
  const html = render('en');
  const paragraph = html.match(/<div class="showcase-heading">[\s\S]*?<p>([\s\S]*?)<\/p>/)?.[1];
  assert.ok(paragraph);
  const mobileText = paragraph.replace(/<br>/g, '');
  assert.match(mobileText, /parsing\. From the question/);
});

test('Home escapes translated content instead of treating catalogs as HTML', () => {
  const messages = structuredClone(getMessages('en'));
  messages.home.hero.title[0] = '<img src=x onerror=alert(1)>';
  messages.home.hero.artAlt = '" onerror="alert(1)';
  const html = render('en', messages);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(html, /<img src=x|alt="" onerror=/);
});

test('a different translated eyebrow remains plain escaped copy without KIP styling', () => {
  const messages = structuredClone(getMessages('en'));
  messages.home.hero.eyebrow = '<img src=x onerror=alert(1)>';
  const label = render('en', messages).match(/<p class="eyebrow">(.*?)<\/p>/s)[1];
  assert.equal(label, '&lt;img src=x onerror=alert(1)&gt;');
  assert.doesNotMatch(label, /eyebrow-initial|<img/);
});

test('Chinese Home remains the default and renders the current catalog quote exactly', () => {
  const html = renderHome({ advantageSection: () => '', contact: () => '' });
  const quote = html.match(/<blockquote>([\s\S]*?)<\/blockquote>/)?.[1].replace(/<[^>]*>/g, '');
  assert.equal(quote, zhHant.ceo.quote.flat().map(escapeHtml).join(''));
  assert.match(html, /src="assets\/kip-search-demo\.svg"/);
});

test('the English CEO quote renders both catalog paragraphs and escapes edited copy', () => {
  const html = render('en');
  const quote = html.match(/<blockquote>([\s\S]*?)<\/blockquote>/)?.[1];
  const paragraphs = [...quote.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(match => match[1].replace(/<[^>]*>/g, ''));
  assert.equal(en.ceo.quote.length, 2);
  assert.ok(en.ceo.quote.every(parts => parts.length === 2 && parts.every(part => typeof part === 'string')));
  assert.deepEqual(paragraphs, en.ceo.quote.map(parts => parts.map(escapeHtml).join('')));
  assert.match(html, /邱浩煒 Wilson/);
  assert.doesNotMatch(html, /邱浩偉/);
  const messages = structuredClone(getMessages('en'));
  assert.doesNotMatch(quote, /undefined/);
  messages.home.ceo.quote[1][0] = '<script>bad</script>';
  messages.home.ceo.quote[0][1] = 'Updated & emphasized';
  const edited = render('en', messages);
  assert.match(edited, /&lt;script&gt;bad&lt;\/script&gt;/);
  assert.match(edited, /class="quote-phrase">Updated &amp; emphasized<\/span>/);
  assert.doesNotMatch(edited, /<script>bad/);
});
