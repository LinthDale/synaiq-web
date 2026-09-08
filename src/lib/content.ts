/**
 * Content Collections 的取值封裝。
 *
 * `.astro` 一律透過本檔取資料，不直接呼叫 `getEntry()`：
 * 這樣「新增一個語系」只需要動 `src/config/site.ts` 與內容目錄，元件零修改。
 */

import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_TAGS,
  PAGE_SLUGS,
  SITE_URL,
  contentDirFor,
  entryIdFor,
  pathFor,
  type Locale,
  type PageSlug,
} from '../config/site.ts';

export type SiteData = CollectionEntry<'site'>['data'];
export type PageEntry = CollectionEntry<'pages'>;
export type PageData = PageEntry['data'];

/** 一個 slug 在各語系的對應資訊，供 hreflang 與語言切換器使用。 */
export type LocaleLink = {
  locale: Locale;
  tag: string;
  path: string;
  href: string;
  draft: boolean;
};

/** 站內路徑 → 絕對網址（canonical / hreflang / og:url 用）。 */
export function absolute(path: string): string {
  return new URL(path, SITE_URL).href;
}

export async function loadSite(locale: Locale): Promise<SiteData> {
  const entry = await getEntry('site', contentDirFor(locale));
  if (!entry) {
    throw new Error(`缺少內容檔 src/content/site/${contentDirFor(locale)}.md（語系 ${locale}）。`);
  }
  return entry.data;
}

export async function loadPage(locale: Locale, slug: PageSlug): Promise<PageEntry> {
  const entry = await getEntry('pages', entryIdFor(locale, slug));
  if (!entry) {
    throw new Error(
      `缺少內容檔 src/content/pages/${contentDirFor(locale)}/${slug}.md（語系 ${locale}）。`,
    );
  }
  return entry;
}

/** 某個 slug 在所有語系的連結；`draft` 直接取自 frontmatter。 */
export async function localeLinks(slug: PageSlug): Promise<LocaleLink[]> {
  const pages = await getCollection('pages');

  return LOCALES.map((locale) => {
    const id = entryIdFor(locale, slug);
    const entry = pages.find((page) => page.id === id);
    if (!entry) throw new Error(`Content Collections 找不到 entry「${id}」。`);

    const path = pathFor(locale, slug);
    return { locale, tag: LOCALE_TAGS[locale], path, href: absolute(path), draft: entry.data.draft };
  });
}

/** `%s` 樣板套用；頁面自帶 `metadata.titleTemplate` 時優先。 */
export function titleFor(page: PageData, site: SiteData): string {
  const template = page.metadata.titleTemplate ?? site.titleTemplate;
  return template.replace('%s', () => page.metadata.title);
}

const PATH_TO_SLUG = new Map<string, PageSlug>(
  PAGE_SLUGS.map((slug) => [pathFor(DEFAULT_LOCALE, slug), slug]),
);

/**
 * 把內容檔裡的站內路徑改寫成目標語系的路徑。
 *
 * 內容檔以預設語系路徑書寫（`/about/`），非預設語系渲染時才加前綴，
 * 這樣翻譯者不必維護兩套連結。錨點、`mailto:`、`tel:` 與外部網址原樣保留。
 */
export function localizeHref(href: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE || !href.startsWith('/')) return href;
  const slug = PATH_TO_SLUG.get(href);
  return slug ? pathFor(locale, slug) : `/${locale}${href}`;
}

/** 導覽列的 `aria-current`：本頁命中，產品頁的四個子頁也算命中「產品」。 */
const PRODUCT_CHILD_SLUGS: PageSlug[] = ['wally', 'knowledge-base', 'generative-ai', 'agi'];

export function isCurrentNav(href: string, currentSlug: PageSlug | null): boolean {
  if (currentSlug === null) return false;
  const slug = PATH_TO_SLUG.get(href);
  if (!slug) return false;
  if (slug === currentSlug) return true;
  return slug === 'products' && PRODUCT_CHILD_SLUGS.includes(currentSlug);
}
