import assert from 'node:assert/strict';
import sharp from 'sharp';

// Approved local-only opaque redaction for the inspected EMPTY chat entrance.
// Never persist or emit the input. Fail closed if the capture geometry changes.
// Not suitable for populated conversations, document lists, or another viewport.
export const redactionRegions = [
  { x: 0, y: 0, width: 280, height: 56, fill: '#23272f' },
  { x: 0, y: 570, width: 280, height: 150, fill: '#23272f' },
  { x: 600, y: 120, width: 350, height: 100, fill: '#1d2026' },
  { x: 280, y: 660, width: 1000, height: 60, fill: '#1d2026' },
];

export async function sanitizeCapture(input) {
  const metadata = await sharp(input).metadata();
  assert.equal(metadata.width, 1280, 'Capture width changed; inspect again before redacting.');
  assert.equal(metadata.height, 720, 'Capture height changed; inspect again before redacting.');
  const rectangles = redactionRegions.map(r => `<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" fill="${r.fill}"/>`).join('');
  const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720">${rectangles}<g font-family="Microsoft JhengHei, sans-serif" font-size="14" fill="#abb1bb"><text x="18" y="34">企業識別已移除</text><text x="18" y="611">使用者資訊已移除</text><text x="18" y="638" font-size="12">去識別化產品畫面</text><text x="780" y="192" text-anchor="middle">品牌識別已移除</text></g></svg>`);
  // Flatten the masks into the pixels; no original image or metadata is embedded.
  return sharp(input).composite([{ input: overlay }]).removeAlpha().png().toBuffer();
}
