import { BRAND, PRODUCT_BRAND } from './brand.js';
import { DEFAULT_LOCALE, LOCALE_CONFIG, LOCALE_ASSETS } from './locale-config.js';
import loaders from './locales/generated/loaders.js';
export { DEFAULT_LOCALE };
export const SUPPORTED_LOCALES = Object.freeze(LOCALE_CONFIG.map(({ code, label, shortLabel, dir }) => Object.freeze({ code, label, shortLabel, dir })));

export function resolveLocale(value) {
  return SUPPORTED_LOCALES.find(item => item.code.toLowerCase() === String(value ?? '').toLowerCase())?.code ?? DEFAULT_LOCALE;
}

/** Explicit URL choice wins. Only an absent parameter consults browser preferences. */
export function selectLocale(requested, browserLanguages = []) {
  if (requested !== null && requested !== undefined) return resolveLocale(requested);
  for (const value of browserLanguages) {
    let language = String(value).toLowerCase();
    while (language) {
      const match = LOCALE_CONFIG.find(item => item.browserLanguages.includes(language));
      if (match) return match.code;
      const separator = language.lastIndexOf('-');
      language = separator < 0 ? '' : language.slice(0, separator);
    }
  }
  return DEFAULT_LOCALE;
}

export function createMessageStore(loaders) {
  const ready = new Map();
  const pending = new Map();
  return {
    has: locale => ready.has(locale),
    get(locale) {
      if (!ready.has(locale)) throw new Error(`Language ${locale} is not loaded; await loadMessages first`);
      return ready.get(locale);
    },
    async load(locale) {
      if (!Object.hasOwn(loaders, locale)) throw new Error('Unsupported language');
      if (ready.has(locale)) return ready.get(locale);
      if (!pending.has(locale)) {
        pending.set(locale, Promise.resolve().then(() => loaders[locale]()).then(module => {
          ready.set(locale, module.default);
          return module.default;
        }).finally(() => pending.delete(locale)));
      }
      return pending.get(locale);
    },
  };
}

// This module has one canonical import URL, even when i18n.js has a version query.
// Static specifiers keep user-provided locale values out of resource paths.
const store = createMessageStore(loaders);
export const hasMessages = locale => store.has(resolveLocale(locale));
export const loadMessages = async (locale = DEFAULT_LOCALE) => {
  await store.load(resolveLocale(locale));
  return getMessages(locale);
};
export function getMessages(locale = DEFAULT_LOCALE) {
  const code = resolveLocale(locale), messages = store.get(code);
  return { ...messages, common: { ...messages.common, assets: LOCALE_ASSETS[code], brand: BRAND, productBrand: PRODUCT_BRAND } };
}
