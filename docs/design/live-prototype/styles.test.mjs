import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { PUBLIC_FILES } from './share-preview.mjs';
import { hasDeclaration } from './css-test-helpers.mjs';
import { renderHome } from './home-design.js';
import postcss from 'postcss';

test('no website typography declarations can be left outside tokens.css', async () => {
  const typeProperty = /^(?:font(?:-.+)?|-webkit-font-smoothing|line-height|letter-spacing|word-spacing|color|text-transform|text-shadow|text-decoration(?:-.+)?|text-underline-offset)$/;
  const misplaced = [];
  postcss.parse(await read('site.css')).walkDecls(decl => {
    if (typeProperty.test(decl.prop)) misplaced.push(`${decl.source.start.line}: ${decl.prop}`);
  });
  assert.deepEqual(misplaced, [], 'Every text declaration, including responsive and demo rules, belongs in tokens.css');
  for (const { file } of PUBLIC_FILES.filter(item => item.file === 'page.html' || item.file.endsWith('.js'))) {
    const source = await read(file);
    assert.doesNotMatch(source, /<style[\s>]/i, `${file}: inline stylesheets bypass tokens.css`);
    for (const match of source.matchAll(/style=["']([^"']*)["']/g)) {
      for (const declaration of match[1].split(';')) {
        assert.equal(typeProperty.test(declaration.split(':')[0].trim()), false, `${file}: inline typography`);
      }
    }
    assert.doesNotMatch(source, /\.style\.(?:font\w*|color|lineHeight|letterSpacing|wordSpacing|textDecoration\w*|textShadow|textTransform)\s*=/, `${file}: runtime typography must not bypass tokens.css`);
    for (const match of source.matchAll(/\.style\.setProperty\(\s*['"]([^'"]+)['"]/g)) {
      assert.equal(typeProperty.test(match[1]), false, `${file}: runtime typography property ${match[1]}`);
    }
  }
  const tokens = await read('tokens.css');
  for (const selector of ['.language', '.site-header .menu', '.slot-caption', '.handwritten-note', '.film-breadcrumb', '.film-answer small', '.film-library h4', '.kip-scene-note']) {
    assert.ok(tokens.includes(selector), `Missing text category: ${selector}`);
  }
});

test('only the knowledge-hub phrase is marked in the Home title', () => {
  const home = renderHome({ advantageSection: () => '', contact: () => '' });
  const title = home.match(/<h1>(.*?)<\/h1>/s)[1];
  assert.match(title, /class="title-phrase">變成隨問隨答的<\/span>/);
  assert.match(title, /class="title-phrase title-knowledge">知識中樞<\/span>/);
  assert.equal((title.match(/title-knowledge/g) ?? []).length, 1);
  assert.ok(hasDeclaration('tokens.css', '.home-opening h1 .title-knowledge', 'text-decoration-line', 'underline'));
  assert.ok(hasDeclaration('tokens.css', '.home-opening h1 .title-knowledge', 'text-underline-offset', 'var(--hero-underline-offset)'));
  const english = renderHome({ advantageSection: () => '', contact: () => '', locale: 'en' });
  assert.equal(english.includes('title-knowledge'), false);
});

test('main text in every Home and KIP section has a named size setting', async () => {
  const tokens = await read('tokens.css');
  const typography = await read('tokens.css');
  for (const prefix of ['narrative-pretitle', 'narrative-title', 'narrative-lead', 'narrative-body', 'product-title', 'showcase-title', 'showcase-body', 'wally-title', 'wally-body', 'persona-title', 'persona-body', 'advantages-summary', 'contact-title', 'contact-body', 'footer-body', 'kip-process-title', 'kip-step-title', 'kip-step-body', 'kip-architecture-title', 'kip-layer-title', 'kip-layer-body', 'kip-proof-title', 'kip-proof-body', 'kip-capabilities-title', 'kip-capability-title', 'kip-capability-body']) {
    assert.ok(tokens.includes(`--${prefix}-size:`), `Missing ${prefix}`);
    assert.ok(typography.includes(`var(--${prefix}-size)`), `Unused ${prefix}`);
  }
});

const read = name => readFile(new URL(name, import.meta.url), 'utf8');

test('the Contents label has its own searchable setting, separate from menu links', async () => {
  const tokens = await read('tokens.css');
  assert.ok(tokens.includes('首頁內容／KIP 平台內容'));
  assert.ok(tokens.includes('--nav-context-label-size:'));
  assert.ok(hasDeclaration('tokens.css', '.page-context-label', 'font-size', 'var(--nav-context-label-size)'));
});

test('Home emphasizes only K I P without changing the eyebrow text in either language', async () => {
  for (const locale of ['zh-Hant', 'en']) {
    const html = renderHome({ locale, advantageSection: () => '', contact: () => '' });
    const label = html.match(/<p class="eyebrow">(.*?)<\/p>/s)[1];
    assert.equal(label.replace(/<[^>]+>/g, ''), 'KNOWLEDGE INTELLIGENCE PLATFORM');
    assert.deepEqual([...label.matchAll(/<span class="eyebrow-initial">(.*?)<\/span>/g)].map(match => match[1]), ['K', 'I', 'P']);
  }
  assert.ok(hasDeclaration('tokens.css', '.home-opening .eyebrow-initial', 'font-size', 'calc(1em + var(--hero-eyebrow-initial-increase))'));
  assert.ok(hasDeclaration('tokens.css', '.home-opening .eyebrow-initial', 'color', 'var(--hero-eyebrow-initial-color)'));
  assert.ok((await read('tokens.css')).includes('--hero-eyebrow-initial-increase:'));
  assert.ok(hasDeclaration('tokens.css', ':root', '--hero-eyebrow-initial-color', '#cca858'));
});

test('visible Banner text has independent font controls, including its English eyebrow', async () => {
  const tokens = await read('tokens.css');
  for (const text of ['KNOWLEDGE INTELLIGENCE PLATFORM', '散落的企業文件', '從一個問題開始', 'AI 正在改變', '邱浩煒 Wilson', '八項核心優勢']) {
    assert.ok(tokens.includes(text), `Settings must be searchable by visible copy: ${text}`);
  }
  for (const [selector, prefix] of [
    ['.home-opening .eyebrow', 'hero-eyebrow'],
    ['.home-opening h1', 'hero-title'],
    ['.home-opening .intro', 'hero-intro'],
    ['body[data-page="kip"] .kip-opening .eyebrow', 'kip-eyebrow'],
  ]) {
    for (const [property, suffix] of [['font-family', 'font'], ['font-size', 'size'], ['font-weight', 'weight'], ['color', 'color']]) {
      const name = `--${prefix}-${suffix}`;
      assert.ok(tokens.includes(`${name}:`), `Missing ${name}`);
      assert.ok(hasDeclaration('tokens.css', selector, property, `var(${name})`), `Unused ${name}`);
    }
  }
  assert.ok(hasDeclaration('tokens.css', '.home-opening .eyebrow', 'letter-spacing', 'var(--hero-eyebrow-tracking)'));
  assert.ok(hasDeclaration('tokens.css', ':root', '--hero-eyebrow-size', '9px', '(max-width: 639px)'));
  assert.ok(hasDeclaration('tokens.css', ':root', '--hero-eyebrow-tracking', '0.02em', '(max-width: 639px)'));
});

test('the live website has exactly two CSS files and one settings import', async () => {
  const page = await read('page.html');
  assert.match(page, /href="site\.css"/);
  const entry = await read('site.css');
  const imports = [...entry.matchAll(/@import url\("([^"]+)"\)/g)].map(match => match[1]);
  assert.deepEqual(imports, ['tokens.css']);
  const files = (await readdir(new URL('.', import.meta.url))).filter(name => name.endsWith('.css')).sort();
  assert.deepEqual(files, ['site.css', 'tokens.css']);
  assert.deepEqual(PUBLIC_FILES.filter(item => item.file.endsWith('.css')).map(item => item.file).sort(), files);
  for (const file of imports) {
    const css = await read(file);
    assert.ok(css.split('\n').length > 10, `${file} must be readable, not a minified source`);
  }
});

test('the permanent soft edge covers the About portraits from one shared gradient', async () => {
  // Regression guard: the About page once lost this edge by moving off renderInkPhoto.
  const softEdge = 'radial-gradient(ellipse at 50% 45%, black 38%, #000e 52%, #0006 65%, transparent 77%)';
  for (const selector of ['.team-photo', '.ink-photo__canvas:not(.ink-photo__canvas--companion)']) {
    assert.ok(hasDeclaration('site.css', selector, 'mask-image', softEdge), `${selector} lost the soft edge`);
  }
  const css = await read('site.css');
  assert.equal((css.match(/ellipse at 50% 45%, black 38%/g) ?? []).length, 1, 'The gradient keeps a single source of truth');
});

test('everyday typography and colour settings have a central editing point', async () => {
  const tokens = await read('tokens.css');
  for (const name of ['--display', '--body', '--ink', '--muted', '--hero-title-size', '--hero-intro-size', '--outlook-title-size', '--outlook-body-size', '--outlook-detail-size', '--outlook-surface', '--nav-text-size']) {
    assert.ok(tokens.includes(`${name}:`), `Missing ${name}`);
  }
  const typography = await read('tokens.css');
  for (const name of ['hero-title-size', 'nav-text-size', 'ceo-quote-size', 'advantages-detail-size', 'kip-title-size', 'kip-intro-size']) {
    assert.ok(tokens.includes(`--${name}:`), `Missing setting ${name}`);
    assert.ok(typography.includes(`font-size: var(--${name})`), `Unused setting ${name}`);
  }
  assert.match(tokens, /--ceo-quote-size:\s*clamp\(27px, 7\.3vw, 33px\)/);
  assert.match(tokens, /html:lang\(en\) body\[data-page="kip"\][\s\S]*--kip-title-size:\s*clamp\(34px, 5\.3vw, 76px\)/);
});
