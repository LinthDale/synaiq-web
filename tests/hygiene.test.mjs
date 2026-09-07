/**
 * 建置產物與原始碼的衛生檢查（PRD-001 §6 驗收 #2、FR-102、FR-105）：
 * 零 client JS、零外部 `http://` 依賴、零硬編碼色值、零 `client:` 指令。
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

import { DIST, SRC, listFiles } from './lib/dist.mjs';

const HTML_FILES = listFiles(DIST, ['.html']);
const SRC_CODE_FILES = listFiles(SRC, ['.astro', '.css', '.ts']);

/** `#rgb` / `#rrggbb`（含 4、8 位含 alpha 的寫法）與函式型色值。 */
const HARDCODED_COLOR =
  /#[0-9a-fA-F]{3}(?:[0-9a-fA-F])?(?:[0-9a-fA-F]{2}(?:[0-9a-fA-F]{2})?)?\b|\brgba?\(|\bhsla?\(/;

function readSrc(relativePath) {
  return readFileSync(join(SRC, relativePath), 'utf8');
}

function readHtml(relativePath) {
  return readFileSync(join(DIST, relativePath), 'utf8');
}

test('建置產物包含 19 個 HTML（9 路由 × 2 語系 + /styleguide）', () => {
  assert.equal(HTML_FILES.length, 19, `dist 的 HTML 檔數不符：${HTML_FILES.join(', ')}`);
});

test('內容頁零 <script type="module">，也零 <script>', () => {
  for (const file of HTML_FILES) {
    const html = readHtml(file);
    const modules = (html.match(/<script[^>]*type="module"/g) ?? []).length;
    const scripts = (html.match(/<script[\s>]/g) ?? []).length;

    assert.equal(modules, 0, `${file} 出現 <script type="module">`);
    assert.equal(scripts, 0, `${file} 出現 <script>`);
  }
});

test('dist 的 HTML 沒有 localhost、8400 或 http:// 依賴', () => {
  for (const file of HTML_FILES) {
    const html = readHtml(file);
    assert.ok(!html.includes('localhost'), `${file} 出現 localhost`);
    assert.ok(!html.includes('8400'), `${file} 出現 8400`);
    assert.ok(!html.includes('http://'), `${file} 出現 http:// 依賴`);
  }
});

test('dist 的非 HTML 產物沒有 localhost 或 8400', () => {
  // sitemap 的 XML namespace 本來就是 `http://…` 識別字串，不是可載入的依賴，故只查這兩項。
  for (const file of listFiles(DIST, ['.xml', '.css', '.js', '.txt'])) {
    const content = readFileSync(join(DIST, file), 'utf8');
    assert.ok(!content.includes('localhost'), `${file} 出現 localhost`);
    assert.ok(!content.includes('8400'), `${file} 出現 8400`);
  }
});

test('src 除 tokens.css 外零硬編碼色值', () => {
  const offenders = [];

  for (const file of SRC_CODE_FILES) {
    if (file === 'styles/tokens.css') continue;
    const content = readSrc(file);
    content.split('\n').forEach((line, index) => {
      if (HARDCODED_COLOR.test(line)) offenders.push(`${file}:${index + 1} ${line.trim()}`);
    });
  }

  assert.deepEqual(offenders, [], `硬編碼色值只能出現在 tokens.css：\n${offenders.join('\n')}`);
});

test('tokens.css 是唯一宣告 custom property 的地方', () => {
  const offenders = [];

  for (const file of SRC_CODE_FILES) {
    if (file === 'styles/tokens.css') continue;
    const content = readSrc(file);
    content.split('\n').forEach((line, index) => {
      if (/^\s*--[\w-]+\s*:/.test(line)) offenders.push(`${file}:${index + 1} ${line.trim()}`);
    });
  }

  assert.deepEqual(offenders, [], `custom property 只能宣告在 tokens.css：\n${offenders.join('\n')}`);
});

test('src 沒有任何 client: 水合指令（PRD-001 §2 的 island 白名單目前為空）', () => {
  const offenders = [];

  for (const file of listFiles(SRC, ['.astro'])) {
    const content = readSrc(file);
    content.split('\n').forEach((line, index) => {
      if (/\sclient:(load|idle|visible|media|only)/.test(line)) {
        offenders.push(`${file}:${index + 1}`);
      }
    });
  }

  assert.deepEqual(offenders, [], `出現 client: 指令：\n${offenders.join('\n')}`);
});
