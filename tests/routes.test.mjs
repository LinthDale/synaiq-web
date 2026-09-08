/**
 * 9 條路由 × 2 語系的三類斷言（PRD-001 FR-107）：
 * 關鍵區塊存在、`<html lang>` 正確、`<title>` 全站唯一。
 *
 * 區塊清單是獨立於實作的規格：只斷言「這個區塊的錨點 id 在 HTML 裡」，
 * 不碰 class 名，也不碰元件切分方式。
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { hasElementId, htmlFor, langOf, titleOf } from './lib/dist.mjs';

const LOCALES = [
  { locale: 'zh-Hant', tag: 'zh-Hant-TW', prefix: '' },
  { locale: 'en', tag: 'en', prefix: '/en' },
];

/** slug → 該頁必須存在的區塊錨點 id。`brand` 是 hero，`action` 是結尾 CTA。 */
const ROUTE_BLOCKS = {
  home: ['brand', 'services', 'products', 'technology', 'experience', 'contact', 'action'],
  about: ['brand', 'approach', 'team', 'vision', 'action'],
  products: ['brand', 'products', 'action'],
  wally: ['brand', 'selection', 'models', 'features', 'supporting', 'action'],
  'knowledge-base': ['brand', 'capabilities', 'use-cases', 'screenshots', 'action'],
  'generative-ai': ['brand', 'services', 'flow', 'action'],
  agi: ['brand', 'capabilities', 'flow', 'deployment', 'action'],
  media: ['brand', 'news', 'events', 'social', 'action'],
  contact: ['brand', 'contact-cards', 'consultation', 'action'],
};

const SLUGS = Object.keys(ROUTE_BLOCKS);

function routeFor(prefix, slug) {
  return slug === 'home' ? `${prefix}/` : `${prefix}/${slug}/`;
}

test('每條路由 × 語系都建置出檔案，且關鍵區塊存在', () => {
  for (const { prefix } of LOCALES) {
    for (const slug of SLUGS) {
      const route = routeFor(prefix, slug);
      const html = htmlFor(route);

      for (const id of ROUTE_BLOCKS[slug]) {
        assert.ok(hasElementId(html, id), `${route} 缺少區塊錨點 id="${id}"`);
      }
    }
  }
});

test('每頁只有一個 <h1>', () => {
  for (const { prefix } of LOCALES) {
    for (const slug of SLUGS) {
      const route = routeFor(prefix, slug);
      const count = (htmlFor(route).match(/<h1[\s>]/g) ?? []).length;
      assert.equal(count, 1, `${route} 的 <h1> 數量應為 1，實際 ${count}`);
    }
  }
});

test('<html lang> 依語系正確', () => {
  for (const { prefix, tag } of LOCALES) {
    for (const slug of SLUGS) {
      const route = routeFor(prefix, slug);
      assert.equal(langOf(htmlFor(route)), tag, `${route} 的 <html lang> 不正確`);
    }
  }
});

test('<title> 全站唯一且非空', () => {
  const seen = new Map();

  for (const { prefix } of LOCALES) {
    for (const slug of SLUGS) {
      const route = routeFor(prefix, slug);
      const title = titleOf(htmlFor(route));

      assert.ok(title && title.trim().length > 0, `${route} 沒有 <title>`);
      assert.ok(!seen.has(title), `<title>「${title}」重複：${seen.get(title)} 與 ${route}`);
      seen.set(title, route);
    }
  }

  assert.equal(seen.size, LOCALES.length * SLUGS.length);
});

test('/styleguide 的 <title> 不與內容頁重複', () => {
  const styleguide = titleOf(htmlFor('/styleguide/'));
  const contentTitles = LOCALES.flatMap(({ prefix }) =>
    SLUGS.map((slug) => titleOf(htmlFor(routeFor(prefix, slug)))),
  );

  assert.ok(styleguide);
  assert.ok(!contentTitles.includes(styleguide), `/styleguide 的 <title> 與內容頁重複`);
});
