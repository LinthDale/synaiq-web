import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, lstat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { DECISION_MOBILE_BUNDLE_SIZE, DECISION_MOBILE_BUNDLE_FILES, DECISION_MOBILE_FRAME_FILES } from '../decision-frames.js';
import { syncDecisionMobile } from './sync-decision-mobile.mjs';
const root = new URL('../', import.meta.url);
export async function syncDecisionMobileBundles({ check = false } = {}) {
  await syncDecisionMobile({ check: true });
  let size = 0;
  for (const [id, path] of DECISION_MOBILE_BUNDLE_FILES.entries()) {
    const start = id * DECISION_MOBILE_BUNDLE_SIZE, frames = [];
    for (const file of DECISION_MOBILE_FRAME_FILES.slice(start, start + DECISION_MOBILE_BUNDLE_SIZE)) {
      frames.push(`data:image/webp;base64,${(await readFile(new URL(file, root))).toString('base64')}`);
    }
    const bytes = Buffer.from(JSON.stringify({ schema: 1, start, frames }) + '\n');
    assert.ok(bytes.length < 600_000); size += bytes.length;
    const target = new URL(path, root);
    if (check) {
      assert.equal((await lstat(target)).isSymbolicLink(), false);
      // Git may check text assets out as CRLF on Windows; packaged bytes use git show.
      assert.equal((await readFile(target, 'utf8')).replaceAll('\r\n', '\n'), bytes.toString('utf8'));
    }
    else { await mkdir(new URL('./', target), { recursive: true }); await writeFile(target, bytes, { flag: 'wx' }); }
  }
  return { files: DECISION_MOBILE_BUNDLE_FILES.length, frames: DECISION_MOBILE_FRAME_FILES.length, bytes: size };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) console.log(await syncDecisionMobileBundles({ check: process.argv.includes('--check') }));
