import { getMessages, escapeHtml } from './i18n.js';

// 動畫引擎：日常調整只改 tokens.css；這裡不保留第二份秒數／次數預設值。
// CSS 設定缺漏或格式不合法時顯示靜態內容，不能把產品藏起來。
export function readMotionNumber(style, name, { time = false, integer = false, max = Infinity } = {}) {
  const raw = style.getPropertyValue(name).trim();
  const match = raw.match(time ? /^(\d+(?:\.\d+)?|\.\d+)(ms|s)$/ : /^(\d+(?:\.\d+)?|\.\d+)$/);
  if (!match) return null;
  const value = Number(match[1]) * (time && match[2] === 's' ? 1000 : 1);
  return Number.isFinite(value) && value <= max && (!integer || Number.isInteger(value)) ? value : null;
}

const demoStates = ['question', 'click', 'answer', 'source', 'library'];
export function readDemoTiming(style) {
  const durations = demoStates.map(state => readMotionNumber(style, `--demo-${state}-hold`, { time: true }));
  const count = readMotionNumber(style, '--demo-play-count', { integer: true });
  const threshold = readMotionNumber(style, '--demo-view-threshold', { max: 1 });
  if (count === null || threshold === null || durations.some(value => value === null || value <= 0)) return null;
  const total = durations.reduce((sum, value) => sum + value, 0);
  return Number.isFinite(total) ? { durations, total, count, threshold } : null;
}

export function demoFrameAt(milliseconds, timing) {
  if (!timing || !Number.isFinite(milliseconds)) return 'source';
  if (timing.count > 0 && milliseconds >= timing.total * timing.count) return 'library';
  let t = ((milliseconds % timing.total) + timing.total) % timing.total;
  for (let index = 0; index < demoStates.length; index++) {
    if (t < timing.durations[index]) return demoStates[index];
    t -= timing.durations[index];
  }
  return 'library';
}

// 04 產品組圖：捲出整段後才準備下一次出場，接近門檻時不閃爍。
export function initProductReveal() {
  const reveal = document.querySelector('[data-product-reveal]');
  if (!reveal) return () => {};
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let observer, played = 0;
  function configure() {
    observer?.disconnect();
    const style = getComputedStyle(reveal);
    const count = readMotionNumber(style, '--product-reveal-count', { integer: true });
    const threshold = readMotionNumber(style, '--product-reveal-threshold', { max: 1 });
    if (preference.matches || count === null || threshold === null || !('IntersectionObserver' in globalThis)) {
      reveal.classList.remove('reveal-motion');
      reveal.classList.add('is-visible');
      return;
    }
    if (count > 0 && played >= count) return;
    if (!reveal.classList.contains('reveal-motion')) reveal.classList.remove('is-visible');
    reveal.classList.add('reveal-motion');
    // 橫向手機可能裝不下整段；限制到視窗實際可達比例，1px 避免浮點邊界。
    const height = reveal.getBoundingClientRect().height;
    const reachableThreshold = Math.min(threshold, Math.max(0, window.innerHeight - 1) / Math.max(1, height));
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          reveal.classList.remove('is-visible');
        } else if (entry.intersectionRatio >= reachableThreshold && !reveal.classList.contains('is-visible')) {
          reveal.classList.add('is-visible');
          played += 1;
          if (count > 0 && played >= count) { observer.disconnect(); break; }
        }
      }
    }, { threshold: [...new Set([0, reachableThreshold])] });
    observer.observe(reveal);
  }
  configure();
  const resizeObserver = new ResizeObserver(configure);
  resizeObserver.observe(reveal);
  window.addEventListener('resize', configure);
  preference.addEventListener('change', configure);
  return () => { observer?.disconnect(); resizeObserver.disconnect(); window.removeEventListener('resize', configure); preference.removeEventListener('change', configure); };
}

// 三片共用同一個產品介面；只替換訊息、結果與附件，不另造搜尋頁。
function renderChatFilm(messages, { question, answer, panels, draft = '', thinking = messages.demo.thinking, image = false }) {
  const m = messages.demo;
  const e = escapeHtml;
  return `<div class="demo-film${image ? ' image-search-film' : ''}">
      <div class="film-top"><span class="film-logo"><img src="${e(messages.common.brand.ink)}" width="844" height="143" alt="SynaiQ"></span><span class="film-wordmark"><span class="film-kip"><img src="assets/kip-wordmark.png" width="275" height="96" alt="KIP"></span><span class="film-wordmark-label">${e(m.productLabel)}</span></span></div>
      <div class="film-mobilebar"><button type="button" data-demo-sidebar-toggle aria-controls="demo-history" aria-expanded="false">${e(m.history)} ▾</button></div>
      <div class="film-body">
        <nav class="film-sidebar" id="demo-history" aria-label="${e(m.history)}"><div class="film-sidebar-heading"><span>${e(m.history)}</span><button type="button" data-demo-sidebar-close>${e(m.collapse)} ×</button></div><button type="button" class="film-new">${e(m.newChat)}</button><small>${e(m.recentQuestions)}</small><button type="button" class="film-nav-question" aria-current="page">${e(m.warrantyTopic)}</button><button type="button" class="film-nav-library">${e(m.knowledgeCenter)}</button><button type="button" class="film-nav-source">${e(m.sourceTopic)}</button><div class="film-sidebar-art" aria-hidden="true"><img src="assets/demo-sidebar-dialogues.webp" width="512" height="512" alt="" draggable="false"></div><small class="film-workspace">${e(m.workspace)}</small></nav>
        <button type="button" class="film-sidebar-scrim" data-demo-sidebar-close aria-label="${e(m.collapse)} ${e(m.history)}"></button>
        <div class="film-chat"><small class="film-breadcrumb">${e(image ? m.booth.collection : m.breadcrumb)}</small><div class="film-question">${question}</div><div class="film-thinking"><i></i><i></i><i></i><span>${e(thinking)}</span></div><div class="film-answer"><span class="film-avatar">${e(m.avatar)}</span><div>${answer}</div></div><div class="film-input">${draft ? `<span class="film-input-draft">${draft}</span>` : ''}<span class="film-input-placeholder">${e(m.followUp)}</span><span class="film-send"><span>${e(m.send)}</span><span class="film-send-pen" aria-hidden="true"><img src="assets/demo-send-pen.webp" width="256" height="256" alt="" draggable="false"></span></span></div></div>
        ${panels}
      </div><span class="film-cursor" aria-hidden="true"><i></i></span>
    </div>`;
}

function renderKnowledgeFilm(messages) {
  const m = messages.demo, e = escapeHtml;
  return renderChatFilm(messages, {
    question: `<span>${e(m.question)}</span>`,
    answer: `<p>${e(m.answer)}<br><span class="marked">${e(m.answerHighlight)}</span></p><small>${e(m.answerNote)}</small><button type="button" class="film-citation" aria-expanded="false" aria-controls="demo-source-note"><small>${e(m.citationLabel)}</small><span>${e(m.citationFilename)} <b>${e(m.citationPage)}</b></span></button>`,
    panels: `<section class="film-source film-note" id="demo-source-note" aria-label="${e(m.sourceRegion)}" inert><div class="film-note-top"><small>${e(m.sourceLabel)}</small><button type="button" data-demo-source-close>${e(m.close)} ×</button></div><h4>${e(m.sourceTitle)}</h4><div class="film-note-body"><p class="film-source-label">${e(m.sourceHeading)}</p><p><mark>${e(m.answerHighlight)}</mark></p><span class="film-note-scribble">${e(m.sourceScribble)}</span></div><small class="film-note-disclaimer">${e(m.sourceNote)}</small></section>
      <div class="film-library"><small>${e(m.libraryLabel)}</small><h4>${e(m.libraryTitle)}</h4><p>${e(m.libraryIntro)}</p><div class="film-table"><div>${m.tableHeaders.map(copy => `<span>${e(copy)}</span>`).join('')}</div>${m.tableRows.map(row => `<div>${row.map(copy => `<span>${e(copy)}</span>`).join('')}</div>`).join('')}</div><small>${e(m.libraryNote)}</small></div>`,
  });
}

const demoScenes = ['knowledge', 'text-image', 'image-image'];
export const demoSceneAt = index => demoScenes[((index % demoScenes.length) + demoScenes.length) % demoScenes.length];
const imageAssets = [
  { name: 'Wally 2 PLUS', file: 'Wally_2_PLUS.png', src: '/brand/wally-2-plus.png' },
  { name: 'Wally 2', file: 'Wally_2.png', src: '/brand/wally/wally-2.png' },
  { name: 'Wally Mini', file: 'Wally_Mini.png', src: '/brand/wally-mini.png' },
];
const imageCopy = (scene, m) => scene === 'image-image' ? m.booth.imageImage : m.booth.textImage;

export function renderDemoFilm(scene, messages) {
  if (!demoScenes.includes(scene) || scene === 'knowledge') return renderKnowledgeFilm(messages);
  const m = messages.demo, b = m.booth, copy = imageCopy(scene, m), e = escapeHtml;
  const images = scene === 'image-image' ? [imageAssets[2], imageAssets[0], imageAssets[1]] : imageAssets;
  const selected = images[0];
  const picture = item => `<img src="${item.src}" alt="${e(b.imageAlt)} — ${e(item.name)}">`;
  const thumbnail = scene === 'image-image' ? `<span class="image-query-thumb">${picture(selected)}</span>` : '';
  return renderChatFilm(messages, {
    image: true, thinking: copy.loading,
    question: `${thumbnail}<span>${e(copy.query)}</span>`,
    draft: `${thumbnail}<span class="image-query-text">${e(copy.query)}</span>`,
    answer: `<p class="image-search-match">${e(copy.matching)}</p><small class="image-result-heading">${e(b.resultLabel)} · ${e(b.resultCount)}</small><div class="image-results">${images.map((item, index) => `<figure class="image-result" style="--result-order:${index}"><div class="image-result-photo">${picture(item)}</div><figcaption><strong>${e(item.name)}</strong><span>${e(b.candidate)}</span></figcaption></figure>`).join('')}</div><small class="image-search-note">${e(b.example)}</small>`,
    panels: `<div class="film-source image-search-preview"><span class="image-preview-kicker">${e(b.original)}</span><div class="image-preview-photo">${picture(selected)}</div><h4>${e(selected.name)}</h4><dl><dt>${e(b.fileLabel)}</dt><dd>${e(selected.file)}</dd><dt>${e(b.folderLabel)}</dt><dd>${e(b.folder)}</dd></dl><span class="image-preview-open">${e(b.open)}</span></div>`,
  });
}

function renderDemoChapters(scene, m) {
  const labels = scene === 'knowledge' ? m.chapters : imageCopy(scene, m).chapters;
  return ['question', 'source', 'library'].map((chapter, index) => `<li data-chapter="${chapter}"><span>0${index + 1}</span>${escapeHtml(labels[index])}</li>`).join('');
}

export function renderAnimatedDemo({ locale = 'zh-Hant', messages = getMessages(locale) } = {}) {
  const m = messages.demo, b = m.booth, e = escapeHtml;
  const arrow = direction => `<svg viewBox="0 0 32 20" width="32" height="20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><path d="${direction === 'prev' ? 'M29 10H3m8-7-8 7 8 7' : 'M3 10h26m-8-7 8 7-8 7'}"/></svg>`;
  return `<div class="animated-product demo-booth" data-demo-animation data-demo-scene="knowledge" data-state="answer" role="region" aria-label="${e(b.label)} — ${e(m.groupLabel)}">
    <div class="demo-booth-navigation">
      <button type="button" class="demo-booth-arrow" data-demo-prev aria-label="${e(b.previous)}">${arrow('prev')}</button>
      <div class="demo-booth-heading"><span class="demo-booth-kicker">${e(b.nowShowing)} <span data-demo-counter>01 / 03</span></span><h3 data-demo-title>${e(b.titles[0])}</h3><p data-demo-description>${e(b.descriptions[0])}</p></div>
      <button type="button" class="demo-booth-arrow" data-demo-next aria-label="${e(b.next)}">${arrow('next')}</button>
    </div>
    <div class="demo-booth-choices" role="group" aria-label="${e(b.select)}">${demoScenes.map((scene, index) => `<button type="button" data-demo-select="${scene}" aria-pressed="${index === 0}"><span>0${index + 1}</span>${e(b.titles[index])}</button>`).join('')}</div>
    <div class="demo-playback"><span>${e(m.playbackLabel)} <span class="playback-dot" aria-hidden="true"></span></span><div><button type="button" data-demo-replay>${e(m.replay)}</button><button type="button" data-demo-pause>${e(m.pause)}</button></div></div>
    <div class="demo-screen-host" data-demo-screen>${renderDemoFilm('knowledge', messages)}</div>
    <ol class="demo-chapters" aria-label="${e(m.chaptersLabel)}">${renderDemoChapters('knowledge', m)}</ol>
    <p class="gallery-note">${e(m.note)}</p>
    <p class="demo-booth-status" data-demo-status aria-live="polite" aria-atomic="true"></p>
  </div>`;
}

export function initAnimatedDemo({ locale = 'zh-Hant', messages = getMessages(locale) } = {}) {
  const m = messages.demo;
  const root = document.querySelector('[data-demo-animation]');
  if (!root) return () => {};
  let timing = readDemoTiming(getComputedStyle(root));
  let scene = 'knowledge';
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const pause = root.querySelector('[data-demo-pause]');
  const replay = root.querySelector('[data-demo-replay]');
  let elapsed = 0, lastTime = null, frame = null, inView = false, paused = false, currentState = '';
  const narrowSidebar = matchMedia('(max-width:699px)');
  let sidebarOpen = false, inspecting = false;
  function syncPanels() {
    const noteOpen = scene === 'knowledge' && currentState === 'source';
    root.querySelector('.film-note')?.toggleAttribute('inert', !noteOpen || sidebarOpen);
    root.querySelector('.film-citation')?.setAttribute('aria-expanded', String(noteOpen));
    root.querySelector('.film-chat')?.toggleAttribute('inert', sidebarOpen || noteOpen || (scene === 'knowledge' && currentState === 'library'));
    root.querySelector('.film-answer')?.toggleAttribute('inert', currentState === 'question' || currentState === 'click');
    root.querySelector('.film-library')?.toggleAttribute('inert', sidebarOpen || currentState !== 'library');
    root.querySelectorAll('.film-nav-question,.film-nav-library').forEach(button => {
      const library = scene === 'knowledge' && currentState === 'library';
      if (library === button.classList.contains('film-nav-library')) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
  }
  function setSidebar(open, restore = false) {
    sidebarOpen = Boolean(open && narrowSidebar.matches);
    root.classList.toggle('is-sidebar-open', sidebarOpen);
    root.querySelector('[data-demo-sidebar-toggle]')?.setAttribute('aria-expanded', String(sidebarOpen));
    syncPanels();
    if (sidebarOpen) root.querySelector('[data-demo-sidebar-close]')?.focus();
    else if (restore) root.querySelector('[data-demo-sidebar-toggle]')?.focus();
  }
  function positionPointer() {
    const film = root.querySelector('.demo-film');
    const selector = scene === 'knowledge'
      ? currentState === 'click' ? '.film-send' : currentState === 'answer' || currentState === 'source' ? '.film-citation b' : currentState === 'library' ? '.film-library h4' : '.film-question'
      : currentState === 'click' ? '.film-send' : currentState === 'answer' || currentState === 'source' ? '.image-result:first-child figcaption' : currentState === 'library' ? '.image-preview-open' : scene === 'image-image' ? '.film-input .image-query-thumb' : '.film-input .image-query-text';
    const target = root.querySelector(selector);
    if (!film || !target) return;
    const container = film.getBoundingClientRect(), point = target.getBoundingClientRect();
    if (!container.width || !container.height || !point.width) return;
    // 原圖面板正在滑入時，以最終位置定位滑鼠，而不是追到畫框外的起點。
    const preview = scene !== 'knowledge' && currentState === 'library' ? root.querySelector('.image-search-preview') : null;
    const offsetX = preview ? new DOMMatrixReadOnly(getComputedStyle(preview).transform).m41 : 0;
    root.style.setProperty('--cursor-x', `${(point.left + point.width * .62 - container.left - offsetX) / container.width * 100}%`);
    root.style.setProperty('--cursor-y', `${(point.top + point.height * .62 - container.top) / container.height * 100}%`);
  }
  function show(state) {
    if (state === currentState) return;
    currentState = state;
    root.dataset.state = state;
    syncPanels();
    const chapter = state === 'library' ? 'library' : state === 'source' || (scene !== 'knowledge' && state === 'answer') ? 'source' : 'question';
    root.querySelectorAll('[data-chapter]').forEach(item => item.classList.toggle('is-active', item.dataset.chapter === chapter));
    positionPointer();
  }
  const finished = () => timing && timing.count > 0 && elapsed >= timing.total * timing.count;
  function running() { return timing && !finished() && !preference.matches && !paused && inView && !document.hidden; }
  function paintControls() {
    pause.disabled = preference.matches || !timing;
    replay.disabled = preference.matches || !timing;
    pause.textContent = preference.matches || !timing ? m.reducedMotion : paused || finished() ? m.play : m.pause;
    root.classList.toggle('is-paused', !running());
    root.classList.toggle('is-complete', Boolean(finished()));
  }
  function tick(time) {
    if (lastTime !== null) elapsed += Math.min(time - lastTime, 100);
    lastTime = time;
    show(demoFrameAt(elapsed, timing));
    if (finished()) { frame = null; lastTime = null; paintControls(); return; }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null; lastTime = null;
    if (!inspecting && (preference.matches || !timing)) show('source');
    else if (!inspecting && finished()) show('library');
    if (running()) frame = requestAnimationFrame(tick);
    paintControls();
  }
  pause.addEventListener('click', () => {
    inspecting = false;
    setSidebar(false);
    if (finished()) { elapsed = 0; paused = false; show('question'); }
    else paused = !paused;
    sync();
  });
  replay.addEventListener('click', () => { inspecting = false; setSidebar(false); elapsed = 0; paused = false; show('question'); sync(); });
  const observer = new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting && entries[0].intersectionRatio >= (timing?.threshold ?? 0);
    sync();
  }, { threshold: timing?.threshold ?? 0 });
  observer.observe(root);
  const resizeObserver = new ResizeObserver(positionPointer);
  resizeObserver.observe(root.querySelector('.demo-film'));
  // 三段共用一個畫面與時鐘。切片只換內容，不另開計時器；由使用者切換，不自動跳片。
  const host = root.querySelector('[data-demo-screen]');
  const previous = root.querySelector('[data-demo-prev]');
  const next = root.querySelector('[data-demo-next]');
  const choices = [...root.querySelectorAll('[data-demo-select]')];
  function selectScene(value) {
    if (!host || !demoScenes.includes(value) || value === scene) return;
    resizeObserver.unobserve(root.querySelector('.demo-film'));
    scene = value;
    inspecting = false;
    root.dataset.demoScene = scene;
    host.innerHTML = renderDemoFilm(scene, messages);
    setSidebar(false);
    root.querySelector('.demo-chapters').innerHTML = renderDemoChapters(scene, m);
    const index = demoScenes.indexOf(scene);
    root.querySelector('[data-demo-title]').textContent = m.booth.titles[index];
    root.querySelector('[data-demo-description]').textContent = m.booth.descriptions[index];
    root.querySelector('[data-demo-counter]').textContent = `0${index + 1} / 0${demoScenes.length}`;
    root.querySelector('[data-demo-status]').textContent = `${index + 1} / ${demoScenes.length} — ${m.booth.titles[index]}. ${m.booth.descriptions[index]}`;
    choices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.demoSelect === scene)));
    timing = readDemoTiming(getComputedStyle(root));
    elapsed = 0; currentState = '';
    show(preference.matches || !timing ? 'source' : 'question');
    sync(); // 保留使用者暫停狀態；重播才取消暫停。
    resizeObserver.observe(root.querySelector('.demo-film'));
  }
  const goPrevious = () => selectScene(demoSceneAt(demoScenes.indexOf(scene) - 1));
  const goNext = () => selectScene(demoSceneAt(demoScenes.indexOf(scene) + 1));
  const choose = event => selectScene(event.currentTarget.dataset.demoSelect);
  const navigate = event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    if (event.key === 'ArrowLeft') goPrevious(); else goNext();
    choices.find(button => button.dataset.demoSelect === scene)?.focus();
  };
  // 手動查看只切換本機展示狀態；沿用單一動畫時鐘，不送出網路請求。
  function inspectState(state) {
    inspecting = true;
    paused = true;
    if (timing) elapsed = timing.durations.slice(0, demoStates.indexOf(state)).reduce((sum, value) => sum + value, 0);
    setSidebar(false);
    show(state);
    sync();
  }
  const inspect = event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-demo-sidebar-toggle')) { paused = true; sync(); setSidebar(!sidebarOpen); }
    else if (button.hasAttribute('data-demo-sidebar-close')) setSidebar(false, true);
    else if (button.classList.contains('film-citation')) { inspectState('source'); root.querySelector('[data-demo-source-close]')?.focus(); }
    else if (button.hasAttribute('data-demo-source-close')) { inspectState('answer'); root.querySelector('.film-citation')?.focus(); }
    else if (button.classList.contains('film-nav-question')) { inspectState('answer'); if (narrowSidebar.matches) setSidebar(false, true); }
    else if (button.classList.contains('film-nav-library')) { inspectState(scene === 'knowledge' ? 'library' : 'answer'); if (narrowSidebar.matches) setSidebar(false, true); }
    else if (button.classList.contains('film-nav-source')) { inspectState(scene === 'knowledge' ? 'source' : 'library'); root.querySelector('[data-demo-source-close]')?.focus(); }
    else if (button.classList.contains('film-new')) replay.click();
  };
  const dismiss = event => {
    if (event.key === 'Escape') {
      if (sidebarOpen) setSidebar(false, true);
      else if (scene === 'knowledge' && currentState === 'source') { inspectState('answer'); root.querySelector('.film-citation')?.focus(); }
    }
    if (event.key === 'Tab' && sidebarOpen) {
      const buttons = [...root.querySelectorAll('.film-sidebar button')];
      const first = buttons[0], last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  };
  const resizeSidebar = () => setSidebar(false);
  root.addEventListener('click', inspect);
  root.addEventListener('keydown', dismiss);
  narrowSidebar.addEventListener('change', resizeSidebar);
  previous?.addEventListener('click', goPrevious);
  next?.addEventListener('click', goNext);
  choices.forEach(button => { button.addEventListener('click', choose); button.addEventListener('keydown', navigate); });
  preference.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  show(preference.matches || !timing ? 'source' : 'question');
  sync();
  return () => {
    observer.disconnect(); resizeObserver.disconnect();
    if (frame !== null) cancelAnimationFrame(frame);
    preference.removeEventListener('change', sync); document.removeEventListener('visibilitychange', sync);
    previous?.removeEventListener('click', goPrevious); next?.removeEventListener('click', goNext);
    choices.forEach(button => { button.removeEventListener('click', choose); button.removeEventListener('keydown', navigate); });
    root.removeEventListener('click', inspect); root.removeEventListener('keydown', dismiss);
    narrowSidebar.removeEventListener('change', resizeSidebar);
  };
}
