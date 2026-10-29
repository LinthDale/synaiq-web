// Scaffold empty translations only; no machine translation or publication is implied.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile, lstat } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { DEFAULT_LOCALE, NAMESPACES } from '../locale-schema.js';

const root = new URL('../locales/', import.meta.url);
export async function addLocale(code) {
  assert.ok(typeof code === 'string' && /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(code), 'Use a BCP 47 language code, e.g. ja or fr');
  assert.equal(Intl.getCanonicalLocales(code)[0], code, 'Use the canonical code, e.g. pt-BR');
  assert.ok((await lstat(root)).isDirectory() && !(await lstat(root)).isSymbolicLink(), 'Invalid locale root');
  const locale = new Intl.Locale(code);
  const label = new Intl.DisplayNames([code], { type: 'language' }).of(code);
  const maximized = locale.maximize();
  assert.ok(maximized.region, 'Cannot infer Open Graph region for this language');
  const metadata = { label, shortLabel: code.toUpperCase(), dir: locale.getTextInfo().direction,
    og: `${locale.language}_${maximized.region}`, descriptionLimit: ['zh', 'ja', 'ko'].includes(locale.language) ? 80 : 160 };
  const blank = value => Array.isArray(value) ? value.map(blank) : value && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, blank(item)])) : '';
  const outputs = [['_meta', metadata]];
  for (const namespace of NAMESPACES) outputs.push([namespace, blank(JSON.parse(await readFile(new URL(`${DEFAULT_LOCALE}/${namespace}.json`, root), 'utf8')))]);
  const folder = new URL(`${code}/`, root);
  // Exclusive directory creation refuses existing languages, files and links.
  await mkdir(folder);
  for (const [name, value] of outputs) await writeFile(new URL(`${name}.json`, folder), `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' });
  return code;
}
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  try {
    assert.equal(process.argv.length, 3, 'Usage: npm run i18n:add -- ja');
    const code = await addLocale(process.argv[2]);
    console.log(`Created locales/${code}/ with metadata and 10 empty translation files. Translate them, then run npm run i18n:sync. Incomplete translations block checks.`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
