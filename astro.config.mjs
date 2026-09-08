// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

import { draftPaths } from './src/config/drafts.ts';
import { DEFAULT_LOCALE, LOCALES, LOCALE_TAGS, NOINDEX_PATHS, SITE_URL } from './src/config/site.ts';

/** sitemap 需排除的路徑：手冊頁與所有 draft 內容（PRD-001 FR-106）。 */
const excluded = new Set([...NOINDEX_PATHS, ...draftPaths()]);

/** @type {Record<string, string>} */
const sitemapLocales = Object.fromEntries(LOCALES.map((locale) => [locale, LOCALE_TAGS[locale]]));

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: DEFAULT_LOCALE,
    locales: [...LOCALES],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    react(),
    sitemap({
      i18n: { defaultLocale: DEFAULT_LOCALE, locales: sitemapLocales },
      filter: (page) => {
        const path = new URL(page).pathname;
        return !excluded.has(path);
      },
    }),
  ],
});
