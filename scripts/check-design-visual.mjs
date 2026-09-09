// Compare the accepted design against a Git revision without serving repository files.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';
import postcss from 'postcss';
import { createPreviewServer } from '../docs/design/live-prototype/share-preview.mjs';

const option = (name, fallback) => process.argv.find(arg => arg.startsWith(`--${name}=`))?.split('=').slice(1).join('=') ?? fallback;
const before = option('before', 'cfe62f6');
const beforeDir = option('before-dir', '');
const mode = option('mode', 'all');
assert.ok(['all', 'visual', 'interactions'].includes(mode));
assert.match(before, /^[a-zA-Z0-9_./~-]+$/, 'Use a local Git revision, not a command option');
assert.ok(!before.startsWith('-'));
const directory = 'docs/design/live-prototype/';
const output = resolve(option('output', 'out/css-refactor-20260909'));
const widths = option('widths', '320,359,360,390,639,640,699,700,768,899,900,999,1000,1100,1101,1440,1920').split(',').map(Number);
assert.ok(widths.every(width => Number.isInteger(width) && width >= 320 && width <= 3840));
const screenshots = new Set([390, 768, 1440]);
const gitFile = file => {
  assert.match(file, /^[a-zA-Z0-9-]+\.(?:css|html)$/, 'Baseline files must be direct HTML/CSS children');
  return beforeDir ? readFileSync(resolve(beforeDir, file)) : execFileSync('git', ['show', `${before}:${directory}${file}`], { maxBuffer: 8 * 1024 * 1024 });
};
const baselineHtml = gitFile('page.html');
const baselineFiles = new Map([['page.html', baselineHtml]]);
for (const match of baselineHtml.toString().matchAll(/href="([^"]+\.css)"/g)) baselineFiles.set(match[1], gitFile(match[1]));
for (const [name, body] of baselineFiles) {
  if (!name.endsWith('.css')) continue;
  postcss.parse(body.toString()).walkAtRules('import', rule => {
    const match = rule.params.match(/^url\(["']([a-zA-Z0-9-]+\.css)["']\)$/);
    assert.ok(match, `Unsupported baseline import; refusing to use working-tree CSS: ${rule.params}`);
    if (!baselineFiles.has(match[1])) baselineFiles.set(match[1], gitFile(match[1]));
  });
}
await mkdir(output, { recursive: true });
const server = createPreviewServer();
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}) });
} catch (error) {
  await new Promise(done => server.close(done));
  throw error;
}
const report = { status: 'running', before: beforeDir ? resolve(beforeDir) : before, browser: browser.version(), widths, cases: [], interactions: [], errors: [] };
const externalCache = new Map();

async function newPage(baseline, motion = 'reduce') {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: motion });
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    const file = url.pathname.replace('/live-prototype/', '');
    if (baseline && baselineFiles.has(file)) {
      return route.fulfill({ body: baselineFiles.get(file), contentType: file.endsWith('.css') ? 'text/css' : 'text/html' });
    }
    if (url.origin !== origin) {
      // Reuse exactly the same font/image bytes on both sides of a comparison.
      if (!externalCache.has(url.href)) externalCache.set(url.href, (async () => {
        const response = await route.fetch();
        assert.ok(response.ok(), `External asset failed: ${url.href}`);
        return { body: await response.body(), contentType: response.headers()['content-type'], status: response.status() };
      })());
      return route.fulfill(await externalCache.get(url.href));
    }
    return route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) report.errors.push(`${response.status()} ${response.url()}`); });
  return page;
}

async function ready(page, name, language) {
  await page.goto(`${origin}/live-prototype/page.html?page=${name}&lang=${language}`, { waitUntil: 'networkidle' });
  await page.locator('main h1').waitFor();
  await page.evaluate(() => { document.querySelectorAll('img').forEach(img => { img.loading = 'eager'; img.decoding = 'sync'; }); });
  // Let lazy-loading request changes settle before calling decode().
  await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0));
  const imageErrors = await page.evaluate(async () => {
    // Do not force full-resolution decoding of all large product photos at once.
    // Check load success here; screenshots exercise Chromium's real scaled paint.
    for (const img of document.images) {
      if (img.naturalWidth * img.naturalHeight < 20_000_000) await img.decode();
    }
    await document.fonts.ready;
    window.scrollTo({ top: 0, behavior: 'instant' });
    return [...document.images].filter(img => !img.complete || !img.naturalWidth).map(img => new URL(img.src).pathname).sort();
  });
  page.imageErrors = imageErrors;
  await page.mouse.move(0, 0);
}

async function stableScreenshot(page) {
  let previous;
  for (let attempt = 0; attempt < 5; attempt++) {
    const current = await page.screenshot({ fullPage: true, animations: 'disabled' });
    if (previous?.equals(current)) return current;
    previous = current;
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  }
  throw new Error('Screenshot did not settle to two identical paints');
}

async function snapshot(page) {
  return page.evaluate(() => {
    const properties = ['display', 'position', 'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'color', 'background-color', 'background-image', 'padding', 'margin', 'gap', 'border', 'border-radius', 'box-shadow', 'transform', 'opacity', 'z-index', 'overflow', 'text-align', 'white-space', 'text-wrap', 'grid-template-columns', 'min-height', 'max-width', 'animation', 'transition', 'mask-image'];
    const styles = style => Object.fromEntries(properties.map(property => [property, style.getPropertyValue(property)]));
    const nodes = [...document.querySelectorAll('body, body *')].filter(el => !['SCRIPT', 'STYLE'].includes(el.tagName));
    return nodes.map(el => {
      const rect = el.getBoundingClientRect();
      return {
        tag: el.tagName, class: el.className.baseVal ?? el.className,
        rect: [rect.x, rect.y + scrollY, rect.width, rect.height].map(value => Math.round(value * 100) / 100),
        style: styles(getComputedStyle(el)),
        before: styles(getComputedStyle(el, '::before')),
        after: styles(getComputedStyle(el, '::after')),
      };
    });
  });
}

async function compare(name, language) {
  const oldPage = await newPage(true);
  const newPageView = await newPage(false);
  try {
    await ready(oldPage, name, language);
    await ready(newPageView, name, language);
    assert.deepEqual(newPageView.imageErrors, oldPage.imageErrors, 'No new image failures allowed');
    report.imageWarnings ??= {};
    report.imageWarnings[`${name}-${language}`] = oldPage.imageErrors;
    assert.equal(oldPage.imageErrors.length, 0, 'All reference images must load');
    for (const width of widths) {
      await oldPage.setViewportSize({ width, height: 900 });
      await newPageView.setViewportSize({ width, height: 900 });
      await oldPage.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await newPageView.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      for (const expanded of [false, true]) {
        for (const page of [oldPage, newPageView]) {
          await page.evaluate(open => { document.querySelectorAll('details').forEach(el => { el.open = open; }); window.scrollTo(0, 0); }, expanded);
        }
        const oldSnapshot = await snapshot(oldPage);
        const newSnapshot = await snapshot(newPageView);
        const differences = [];
        for (let i = 0; i < Math.max(oldSnapshot.length, newSnapshot.length); i++) {
          if (JSON.stringify(oldSnapshot[i]) !== JSON.stringify(newSnapshot[i])) differences.push({ index: i, before: oldSnapshot[i], after: newSnapshot[i] });
        }
        const id = `${name}-${language}-${width}-${expanded ? 'open' : 'closed'}`;
        const result = { id, nodes: oldSnapshot.length, differences: differences.length };
        if (differences.length) await writeFile(resolve(output, `${id}.diff.json`), JSON.stringify(differences, null, 2));
        if (!expanded && screenshots.has(width)) {
          const a = await stableScreenshot(oldPage);
          const b = await stableScreenshot(newPageView);
          await writeFile(resolve(output, `${id}-before.png`), a);
          await writeFile(resolve(output, `${id}-after.png`), b);
          const ar = await sharp(a).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
          const br = await sharp(b).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
          let changed = 0;
          if (ar.data.length === br.data.length && ar.info.width === br.info.width) {
            for (let i = 0; i < ar.data.length; i += 4) if (!ar.data.subarray(i, i + 4).equals(br.data.subarray(i, i + 4))) changed++;
          } else changed = -1;
          result.changedPixels = changed;
        }
        report.cases.push(result);
        console.log(JSON.stringify(result));
      }
    }
  } catch (error) { console.error(error); throw error; }
  finally {
    await oldPage.context().unrouteAll({ behavior: 'ignoreErrors' });
    await newPageView.context().unrouteAll({ behavior: 'ignoreErrors' });
    await oldPage.context().close(); await newPageView.context().close();
  }
}

async function interactions(name, language, width) {
  const page = await newPage(false, 'no-preference');
  const checks = [];
  try {
    await page.setViewportSize({ width, height: 900 });
    await ready(page, name, language);
    assert.equal(page.imageErrors.length, 0, JSON.stringify(page.imageErrors));
    assert.equal(await page.locator(`[data-page-link="${name}"]`).getAttribute('aria-current'), 'page');
    if (width < 900) {
      assert.equal(await page.locator('#mobile-nav').isVisible(), false);
      await page.locator('#menu').click();
      assert.equal(await page.locator('#mobile-nav').isVisible(), true);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#mobile-nav').isVisible(), false);
      checks.push('mobile menu / Escape');
    }
    if (name === 'home') {
      const reveal = page.locator('[data-product-reveal]');
      assert.ok((await reveal.getAttribute('class')).includes('reveal-motion'));
      await reveal.scrollIntoViewIfNeeded();
      await page.waitForFunction(() => document.querySelector('[data-product-reveal]').classList.contains('is-visible'));
      checks.push('scroll-triggered product reveal');
    }
    const details = page.locator('.advantage-row').first();
    await details.locator('summary').click();
    assert.equal(await details.getAttribute('open'), '');
    assert.ok((await details.locator('.advantage-detail').innerText()).length > 100);
    checks.push('expanded advantage content');
    const demo = page.locator('[data-demo-animation]');
    await demo.scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      const root = document.querySelector('[data-demo-animation]');
      window.demoStates = new Set([root.dataset.state]);
      window.demoObserver = new MutationObserver(() => window.demoStates.add(root.dataset.state));
      window.demoObserver.observe(root, { attributes: true, attributeFilter: ['data-state'] });
    });
    await demo.locator('[data-demo-replay]').click();
    await page.waitForFunction(() => ['question', 'click', 'answer', 'source', 'library'].every(state => window.demoStates.has(state)), null, { timeout: 25000 });
    await demo.locator('[data-demo-pause]').click();
    assert.ok((await demo.getAttribute('class')).includes('is-paused'));
    const paused = await demo.getAttribute('data-state');
    await page.waitForTimeout(300);
    assert.equal(await demo.getAttribute('data-state'), paused);
    await demo.locator('[data-demo-replay]').click();
    assert.equal(await demo.getAttribute('data-state'), 'question');
    checks.push('five demo states / pause / replay');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.querySelector('[data-demo-animation]').dataset.state === 'source');
    assert.equal(await demo.locator('[data-demo-pause]').isDisabled(), true);
    checks.push('reduced motion static source');
    const other = name === 'home' ? 'kip' : 'home';
    await page.locator(`[data-page-link="${other}"]`).click();
    await page.waitForURL(url => url.searchParams.get('page') === other);
    await page.locator('main h1').waitFor();
    assert.equal(new URL(page.url()).searchParams.get('lang'), language);
    const nextLanguage = language === 'en' ? 'zh-Hant' : 'en';
    await page.locator('#language').selectOption(nextLanguage);
    await page.waitForURL(url => url.searchParams.get('lang') === nextLanguage);
    assert.equal(new URL(page.url()).searchParams.get('page'), other);
    checks.push('page switch / language preservation');
    report.interactions.push({ name, language, width, checks });
    console.log(JSON.stringify(report.interactions.at(-1)));
  } finally { await page.context().unrouteAll({ behavior: 'ignoreErrors' }); await page.context().close(); }
}

try {
  if (mode !== 'interactions') for (const name of ['home', 'kip']) for (const language of ['zh-Hant', 'en']) await compare(name, language);
  if (mode !== 'visual') for (const name of ['home', 'kip']) for (const [language, width] of [['zh-Hant', 390], ['en', 1440]]) await interactions(name, language, width);
  assert.equal(report.errors.length, 0, JSON.stringify(report.errors));
  assert.equal(report.cases.filter(item => item.differences || item.changedPixels).length, 0, `Design changed; inspect ${output}/report.json`);
  report.status = 'passed';
} catch (error) {
  report.status = 'failed';
  report.failure = error.message;
  throw error;
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2));
}
console.log(`PASS: ${report.cases.length} responsive/state comparisons, ${report.interactions.length} interaction journeys; see ${output}`);
