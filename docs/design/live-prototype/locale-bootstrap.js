import { selectLocale, loadMessages, SUPPORTED_LOCALES } from './locale-store.js';
import startup from './locales/generated/startup.js';

export function showLocaleStatus(locale, { error = false, document = globalThis.document, window = globalThis.window } = {}) {
  const copy = startup[locale];
  let status = document.getElementById('locale-status');
  if (!status) {
    status = document.createElement('div');
    status.id = 'locale-status';
    document.body.prepend(status);
  }
  status.replaceChildren();
  status.lang = locale;
  status.setAttribute('role', error ? 'alert' : 'status');
  const text = document.createElement('p');
  text.textContent = error ? copy.error : copy.loading;
  status.append(text);
  if (error) {
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.textContent = copy.retry;
    // A fresh document also clears a browser's failed dynamic-import module record.
    retry.addEventListener('click', () => window.location.reload());
    status.append(retry);
    const select = document.createElement('select');
    select.setAttribute('aria-label', copy.language);
    for (const item of SUPPORTED_LOCALES) {
      const option = document.createElement('option');
      option.value = item.code;
      option.textContent = item.label;
      option.selected = item.code === locale;
      select.append(option);
    }
    select.addEventListener('change', () => {
      const target = new URL(window.location.href);
      target.searchParams.set('lang', select.value);
      window.location.href = target.href;
    });
    status.append(select);
  }
}

// Complete before dependent page modules read getMessages(). No implicit Node preloading.
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const url = new URL(window.location.href);
  const locale = selectLocale(url.searchParams.get('lang'), window.navigator.languages ?? [window.navigator.language]);
  document.documentElement.lang = locale;
  if (url.searchParams.get('lang') !== locale) {
    url.searchParams.set('lang', locale);
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }
  showLocaleStatus(locale);
  try { await loadMessages(locale); }
  catch (error) { showLocaleStatus(locale, { error: true }); throw error; }
}
