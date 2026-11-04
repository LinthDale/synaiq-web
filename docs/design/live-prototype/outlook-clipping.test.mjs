import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderHome } from './home-design.js';
import { getMessages, escapeHtml } from './i18n.js';
import { PUBLIC_FILES } from './share-preview.mjs';
import { hasDeclaration } from './css-test-helpers.mjs';

const sourceUrl = 'https://www.investing.com/news/stock-market-news/cio-survey-a-massive-boon-for-microsoft--jp-morgan-3502358';

test('annual growth emphasis has editable sizes at every breakpoint', async () => {
  const css = await readFile(new URL('tokens.css', import.meta.url), 'utf8');
  assert.ok(hasDeclaration('tokens.css', '.budget-value', 'font-size', 'var(--outlook-growth-size)'));
  for (const name of ['--outlook-growth-size']) {
    assert.equal((css.match(new RegExp(`${name}:`, 'g')) ?? []).length, 3);
    for (const width of [899, 639]) {
      const blocks = [...css.matchAll(new RegExp(`@media \\(max-width: ${width}px\\)[^{]*\\{[\\s\\S]*?\\n\\}`, 'g'))];
      assert.ok(blocks.some(([block]) => block.includes(`${name}:`)), `${name} needs its ${width}px control`);
    }
  }
  assert.ok(!css.includes('--outlook-number-size'));
});

test('annual growth keeps localized source context without a decorative arrow', () => {
  for (const locale of ['zh-Hant', 'en', 'de']) {
    const messages = getMessages(locale);
    const html = renderHome({ locale, messages, advantageSection: () => '', contact: () => '' });
    assert.doesNotMatch(html, /class="budget-arrow"/);
    assert.ok(html.includes(escapeHtml(messages.home.outlook.chartLabel)));
    const rate = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(((14.5 / 5) ** (1 / 3) - 1) * 100);
    assert.ok(html.includes(`+${rate}<small>%</small>`));
    for (const key of ['growthLabel', 'perYear', 'growthBasis', 'details']) {
      assert.ok(html.includes(escapeHtml(messages.home.outlook[key])));
    }
  }
  assert.ok(hasDeclaration('tokens.css', ':root', '--outlook-growth-font', 'var(--body)'));
  assert.ok(hasDeclaration('tokens.css', '.budget-value', 'font-family', 'var(--outlook-growth-font)'));
});

test('both Home languages keep the enlarged clipping free of captions, with survey caveats inside the disclosure', () => {
  for (const locale of ['zh-Hant', 'en']) {
    const messages = getMessages(locale);
    const html = renderHome({ locale, messages, advantageSection: () => '', contact: () => '' });
    const context = html.match(/<div class="outlook-context">([\s\S]*?)<details class="outlook-details">/)?.[1];
    assert.ok(context);
    const details = html.match(/<details class="outlook-details">([\s\S]*?)<\/details>/)?.[1];
    assert.ok(details);
    for (const key of ['respondents', 'spending', 'caveat']) {
      assert.ok(!context.includes(escapeHtml(messages.home.outlook[key])));
      assert.ok(details.includes(escapeHtml(messages.home.outlook[key])));
    }
    assert.doesNotMatch(context, /figcaption|outlook-evidence/);
    assert.match(context, /class="outlook-clipping"/);
    assert.match(context, /class="outlook-clipping-image"[^>]*src="assets\/investing-cio-20240629.png"/);
    assert.match(context, /width="905" height="577"/);
    assert.ok(context.includes(`href="${sourceUrl}"`));
    assert.match(context, /target="_blank" rel="noopener noreferrer"/);
    assert.ok(context.includes(escapeHtml(messages.home.outlook.clippingLabel)));
    assert.ok(context.includes(escapeHtml(messages.home.outlook.clippingAlt)));
  }
});

test('two localized article paragraphs fill the space beside the clipping and retain the survey date and counterpoint', () => {
  for (const locale of ['zh-Hant', 'en']) {
    const messages = structuredClone(getMessages(locale));
    const paragraphs = messages.home.outlook.reading;
    assert.equal(paragraphs?.length, 2);
    assert.match(paragraphs.join(' '), /2024/);
    assert.match(paragraphs.join(' '), /33%/);
    assert.match(paragraphs.join(' '), /62%/);
    const html = renderHome({ locale, messages, advantageSection: () => '', contact: () => '' });
    const reading = html.match(/<div class="outlook-reading">([\s\S]*?)<\/div>/)?.[1];
    assert.ok(reading);
    assert.equal((reading.match(/<p>/g) ?? []).length, 2);
    for (const paragraph of paragraphs) assert.ok(reading.includes(escapeHtml(paragraph)));
    assert.ok(html.indexOf('class="outlook-reading"') < html.indexOf('class="outlook-clipping"'));
    messages.home.outlook.reading = ['<script>bad</script>', 'A & B'];
    const escaped = renderHome({ locale, messages, advantageSection: () => '', contact: () => '' });
    assert.match(escaped, /&lt;script&gt;bad&lt;\/script&gt;/);
    assert.match(escaped, /A &amp; B/);
    assert.doesNotMatch(escaped, /<script>bad/);
  }
  assert.ok(hasDeclaration('tokens.css', '.outlook-reading', 'font-size', 'var(--outlook-reading-size)'));
  assert.ok(hasDeclaration('tokens.css', '.outlook-reading', 'color', 'var(--outlook-reading-color)'));
  assert.ok(hasDeclaration('site.css', '.outlook-context', 'grid-template-columns', 'minmax(0, 1fr)', '(max-width: 899px)'));
  assert.ok(hasDeclaration('site.css', '.outlook-clipping', 'min-width', '0'));
});

test('the clipping keeps the screenshot separate from its original illustrated frame', async () => {
  const css = await readFile(new URL('site.css', import.meta.url), 'utf8');
  assert.match(css, /assets\/news-sketch-frame-v2\.webp/);
  assert.ok(hasDeclaration('site.css', '.outlook-clipping-image', 'height', 'auto'));
  assert.ok(hasDeclaration('site.css', '.outlook-clipping', 'max-width', 'calc(100% - 48px)'));
  assert.ok(hasDeclaration('site.css', '.outlook-clipping', 'transform', 'rotate(var(--outlook-clipping-tilt))'));
  assert.ok(hasDeclaration('site.css', '.outlook-context', 'border', '0'));
  assert.ok(hasDeclaration('tokens.css', ':root', '--outlook-clipping-width', '500px'));
  for (const asset of ['assets/investing-cio-20240629.png', 'assets/news-sketch-frame-v2.webp']) {
    assert.ok(PUBLIC_FILES.some(entry => entry.file === asset), `Asset must be explicitly allowlisted: ${asset}`);
    assert.ok((await readFile(new URL(asset, import.meta.url))).byteLength > 1000);
  }
});

test('clipping accessibility copy is escaped and does not introduce executable markup', () => {
  const messages = structuredClone(getMessages('en'));
  messages.home.outlook.clippingLabel = '" onclick="alert(1)';
  messages.home.outlook.clippingAlt = '<img src=x onerror=alert(1)>';
  const html = renderHome({ locale: 'en', messages, advantageSection: () => '', contact: () => '' });
  assert.match(html, /&quot; onclick=&quot;alert\(1\)/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(html, /<script>bad|alt="<img/);
});
