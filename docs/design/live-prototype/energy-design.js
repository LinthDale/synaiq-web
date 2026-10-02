import { getMessages, escapeHtml as e } from './i18n.js';
import { renderContact } from './shared-design.js';
import { productScreens, screenPath, renderProductScreens, initProductScreens } from './energy-screens.js';

const destinations = Object.freeze({ ems: 'https://synaiq-ai.com/ems/#Monitor', pvsim: 'https://synaiq-ai.com/solar/' });

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
        <p class="product-identity"><span>${e(m.productLabel)}</span></p>
        <h1 id="energy-title">${m.title.map((line, index) => index === 2 ? `<span class="marked">${e(line)}</span>` : e(line)).join('<br>')}</h1>
        <p class="energy-intro">${e(m.intro)}</p>
        <div class="energy-opening-actions"><a class="button" href="#process">${e(m.cta)}</a><span class="energy-status">${e(m.status)}</span></div>
      </div>
      <figure class="energy-scene"><div class="energy-scene-top"><span>${name}</span><span>${e(m.sceneNote)}</span></div><a class="energy-scene-screen" href="#proof"><img src="${screenPath(productScreens[product][0])}" alt="${e(m.screens.items[0][1])}" fetchpriority="high" decoding="async"></a><figcaption>${e(m.sceneLabel)}</figcaption><ol class="energy-scene-nodes">${m.sceneNodes.map(label => `<li>${e(label)}</li>`).join('')}</ol></figure>
    </div></section>
    <section class="energy-story energy-torn" id="story"><div class="wrap energy-story-layout"><div><span class="energy-kicker">01 / ${e(m.storyLabel)}</span><h2>${m.storyTitle.map(e).join('<br>')}</h2></div><div class="energy-story-copy">${m.story.map(copy => `<p>${e(copy)}</p>`).join('')}</div></div></section>
    <section class="energy-process" id="process" aria-labelledby="energy-process-title"><div class="wrap"><div class="energy-section-heading"><span class="energy-section-number">02</span><h2 id="energy-process-title">${m.processTitle.map(e).join('<br>')}</h2></div><div class="energy-steps">${m.steps.map(([title, copy], index) => `<article><span class="energy-step-number">0${index + 1}</span><h3>${e(title)}</h3><p>${e(copy)}</p></article>`).join('')}</div></div></section>
    <section class="energy-capabilities energy-torn" id="capabilities" aria-labelledby="energy-capabilities-title"><div class="wrap energy-capabilities-layout"><div><span class="energy-section-number">03</span><h2 id="energy-capabilities-title">${m.capabilitiesTitle.map(e).join('<br>')}</h2><p>${e(m.capabilitiesIntro)}</p></div><dl class="energy-capability-list">${m.capabilities.map(([title, copy], index) => `<div><dt><span>0${index + 1}</span>${e(title)}</dt><dd>${e(copy)}</dd></div>`).join('')}</dl></div></section>
    <section class="energy-demo" id="proof" aria-labelledby="energy-demo-title"><div class="wrap"><div class="energy-demo-heading"><h2 id="energy-demo-title">${m.demoTitle.map(e).join('<br>')}</h2><p>${e(m.demoIntro)}</p></div>
      ${renderProductScreens(product, m)}
      <div class="energy-workbook"><div class="energy-workbook-top"><span>${name}</span><span>${e(m.demoLabel)}</span></div>
        <div class="energy-stage-buttons" role="group" aria-label="${e(m.stageGroup)}">${m.stages.map(([title], index) => `<button type="button" data-energy-step="${index}" aria-pressed="${index === 0}" aria-controls="energy-stage"><span>0${index + 1}</span>${e(title)}</button>`).join('')}</div>
        <div class="energy-stage-layout"><div class="energy-stage-art"><ol class="energy-progress" aria-hidden="true">${m.stages.map((_, index) => `<li data-energy-marker="${index}" class="${index === 0 ? 'is-active' : ''}">0${index + 1}</li>`).join('')}</ol></div><div id="energy-stage" class="energy-stage-copy" aria-live="polite" aria-atomic="true">${stageContent(m, 0)}</div></div>
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
  initProductScreens(root, root.dataset.energyProduct, m);
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
