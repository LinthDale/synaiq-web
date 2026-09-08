import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('consolidated pipeline is manual verification only and contains no upload job', () => {
  const pipeline = read('azure-pipelines.yml');
  assert.match(pipeline, /^trigger: none$/m);
  assert.match(pipeline, /^pr: none$/m);
  assert.match(pipeline, /npm run test:all/);
  assert.doesNotMatch(pipeline, /FtpUpload|HOSTINGER_|deployment:|clean: true/);
});

test('both source trees have explicit development and verification commands', () => {
  const { scripts } = JSON.parse(read('package.json'));
  assert.equal(scripts.dev, 'astro dev');
  assert.equal(scripts['dev:design'], 'node docs/design/live-prototype/share-preview.mjs');
  assert.equal(scripts['test:all'], 'npm test && npm run test:design');
  assert.match(read('.gitattributes'), /^\*\.svg text eol=lf$/m);
});
