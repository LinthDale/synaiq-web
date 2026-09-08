import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { sanitizeCapture, redactionRegions } from './sanitize-capture.mjs';

test('wrong viewport fails closed', async () => {
  const wrong = await sharp({ create: { width: 1000, height: 680, channels: 3, background: '#ff0000' } }).png().toBuffer();
  await assert.rejects(sanitizeCapture(wrong), /Capture width changed/);
});

test('all redaction pixels are independent of the underlying private image', async () => {
  const makeInput = color => sharp({ create: { width: 1280, height: 720, channels: 3, background: color } }).png().toBuffer();
  const red = await sanitizeCapture(await makeInput('#ff0000'));
  const blue = await sanitizeCapture(await makeInput('#0000ff'));
  for (const { x, y, width, height } of redactionRegions) {
    const bounds = { left: x, top: y, width, height };
    const a = await sharp(red).extract(bounds).raw().toBuffer();
    const b = await sharp(blue).extract(bounds).raw().toBuffer();
    assert.deepEqual(a, b, 'A redaction region still depends on the original pixels');
  }
  const metadata = await sharp(red).metadata();
  assert.equal(metadata.hasAlpha, false);
  assert.equal(metadata.exif, undefined);
  assert.equal(metadata.xmp, undefined);
});
