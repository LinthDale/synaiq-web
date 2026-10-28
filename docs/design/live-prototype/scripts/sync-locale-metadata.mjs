import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { DEFAULT_LOCALE, LOCALE_CONFIG } from '../locale-config.js';

const check = process.argv.includes('--check');
assert.ok(process.argv.slice(2).every(value => value === '--check'));
const path = new URL('../page.html', import.meta.url);
const source = (await readFile(path, 'utf8')).replaceAll('\r\n', '\n');
const start = '<!-- generated-locale-alternates:start -->';
const end = '<!-- generated-locale-alternates:end -->';
assert.equal(source.split(start).length, 2, 'Missing/duplicate generated metadata marker');
assert.equal(source.split(end).length, 2, 'Missing/duplicate generated metadata marker');
const tags = LOCALE_CONFIG.filter(item => item.code !== DEFAULT_LOCALE).map(item => `<meta property="og:locale:alternate" content="${item.og}">`).join('\n');
const updated = source.replace(/<!-- generated-locale-alternates:start -->[\s\S]*?<!-- generated-locale-alternates:end -->/, `${start}\n${tags}\n${end}`);
if (check) assert.equal(source, updated, 'Generated locale metadata is stale. Run npm run i18n:sync.');
else if (source !== updated) await writeFile(path, updated);
