#!/usr/bin/env node
/**
 * FR-104 內容遷移：舊 `## key` Markdown → Content Collections frontmatter。
 *
 * 用法：`npm run migrate:content`
 *
 * 保證
 * 1. 只搬運，不改寫、不補寫文字（唯一例外是 `/en/` 佔位頁的 `[EN] ` 前綴，見 README 與 phaseA-log）。
 * 2. 零遺漏：舊檔解析出的每一個 `## key` 都必須經過 recorder，差集非空即以非零離開碼失敗。
 * 3. 產出對照表 `docs/migration/content-key-map.md`（人看）與
 *    `tests/fixtures/content-key-map.json`（`npm test` 用來驗證每個舊 key 的文字都出現在 dist HTML）。
 */

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parsePageMarkdown } from './lib/legacy-markdown.mjs';
import { PAGE_BUILDERS } from './lib/map-pages.mjs';
import { buildHome, buildSite } from './lib/map-site.mjs';
import { toYaml } from './lib/yaml.mjs';
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_NAMES,
  PAGE_SLUGS,
  contentDirFor,
} from '../src/config/site.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIR = join(ROOT, 'content', 'pages');
const OUT_ROOT = join(ROOT, 'src', 'content');
const KEY_MAP_MD = join(ROOT, 'docs', 'migration', 'content-key-map.md');
const KEY_MAP_JSON = join(ROOT, 'tests', 'fixtures', 'content-key-map.json');

/**
 * 語言切換器的 `aria-label`。這是新樹才有的 UI（舊樹單語系、無切換器），
 * 舊內容沒有對應文字，因此在此定義而非從舊檔搬運。
 */
const SWITCHER_LABELS = { 'zh-Hant': '語言', en: 'Language' };

/** 首頁 `metadata.title` 本身即完整標題（舊樹如此），故不套用全站 `%s｜SynaiQ`。 */
const HOME_TITLE_TEMPLATE = '%s';

function readSource(name) {
  const file = join(SOURCE_DIR, `${name}.md`);
  if (!existsSync(file)) {
    throw new Error(
      `找不到舊內容檔 content/pages/${name}.md。\n` +
        '遷移完成並通過 npm test 後，舊內容目錄已從工作區移除（對照表留在 ' +
        'docs/migration/content-key-map.md）。要重跑遷移請先從 git 歷史還原：\n' +
        '  git checkout <FR-104 之前的 commit> -- content/pages',
    );
  }
  return parsePageMarkdown(readFileSync(file, 'utf8'));
}

function writeMarkdown(path, frontmatter) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `---\n${toYaml(frontmatter)}\n---\n`, 'utf8');
}

/** 非預設語系的佔位副本：內容沿用 zh-Hant，標題與描述加語系前綴以維持全站唯一。 */
function draftCopy(frontmatter, locale) {
  const clone = structuredClone(frontmatter);
  const prefix = `[${locale.toUpperCase()}] `;
  return {
    draft: true,
    ...clone,
    metadata: {
      ...clone.metadata,
      title: `${prefix}${clone.metadata.title}`,
      description: `${prefix}${clone.metadata.description}`,
    },
  };
}

function localeName(locale) {
  const name = LOCALE_NAMES[locale];
  const label = SWITCHER_LABELS[locale];
  if (!name || !label) {
    throw new Error(`語系「${locale}」缺少 localeName 或 languageSwitcherLabel，請更新本腳本。`);
  }
  return { localeName: name, languageSwitcherLabel: label };
}

function buildAll() {
  const site = buildSite(readSource('site'));
  const home = buildHome(readSource('home'));

  const pages = [
    {
      slug: 'home',
      frontmatter: {
        ...home.frontmatter,
        metadata: { ...home.frontmatter.metadata, titleTemplate: HOME_TITLE_TEMPLATE },
      },
    },
  ];

  for (const slug of PAGE_SLUGS) {
    if (slug === 'home') continue;
    const builder = PAGE_BUILDERS[slug];
    if (!builder) throw new Error(`PAGE_SLUGS 有「${slug}」但 map-pages.mjs 沒有對應 builder。`);
    const built = builder(readSource(slug));
    pages.push({ slug, frontmatter: built.frontmatter, records: built.records, unmapped: built.unmapped });
  }

  const sources = [
    { name: 'site', ...site },
    { name: 'home', ...home },
    ...pages.slice(1).map((page) => ({ name: page.slug, records: page.records, unmapped: page.unmapped })),
  ];

  return { site, home, pages, sources };
}

function assertNoUnmapped(sources) {
  const failures = sources.filter((source) => source.unmapped.length > 0);
  if (failures.length === 0) return;
  for (const source of failures) {
    console.error(`[未遷移] ${source.name}.md：${source.unmapped.join(', ')}`);
  }
  throw new Error(`共 ${failures.length} 個舊檔有未遷移的 key，遷移中止。`);
}

function writeContent({ site, home, pages }) {
  rmSync(OUT_ROOT, { recursive: true, force: true });

  // `%s｜SynaiQ` 舊樹放在 home.md，但它是全站設定，故回填到 site collection。
  const siteBase = { ...site.frontmatter, titleTemplate: home.titleTemplate };

  for (const locale of LOCALES) {
    const dir = contentDirFor(locale);
    writeMarkdown(join(OUT_ROOT, 'site', `${dir}.md`), { ...siteBase, ...localeName(locale) });

    for (const page of pages) {
      const target = join(OUT_ROOT, 'pages', dir, `${page.slug}.md`);
      const frontmatter =
        locale === DEFAULT_LOCALE
          ? { draft: false, ...page.frontmatter }
          : draftCopy(page.frontmatter, locale);
      writeMarkdown(target, frontmatter);
    }
  }
}

function writeKeyMap(sources) {
  const records = sources.flatMap((source) => source.records);

  const rows = records
    .map((r) => `| \`${r.page}.md\` | \`${r.oldKey}\` | ${r.kind} | \`${r.newPath}\` | \`${r.route}\` |`)
    .join('\n');

  const perFile = sources
    .map((s) => `| \`${s.name}.md\` | ${s.records.length} | ${s.unmapped.length} |`)
    .join('\n');

  const md = [
    '# 舊 key → 新 frontmatter 對照表（PRD-001 FR-104）',
    '',
    '> 由 `npm run migrate:content` 產生，**請勿手改**。',
    '> 「驗證路由」欄是 `npm test` 檢查該 key 文字是否出現在建置後 HTML 的位置。',
    '',
    '## 逐檔統計',
    '',
    '| 舊檔 | 已對應 key 數 | 未對應 key 數 |',
    '|---|---|---|',
    perFile,
    `| **合計** | **${records.length}** | **${sources.reduce((n, s) => n + s.unmapped.length, 0)}** |`,
    '',
    '## 逐 key 對照',
    '',
    '| 舊檔 | 舊 key | 型別 | 新欄位路徑 | 驗證路由 |',
    '|---|---|---|---|---|',
    rows,
    '',
  ].join('\n');

  mkdirSync(dirname(KEY_MAP_MD), { recursive: true });
  writeFileSync(KEY_MAP_MD, md, 'utf8');

  mkdirSync(dirname(KEY_MAP_JSON), { recursive: true });
  writeFileSync(KEY_MAP_JSON, `${JSON.stringify(records, null, 2)}\n`, 'utf8');

  return records.length;
}

function main() {
  const built = buildAll();
  assertNoUnmapped(built.sources);
  writeContent(built);
  const total = writeKeyMap(built.sources);

  const files = LOCALES.length * (1 + built.pages.length);
  console.log(`[migrate] locales=${LOCALES.length} pages=${built.pages.length} files=${files}`);
  console.log(`[migrate] mapped keys=${total} unmapped=0`);
  console.log(`[migrate] key map -> docs/migration/content-key-map.md`);
}

main();
