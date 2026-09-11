import { getMessages, escapeHtml as e } from './i18n.js';
import { renderInkPhoto, initInkPhotos } from './ink-photo.js';

const pressUrls = ['https://n.yam.com/Article/20260311616052', 'https://www.ettoday.net/news/20260311/3130564.htm'];

export function renderCases({ contact = () => '', locale = 'zh-Hant', messages = getMessages(locale) } = {}) {
  const m = messages.cases;
  return `<div class="cases-page">
    <section class="editorial-hero cases-hero" aria-labelledby="cases-title"><div class="wrap cases-hero-layout">
      <div class="cases-hero-copy">
        <p class="editorial-kicker">${e(m.eyebrow)}</p>
        <h1 id="cases-title">${m.title.map((line, i) => `<span${i === 2 ? ' class="editorial-underline"' : ''}>${e(line)}</span>`).join('')}</h1>
        <p class="editorial-intro">${e(m.intro)}</p>
        <a class="editorial-link" href="#story">${e(m.action)} <span aria-hidden="true">↓</span></a>
        <div class="case-identifier"><span>${e(m.chapter)}</span><span>${e(m.journey)}</span></div>
      </div>
      <figure class="cases-hero-art">
        ${renderInkPhoto({ id: 'tokyo-hero-photo', sketch: 'assets/cases/tokyo-2-sketch.webp', photo: 'assets/cases/tokyo-2-scaled.jpg', alt: m.photoAlt, label: m.photoLabel, aspect: '3 / 4', kind: 'scene', eager: true })}
        <figcaption>${e(m.photoCaption)}</figcaption>
      </figure>
    </div></section>
    <section class="editorial-section case-story" id="story" aria-labelledby="case-story-title"><div class="wrap">
      <div class="case-facts">${m.facts.map(([label, value, detail]) => `<div><span>${e(label)}</span><h3>${e(value)}</h3><p>${e(detail)}</p></div>`).join('')}</div>
      <div class="case-story-layout"><div class="editorial-section-heading"><p class="editorial-kicker">${e(m.storyEyebrow)}</p><h2 id="case-story-title">${m.storyTitle.map(e).join('<br>')}</h2></div><div class="case-story-copy">${m.paragraphs.map(p => `<p>${e(p)}</p>`).join('')}</div></div>
    </div></section>
    <section class="editorial-section case-field" id="fieldnotes" aria-labelledby="case-field-title"><div class="wrap case-field-layout">
      <figure class="case-field-art">${renderInkPhoto({ id: 'tokyo-field-photo', sketch: 'assets/cases/tokyo-5-sketch.webp', photo: 'assets/cases/tokyo-5.jpg', alt: m.fieldAlt, label: m.fieldLabel, aspect: '3 / 4', kind: 'scene' })}<figcaption>${e(m.fieldCaption)}</figcaption></figure>
      <div class="case-field-copy"><p class="editorial-kicker">${e(m.fieldEyebrow)}</p><h2 id="case-field-title">${m.fieldTitle.map(e).join('<br>')}</h2><p class="editorial-intro">${e(m.fieldIntro)}</p><ol class="case-notes">${m.notes.map(([title, copy], i) => `<li><span>0${i + 1}</span><div><h3>${e(title)}</h3><p>${e(copy)}</p></div></li>`).join('')}</ol></div>
    </div></section>
    <section class="editorial-section case-press" aria-labelledby="case-press-title"><div class="wrap"><h2 id="case-press-title">${e(m.pressTitle)}</h2><div class="case-press-links">${m.pressLinks.map(([publisher, title], i) => `<a href="${pressUrls[i]}" target="_blank" rel="noopener noreferrer"><span>${e(publisher)}</span><span>${e(title)}</span><span aria-hidden="true">↗</span></a>`).join('')}</div></div></section>
    <div class="wrap editorial-closing"><p>${e(m.closing)}</p><svg class="editorial-paper-plane" viewBox="0 0 180 100" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 79c20-24 52-20 51-4-1 16-28 13-23-4 5-16 26-19 46-24" stroke-width="1.1" stroke-dasharray="3 5"/><path d="m89 38 74-23-34 60-11-25-29-12Z" stroke-width="1.4"/><path d="m118 50 45-35-54 30M118 50l-4 16 10-7" stroke-width="1.1"/><path d="m92 35 68-23M133 75l31-56" stroke-width=".65" opacity=".4"/></svg></div>
  </div>${contact()}`;
}

export function initCases() {
  const root = document.querySelector('.cases-page');
  if (root) return initInkPhotos(root);
}
