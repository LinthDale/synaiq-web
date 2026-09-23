import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { PUBLIC_FILES } from './share-preview.mjs';
import { renderContact } from './shared-design.js';
import { getMessages } from './i18n.js';

const css = readFileSync(new URL('./site.css', import.meta.url), 'utf8');

test('shared consultation keeps its copy and places the decorative cat above its real email link', () => {
  const contact = renderContact(getMessages().common);
  assert.ok(contact);
  assert.match(contact, /先講一個場景，<br>我們回一個做法。/);
  assert.match(contact, /從資料來源、使用對象與查詢需求開始，<br>一起確認第一個可驗證的知識流程。/);
  assert.match(contact, /class="contact-invitation">\s*<img[^>]*src="assets\/contact-cat-yarn-v1\.webp"[^>]*alt=""[^>]*>\s*<a class="button inverse" href="mailto:service@taistro.com.tw">洽談導入<\/a>/);
  assert.match(contact, /width="900" height="600"/);
  assert.match(css, /\.contact-invitation\s*\{[^}]*flex-direction:\s*column/);
  assert.match(css, /\.contact-cat\s*\{[^}]*height:\s*auto/);
});

test('only the final cat illustration is shared, not its generation notes', () => {
  assert.ok(statSync(new URL('./assets/contact-cat-yarn-v1.webp', import.meta.url)).size > 1000);
  assert.ok(PUBLIC_FILES.some(entry => entry.file === 'assets/contact-cat-yarn-v1.webp'));
  assert.ok(!PUBLIC_FILES.some(entry => entry.file === 'contact-cat-notes.md'));
});
