import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import { localeFromContentDir, pathFor, type PageSlug } from './site.ts';

const CONTENT_PAGES_DIR = 'src/content/pages';

/**
 * 在建置前先掃描一次內容檔的 `draft:` 旗標。
 *
 * 為什麼掃描而不是查 Content Collections：`@astrojs/sitemap` 的 `filter()` 是
 * integration 層的同步函式，拿不到 `getCollection()` 的結果，所以 draft 清單必須
 * 在 `astro.config.mjs` 載入時就算出來。frontmatter 仍是唯一事實來源。
 */
export function draftPaths(root: string = process.cwd()): string[] {
  const dir = join(root, CONTENT_PAGES_DIR);
  const paths: string[] = [];

  for (const file of walk(dir)) {
    if (!file.endsWith('.md')) continue;

    const segments = relative(dir, file).split(sep);
    if (segments.length !== 2) {
      throw new Error(
        `內容檔路徑必須是 ${CONTENT_PAGES_DIR}/<locale>/<slug>.md，實際為：${relative(root, file)}`,
      );
    }

    const [dirName, filename] = segments;
    if (!isDraft(file)) continue;

    const locale = localeFromContentDir(dirName);
    paths.push(pathFor(locale, filename.replace(/\.md$/, '') as PageSlug));
  }

  return paths.sort();
}

function isDraft(file: string): boolean {
  const source = readFileSync(file, 'utf8');
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) throw new Error(`內容檔缺少 YAML frontmatter：${file}`);
  return /^draft:\s*true\s*$/m.test(frontmatter[1]);
}

function* walk(dir: string): Generator<string> {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch (error) {
    // 內容尚未遷移時（首次 scaffold）視為空集合，不讓 config 載入失敗。
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw error;
  }

  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else yield full;
  }
}
