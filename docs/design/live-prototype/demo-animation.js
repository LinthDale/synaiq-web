import { getMessages, escapeHtml } from './i18n.js';

export function demoFrameAt(milliseconds) {
  const t = ((milliseconds % 16000) + 16000) % 16000;
  if (t < 2400) return 'question';
  if (t < 3800) return 'click';
  if (t < 7600) return 'answer';
  if (t < 11800) return 'source';
  return 'library';
}

export function renderAnimatedDemo({ locale = 'zh-Hant', messages = getMessages(locale) } = {}) {
  const m = messages.demo;
  const e = escapeHtml;
  return `<div class="animated-product" data-demo-animation data-state="answer" role="group" aria-label="${e(m.groupLabel)}">
    <div class="demo-playback"><span>${e(m.playbackLabel)} <span class="playback-dot" aria-hidden="true"></span></span><div><button type="button" data-demo-replay>${e(m.replay)}</button><button type="button" data-demo-pause>${e(m.pause)}</button></div></div>
    <div class="demo-film" aria-hidden="true">
      <div class="film-top"><span class="film-logo"><img src="${e(messages.common.brand.ink)}" width="844" height="143" alt="SynaiQ"></span><span>${e(m.productTitle)}</span><small>${e(m.productNote)}</small></div>
      <div class="film-body">
        <div class="film-sidebar"><span class="film-new">${e(m.newChat)}</span><small>${e(m.recentQuestions)}</small><span class="film-nav-question">${e(m.warrantyTopic)}</span><span class="film-nav-library">${e(m.knowledgeCenter)}</span><span>${e(m.sourceTopic)}</span><small class="film-workspace">${e(m.workspace)}</small></div>
        <div class="film-chat"><small class="film-breadcrumb">${e(m.breadcrumb)}</small><div class="film-question"><span>${e(m.question)}</span></div><div class="film-thinking"><i></i><i></i><i></i><span>${e(m.thinking)}</span></div><div class="film-answer"><span class="film-avatar">${e(m.avatar)}</span><div><p>${e(m.answer)}<br><span class="marked">${e(m.answerHighlight)}</span></p><small>${e(m.answerNote)}</small><div class="film-citation"><small>${e(m.citationLabel)}</small><span>${e(m.citationFilename)} <b>${e(m.citationPage)}</b></span></div></div></div><div class="film-input"><span>${e(m.followUp)}</span><span class="film-send">${e(m.send)}</span></div></div>
        <div class="film-source"><div><small>${e(m.sourceLabel)}</small><span>×</span></div><h4>${e(m.sourceTitle)}</h4><p class="film-source-label">${e(m.sourceHeading)}</p><p><mark>${e(m.answerHighlight)}</mark></p><div class="film-faux-lines"></div><small>${e(m.sourceNote)}</small></div>
        <div class="film-library"><small>${e(m.libraryLabel)}</small><h4>${e(m.libraryTitle)}</h4><p>${e(m.libraryIntro)}</p><div class="film-table"><div>${m.tableHeaders.map(copy => `<span>${e(copy)}</span>`).join('')}</div>${m.tableRows.map(row => `<div>${row.map(copy => `<span>${e(copy)}</span>`).join('')}</div>`).join('')}</div><small>${e(m.libraryNote)}</small></div>
      </div><span class="film-cursor"><i></i></span>
    </div>
    <ol class="demo-chapters" aria-label="${e(m.chaptersLabel)}">${['question', 'source', 'library'].map((chapter, index) => `<li data-chapter="${chapter}"><span>0${index + 1}</span>${e(m.chapters[index])}</li>`).join('')}</ol>
    <p class="gallery-note">${e(m.note)}</p>
  </div>`;
}

export function initAnimatedDemo({ locale = 'zh-Hant', messages = getMessages(locale) } = {}) {
  const m = messages.demo;
  const root = document.querySelector('[data-demo-animation]');
  if (!root) return () => {};
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const pause = root.querySelector('[data-demo-pause]');
  const replay = root.querySelector('[data-demo-replay]');
  let elapsed = 0, lastTime = null, frame = null, inView = false, paused = false, currentState = '';
  function positionPointer() {
    const film = root.querySelector('.demo-film');
    const selector = currentState === 'click' ? '.film-send' : currentState === 'answer' || currentState === 'source' ? '.film-citation b' : currentState === 'library' ? '.film-library h4' : '.film-question';
    const target = root.querySelector(selector);
    if (!film || !target) return;
    const container = film.getBoundingClientRect(), point = target.getBoundingClientRect();
    if (!container.width || !container.height || !point.width) return;
    root.style.setProperty('--cursor-x', `${(point.left + point.width * .62 - container.left) / container.width * 100}%`);
    root.style.setProperty('--cursor-y', `${(point.top + point.height * .62 - container.top) / container.height * 100}%`);
  }
  function show(state) {
    if (state === currentState) return;
    currentState = state;
    root.dataset.state = state;
    const chapter = state === 'library' ? 'library' : state === 'source' ? 'source' : 'question';
    root.querySelectorAll('[data-chapter]').forEach(item => item.classList.toggle('is-active', item.dataset.chapter === chapter));
    positionPointer();
  }
  function running() { return !preference.matches && !paused && inView && !document.hidden; }
  function paintControls() {
    pause.disabled = preference.matches;
    replay.disabled = preference.matches;
    pause.textContent = preference.matches ? m.reducedMotion : paused ? m.play : m.pause;
    root.classList.toggle('is-paused', !running());
  }
  function tick(time) {
    if (lastTime !== null) elapsed += Math.min(time - lastTime, 100);
    lastTime = time;
    show(demoFrameAt(elapsed));
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null; lastTime = null;
    if (preference.matches) show('source');
    if (running()) frame = requestAnimationFrame(tick);
    paintControls();
  }
  pause.addEventListener('click', () => { paused = !paused; sync(); });
  replay.addEventListener('click', () => { elapsed = 0; paused = false; show('question'); sync(); });
  const observer = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; sync(); }, { threshold: 0.12 });
  observer.observe(root);
  const resizeObserver = new ResizeObserver(positionPointer);
  resizeObserver.observe(root.querySelector('.demo-film'));
  preference.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  show(preference.matches ? 'source' : 'question');
  sync();
  return () => { observer.disconnect(); resizeObserver.disconnect(); if (frame !== null) cancelAnimationFrame(frame); preference.removeEventListener('change', sync); document.removeEventListener('visibilitychange', sync); };
}
