import test from 'node:test';
import assert from 'node:assert/strict';
import { selectLocale, resolveLocale, createMessageStore, loadMessages, getMessages, hasMessages } from './locale-store.js';

test('explicit URL wins; browser preferences match regional tags in order', () => {
  assert.equal(selectLocale('en', ['de-DE']), 'en');
  assert.equal(selectLocale(null, ['not-supported', 'de-AT', 'en-US']), 'de');
  assert.equal(selectLocale(undefined, ['en-GB', 'de-DE']), 'en');
  assert.equal(selectLocale(null, ['zh-TW']), 'zh-Hant');
  assert.equal(selectLocale(null, ['zh-CN', 'en']), 'zh-Hant');
  assert.equal(selectLocale(null, ['not-supported']), 'zh-Hant');
  assert.equal(selectLocale(null, []), 'zh-Hant');
  assert.equal(selectLocale('../../private', ['de']), 'zh-Hant');
  assert.equal(selectLocale('', ['de']), 'zh-Hant');
  assert.equal(resolveLocale('DE'), 'de');
});

test('store loads only requested language, shares concurrent requests and retries failures', async () => {
  const calls = [];
  let fail = true;
  const store = createMessageStore({
    en: async () => { calls.push('en'); return { default: { value: 'English' } }; },
    de: async () => { calls.push('de'); if (fail) throw new Error('offline'); return { default: { value: 'Deutsch' } }; },
  });
  assert.throws(() => store.get('en'), /not loaded/);
  const [a, b] = await Promise.all([store.load('en'), store.load('en')]);
  assert.equal(a, b);
  assert.deepEqual(calls, ['en']);
  assert.equal(store.get('en'), a);
  await assert.rejects(store.load('de'), /offline/);
  fail = false;
  assert.equal((await store.load('de')).value, 'Deutsch');
  await assert.rejects(store.load('../../private'), /Unsupported/);
  assert.deepEqual(calls, ['en', 'de', 'de']);
});

test('canonical and versioned i18n imports share one store', async () => {
  await loadMessages('de');
  await loadMessages('en');
  await loadMessages();
  assert.equal(hasMessages('de'), true);
  assert.equal(getMessages().common.navigation.home, '首頁');
  const versioned = await import('./i18n.js?v=20260922-cases-expansion');
  assert.equal(versioned.getMessages('de').common.navigation.home, getMessages('de').common.navigation.home);
  assert.equal(getMessages('de').common.navigation.home, 'Startseite');
});
