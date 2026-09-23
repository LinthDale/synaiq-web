import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createPreviewServer } from './share-preview.mjs';

test('paper demo preserves responsive navigation, notebook and localized send controls', {
  skip: !process.env.PLAYWRIGHT_EXECUTABLE_PATH,
}, async t => {
  const server = createPreviewServer();
  await new Promise(done => server.listen(0, '127.0.0.1', done));
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH });
  try {
    for (const locale of ['zh-Hant', 'en']) for (const width of [320,390,768,1440]) {
      await t.test(`${locale}/${width}`, async () => {
        const page = await browser.newPage({ viewport:{width,height:950}, reducedMotion:'reduce' });
        const errors=[]; page.on('pageerror',e=>errors.push(e.message));
        await page.route('https://**/*', route=>route.abort());
        try {
          await page.goto(`http://127.0.0.1:${server.address().port}/live-prototype/page.html?page=home&lang=${locale}`);
          const demo=page.locator('[data-demo-animation]'); await demo.scrollIntoViewIfNeeded();
          await page.locator('[data-demo-source-close]').click();
          assert.equal(await demo.getAttribute('data-state'),'answer','Reduced-motion notes can close');
          await page.locator('.film-citation').click();
          const note=page.locator('.film-note');
          assert.equal(await note.getAttribute('inert'),null);
          const sizes=await note.evaluate(n=>{
            const r=n.getBoundingClientRect(),f=n.querySelector('.film-note-disclaimer').getBoundingClientRect();
            return {fits:f.bottom<=r.bottom+1,paper:getComputedStyle(n).backgroundColor,edge:getComputedStyle(n,'::before').backgroundColor};
          });
          assert.ok(sizes.fits,'Notebook disclaimer exceeds its paper');
          assert.equal(sizes.paper,sizes.edge);
          await page.keyboard.press('Escape');
          assert.equal(await page.locator('.film-citation').getAttribute('aria-expanded'),'false');
          for(const scene of ['knowledge','text-image','image-image']) {
            await page.locator(`[data-demo-select="${scene}"]`).click();
            if(scene==='knowledge' && await demo.getAttribute('data-state')==='source') await page.locator('[data-demo-source-close]').click();
            const send=page.locator('.film-send');
            assert.equal((await send.innerText()).trim(),locale==='en'?'Send':'寄出');
            await send.locator('img').evaluate(i=>i.decode());
            assert.equal(await page.locator('.film-product-logo img').getAttribute('alt'),'Synaiq');
            if(width<700) {
              await page.locator('[data-demo-sidebar-toggle]').click();
              assert.equal(await page.locator('.film-sidebar').isVisible(),true);
              const fits=await page.locator('.film-sidebar').evaluate(s=>[...s.children].every(c=>c.getBoundingClientRect().bottom<=s.getBoundingClientRect().bottom+1));
              assert.ok(fits,'Sidebar content is clipped');
              await page.keyboard.press('Escape');
              assert.equal(await page.locator('[data-demo-sidebar-toggle]').getAttribute('aria-expanded'),'false');
            } else assert.equal(await page.locator('.film-sidebar').isVisible(),true);
            assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
          }
          assert.deepEqual(errors,[]);
        } finally { await page.close(); }
      });
    }
  } finally { await browser.close(); await new Promise(done=>server.close(done)); }
});
