// Verify complete authored-text ownership, then exercise the named controls.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import postcss from 'postcss';
import { chromium } from 'playwright';
import { createPreviewServer } from '../docs/design/live-prototype/share-preview.mjs';
import { SUPPORTED_PAGES, pageHref } from '../docs/design/live-prototype/i18n.js';
import { caseIds } from '../docs/design/live-prototype/cases-data.js';

const directory = 'docs/design/live-prototype/';
const tokens = postcss.parse(readFileSync(`${directory}tokens.css`, 'utf8'));
const css = tokens;
const suffixes = { size: ['font-size', '21px'], font: ['font-family', 'monospace'], weight: ['font-weight', '500'], color: ['color', 'rgb(191, 33, 57)'], leading: ['line-height', '31px'], tracking: ['letter-spacing', '3px'], thickness: ['text-decoration-thickness', '3px'], offset: ['text-underline-offset', '5px'] };
const definitions = new Map();
tokens.walkDecls(decl => {
  const suffix = decl.prop.split('-').at(-1);
  // Keep the base scope: a later English-only override must not exclude Chinese KIP.
  if (decl.prop.startsWith('--') && suffixes[suffix] && !decl.prop.startsWith('--heading-') && !definitions.has(decl.prop)) definitions.set(decl.prop, { name: decl.prop, scope: decl.parent.selector, property: decl.prop === '--hero-underline-color' ? 'text-decoration-color' : suffixes[suffix][0], value: suffixes[suffix][1], rules: [] });
});
css.walkRules(rule => {
  const media = [];
  for (let parent = rule.parent; parent; parent = parent.parent) if (parent.type === 'atrule' && parent.name === 'media') media.push(parent.params);
  rule.walkDecls(decl => {
    if (!['font', 'font-size', 'font-family', 'font-weight', 'color', 'text-decoration-color', 'line-height', 'letter-spacing', 'text-decoration-thickness', 'text-underline-offset'].includes(decl.prop)) return;
    for (const match of decl.value.matchAll(/var\((--[a-z0-9-]+)\)/g)) {
      const definition = definitions.get(match[1]);
      if (definition && (decl.prop === definition.property || decl.prop === 'font')) definition.rules.push({ selector: rule.selector, media });
    }
  });
});
for (const definition of definitions.values()) assert.ok(definition.rules.length, `Unused setting: ${definition.name}`);

const output = resolve(process.argv.find(arg => arg.startsWith('--output='))?.slice(9) ?? 'out/typography-controls-20260909/audit');
// These variants deliberately override their parent setting. Exercise their
// dedicated control separately instead of treating the parent override as broken.
const overrides = {
  '--button-text-size': '.button.small',
  '--persona-body-size': '.persona-context .note',
  '--editorial-title-size': '.about-title',
};
await mkdir(output, { recursive: true });
const server = createPreviewServer();
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const report = { status: 'running', settings: definitions.size, cases: [], errors: [] };
let browser;
try {
  browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}) });
  report.browser = browser.version();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  page.on('pageerror', error => report.errors.push(error.message));
  const pages = SUPPORTED_PAGES.flatMap(name => [
    { name, caseId: null },
    ...(name === 'cases' ? caseIds().map(caseId => ({ name, caseId })) : []),
  ]);
  for (const { name, caseId } of pages) for (const language of ['zh-Hant', 'en']) {
    await page.goto(`${origin}/live-prototype/page.html${pageHref({ page: name, caseId, locale: language })}`, { waitUntil: 'networkidle' });
    await page.locator('main h1').waitFor();
    await page.evaluate(() => document.fonts.ready);
    const scenes = await page.locator('[data-demo-select]').evaluateAll(buttons => buttons.map(button => button.dataset.demoSelect));
    for (const scene of scenes.length ? scenes : [null]) for (const width of [320, 359, 360, 390, 639, 640, 699, 700, 768, 899, 900, 999, 1000, 1100, 1101, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      if (scene) {
        await page.locator(`[data-demo-select="${scene}"]`).click();
        await page.waitForFunction(value => document.querySelector('[data-demo-animation]').dataset.demoScene === value, scene);
      }
      const result = await page.evaluate(({ definitions, overrides }) => {
        document.querySelectorAll('details').forEach(el => { el.open = true; });
        // Inventory every text-bearing DOM element, including collapsed/demo
        // content. UA defaults and text embedded in images are not author CSS.
        const textProperty = /^(?:font(?:-.+)?|-webkit-font-smoothing|line-height|letter-spacing|word-spacing|color|text-transform|text-shadow|text-decoration(?:-.+)?|text-underline-offset)$/;
        const authored = [];
        const unexpectedSheets = [];
        function collectRules(rules, href) {
          for (const rule of rules) {
            if (rule.type === CSSRule.IMPORT_RULE) {
              if (!rule.media.length || matchMedia(rule.media.mediaText).matches) collectRules(rule.styleSheet.cssRules, new URL(rule.href, href || document.baseURI).href);
            } else if (rule.type === CSSRule.STYLE_RULE) {
              const properties = [...rule.style].filter(property => textProperty.test(property));
              if (properties.length) authored.push({ selector: rule.selectorText, properties, href });
            } else if (rule.cssRules) {
              if (rule.type === CSSRule.MEDIA_RULE && !matchMedia(rule.conditionText).matches) continue;
              if (rule.type === CSSRule.SUPPORTS_RULE && !CSS.supports(rule.conditionText)) continue;
              collectRules(rule.cssRules, href);
            }
          }
        }
        for (const sheet of document.styleSheets) {
          // Google Fonts only supplies @font-face, not website element styles.
          if (sheet.href && new URL(sheet.href).origin !== location.origin) {
            if (new URL(sheet.href).hostname !== 'fonts.googleapis.com') unexpectedSheets.push(sheet.href);
            continue;
          }
          collectRules(sheet.cssRules, sheet.href ?? 'inline stylesheet');
        }
        const misplaced = authored.filter(rule => !rule.href.endsWith('/tokens.css'));
        const elements = [document.documentElement, document.body, ...document.body.querySelectorAll('*')];
        const inline = elements.flatMap(el => [...el.style].filter(property => textProperty.test(property)).map(property => ({ element: `${el.tagName}.${el.className}`, property })));
        const textElements = elements.filter(el => !['SCRIPT', 'STYLE'].includes(el.tagName) && [...el.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()));
        const textInventory = textElements.map(el => {
          const style = getComputedStyle(el);
          return { element: `${el.tagName}.${el.className}`, text: el.textContent.trim().slice(0, 100), font: style.fontFamily, size: style.fontSize, weight: style.fontWeight, leading: style.lineHeight, color: style.color };
        });
        // Independently walk all text nodes: page length is not evidence that the
        // inventory is complete, especially for an overview with only a few cases.
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const textParents = new Set();
        while (walker.nextNode()) {
          const node = walker.currentNode;
          if (node.textContent.trim() && !['SCRIPT', 'STYLE'].includes(node.parentElement?.tagName)) textParents.add(node.parentElement);
        }
        const ownership = {
          authoredRules: authored.length, textElements: textElements.length,
          completeTextInventory: textParents.size === textElements.length && textElements.every(element => textParents.has(element)),
          misplaced, inline, unexpectedSheets,
        };
        const failures = [];
        const checked = [];
        const overflow = document.documentElement.scrollWidth > innerWidth;
        for (const definition of definitions) {
          const scope = document.querySelector(definition.scope);
          if (!scope) continue;
          const elements = [...new Set(definition.rules.filter(rule => rule.media.every(query => matchMedia(query).matches)).flatMap(rule => [...document.querySelectorAll(rule.selector)]))].filter(el => !overrides[definition.name] || !el.matches(overrides[definition.name]));
          if (!elements.length) continue;
          const saved = scope.getAttribute('style');
          try {
            scope.style.setProperty(definition.name, definition.value);
            for (const el of elements) {
              const actual = getComputedStyle(el).getPropertyValue(definition.property);
              if (actual !== definition.value) failures.push({ token: definition.name, element: `${el.tagName}.${el.className}`, actual, expected: definition.value });
            }
            checked.push(definition.name);
          } finally {
            if (saved === null) scope.removeAttribute('style'); else scope.setAttribute('style', saved);
          }
        }
        const phrase = document.querySelector('.title-knowledge');
        let underline = null;
        if (phrase) {
          const text = phrase.textContent;
          const other = phrase.previousElementSibling;
          const before = phrase.getBoundingClientRect().toJSON();
          const decorated = getComputedStyle(phrase).textDecorationLine;
          const firstDecoration = getComputedStyle(other).textDecorationLine;
          const original = phrase.getAttribute('style');
          phrase.style.textDecorationLine = 'none';
          const after = phrase.getBoundingClientRect().toJSON();
          if (original === null) phrase.removeAttribute('style'); else phrase.setAttribute('style', original);
          underline = { text, other: other.textContent, decorated, firstDecoration, stableGeometry: JSON.stringify(before) === JSON.stringify(after) };
        }
        const eyebrow = document.querySelector('.home-opening .eyebrow');
        let eyebrowInitials = null;
        if (eyebrow) {
          const initials = [...eyebrow.querySelectorAll('.eyebrow-initial')];
          const base = parseFloat(getComputedStyle(eyebrow).fontSize);
          const configuredIncrease = parseFloat(getComputedStyle(eyebrow).getPropertyValue('--hero-eyebrow-initial-increase'));
          const probe = document.createElement('span');
          probe.style.color = getComputedStyle(eyebrow).getPropertyValue('--hero-eyebrow-initial-color');
          eyebrow.append(probe);
          const configuredColor = getComputedStyle(probe).color;
          probe.remove();
          const values = initials.map(el => ({ text: el.textContent, increase: parseFloat(getComputedStyle(el).fontSize) - base, color: getComputedStyle(el).color }));
          const scope = document.documentElement;
          const original = scope.getAttribute('style');
          let increaseControlWorks;
          try {
            const probeIncrease = configuredIncrease + 3;
            scope.style.setProperty('--hero-eyebrow-initial-increase', `${probeIncrease}px`);
            increaseControlWorks = initials.length === 3 && initials.every(el => Math.abs(parseFloat(getComputedStyle(el).fontSize) - base - probeIncrease) < 0.01);
          } finally {
            if (original === null) scope.removeAttribute('style'); else scope.setAttribute('style', original);
          }
          eyebrowInitials = { text: eyebrow.textContent, values, increaseControlWorks, configuredIncrease, configuredColor };
        }
        return { checked, failures, overflow, underline, eyebrowInitials, ownership, textInventory };
      }, { definitions: [...definitions.values()], overrides });
      report.cases.push({ name, caseId, language, scene, width, ...result });
      assert.deepEqual(result.ownership.misplaced, [], 'Authored typography found outside tokens.css');
      assert.deepEqual(result.ownership.inline, [], 'Inline typography bypasses the editing file');
      assert.deepEqual(result.ownership.unexpectedSheets, [], 'Unaudited external stylesheet');
      assert.ok(result.ownership.textElements > 0 && result.ownership.completeTextInventory, `Incomplete text inventory at ${name}/${caseId ?? 'overview'}/${language}/${width}`);
      assert.deepEqual(result.failures, [], `Inactive settings at ${name}/${language}/${scene}/${width}`);
      assert.equal(result.overflow, false, `Overflow at ${name}/${language}/${scene}/${width}`);
      if (name === 'home' && language === 'zh-Hant') assert.deepEqual(result.underline, { text: '知識中樞', other: '變成隨問隨答的', decorated: 'underline', firstDecoration: 'none', stableGeometry: true });
      else assert.equal(result.underline, null, 'Do not underline unrelated or translated copy');
      if (name === 'home') assert.deepEqual(result.eyebrowInitials, {
        text: 'KNOWLEDGE INTELLIGENCE PLATFORM',
        values: ['K', 'I', 'P'].map(text => ({ text, increase: result.eyebrowInitials.configuredIncrease, color: result.eyebrowInitials.configuredColor })),
        increaseControlWorks: true,
        configuredIncrease: result.eyebrowInitials.configuredIncrease,
        configuredColor: result.eyebrowInitials.configuredColor,
      });
      else assert.equal(result.eyebrowInitials, null);
    }
  }
  const checked = new Set(report.cases.flatMap(item => item.checked));
  for (const name of definitions.keys()) assert.ok(checked.has(name), `Setting was never exercised: ${name}`);
  assert.deepEqual(report.errors, []);
  report.status = 'passed';
} catch (error) {
  report.status = 'failed';
  report.failure = error.message;
  throw error;
} finally {
  await browser?.close();
  await new Promise(done => server.close(done));
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2));
}
console.log(`PASS: ${report.settings} text settings; ${report.cases.length} page/language/width cases. ${output}`);
