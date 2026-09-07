/**
 * 測試共用工具：只讀 `dist/`，不讀任何 `.astro` / `.tsx` 原始碼（PRD-001 FR-107）。
 *
 * 這代表「改 class 名」「把區塊抽成別的元件」不會讓測試變紅；
 * 只有「建置後 HTML 少了東西」才會。
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, posix, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DIST = join(ROOT, 'dist');
export const SRC = join(ROOT, 'src');

/** 站內路徑（`/about/`）→ 對應的 `dist` 檔案內容。 */
export function htmlFor(routePath) {
  const segments = routePath.split('/').filter(Boolean);
  return readFileSync(join(DIST, ...segments, 'index.html'), 'utf8');
}

export function readDist(relativePath) {
  return readFileSync(join(DIST, relativePath), 'utf8');
}

/** 遞迴列出某個目錄下符合副檔名的檔案，回傳相對於該目錄的 POSIX 路徑。 */
export function listFiles(root, extensions) {
  const found = [];

  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (extensions.some((ext) => entry.endsWith(ext))) {
        found.push(relative(root, full).split(sep).join(posix.sep));
      }
    }
  };

  walk(root);
  return found.sort();
}

const NAMED_ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&nbsp;': ' ',
};

/**
 * 把 HTML 實體還原成原字元，好用原始內容字串做子字串比對。
 * Astro 會把 `'` 逸出成 `&#39;`，不還原就比不到 `LET'S BUILD WHAT'S NEXT`。
 */
export function decodeEntities(html) {
  let out = html.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
  out = out.replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)));
  for (const [entity, char] of Object.entries(NAMED_ENTITIES)) {
    out = out.split(entity).join(char);
  }
  return out.replace(/\r\n/g, '\n');
}

/** 取出 `<title>` 內容（已還原實體）。 */
export function titleOf(html) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/);
  return match ? decodeEntities(match[1]) : null;
}

/** 取出某個 meta 的 content。 */
export function metaContent(html, name) {
  const pattern = new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]*)"`, 'i');
  const match = html.match(pattern);
  return match ? decodeEntities(match[1]) : null;
}

/** 取出 `<html lang="...">`。 */
export function langOf(html) {
  const match = html.match(/<html\s+lang="([^"]*)"/i);
  return match ? match[1] : null;
}

/** 取出 canonical 網址。 */
export function canonicalOf(html) {
  const match = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i);
  return match ? match[1] : null;
}

/** 取出所有 `hreflang` → href 的對應。 */
export function alternatesOf(html) {
  const result = {};
  const pattern = /<link\s+rel="alternate"\s+hreflang="([^"]*)"\s+href="([^"]*)"/gi;
  for (const match of html.matchAll(pattern)) result[match[1]] = match[2];
  return result;
}

/** 元素 id 是否存在（`id="x"`）。 */
export function hasElementId(html, id) {
  return new RegExp(`\\sid="${id}"`).test(html);
}
