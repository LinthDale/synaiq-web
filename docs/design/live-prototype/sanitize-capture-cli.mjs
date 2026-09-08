import { readFile, writeFile, unlink } from 'node:fs/promises';
import { resolve, dirname, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { sanitizeCapture } from './sanitize-capture.mjs';

const [source, destination] = process.argv.slice(2);
if (!source || !destination || resolve(source) === resolve(destination)) {
  throw new Error('Pass distinct private input and sanitized output paths.');
}
const inputPath = resolve(source);
const parent = dirname(inputPath);
if (basename(inputPath) !== 'private-input.png' ||
    !/^synaiq-capture-[a-f0-9]{32}$/.test(basename(parent)) ||
    dirname(parent).toLowerCase() !== resolve(tmpdir()).toLowerCase()) {
  throw new Error('Input must be this workflow’s named capture in its task-owned temporary directory.');
}
try {
  const clean = await sanitizeCapture(await readFile(source));
  await writeFile(destination, clean, { flag: 'wx' });
} finally {
  // This one task-owned temporary capture must never survive a failed redaction.
  await unlink(source);
}
