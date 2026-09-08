import { SUPPORTED_LOCALES, getMessages, resolveLocale, pageHref, escapeHtml } from './i18n.js';

export function readPreviewRoute(href) {
  const url = new URL(href, 'https://preview.invalid/');
  let hash = url.hash.slice(1);
  try { hash = decodeURIComponent(hash); } catch { /* Keep a malformed fragment as literal text. */ }
  return { page: url.searchParams.get('page') === 'kip' ? 'kip' : 'home', locale: resolveLocale(url.searchParams.get('lang')), hash };
}

export function previewPageHref(route) { return `page.html${pageHref(route)}`; }

const format = (template, values) => template.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);

export function initPreview({ document = globalThis.document, window = globalThis.window, ResizeObserver = globalThis.ResizeObserver } = {}) {
  const ids = ['stage', 'viewport', 'preview', 'width', 'page', 'language', 'fit', 'readout', 'direct', 'status', 'metrics'];
  const nodes = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
  const { stage, viewport, preview: frame, width, page, language } = nodes;
  let route = readPreviewRoute(window.location.href);
  let frameWindow;
  let copy;
  language.innerHTML = SUPPORTED_LOCALES.map(item => `<option value="${escapeHtml(item.code)}">${escapeHtml(item.label)}</option>`).join('');

  function updateShellUrl() {
    nodes.direct.href = new URL(previewPageHref(route), window.location.href).href;
    const url = new URL(window.location.href);
    url.searchParams.set('page', route.page);
    url.searchParams.set('lang', route.locale);
    url.hash = new URL(previewPageHref(route), url).hash;
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }

  function inspect() {
    try {
      const doc = frame.contentDocument;
      if (!doc?.querySelector('h1')) { nodes.metrics.textContent = copy.waiting; return; }
      const root = doc.documentElement;
      nodes.metrics.textContent = format(copy.metrics, { width: root.clientWidth, scroll: root.scrollWidth, result: root.scrollWidth > root.clientWidth ? copy.overflow : copy.fits });
    } catch { nodes.metrics.textContent = copy.waiting; }
  }

  function resize() {
    const w = Math.max(320, Math.min(1600, Number(width.value) || 1440));
    const available = Math.max(1, stage.clientWidth - 32);
    const scale = Math.min(1, available / w);
    const height = Math.max(240, Math.floor((stage.clientHeight - 32) / scale));
    width.value = String(w);
    viewport.style.width = `${w}px`;
    viewport.style.marginLeft = `${Math.max(0, (available - w * scale) / 2)}px`;
    viewport.style.transform = `scale(${scale})`;
    frame.style.height = `${height}px`;
    nodes.readout.value = `${w} px`;
    nodes.status.textContent = format(copy.status, { width: w, scale: Math.round(scale * 100) });
  }

  function localize() {
    const common = getMessages(route.locale).common;
    copy = common.preview;
    document.documentElement.lang = route.locale;
    document.documentElement.dir = SUPPORTED_LOCALES.find(item => item.code === route.locale).dir;
    document.title = copy.title;
    document.querySelectorAll('[data-preview-label]').forEach(node => { node.textContent = copy[node.dataset.previewLabel]; });
    for (const option of page.options) option.textContent = common.navigation[option.value];
    page.value = route.page;
    language.value = route.locale;
    frame.title = copy.frame;
    resize();
    inspect();
  }

  function navigate(nextRoute) {
    route = nextRoute;
    localize();
    updateShellUrl();
    frame.src = previewPageHref(route);
  }

  function syncFromFrame() {
    try {
      const url = new URL(frame.contentWindow.location.href);
      // Ignore the initial about:blank document and any navigation outside this preview.
      if (url.origin !== window.location.origin || url.pathname !== new URL('page.html', window.location.href).pathname) return;
      route = readPreviewRoute(url.href);
      localize();
      updateShellUrl();
    } catch { nodes.metrics.textContent = copy.waiting; }
  }

  function loaded() {
    try {
      frameWindow?.removeEventListener('hashchange', syncFromFrame);
      frameWindow = frame.contentWindow;
      frameWindow.addEventListener('hashchange', syncFromFrame);
    } catch { /* The prototype is expected to stay same-origin. */ }
    syncFromFrame();
    inspect();
  }

  const resizeAndInspect = () => { resize(); window.requestAnimationFrame(inspect); };
  const fit = () => { width.value = String(Math.max(320, Math.min(1600, stage.clientWidth - 32))); resizeAndInspect(); };
  const changePage = () => navigate({ page: page.value === 'kip' ? 'kip' : 'home', locale: route.locale, hash: '' });
  const changeLanguage = () => navigate({ ...route, locale: resolveLocale(language.value) });
  const restoreRoute = () => navigate(readPreviewRoute(window.location.href));
  width.addEventListener('input', resizeAndInspect);
  page.addEventListener('change', changePage);
  language.addEventListener('change', changeLanguage);
  nodes.fit.addEventListener('click', fit);
  frame.addEventListener('load', loaded);
  window.addEventListener('resize', resizeAndInspect);
  window.addEventListener('popstate', restoreRoute);
  window.addEventListener('hashchange', restoreRoute);
  navigate(route);
  const observer = new ResizeObserver(resizeAndInspect);
  observer.observe(stage);
  const timer = window.setInterval(inspect, 1000);
  return () => {
    observer.disconnect();
    window.clearInterval(timer);
    width.removeEventListener('input', resizeAndInspect);
    page.removeEventListener('change', changePage);
    language.removeEventListener('change', changeLanguage);
    nodes.fit.removeEventListener('click', fit);
    frame.removeEventListener('load', loaded);
    window.removeEventListener('resize', resizeAndInspect);
    window.removeEventListener('popstate', restoreRoute);
    window.removeEventListener('hashchange', restoreRoute);
    try { frameWindow?.removeEventListener('hashchange', syncFromFrame); } catch { /* Navigated away. */ }
  };
}

if (typeof document !== 'undefined' && document.getElementById('preview')) initPreview();
