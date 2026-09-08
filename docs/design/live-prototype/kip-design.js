import { renderAnimatedDemo, initAnimatedDemo } from './demo-animation.js';
import { getMessages, escapeHtml } from './i18n.js';

// Simple original pen diagrams, not claims about product screens or data.
function stepDrawing(index) {
  const drawings = [
    '<path d="M61 36 145 28 156 138 65 144ZM79 23 159 21 169 126M95 16 171 18 179 115M76 59 133 53M78 75 143 69M79 93 129 87M80 111 142 105"/><path class="kip-pen-accent" d="M35 91q-14 43 23 57m-15-9 15 9-4-17"/>',
    '<path d="M71 25 157 29 151 143 64 139ZM83 52l55 2M81 69l51 2M78 86l62 3M78 105l40 1M77 119l58 4"/><path class="kip-pen-accent" d="M50 49 42 47 38 126 49 128M169 48 179 48 175 127 164 127M56 82q56-8 111 1"/>',
    '<path d="M65 29 144 29 151 139 61 143ZM77 54l52-2M77 72l49-1M76 90l36-1M75 109l48-1"/><path class="kip-pen-accent" d="M128 84c-32-8-39 36-10 42 36 6 39-34 10-42ZM140 123l28 32M108 103l9 9 18-21"/>',
  ];
  return `<svg class="kip-step-drawing" viewBox="0 0 220 180" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${drawings[index]}</svg>`;
}

export function renderKip({ advantageSection, contact, locale = 'zh-Hant', messages = getMessages(locale) }) {
  const m = messages.kip;
  const e = escapeHtml;
  return `
  <section class="hero kip-opening" aria-labelledby="kip-title">
    <div class="wrap kip-opening-layout">
      <div class="kip-opening-copy">
        <p class="eyebrow">${e(m.eyebrow)}</p>
        <h1 id="kip-title">${e(m.title[0])}<br>${e(m.title[1])}<br><span class="marked">${e(m.title[2])}</span></h1>
        <p class="intro">${e(m.intro)}</p>
        <a class="button" href="#contact">${e(m.cta)}</a>
      </div>
      <div class="kip-opening-scene">
        <svg class="kip-pencil-trail" viewBox="0 0 700 610" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M59 70c24-59 73-51 54-6-14 34-61 28-60 58 1 61 164 4 272-21S611 79 638 194s-72 308-156 338-148-25-140-76 86-62 125-37 2 59-51 48"/><path d="m52 58 8 14 14-5M396 461l20 7-13 13"/></svg>
        <div class="kip-scene-caption"><span>01 / KIP</span><span>${e(m.sceneCaption)}</span></div>
        <figure class="kip-hero-screen"><img src="${e(messages.common.assets.searchScreen)}" width="1440" height="900" alt="${e(m.screenAlt)}"></figure>
        <div class="kip-evidence-slip"><span class="kip-slip-label">${e(m.sourceLabel)}</span><p>${e(m.sampleQuestion)}</p><p class="kip-slip-answer">${e(m.sampleAnswer)}<span class="marked">${e(m.sampleHighlight)}</span></p><small>${e(m.sampleCitation)}</small></div>
        <span class="kip-scene-note">${e(m.sceneNote)}</span>
      </div>
    </div>
  </section>

  <section class="kip-process kip-torn" id="process" aria-labelledby="kip-process-title"><div class="wrap">
    <div class="kip-section-heading"><span class="kip-margin-label">01</span><h2 id="kip-process-title">${m.processTitle.map(e).join('<br>')}</h2></div>
    <div class="kip-steps">${m.steps.map(([title, copy], index) => `<article>${stepDrawing(index)}<div class="kip-step-heading"><span>0${index + 1}</span><h3>${e(title)}</h3></div><p>${e(copy)}</p></article>`).join('')}</div>
  </div></section>

  <section class="kip-architecture kip-torn" id="architecture" aria-labelledby="kip-architecture-title">
    <div class="wrap kip-architecture-panel">
      <div class="kip-architecture-heading"><span class="section-no">${e(m.architectureLabel)}</span><h2 id="kip-architecture-title">${m.architectureTitle.map(e).join('<br>')}</h2><p class="connector">${e(m.architectureNote)}</p><svg class="kip-architecture-thread" viewBox="0 0 340 160" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M12 62c58 77 183 68 184 7s-104-28-70 11 116 56 191-12m-21-1 24-1-8 22"/></svg></div>
      <div class="kip-layer-stack">${m.layers.map(([title, copy], index) => `<article class="lit" style="--layer:${index}"><span class="index">0${index + 1}</span><div><h3>${e(title)}</h3><p>${e(copy)}</p></div><span class="kip-layer-dot" aria-hidden="true"></span></article>`).join('')}</div>
    </div>
  </section>

  ${advantageSection()}

  <section class="kip-proof kip-torn" id="proof" aria-labelledby="kip-proof-title"><div class="wrap">
    <div class="kip-proof-heading"><h2 id="kip-proof-title">${e(m.proofTitle[0])}<br><span class="marked">${e(m.proofTitle[1])}</span></h2><div>${m.proofCopy.map(copy => `<p>${e(copy)}</p>`).join('')}</div></div>
    ${renderAnimatedDemo({ locale, messages })}
    <div class="kip-library-notes"><div><span class="section-no">${e(m.libraryLabel)}</span><h3>${e(m.libraryTitle)}</h3></div><dl>${m.libraryNotes.map(([title, copy]) => `<div><dt>${e(title)}</dt><dd>${e(copy)}</dd></div>`).join('')}</dl></div>
  </div></section>

  <section class="kip-capabilities kip-torn" aria-labelledby="kip-capabilities-title"><div class="wrap kip-capabilities-layout">
    <div class="kip-capabilities-heading"><span class="kip-margin-label">05</span><h2 id="kip-capabilities-title">${m.capabilitiesTitle.map(e).join('<br>')}</h2><div class="kip-capability-art" aria-hidden="true"><img src="assets/kip-connected-work-v1.webp" width="1000" height="667" alt="" loading="lazy"></div></div>
    <dl class="kip-capability-list">${m.capabilities.map(([title, copy], index) => `<div><dt><span>0${index + 1}</span>${e(title)}</dt><dd>${e(copy)}</dd></div>`).join('')}</dl>
  </div></section>
  ${contact()}`;
}

export function initKip({ locale = 'zh-Hant', messages = getMessages(locale) } = {}) {
  // All four architecture cards are visible together, so they use normal flow.
  // Keep the product demo independent from page scrolling and section sizing.
  initAnimatedDemo({ locale, messages });
}
