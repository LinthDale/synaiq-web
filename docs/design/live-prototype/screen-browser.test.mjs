import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createPreviewServer } from './share-preview.mjs';

test('static product illustrations render embedded paper assets with text inside the screen', {
  skip: !process.env.PLAYWRIGHT_EXECUTABLE_PATH,
}, async () => {
  const server = createPreviewServer();
  await new Promise(done => server.listen(0, '127.0.0.1', done));
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    for (const screen of ['search', 'library']) for (const suffix of ['', '-en']) {
      const name = `kip-${screen}-demo${suffix}.svg`;
      const response = await page.goto(`http://127.0.0.1:${server.address().port}/live-prototype/assets/${name}`);
      assert.equal(response.status(), 200);
      const findings = await page.evaluate(async () => {
        await document.fonts.ready;
        const images = await Promise.all([...document.querySelectorAll('image')].map(async node => {
          const img = new Image(); img.src = node.getAttribute('href');
          try { await img.decode(); return img.naturalWidth > 0; } catch { return false; }
        }));
        const overflow = [...document.querySelectorAll('text')].filter(node => {
          const r = node.getBBox();
          return r.x < 0 || r.y < 0 || r.x + r.width > 1432 || r.y + r.height > 900
            || (node.getAttribute('x') === '30' && r.x + r.width > 221);
        }).map(node => node.textContent);
        return { images, overflow };
      });
      assert.ok(findings.images.every(Boolean), `${name}: embedded asset decode failed`);
      assert.deepEqual(findings.overflow, [], `${name}: text crosses the screen/sidebar edge`);
    }
  } finally { await browser.close(); await new Promise(done => server.close(done)); }
});
