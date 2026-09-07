/**
 * 語系與 SEO 骨架（PRD-001 FR-106）：
 * sitemap 涵蓋與排除、canonical、hreflang 成對含 x-default、description 唯一。
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { alternatesOf, canonicalOf, htmlFor, metaContent, readDist } from './lib/dist.mjs';

const SITE = 'https://synaiq.com';

const SLUGS = [
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

const LOCALES = [
  { locale: 'zh-Hant', tag: 'zh-Hant-TW', prefix: '', draft: false },
  { locale: 'en', tag: 'en', prefix: '/en', draft: true },
];

function routeFor(prefix, slug) {
  return slug === 'home' ? `${prefix}/` : `${prefix}/${slug}/`;
}

test('sitemap 只涵蓋 zh-Hant 的 9 條路由', () => {
  const index = readDist('sitemap-index.xml');
  assert.match(index, /sitemap-0\.xml/);

  const sitemap = readDist('sitemap-0.xml');
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const expected = SLUGS.map((slug) => `${SITE}${routeFor('', slug)}`).sort();

  assert.deepEqual([...locations].sort(), expected);
});

test('sitemap 排除 draft 頁與 /styleguide', () => {
  const sitemap = readDist('sitemap-0.xml');
  assert.ok(!sitemap.includes('/en/'), 'draft 的 /en/ 不應進 sitemap');
  assert.ok(!sitemap.includes('styleguide'), '/styleguide 不應進 sitemap');
});

test('每頁 canonical 指向自身', () => {
  for (const { prefix } of LOCALES) {
    for (const slug of SLUGS) {
      const route = routeFor(prefix, slug);
      assert.equal(canonicalOf(htmlFor(route)), `${SITE}${route}`, `${route} canonical 不正確`);
    }
  }
});

test('hreflang 兩語系成對且含 x-default', () => {
  for (const { prefix } of LOCALES) {
    for (const slug of SLUGS) {
      const route = routeFor(prefix, slug);
      const alternates = alternatesOf(htmlFor(route));

      assert.deepEqual(
        Object.keys(alternates).sort(),
        ['en', 'x-default', 'zh-Hant-TW'].sort(),
        `${route} 的 hreflang 不成對`,
      );
      assert.equal(alternates['zh-Hant-TW'], `${SITE}${routeFor('', slug)}`);
      assert.equal(alternates.en, `${SITE}${routeFor('/en', slug)}`);
      assert.equal(alternates['x-default'], alternates['zh-Hant-TW']);
    }
  }
});

test('draft 頁標 noindex，正式頁不標', () => {
  for (const { prefix, draft } of LOCALES) {
    for (const slug of SLUGS) {
      const route = routeFor(prefix, slug);
      const robots = metaContent(htmlFor(route), 'robots');

      if (draft) assert.match(robots ?? '', /noindex/, `${route} 應標 noindex`);
      else assert.equal(robots, null, `${route} 不應標 robots`);
    }
  }
});

test('/styleguide 標 noindex', () => {
  assert.equal(metaContent(htmlFor('/styleguide/'), 'robots'), 'noindex');
});

test('每頁 description 非空且全站唯一', () => {
  const seen = new Map();

  for (const { prefix } of LOCALES) {
    for (const slug of SLUGS) {
      const route = routeFor(prefix, slug);
      const description = metaContent(htmlFor(route), 'description');

      assert.ok(description && description.trim().length > 0, `${route} 沒有 description`);
      assert.ok(!seen.has(description), `description 重複：${seen.get(description)} 與 ${route}`);
      seen.set(description, route);
    }
  }
});

/** 只取切換器這個 `<nav>` 元素，避免比對到 CSS 裡的同名 class。 */
function switcherOf(html) {
  const match = html.match(/<nav class="language-switcher"[\s\S]*?<\/nav>/);
  return match ? match[0] : null;
}

test('zh-Hant 頁不顯示指向 draft 的語言切換連結', () => {
  for (const slug of SLUGS) {
    assert.equal(
      switcherOf(htmlFor(routeFor('', slug))),
      null,
      `${slug}：對應的 /en/ 是 draft，zh-Hant 頁不應出現語言切換器`,
    );
  }
});

test('/en/ 頁提供回 zh-Hant 的語言切換連結', () => {
  for (const slug of SLUGS) {
    const switcher = switcherOf(htmlFor(routeFor('/en', slug)));
    assert.ok(switcher, `/en/${slug}：缺少語言切換器`);
    assert.ok(
      switcher.includes(`href="${routeFor('', slug)}"`),
      `/en/${slug}：切換連結目標不正確`,
    );
  }
});
