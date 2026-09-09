import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderAdvantageSection } from './shared-design.js';
import { getMessages } from './i18n.js';

const common = getMessages().common;
const advantages = common.advantages.items;
const html = renderAdvantageSection(common);
const css = readFileSync(new URL('./site.css', import.meta.url), 'utf8');

const original = [
  ['準確回答，低 AI 幻覺', '有依據才回答', '找不到對應內容時，明確指出資料不足，讓使用者知道答案的邊界。'],
  ['快速找到需要的資訊', '從文件回到答案', '把散落在不同文件的內容集中檢索，保留能核對的來源。'],
  ['自然語言提問', '用完整問題查詢', '不必先猜文件使用的關鍵字，直接描述需要找的內容。'],
  ['知識內容隨時更新', '讓制度與答案同步', '更新組織文件，讓查詢依據跟著資料版本前進。'],
  ['多知識來源整合', '跨部門資料一起找', '把不同部門的文件接入同一個知識流程。'],
  ['資訊來源驗證', '每句話都能回到原文', '回應附來源與索引，查詢結果可以回到文件逐一核對。'],
  ['多輪對話能力', '接著追問', '承接問題上下文，逐步釐清需要的答案。'],
  ['多媒體知識支援', '文件不只一種格式', 'PDF、掃描件、手寫、表格與圖片，都有對應的接入流程。'],
];

test('eight advantages retain every accepted title, summary and explanation in order', () => {
  assert.equal(advantages.length, original.length);
  for (const [index, expected] of original.entries()) {
    assert.deepEqual(Array.from(advantages[index]).slice(0, 3), expected);
    for (const copy of expected) assert.ok(html.includes(copy), `Missing original copy: ${copy}`);
  }
});

test('each expansion adds substantive explanation and a clearly labeled illustrative scenario', () => {
  for (const [title, , , explanation, scenario] of advantages) {
    assert.ok(explanation?.length >= 50, `${title}: needs more than a one-line explanation`);
    assert.ok((explanation.match(/。/g) || []).length >= 2, `${title}: provide working context`);
    assert.ok(scenario?.length >= 35, `${title}: missing concrete work scenario`);
  }
  assert.equal((html.match(/class="advantage-detail"/g) || []).length, 8);
  assert.equal((html.match(/class="advantage-scenario"/g) || []).length, 8);
  assert.equal((html.match(/工作情境示例/g) || []).length, 8);
  assert.doesNotMatch(html, /秒級|百分之百|100%|零幻覺|無限|待確認|理念稿/);
});

test('native details and a shared anchor support page navigation and keyboard activation', () => {
  assert.match(html, /<section class="paper-section advantages" id="advantages" aria-labelledby="advantages-title">/);
  assert.match(html, /<h2 id="advantages-title">八項核心優勢<\/h2>/);
  assert.equal((html.match(/<details class="advantage-row">/g) || []).length, 8);
  assert.equal((html.match(/<summary>/g) || []).length, 8);
  assert.doesNotMatch(html, /onclick|role="button"|tabindex/);
});

test('compact rows keep touch targets and paper-edge clearance without enlarging body copy', () => {
  assert.match(css, /section\.advantages > \.wrap\s*\{[^}]*1080px/);
  assert.match(css, /section\.advantages \.advantage-row summary\s*\{[^}]*min-height:\s*58px;[^}]*padding:\s*14px 0/);
  assert.match(css, /section\.advantages \.section-head\s*\{[^}]*margin-bottom:\s*28px/);
  assert.match(css, /body\[data-page\] section\.advantages\s*\{\s*padding-top:/);
  const paperCss = readFileSync(new URL('./site.css', import.meta.url), 'utf8');
  const kipCss = readFileSync(new URL('./site.css', import.meta.url), 'utf8');
  assert.match(paperCss, /\.home-wally,\s*\.advantages\s*\)\s*\{\s*padding-bottom:\s*max\(126px, var\(--tear-height\)\)/);
  assert.match(kipCss, /\.kip-capabilities,\s*\.advantages\s*\)\s*\{\s*padding:[^}]*max\(156px, var\(--kip-tear-height\)\)/);
});
