import test from 'node:test';
import assert from 'node:assert/strict';
import { renderHome } from './home-design.js';

const html = renderHome({ advantageSection: () => '', contact: () => '' });

test('preserves the selected hero and supplied enterprise narrative', () => {
  assert.match(html, /散落的企業文件，/);
  assert.match(html, /變成隨問隨答的/);
  assert.match(html, /電子郵件、備忘錄、內部文件與簡報/);
  assert.doesNotMatch(html, /枯竭/);
});

test('survey figures retain dates, forecast caveat and countercontext', () => {
  for (const value of ['2024 年調查', '2027 年預期', '14.5', '166 位資訊長', '1,230 億美元', '33%', '62%', '並非已實現結果', '未取得 J.P. Morgan 原始調查全文']) {
    assert.ok(html.includes(value), `Missing ${value}`);
  }
  assert.match(html, /https:\/\/www\.investing\.com\/news\/stock-market-news\/cio-survey/);
});

test('CEO section preserves the supplied quote and uses the requested speaking sketch and attribution', () => {
  const ceoSection = html.match(/<section\b[^>]*\bdata-ceo-message\b[^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(ceoSection, 'Missing dedicated CEO message section');
  const text = ceoSection.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');

  assert.match(ceoSection, /src="assets\/ceo-speaking-sketch-v1\.webp"/);
  assert.match(text, /邱浩煒 Wilson/);
  assert.doesNotMatch(ceoSection, /邱浩偉/);
  assert.match(text, /CEO of Synaiq/);
  const quote = ceoSection.match(/<blockquote>([\s\S]*?)<\/blockquote>/)?.[1].replace(/<[^>]*>/g, '');
  assert.equal(quote, 'AI 的價值，是讓被落下的人迎頭趕上。我們用 AI，讓企業的知識找得到、用得上；再結合管理的智慧，突破既有框架，把答案變成行動。');
  assert.equal((ceoSection.match(/<blockquote>([\s\S]*?)<\/blockquote>/)?.[1].match(/<p>/g) || []).length, 2);
  assert.match(text, /留給每一個，需要答案的人。/);
  assert.doesNotMatch(text, /我們相信|用得上知識|向前的力量|理念稿|待確認/);
  assert.doesNotMatch(ceoSection, /shared-knowledge-hands-v1|黃仁勳|NVIDIA|blogs\.nvidia\.com|中文意譯/);
  assert.doesNotMatch(html, /blogs\.nvidia\.com/);
  assert.equal((html.match(/src="assets\/shared-knowledge-hands-v1\.png"/g) || []).length, 1);
});

test('homepage preserves the selected brand-matched interface studies', () => {
  assert.equal((html.match(/src="assets\/kip-search-demo\.svg"/g) || []).length, 1);
  assert.match(html, /data-demo-animation/);
  assert.match(html, /品牌化介面 · 示例資料/);
  assert.doesNotMatch(html, /kb-entry-redacted\.png/);
});

test('hand-drawn opening precedes product reveal and PLUS stays in the device row', () => {
  assert.match(html, /hero-thread-art" aria-hidden="true"/);
  assert.match(html, /knowledge-threads-v2\.png/);
  assert.ok(html.indexOf('id="introduction"') < html.indexOf('data-product-reveal'));
  assert.match(html, /class="stage-devices"/);
  assert.equal((html.match(/src="\/brand\/wally-2-plus\.png"/g) || []).length, 1);
  assert.doesNotMatch(html, /wally-plus-feature|art-placeholder|human-ai-quote/);
});
