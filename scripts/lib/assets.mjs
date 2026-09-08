/**
 * 舊樹把圖片路徑寫死在 `.tsx` 裡（`app/page.tsx`、`app/about/page.tsx`、
 * `app/wally/page.tsx`、`app/knowledge-base/page.tsx`、`app/generative-ai/page.tsx`）。
 * 新樹把它們搬進 frontmatter，讓「內容 + 資產」同一處管理、元件零硬編碼路徑。
 *
 * 這裡只是「舊碼裡有什麼」的抄錄，不是設計決策；
 * 換圖／換版型是 PRD-003／PRD-005 的事。
 */

export const HERO_IMAGES = {
  home: '/brand/synaiq-logo-s.webp',
  wally: '/brand/wally/wally-series.png',
  'knowledge-base': '/brand/knowledge-base.png',
  'generative-ai': '/brand/media-factory.png',
};

export const EXPERIENCE_IMAGES = {
  knowledge: '/brand/knowledge-base.png',
  generative: '/brand/media-factory.png',
};

export const EXPERIENCE_DEVICES = {
  'wally-1': '/brand/wally-1.png',
  'wally-mini': '/brand/wally-mini.png',
};

export const TEAM_PHOTOS = {
  wilson: '/brand/team/wilson-web-1.jpg',
  sunny: '/brand/team/sunny-web-1.1.jpg',
  leef: '/brand/team/leff-web-1.jpg',
  lou: '/brand/team/lou-web-1.jpg',
  dale: '/brand/team/dale-web-1.jpg',
  daniel: '/brand/team/daniel-web-1.jpg',
};

export const MODEL_IMAGES = {
  'wally-1': '/brand/wally-1.png',
  'wally-1-plus': '/brand/wally/wally-1-plus.png',
  'wally-2': '/brand/wally/wally-2.png',
  'wally-2-plus': '/brand/wally-2-plus.png',
  'wally-mini': '/brand/wally-mini.png',
};

/** 舊樹寫死在 `app/media/page.tsx` 的社群連結。 */
export const SOCIAL_HREF = 'https://www.instagram.com/synaiq.ai/';

/** `astro.config.mjs` 設定 `trailingSlash: 'always'`，站內連結一律補尾斜線。 */
export function withSlash(href) {
  if (!href.startsWith('/')) return href;
  if (href.endsWith('/') || href.includes('#') || href.includes('?')) return href;
  return `${href}/`;
}

/** 空字串轉 undefined，讓 YAML 直接省略該欄位。 */
export function orUndefined(value) {
  const trimmed = (value ?? '').trim();
  return trimmed === '' ? undefined : trimmed;
}

/** 依 id 取資產路徑，找不到就明確失敗（不要靜默產生破圖）。 */
export function assetFor(map, id, label) {
  const src = map[id];
  if (!src) {
    throw new Error(`${label}：找不到 id「${id}」對應的圖片路徑，請更新 scripts/lib/assets.mjs。`);
  }
  return src;
}
