import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderKip, initKip } from './kip-design.js';
import { getMessages } from './i18n.js';

const html = renderKip({
  advantageSection: () => '<section data-shared-advantages>SHARED_ADVANTAGES</section>',
  contact: () => '<section data-shared-contact>SHARED_CONTACT</section>',
});
const text = html.replace(/<[^>]*>/g, '');
const siteCss = readFileSync(new URL('./site.css', import.meta.url), 'utf8');
const kipStart = siteCss.indexOf('/* BEGIN KIP /');
assert.ok(kipStart >= 0, 'KIP layout section must exist');
const css = siteCss.slice(kipStart);

test('KIP preserves the retained copy and shared-content blocks', () => {
  const expected = [
    '問得到、答得準、接得上。',
    '把散落各處的企業文件，變成隨問隨答、有憑有據的知識中樞。',
    '預約導入評估',
    '資料接入',
    'PDF、Word、Excel、掃描文件、手寫與圖片，一起進來。',
    '讀取內容、還原表格，掌握處理進度。',
    '用自己的問題查詢，再回到原文核對。',
    'Web、API 與行動裝置，接入既有工作流程。',
    '依需求選擇模型，讓提問連回組織的知識。',
    '文件接入、解析與分庫，集中管理資料來源。',
    '權限、紀錄、影像檢索與報表，支援日常使用。',
    '智慧知識搜尋 IKS 讓問題連回文件；知識中心 KC 管理接入、解析與分庫。',
    '來源與答案一起出現，讓查詢成為可以確認的工作。',
    '系統介接 API / MCP',
    '與企業既有系統連接。',
    '分庫與權限控管',
    '依資料範圍與角色開放。',
    '帳號記錄管理',
    '保留使用紀錄與對話歷史。',
    '影像檢索',
    '用文字找圖、用圖找相似圖。',
    '報表與使用洞察',
    '了解使用情況，持續調整知識內容。',
    'SHARED_ADVANTAGES',
    'SHARED_CONTACT',
  ];
  for (const copy of expected) assert.ok(text.includes(copy), `Missing or rewritten KIP copy: ${copy}`);
  assert.equal((html.match(/data-shared-advantages/g) || []).length, 1);
  assert.equal((html.match(/data-shared-contact/g) || []).length, 1);
  assert.ok(html.indexOf('data-shared-advantages') < html.indexOf('id="proof"'));
  assert.ok(html.indexOf('data-shared-contact') > html.indexOf('kip-capability-list'));
});

test('KIP removes the standalone knowledge-center notes in both languages without removing the demo', () => {
  for (const locale of ['zh-Hant', 'en']) {
    const messages = getMessages(locale);
    const page = renderKip({ advantageSection: () => '', contact: () => '', locale, messages });
    assert.doesNotMatch(page, /kip-library-notes|KNOWLEDGE CENTER \/ (?:概念示意|CONCEPT)/);
    for (const key of ['libraryLabel', 'libraryTitle', 'libraryNotes']) {
      assert.equal(Object.hasOwn(messages.kip, key), false, `Unused KIP dictionary key: ${locale}.${key}`);
    }
    assert.equal((page.match(/data-demo-animation\s/g) || []).length, 1);
    assert.equal((page.match(/class="film-library"/g) || []).length, 1);
    assert.match(page, /kip-capability-list/);
  }
  assert.doesNotMatch(siteCss, /kip-library-notes/);
  assert.doesNotMatch(readFileSync(new URL('./tokens.css', import.meta.url), 'utf8'), /kip-library-/);
});

test('KIP retains its brand-matched screen and exactly one labeled animated demo', () => {
  assert.equal((html.match(/src="assets\/kip-search-demo\.svg"/g) || []).length, 1);
  assert.equal((html.match(/data-demo-animation\s/g) || []).length, 1);
  assert.match(html, /data-demo-replay/);
  assert.match(html, /data-demo-pause/);
  assert.match(html, /模擬滑鼠點擊與內容展開的情境動畫 · 示例資料 · 非實際連線操作/);
  assert.doesNotMatch(html, /kb-entry-redacted\.png|demo-window/);
});

test('KIP paper retains its fibres while architecture stays in normal flow at every viewport', () => {
  assert.match(readFileSync(new URL('./tokens.css', import.meta.url), 'utf8'), /--kip-tear-image:\s*url\(["']assets\/torn-paper-cotton-v2\.webp["']\)/);
  assert.doesNotMatch(css, /torn-letter-edge\.svg|clip-path:\s*polygon/);
  assert.match(css, /body\[data-page="kip"\] \.kip-architecture-panel\s*\{[^}]*position:\s*static/);
  assert.doesNotMatch(css, /kip-can-pin|position:\s*sticky|min-height:\s*1450px/);
  assert.doesNotMatch(html, /class="[^"]*\bpin-(?:container|panel)\b/);
  assert.match(css, /\.kip-architecture-panel\s*\{[^}]*padding:[^;]*var\(--kip-tear-height\)/);
  assert.equal((html.match(/class="lit" style="--layer:/g) || []).length, 4);
});

test('KIP connected-work illustration replaces the crude SVG without cropping the drawing', () => {
  const art = html.match(/<div class="kip-capability-art"[^>]*>([\s\S]*?)<\/div>/)?.[1];
  assert.ok(art, 'Missing connected-work illustration');
  assert.match(art, /src="assets\/kip-connected-work-v1\.webp" width="1000" height="667"/);
  assert.doesNotMatch(art, /<svg|<span/);
  assert.match(css, /\.kip-capability-art img\s*\{[^}]*width:\s*100%;[^}]*height:\s*auto;[^}]*mix-blend-mode:\s*multiply/);
});

test('KIP initialization does not install architecture scrolling or sizing machinery', t => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'document');
  t.after(() => {
    if (original) Object.defineProperty(globalThis, 'document', original);
    else delete globalThis.document;
  });
  const queries = [];
  Object.defineProperty(globalThis, 'document', { configurable: true, value: {
    querySelector: selector => { queries.push(selector); return null; },
  } });
  assert.doesNotThrow(() => initKip());
  assert.deepEqual(queries, ['[data-demo-animation]'], 'Only the independent product demo needs initialization');
});
