import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, readdir, lstat } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { DEFAULT_LOCALE, NAMESPACES, MEMBER_IDS } from '../locale-schema.js';

const root = new URL('../locales/', import.meta.url);
const languageTag = value => typeof value === 'string' && /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(value);
async function readJson(path) {
  const file = new URL(path, root);
  assert.ok((await lstat(file)).isFile(), `${path}: must be a regular JSON file`);
  return JSON.parse(await readFile(file, 'utf8'));
}
export async function discoverLocales() {
  const registry = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (entry.name === 'generated' || entry.isFile()) continue;
    assert.ok(entry.isDirectory() && languageTag(entry.name), `Invalid language folder: ${entry.name}`);
    const code = entry.name;
    assert.equal(Intl.getCanonicalLocales(code)[0], code, `Use canonical language folder: ${code}`);
    const meta = await readJson(`${code}/_meta.json`);
    assert.ok(meta && typeof meta === 'object' && !Array.isArray(meta), `${code}: invalid metadata`);
    const allowed = ['label', 'shortLabel', 'dir', 'og', 'browserLanguages', 'order', 'descriptionLimit', 'screen'];
    assert.ok(Object.keys(meta).every(key => allowed.includes(key)), `${code}: unknown metadata field`);
    for (const key of ['label', 'shortLabel']) assert.ok(typeof meta[key] === 'string' && meta[key].trim() && !/[<>\u0000-\u001f]/.test(meta[key]), `${code}: invalid ${key}`);
    assert.ok(/^[a-z]{2,3}_[A-Z]{2}$/.test(meta.og), `${code}: invalid Open Graph locale`);
    assert.ok(['ltr', 'rtl'].includes(meta.dir ?? 'ltr'), `${code}: invalid direction`);
    assert.ok(Number.isFinite(meta.order ?? 100), `${code}: invalid order`);
    assert.ok(Number.isInteger(meta.descriptionLimit ?? 160) && (meta.descriptionLimit ?? 160) > 0, `${code}: invalid description limit`);
    const aliases = meta.browserLanguages ?? [];
    assert.ok(Array.isArray(aliases) && aliases.every(languageTag), `${code}: invalid browser languages`);
    const screen = meta.screen ?? {};
    const limits = { labelWidth: [1, 600], answerLineLength: [0, 120], answerUnderlineOffset: [0, 64], answerNoteY: [450, 540] };
    assert.ok(screen && typeof screen === 'object' && !Array.isArray(screen), `${code}: invalid screen settings`);
    for (const [key, value] of Object.entries(screen)) assert.ok(limits[key] && Number.isFinite(value) && value >= limits[key][0] && value <= limits[key][1], `${code}: invalid screen.${key}`);
    registry.push({ code, label: meta.label, shortLabel: meta.shortLabel, dir: meta.dir ?? 'ltr', og: meta.og,
      suffix: code === DEFAULT_LOCALE ? '' : `-${code}`, browserLanguages: [...new Set([code, ...aliases].map(value => value.toLowerCase()))],
      order: meta.order ?? 100, descriptionLimit: meta.descriptionLimit ?? 160, screen });
  }
  assert.ok(registry.some(item => item.code === DEFAULT_LOCALE), 'Missing default language');
  registry.sort((a, b) => (a.code === DEFAULT_LOCALE ? -1 : b.code === DEFAULT_LOCALE ? 1 : a.order - b.order || (a.code < b.code ? -1 : 1)));
  const aliases = new Set();
  for (const item of registry) for (const alias of item.browserLanguages) {
    assert.ok(!aliases.has(alias), `Duplicate browser language alias: ${alias}`);
    aliases.add(alias);
  }
  return registry;
}
const placeholders = text => [...text.matchAll(/\{([a-zA-Z][\w]*)\}/g)].map(match => match[1]).sort();
export function validateTranslation(baseline, translation, path = '') {
  assert.equal(typeof translation, typeof baseline, `${path}: type mismatch`);
  assert.equal(Array.isArray(translation), Array.isArray(baseline), `${path}: array mismatch`);
  if (baseline !== null && typeof baseline === 'object') {
    assert.ok(translation !== null, `${path}: null translation`);
    assert.deepEqual(Object.keys(translation).sort(), Object.keys(baseline).sort(), `${path}: missing/extra keys or array entries`);
    for (const key of Object.keys(baseline)) validateTranslation(baseline[key], translation[key], `${path}.${key}`);
  } else {
    assert.equal(typeof baseline, 'string', `${path}: translations must be text`);
    if (baseline.trim()) assert.ok(translation.trim(), `${path}: blank translation`);
    assert.deepEqual(placeholders(translation), placeholders(baseline), `${path}: placeholder mismatch`);
  }
}

export async function generateLocales({ check = false } = {}) {
  const locales = await discoverLocales();
  const bundles = {};
  for (const { code } of locales) {
    const files = (await readdir(new URL(`${code}/`, root))).sort();
    assert.deepEqual(files, ['_meta', ...NAMESPACES].map(name => `${name}.json`).sort(), `${code}: missing or unexpected translation files`);
    bundles[code] = Object.fromEntries(await Promise.all(NAMESPACES.map(async namespace => [namespace, await readJson(`${code}/${namespace}.json`)])));
    validateTranslation(bundles['zh-Hant'], bundles[code], code);
    for (const [section, ids] of Object.entries(MEMBER_IDS)) {
      assert.equal(bundles[code].about[section].members.length, ids.length);
    }
  }
  // IDs are stable configuration, never editable translation text.
  for (const bundle of Object.values(bundles)) for (const [section, ids] of Object.entries(MEMBER_IDS)) {
    bundle.about[section].members = bundle.about[section].members.map((member, index) => ({ id: ids[index], ...member }));
  }
  const header = '// GENERATED by scripts/build-locales.mjs. Edit locales/<language>/*.json, not this file.\n';
  const outputs = locales.map(({ code }) => [`generated/${code}.js`, `${header}export default ${JSON.stringify(bundles[code])};\n`]);
  // Tiny loading/error messages remain available even when the full bundle cannot load.
  outputs.push(['generated/startup.js', `${header}export default ${JSON.stringify(Object.fromEntries(locales.map(({code}) => [code, bundles[code].startup])))};\n`]);
  outputs.push(['generated/registry.js', `${header}export default ${JSON.stringify(locales)};\n`]);
  outputs.push(['generated/loaders.js', `${header}export default {\n${locales.map(({code}) => `  ${JSON.stringify(code)}: () => import(${JSON.stringify(`./${code}.js`)}),`).join('\n')}\n};\n`]);
  const changed = [];
  for (const [file, source] of outputs) {
    const target = new URL(file, root);
    const existing = await readFile(target, 'utf8').catch(error => { if (error.code === 'ENOENT') return null; throw error; });
    if (existing?.replaceAll('\r\n', '\n') !== source) changed.push(file);
  }
  if (check) assert.equal(changed.length, 0, `Generated translations are stale: ${changed.join(', ')}. Run npm run build:locales.`);
  else {
    await mkdir(new URL('generated/', root), { recursive: true });
    for (const [file, source] of outputs) if (changed.includes(file)) await writeFile(new URL(file, root), source);
  }
  return { languages: locales.length, changed };
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  assert.ok(process.argv.slice(2).every(value => value === '--check'), 'Usage: build-locales.mjs [--check]');
  console.log(JSON.stringify(await generateLocales({ check: process.argv.includes('--check') })));
}
