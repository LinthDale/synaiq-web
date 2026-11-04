import { renderAnimatedDemo, initAnimatedDemo, initProductReveal } from './demo-animation.js';
import { initDecisionScroll } from './decision-scroll.js';
import { getMessages, escapeHtml, pageHref } from './i18n.js';
const h = escapeHtml;
// Style only this English phrase; future translated labels stay plain, escaped text.
const renderHeroEyebrow = text => text === 'Knowledge Intelligence Platform'
  ? text.split(' ').map(word => /^[KIP]/.test(word) ? `<span class="eyebrow-initial">${h(word[0])}</span>${h(word.slice(1))}` : h(word)).join(' ')
  : h(text);
const slotLabel = (id, text) => `<figcaption class="slot-caption"><span>${h(id)}</span> ${h(text)}</figcaption>`;

export function renderHome({ advantageSection, contact, locale = 'zh-Hant', messages = getMessages(locale) }) {
  // Keep word separation when the mobile layout hides editorial line breaks.
  const breakSpace = locale === 'zh-Hant' ? '' : ' ';
  const lines = values => values.map(h).join(`${breakSpace}<br>`);
  const { hero, narrative, products, outlook, showcase, ceo, looseLetters } = messages.home;
  const annualGrowth = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(((14.5 / 5) ** (1 / 3) - 1) * 100);
  const kipHref = h(pageHref({ page: 'kip', locale }));
  return `
  <section class="hero home-opening" data-decision-surface>
    <div class="typed-fragments" aria-hidden="true">${looseLetters.map((text, i) => `<span style="--x:${(i * 37 + 7) % 94}%;--y:${(i * 17 + 3) % 88}%;--turn:${(i % 7 - 3) * 8}deg;--letter-order:${i % 5}">${h(text)}</span>`).join('')}</div>
    <div class="wrap hero-copy">
      <p class="eyebrow">${renderHeroEyebrow(hero.eyebrow)}</p>
      <h1><span>${h(hero.title[0])}</span><span><span class="title-phrase">${h(hero.title[1].trimEnd())}</span>${breakSpace}<span class="title-phrase${locale === 'zh-Hant' ? ' title-knowledge' : ''}">${h(hero.title[2])}</span></span></h1>
      <p class="intro">${lines(hero.intro)}</p>
      <a class="button inverse" href="#proof">${h(hero.action)}</a>
    </div>
    <figure class="hero-thread-art" aria-hidden="true"><picture><source media="(max-width: 899px), (pointer: coarse)" srcset="assets/kip-d-scroll-mobile-v1/frame-000.webp"><img src="assets/kip-d-opening-v5.webp" width="1536" height="1024" fetchpriority="high" decoding="async" alt="${h(hero.artAlt)}"></picture></figure>
    <a class="hero-scroll" href="#introduction">${h(hero.scroll)} <span aria-hidden="true">↓</span></a>
  </section>

  <section class="home-narrative paper-edge" id="introduction">
    <div class="wrap narrative-title"><p>${h(narrative.pretitle)}</p><h2><span class="marked">${h(narrative.title[0])}</span><br>${h(narrative.title[1])}</h2></div>
    <div class="narrative-body">
      <div class="wrap narrative-layout">
        <div class="narrative-copy"><p>${h(narrative.lead[0])}${breakSpace}<br>${h(narrative.lead[1])}<span class="marked">${h(narrative.lead[2])}</span></p>${narrative.paragraphs.map(copy => `<p class="narrative-small">${h(copy)}</p>`).join('')}<a class="text-link" href="${kipHref}">${h(narrative.action)}</a></div>
        <figure class="illustration-slot narrative-sketch media-slot" data-slot="03">
          <img src="assets/shared-knowledge-hands-v1.png" width="1280" height="1280" alt="${h(narrative.artAlt)}" loading="lazy">
          <figcaption class="handwritten-note">${h(narrative.artNote)}</figcaption>
        </figure>
      </div>
    </div>
  <section class="product-stage product-reveal" data-product-reveal data-decision-surface aria-label="${h(products.label)}">
    <div class="wrap reveal-heading"><span class="handwritten-note">${h(products.note)}</span><h2>${lines(products.title)}</h2></div><div class="product-composition wrap">
      <figure class="main-screen media-slot" data-slot="01">
        <img src="${h(messages.common.assets.decisionScreen)}" width="1440" height="900" alt="${h(products.screenAlt)}">
        ${slotLabel('01', products.screenCaption)}
      </figure>
      <figure class="source-paper" aria-label="${h(products.paperLabel)}">
        <span>${h(products.paperEyebrow)}</span><h3>${lines(products.paperTitle)}</h3>
        <div class="paper-lines" aria-hidden="true"></div>
        <p>${h(products.paperDocuments)}</p><p class="marked">${lines(products.paperCopy)}</p>
        <small>${h(products.paperCaption)}</small>
      </figure>
    </div>
    <p class="stage-note wrap">${h(products.stageCopy)}<span>${h(products.stageNote)}</span></p>
  </section>

    <aside class="enterprise-outlook" aria-labelledby="outlook-heading">
      <div class="wrap">
        <div class="outlook-heading"><span>${h(outlook.eyebrow)}</span><span>${h(outlook.dates)}</span></div>
        <div class="outlook-layout">
          <div><h3 id="outlook-heading">${lines(outlook.title)}</h3><p>${h(outlook.intro)}</p></div>
          <div class="budget-comparison" role="img" aria-label="${h(outlook.chartLabel)}">
            <div class="budget-growth"><span class="budget-label">${h(outlook.growthLabel)}</span><div class="budget-stat"><span class="budget-value">+${h(annualGrowth)}<small>%</small></span><span class="budget-period">${h(outlook.perYear)}</span></div><span class="budget-year">${h(outlook.growthBasis)}</span></div>
          </div>
        </div>
        <div class="outlook-context">
          <div class="outlook-reading">${outlook.reading.map(copy => `<p>${h(copy)}</p>`).join('')}</div>
            <figure class="outlook-clipping">
              <a class="outlook-clipping-link" href="https://www.investing.com/news/stock-market-news/cio-survey-a-massive-boon-for-microsoft--jp-morgan-3502358" target="_blank" rel="noopener noreferrer" aria-label="${h(outlook.clippingLabel)}">
                <span class="outlook-clipping-frame"><img class="outlook-clipping-image" src="assets/investing-cio-20240629.png" width="905" height="577" alt="${h(outlook.clippingAlt)}" loading="lazy"></span>
              </a>
            </figure>
        </div>
        <details class="outlook-details"><summary>${h(outlook.detailsLabel)}</summary><div><p class="outlook-survey"><strong>${h(outlook.respondents)}</strong><span>${h(outlook.spending)}</span></p><p class="outlook-caveat">${h(outlook.caveat)}</p><p>${h(outlook.details)}</p><a href="https://www.investing.com/news/stock-market-news/cio-survey-a-massive-boon-for-microsoft--jp-morgan-3502358" target="_blank" rel="noopener noreferrer">${h(outlook.sourceLabel)}</a><p class="outlook-caveat">${h(outlook.sourceCaveat)}</p></div></details>
      </div>
    </aside>
  </section>

  <section class="home-showcase ink-edge" id="proof" data-decision-surface>
    <div class="wrap">
      <div class="showcase-heading"><h2>${lines(showcase.title)}</h2><p>${lines(showcase.copy)}</p></div>
      ${renderAnimatedDemo({ locale, messages })}
    </div>
  </section>

  ${advantageSection()}
  <section class="home-quote-letter paper-edge ceo-message" id="people" data-ceo-message aria-label="${h(ceo.label)}">
    <div class="wrap quote-letter-layout">
      <div class="quote-art ceo-portrait"><span class="handwritten-note">${h(ceo.note)}</span><img src="assets/ceo-speaking-sketch-v1.webp" width="960" height="1440" alt="${h(ceo.artAlt)}" loading="lazy"></div>
      <figure class="editorial-quote">
        <span class="quote-glyph" aria-hidden="true">“</span>
        <blockquote><p>${h(ceo.quote[0][0])}<span class="quote-phrase">${h(ceo.quote[0][1])}</span></p><p>${h(ceo.quote[1][0])}<span class="marked">${h(ceo.quote[1][1])}</span></p></blockquote>
        <figcaption class="ceo-attribution"><span>${h(ceo.name)}</span><span class="ceo-role">${h(ceo.role)}</span></figcaption>
      </figure>
    </div>
  </section>
  ${contact()}`;
}

export function initHome({ locale = 'zh-Hant', messages = getMessages(locale) } = {}) {
  initAnimatedDemo({ locale, messages });
  initProductReveal();
  initDecisionScroll();
}
