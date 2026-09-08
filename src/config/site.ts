/**
 * 全站路由與語系的單一事實來源。
 *
 * `astro.config.mjs`、Content Collections、頁面路由與測試都從這裡取值，因此
 * 「新增一個語系」= 在 LOCALES / LOCALE_TAGS 各加一項 + 建 `src/content/pages/<dir>/`
 * 與 `src/content/site/<dir>.md`。元件與 schema 都不需要改。
 */

export const SITE_URL = 'https://synaiq.com';

export const DEFAULT_LOCALE = 'zh-Hant';

/** 依 PRD-001 §2：zh-Hant 無前綴、其餘語系走 `/<locale>/` 前綴。 */
export const LOCALES = ['zh-Hant', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

/** `<html lang>` 與 hreflang 使用的 BCP 47 標記。 */
export const LOCALE_TAGS: Record<Locale, string> = {
  'zh-Hant': 'zh-Hant-TW',
  en: 'en',
};

/** 語言切換器顯示的語系名稱（以該語系自身書寫）。 */
export const LOCALE_NAMES: Record<Locale, string> = {
  'zh-Hant': '繁體中文',
  en: 'English',
};

/** 9 條內容路由；`home` 即語系根。 */
export const PAGE_SLUGS = [
  'home',
  'about',
  'products',
  'wally',
  'knowledge-base',
  'generative-ai',
  'agi',
  'media',
  'contact',
] as const;

export type PageSlug = (typeof PAGE_SLUGS)[number];

/** 不進 sitemap、且標記 noindex 的路由。 */
export const NOINDEX_PATHS = ['/styleguide/'];

/**
 * Content Collections 的目錄名與 entry id 前綴。
 * Astro `glob()` loader 會把路徑 slugify（轉小寫），所以內容目錄一律用小寫。
 */
export function contentDirFor(locale: Locale): string {
  return locale.toLowerCase();
}

/** 由內容目錄名反查語系；找不到就丟出可讀的錯誤。 */
export function localeFromContentDir(dir: string): Locale {
  const found = LOCALES.find((locale) => contentDirFor(locale) === dir);
  if (!found) {
    throw new Error(
      `未知的內容語系目錄「${dir}」；請先在 src/config/site.ts 的 LOCALES 加入對應語系。`,
    );
  }
  return found;
}

/** 由 slug 與 locale 算出站內絕對路徑（永遠帶結尾斜線）。 */
export function pathFor(locale: Locale, slug: PageSlug): string {
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  return slug === 'home' ? `${prefix}/` : `${prefix}/${slug}/`;
}

/** Content Collections 的 entry id：`<contentDir>/<slug>`。 */
export function entryIdFor(locale: Locale, slug: PageSlug): string {
  return `${contentDirFor(locale)}/${slug}`;
}
