import { getMessages, escapeHtml as e } from './i18n.js';
import { renderContact } from './shared-design.js';

const destinations = Object.freeze({ ems: 'https://synaiq-ai.com/ems/#Monitor', pvsim: 'https://synaiq-ai.com/solar/' });

// Original explanatory line drawings. These are not screenshots or measured results.
function drawing(product) {
  const roof = `<path d="m70 195 205-108 256 106-202 122Z" fill="#eee9dd"/><path d="m70 195 5 69 251 121 3-70m202-122-6 70-199 122"/><path d="m121 194 155-78 204 83-153 87Z" stroke-dasharray="4 6"/><g fill="#b3c5b0" stroke="#647764">${Array.from({ length: 3 }, (_, row) => Array.from({ length: 4 }, (_, col) => {
    const x = 148 + col * 40 + row * 48, y = 192 - col * 20 + row * 20;
    return `<path d="m${x} ${y} 34-17 39 16-34 17Z"/>`;
  }).join('')).join('')}</g><path d="m369 234 50-25 0-36-50 25Z" fill="#d6d0c3"/><path d="m419 173-35-14-50 25 35 14m-35-14v36l35 14v-36"/><path d="m369 234 48 19 51-26-49-18" fill="#665f5233" stroke="none"/><path d="M480 61v-17m35 29 13-13m-38 34h20m-53-42-13-13"/><circle cx="478" cy="86" r="21" fill="#d5b36a"/><path d="M89 325q10 41 77 53m-10-11 10 11-13 7M416 323q54-13 58-37" stroke="#9e8756"/>`;
  const energy = `<path d="M78 267h122v-86l-40 25v-25l-40 25v-66h-22v84H78Z" fill="#e9e4d8"/><path d="M90 267v-33h97v33m-72-32v32m24-32v32m23-32v32M249 145h118v143H249Z" fill="#f9f7ee"/><path d="M267 168h82v61h-82ZM282 250h50m-46 17h43"/><path d="m275 208 17-10 11 7 11-27 12 18 15-8" stroke="#687d66" stroke-width="3"/><path d="M427 204h71v112h-71Zm20-12h29v12" fill="#d9e1d1"/><path d="m465 220-20 38h24l-15 36" stroke="#687d66" stroke-width="3"/><path d="M199 239h32m137 0h40m-20-6 19 6-19 6M307 288v38H137v-42m170 42h119" stroke="#9e8756" stroke-dasharray="5 6"/><path d="M86 108c47-30 122-22 141 6m174 39q51-5 73 18" stroke="#9e8756"/><circle cx="307" cy="100" r="21" fill="#e2d5b7"/><path d="m297 100 8 8 14-17"/>`;
  return `<svg class="energy-drawing" viewBox="0 0 600 420" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${product === 'ems' ? energy : roof}</svg>`;
}

function stageContent(m, index) {
  const [, question, action, flow] = m.stages[index];
  return `<span class="energy-kicker">${e(m.questionLabel)} / 0${index + 1}</span><h3>${e(question)}</h3><p class="energy-flow">${e(flow)}</p><span class="energy-kicker">${e(m.actionLabel)}</span><p>${e(action)}</p>`;
}

function renderEnergy(product, { locale = 'zh-Hant', messages = getMessages(locale) } = {}) {
  const m = messages[product];
  const name = product === 'ems' ? 'EMS' : 'PVsim';
  return `<div class="energy-product" data-energy-product="${product}">
    <section class="energy-opening" aria-labelledby="energy-title"><div class="wrap energy-opening-layout">
      <div class="energy-opening-copy">
        <p class="product-identity"><img src="${e(messages.common.productBrand.ink)}" width="844" height="143" alt="Synaiq"><span>${e(m.productLabel)}</span></p>
        <h1 id="energy-title">${m.title.map((line, index) => index === 2 ? `<span class="marked">${e(line)}</span>` : e(line)).join('<br>')}</h1>
        <p class="energy-intro">${e(m.intro)}</p>
        <div class="energy-opening-actions"><a class="button" href="#process">${e(m.cta)}</a><span class="energy-status">${e(m.status)}</span></div>
      </div>
      <figure class="energy-scene"><div class="energy-scene-top"><span>Synaiq ${name}</span><span>${e(m.sceneNote)}</span></div>${drawing(product)}<figcaption>${e(m.sceneLabel)}</figcaption><ol class="energy-scene-nodes">${m.sceneNodes.map(label => `<li>${e(label)}</li>`).join('')}</ol></figure>
    </div></section>
    <section class="energy-story energy-torn" id="story"><div class="wrap energy-story-layout"><div><span class="energy-kicker">01 / ${e(m.storyLabel)}</span><h2>${m.storyTitle.map(e).join('<br>')}</h2></div><div class="energy-story-copy">${m.story.map(copy => `<p>${e(copy)}</p>`).join('')}</div></div></section>
    <section class="energy-process" id="process" aria-labelledby="energy-process-title"><div class="wrap"><div class="energy-section-heading"><span class="energy-section-number">02</span><h2 id="energy-process-title">${m.processTitle.map(e).join('<br>')}</h2></div><div class="energy-steps">${m.steps.map(([title, copy], index) => `<article><span class="energy-step-number">0${index + 1}</span><h3>${e(title)}</h3><p>${e(copy)}</p></article>`).join('')}</div></div></section>
    <section class="energy-capabilities energy-torn" id="capabilities" aria-labelledby="energy-capabilities-title"><div class="wrap energy-capabilities-layout"><div><span class="energy-section-number">03</span><h2 id="energy-capabilities-title">${m.capabilitiesTitle.map(e).join('<br>')}</h2><p>${e(m.capabilitiesIntro)}</p></div><dl class="energy-capability-list">${m.capabilities.map(([title, copy], index) => `<div><dt><span>0${index + 1}</span>${e(title)}</dt><dd>${e(copy)}</dd></div>`).join('')}</dl></div></section>
    <section class="energy-demo" id="proof" aria-labelledby="energy-demo-title"><div class="wrap"><div class="energy-demo-heading"><h2 id="energy-demo-title">${m.demoTitle.map(e).join('<br>')}</h2><p>${e(m.demoIntro)}</p></div>
      <div class="energy-workbook"><div class="energy-workbook-top"><span>Synaiq ${name}</span><span>${e(m.demoLabel)}</span></div>
        <div class="energy-stage-buttons" role="group" aria-label="${e(m.stageGroup)}">${m.stages.map(([title], index) => `<button type="button" data-energy-step="${index}" aria-pressed="${index === 0}" aria-controls="energy-stage"><span>0${index + 1}</span>${e(title)}</button>`).join('')}</div>
        <div class="energy-stage-layout"><div class="energy-stage-art">${drawing(product)}<ol class="energy-progress" aria-hidden="true">${m.stages.map((_, index) => `<li data-energy-marker="${index}" class="${index === 0 ? 'is-active' : ''}">0${index + 1}</li>`).join('')}</ol></div><div id="energy-stage" class="energy-stage-copy" aria-live="polite" aria-atomic="true">${stageContent(m, 0)}</div></div>
        <p class="energy-demo-note">${e(m.demoNote)}</p>
      </div>
      <div class="energy-external"><a class="button" href="${destinations[product]}" target="_blank" rel="noopener noreferrer" aria-describedby="energy-external-note">${e(m.external)} <span aria-hidden="true">↗</span></a><p id="energy-external-note">${e(m.externalNote)}</p></div>
    </div></section>
    ${renderContact({ ...messages.common, contact: m.contact })}
  </div>`;
}

export const renderEms = options => renderEnergy('ems', options);
export const renderPvsim = options => renderEnergy('pvsim', options);

export function initEnergy({ locale = 'zh-Hant', messages = getMessages(locale) } = {}) {
  const root = document.querySelector('[data-energy-product]');
  if (!root) return;
  const m = messages[root.dataset.energyProduct];
  const panel = root.querySelector('#energy-stage');
  const buttons = [...root.querySelectorAll('[data-energy-step]')];
  const markers = [...root.querySelectorAll('[data-energy-marker]')];
  for (const button of buttons) button.addEventListener('click', () => {
    const index = Number(button.dataset.energyStep);
    for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
    for (const marker of markers) marker.classList.toggle('is-active', Number(marker.dataset.energyMarker) === index);
    panel.innerHTML = stageContent(m, index);
  });
}
