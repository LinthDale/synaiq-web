import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { imageEquivalent } from './public-assets.mjs';

test('CDN content check allows recompression but rejects replaced images and aspect changes', async () => {
  const source = await sharp({ create: { width: 120, height: 80, channels: 3, background: '#ffeedd' } }).png().toBuffer();
  const webp = await sharp(source).webp({ quality: 90 }).toBuffer();
  assert.ok((await imageEquivalent(source, webp)).meanPixelError < 3);
  const moderate = await sharp(source).linear(0.96).png().toBuffer();
  const warning = await imageEquivalent(source, moderate);
  assert.ok(warning.meanPixelError >= 3 && warning.meanPixelError < 12);
  assert.equal(warning.compressionWarning, true);
  const replaced = await sharp({ create: { width: 120, height: 80, channels: 3, background: '#001122' } }).png().toBuffer();
  await assert.rejects(imageEquivalent(source, replaced));
  await assert.rejects(imageEquivalent(source, await sharp(source).resize(80, 80, { fit: 'fill' }).png().toBuffer()));
});
