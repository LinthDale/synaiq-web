import { renderAnimatedDemo, initAnimatedDemo } from './demo-animation.js';
import { getMessages, escapeHtml, pageHref } from './i18n.js';
const h = escapeHtml;
const slotLabel = (id, text) => `<figcaption class="slot-caption"><span>${h(id)}</span> ${h(text)}</figcaption>`;

export function renderHome({ advantageSection, contact, locale = 'zh-Hant', messages = getMessages(locale) }) {
  // Keep word separation when the mobile layout hides editorial line breaks.
  const breakSpace = locale === 'zh-Hant' ? '' : ' ';
  const lines = values => values.map(h).join(`${breakSpace}<br>`);
  const { hero, narrative, products, outlook, showcase, wally, ceo, looseLetters } = messages.home;
  const kipHref = h(pageHref({ page: 'kip', locale }));
  return `
  <section class="hero home-opening">
    <div class="typed-fragments" aria-hidden="true">${looseLetters.map((text, i) => `<span style="--x:${(i * 37 + 7) % 94}%;--y:${(i * 17 + 3) % 88}%;--turn:${(i % 7 - 3) * 8}deg;--delay:${i % 5 * 0.16}s">${h(text)}</span>`).join('')}</div>
    <div class="wrap hero-copy">
      <p class="eyebrow">${h(hero.eyebrow)}</p>
      <h1><span>${h(hero.title[0])}</span><span><span class="title-phrase">${h(hero.title[1])}</span><span class="title-phrase">${h(hero.title[2])}</span></span></h1>
      <p class="intro">${lines(hero.intro)}</p>
      <a class="button inverse" href="${kipHref}">${h(hero.action)}</a>
    </div>
    <figure class="hero-thread-art" aria-hidden="true"><img src="assets/knowledge-threads-v2.png" width="1536" height="1024" alt="${h(hero.artAlt)}"></figure>
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
  <section class="product-stage product-reveal" data-product-reveal aria-label="${h(products.label)}">
    <div class="wrap reveal-heading"><span class="handwritten-note">${h(products.note)}</span><h2>${lines(products.title)}</h2></div><div class="product-composition wrap">
      <figure class="main-screen media-slot" data-slot="01">
        <img src="${h(messages.common.assets.searchScreen)}" width="1440" height="900" alt="${h(products.screenAlt)}">
        ${slotLabel('01', products.screenCaption)}
      </figure>
      <figure class="source-paper" aria-label="${h(products.paperLabel)}">
        <span>${h(products.paperEyebrow)}</span><h3>${lines(products.paperTitle)}</h3>
        <div class="paper-lines" aria-hidden="true"></div>
        <p>${h(products.paperDocuments)}</p><p class="marked">${lines(products.paperCopy)}</p>
        <small>${h(products.paperCaption)}</small>
      </figure>
      <div class="stage-devices" aria-label="${h(products.devicesLabel)}">
        <figure><img src="/brand/wally/wally-2.png" width="620" height="1398" alt="${h(products.deviceAlts[0])}"><figcaption>Wally 2</figcaption></figure>
        <figure><img src="/brand/wally-2-plus.png" width="1024" height="2049" alt="${h(products.deviceAlts[1])}"><figcaption>Wally 2 PLUS</figcaption></figure>
        <figure class="stage-mini"><img src="/brand/wally-mini.png" alt="${h(products.deviceAlts[2])}"><figcaption>Mini</figcaption></figure>
      </div>
    </div>
    <p class="stage-note wrap">${h(products.stageCopy)}<span>${h(products.stageNote)}</span></p>
  </section>

    <aside class="enterprise-outlook" aria-labelledby="outlook-heading">
      <div class="wrap">
        <div class="outlook-heading"><span>${h(outlook.eyebrow)}</span><span>${h(outlook.dates)}</span></div>
        <div class="outlook-layout">
          <div><h3 id="outlook-heading">${lines(outlook.title)}</h3><p>${h(outlook.intro)}</p></div>
          <div class="budget-comparison" aria-label="${h(outlook.chartLabel)}">
            <div><span class="budget-value">5<small>%</small></span><span class="budget-year">${h(outlook.currentYear)}</span></div><span class="budget-arrow" aria-hidden="true">↗</span><div><span class="budget-value budget-future">14.5<small>%</small></span><span class="budget-year">${h(outlook.futureYear)}</span></div>
          </div>
        </div>
        <div class="outlook-context"><p><strong>${h(outlook.respondents)}</strong><span>${h(outlook.spending)}</span></p><p class="outlook-caveat">${h(outlook.caveat)}</p></div>
        <details class="outlook-details"><summary>${h(outlook.detailsLabel)}</summary><div><p>${h(outlook.details)}</p><a href="https://www.investing.com/news/stock-market-news/cio-survey-a-massive-boon-for-microsoft--jp-morgan-3502358" target="_blank" rel="noopener noreferrer">${h(outlook.sourceLabel)}</a><p class="outlook-caveat">${h(outlook.sourceCaveat)}</p></div></details>
      </div>
    </aside>
  </section>

  <section class="home-showcase ink-edge" id="proof">
    <div class="wrap">
      <div class="showcase-heading"><h2>${lines(showcase.title)}</h2><p>${lines(showcase.copy)}</p></div>
      ${renderAnimatedDemo({ locale, messages })}
    </div>
  </section>

  <section class="home-wally paper-edge" id="wally"><div class="wrap">
    <div class="wally-heading"><h2>${lines(wally.title)}</h2><div><p>${lines(wally.intro)}</p><span class="wally-detail">${h(wally.detail)}</span></div></div>
    <div class="wally-persona">
      <figure class="persona-art media-slot" data-slot="06"><img src="https://synaiq.com/wp-content/uploads/2026/03/toutou-2.png" alt="${h(wally.personaAlt)}" loading="lazy">${slotLabel('06', wally.personaCaption)}</figure>
      <div class="persona-context"><span>${h(wally.personaEyebrow)}</span><h3>${lines(wally.personaTitle)}</h3><p>${lines(wally.personaCopy)}</p><img src="/brand/wally-mini.png" alt="${h(wally.miniAlt)}" loading="lazy"><p class="note">${h(wally.materialNote)}</p></div>
    </div>
    <figure class="wally-panorama media-slot" data-slot="05"><div class="panorama-scroll" role="region" aria-label="${h(wally.panoramaLabel)}" tabindex="0"><img src="/brand/wally/wally-series.png" width="1300" height="670" alt="${h(wally.panoramaAlt)}" loading="lazy"></div>${slotLabel('05', wally.panoramaCaption)}</figure>
    <p class="panorama-hint">${h(wally.panoramaHint)}</p>
  </div></section>

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
  const reveal = document.querySelector('[data-product-reveal]');
  if (!reveal) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  function configureReveal() {
    observer?.disconnect();
    if (preference.matches) {
      reveal.classList.remove('reveal-motion');
      reveal.classList.add('is-visible');
      return;
    }
    reveal.classList.add('reveal-motion');
    observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { reveal.classList.add('is-visible'); observer.disconnect(); }
    }, { threshold: 0.14 });
    observer.observe(reveal);
  }
  configureReveal();
  preference.addEventListener('change', configureReveal);
}
