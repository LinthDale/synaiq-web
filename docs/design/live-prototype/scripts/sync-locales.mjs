// Fresh processes make every stage consume the registry emitted by the preceding stage.
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

export function syncLocales({ check = false } = {}) {
  for (const script of ['build-locales.mjs', 'sync-brand-screens.mjs', 'build-sitemap.mjs', 'sync-locale-metadata.mjs']) {
    execFileSync(process.execPath, [fileURLToPath(new URL(script, import.meta.url)), ...(check ? ['--check'] : [])], { stdio: 'pipe', encoding: 'utf8' });
  }
}
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  try {
    assert.ok(process.argv.slice(2).every(value => value === '--check'), 'Usage: sync-locales.mjs [--check]');
    syncLocales({ check: process.argv.includes('--check') });
    console.log(process.argv.includes('--check') ? 'All locale outputs are current.' : 'Synced language registry, catalogs, screens, sitemap and metadata.');
  } catch (error) {
    console.error(error.stderr?.toString() || error.message);
    process.exitCode = 1;
  }
}
