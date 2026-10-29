import registry from './locales/generated/registry.js';
export { DEFAULT_LOCALE, NAMESPACES, MEMBER_IDS } from './locale-schema.js';
export const LOCALE_CONFIG = Object.freeze(registry.map(item => Object.freeze(item)));
// Keep the prefix a literal so release packaging can relocate generated screen assets.
const assetRoot = 'assets/';
export const LOCALE_ASSETS = Object.freeze(Object.fromEntries(LOCALE_CONFIG.map(({ code, suffix }) => [code, {
  searchScreen: `${assetRoot}kip-search-demo${suffix}.svg`,
  libraryScreen: `${assetRoot}kip-library-demo${suffix}.svg`,
}])));
// Exact generated files only. JSON sources and arbitrary files stay private.
export const LOCALE_PUBLIC_FILES = Object.freeze([
  'locales/generated/registry.js', 'locales/generated/loaders.js', 'locales/generated/startup.js',
  ...LOCALE_CONFIG.flatMap(({ code }) => [`locales/generated/${code}.js`, ...Object.values(LOCALE_ASSETS[code])]),
]);
