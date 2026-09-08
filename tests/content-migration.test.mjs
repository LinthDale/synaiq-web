/**
 * 內容遷移零遺漏（PRD-001 FR-104）。
 *
 * `tests/fixtures/content-key-map.json` 由 `npm run migrate:content` 產生，
 * 每筆記錄一個舊 `## key`、它搬到哪個 frontmatter 欄位、以及應該在哪條路由看到它的文字。
 * 本檔逐筆到 `dist/` 的 HTML 裡找那些文字 —— 找不到就代表搬運過程掉了東西。
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

import { ROOT, decodeEntities, htmlFor } from './lib/dist.mjs';

const KEY_MAP = join(ROOT, 'tests', 'fixtures', 'content-key-map.json');
const records = JSON.parse(readFileSync(KEY_MAP, 'utf8'));
const FORMER_ADDRESS = '台中市西屯區文心路二段 201 號 11 樓之 8';
const APPROVED_ADDRESS = '407臺中市西屯區何安里臺灣大道二段910號10樓之2';

// Preserve the original migration fixture; the user approved only these two address edits on 2026-09-08.
function isApprovedAddressRecord(record) {
  return ['home', 'contact'].includes(record.page) && record.oldKey === 'contact.cards';
}

function expectedMigratedValue(record, value) {
  return isApprovedAddressRecord(record) && value === FORMER_ADDRESS ? APPROVED_ADDRESS : value;
}

/** 舊樹的 10 個內容檔（`site.md` 加 9 頁）。 */
const SOURCE_FILES = [
  'site',
  'home',
  'about',
  'products',
  'wally',
  'knowledge-base',
  'generative-ai',
  'agi',
  'media',
  'contact',
];

const decoded = new Map();
function decodedHtml(route) {
  if (!decoded.has(route)) decoded.set(route, decodeEntities(htmlFor(route)));
  return decoded.get(route);
}

test('對照表涵蓋全部 10 個舊內容檔', () => {
  const pages = [...new Set(records.map((record) => record.page))].sort();
  assert.deepEqual(pages, [...SOURCE_FILES].sort());
  assert.ok(records.length >= 150, `對照表只有 ${records.length} 筆，明顯少於舊樹的 key 數`);
});

test('對照表本身完整：欄位齊全且同一檔案內的舊 key 不重複', () => {
  const seen = new Set();

  for (const record of records) {
    for (const field of ['page', 'oldKey', 'kind', 'newPath', 'route']) {
      assert.ok(record[field], `對照表有記錄缺少欄位 ${field}：${JSON.stringify(record)}`);
    }

    const id = `${record.page}#${record.oldKey}`;
    assert.ok(!seen.has(id), `舊 key 重複對應：${id}`);
    seen.add(id);
  }
});

test('核准的地址變更僅涵蓋首頁與聯絡頁各一筆既有 contact.cards 記錄', () => {
  const approved = records.filter(record => isApprovedAddressRecord(record) && record.values.includes(FORMER_ADDRESS));
  assert.equal(approved.length, 2);
  assert.deepEqual(approved.map(record => record.page).sort(), ['contact', 'home']);
  for (const record of approved) {
    assert.equal(record.values.filter(value => value === FORMER_ADDRESS).length, 1);
    assert.equal(expectedMigratedValue(record, FORMER_ADDRESS), APPROVED_ADDRESS);
  }
  assert.equal(expectedMigratedValue({ page: 'about', oldKey: 'contact.cards' }, FORMER_ADDRESS), FORMER_ADDRESS);
  assert.equal(expectedMigratedValue({ page: 'home', oldKey: 'other.cards' }, FORMER_ADDRESS), FORMER_ADDRESS);
  assert.equal(expectedMigratedValue(approved[0], 'service@synaiq.com'), 'service@synaiq.com');
});

test('每個舊 key 的文字都出現在對應路由的建置結果', () => {
  const misses = [];

  for (const record of records) {
    const html = decodedHtml(record.route);
    for (const value of record.values) {
      const expected = expectedMigratedValue(record, value);
      if (html.includes(expected)) continue;
      misses.push(
        `${record.page}.md「${record.oldKey}」→ ${record.route}（${record.newPath}）` +
          `：找不到「${expected.slice(0, 60)}」`,
      );
    }
  }

  assert.deepEqual(misses, [], `以下舊內容沒有出現在建置結果：\n${misses.join('\n')}`);
});

test('遷移後的文字同樣出現在 /en/ 佔位頁（PRD-002 M2 前為 zh-Hant 副本）', () => {
  // 只抽驗每個舊檔的第一筆，確認 /en/ 路由確實建置且內容同源。
  const misses = [];

  for (const page of SOURCE_FILES) {
    const record = records.find((item) => item.page === page && item.values.length > 0);
    if (!record) continue;

    const route = record.route === '/' ? '/en/' : `/en${record.route}`;
    const html = decodedHtml(route);
    if (!html.includes(record.values[0])) {
      misses.push(`${page}.md「${record.oldKey}」→ ${route}`);
    }
  }

  assert.deepEqual(misses, [], `以下內容沒有出現在 /en/ 佔位頁：\n${misses.join('\n')}`);
});
