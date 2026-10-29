import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, readFile, writeFile, readdir, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const source = fileURLToPath(new URL('./', import.meta.url));
async function fixture(t) {
  const folder = await mkdtemp(join(tmpdir(), 'synaiq-locale-test-'));
  t.after(async () => {
    assert.equal(dirname(resolve(folder)), resolve(tmpdir()));
    assert.ok(folder.includes('synaiq-locale-test-'));
    await rm(folder, { recursive: true });
  });
  await writeFile(join(folder, 'package.json'), '{"type":"module"}');
  for (const entry of await readdir(source)) if (entry.endsWith('.js')) await cp(join(source, entry), join(folder, entry));
  for (const entry of ['scripts', 'screen-templates']) await cp(join(source, entry), join(folder, entry), { recursive: true });
  await mkdir(join(folder, 'locales'));
  for (const code of ['zh-Hant', 'en', 'de', 'generated']) await cp(join(source, 'locales', code), join(folder, 'locales', code), { recursive: true });
  await mkdir(join(folder, 'assets'));
  for (const entry of ['taistro-logo-ink.svg', 'synaiq-logo-ink.svg', 'demo-paper-edge.webp', 'kip-wordmark.png', 'demo-sidebar-dialogues.webp', 'demo-send-pen.webp']) await cp(join(source, 'assets', entry), join(folder, 'assets', entry));
  await cp(join(source, 'page.html'), join(folder, 'page.html'));
  run(folder);
  return folder;
}
const run = (folder, args = []) => execFileSync(process.execPath, [join(folder, 'scripts/sync-locales.mjs'), ...args], { encoding: 'utf8', stdio: 'pipe' });

test('a fourth language needs only JSON: generation, loader, detection, assets, sitemap and freshness follow automatically', async t => {
  const folder = await fixture(t);
  await cp(join(folder, 'locales/en'), join(folder, 'locales/fr'), { recursive: true });
  // Fixture copy is not a translation intended for publication.
  await writeFile(join(folder, 'locales/fr/_meta.json'), JSON.stringify({ label: 'Français', shortLabel: 'FR', og: 'fr_FR' }));
  const common = JSON.parse(await readFile(join(folder, 'locales/fr/common.json'), 'utf8'));
  common.navigation.home = 'Accueil';
  await writeFile(join(folder, 'locales/fr/common.json'), JSON.stringify(common));
  run(folder);
  run(folder, ['--check']);
  const probe = `
    import assert from 'node:assert/strict';
    import {loadMessages,getMessages,selectLocale,hasMessages} from './locale-store.js';
    import {LOCALE_CONFIG,LOCALE_PUBLIC_FILES} from './locale-config.js';
    assert.equal(LOCALE_CONFIG.length,4);
    assert.equal(selectLocale(null,['fr-CA','de-DE']),'fr');
    assert.equal(selectLocale('en',['fr-CA']),'en');
    await loadMessages('fr');
    assert.equal(getMessages('fr').common.navigation.home,'Accueil');
    assert.equal(hasMessages('en'),false);
    assert.ok(LOCALE_PUBLIC_FILES.includes('locales/generated/fr.js'));
    assert.ok(LOCALE_PUBLIC_FILES.includes('assets/kip-search-demo-fr.svg'));
    assert.ok(!LOCALE_PUBLIC_FILES.some(x=>x.endsWith('.json')));
  `;
  execFileSync(process.execPath, ['--input-type=module', '-e', probe], { cwd: folder, stdio: 'pipe' });
  assert.match(await readFile(join(folder, 'sitemap.xml'), 'utf8'), /hreflang="fr"/);
  assert.match(await readFile(join(folder, 'assets/kip-search-demo-fr.svg'), 'utf8'), /<svg/);
  assert.match(await readFile(join(folder, 'page.html'), 'utf8'), /content="fr_FR"/);
  await writeFile(join(folder, 'locales/generated/fr.js'), '// stale');
  assert.throws(() => run(folder, ['--check']), /stale/i);
});

test('incomplete new language and ambiguous browser aliases fail before replacing generated registry', async t => {
  const folder = await fixture(t);
  const registry = join(folder, 'locales/generated/registry.js');
  const original = await readFile(registry, 'utf8');
  await mkdir(join(folder, 'locales/fr'));
  await writeFile(join(folder, 'locales/fr/_meta.json'), JSON.stringify({ label: 'Français', shortLabel: 'FR', og: 'fr_FR' }));
  assert.throws(() => run(folder), /ENOENT|missing/i);
  assert.equal(await readFile(registry, 'utf8'), original);
  await cp(join(folder, 'locales/en'), join(folder, 'locales/fr'), { recursive: true });
  await writeFile(join(folder, 'locales/fr/_meta.json'), JSON.stringify({ label: 'Français', shortLabel: 'FR', og: 'fr_FR', browserLanguages: ['en'] }));
  assert.throws(() => run(folder), /duplicate.*browser|ambiguous/i);
  assert.equal(await readFile(registry, 'utf8'), original);
});

test('the add command creates blank JSON scaffolds and refuses overwrite or escaping paths', async t => {
  const folder = await fixture(t);
  const add = code => execFileSync(process.execPath, [join(folder, 'scripts/add-locale.mjs'), code], { encoding: 'utf8', stdio: 'pipe' });
  add('ja');
  const metadata = JSON.parse(await readFile(join(folder, 'locales/ja/_meta.json'), 'utf8'));
  assert.equal(metadata.label, '日本語');
  assert.equal(metadata.og, 'ja_JP');
  assert.equal((await readdir(join(folder, 'locales/ja'))).length, 11);
  assert.equal(JSON.parse(await readFile(join(folder, 'locales/ja/common.json'), 'utf8')).navigation.home, '');
  assert.throws(() => add('ja'), /EEXIST/);
  assert.throws(() => add('../outside'), /BCP 47/);
  assert.throws(() => run(folder), /blank translation/);
});
