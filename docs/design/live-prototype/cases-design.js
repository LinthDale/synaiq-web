import { getMessages, escapeHtml as e, pageHref } from './i18n.js';
import { renderInkPhoto, initInkPhotos } from './ink-photo.js';
import { CASES, publishedCases, findCase, parseAspect, aspectOrientation } from './cases-data.js';

// One shared overview and one shared detail template render every case from cases-data.js;
// no case has its own copy of the markup. Assets and media addresses come from that module,
// all wording from locale-cases.js, both keyed by the same identifier.

const PAPER_PLANE = `<svg class="editorial-paper-plane" viewBox="0 0 180 100" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 79c20-24 52-20 51-4-1 16-28 13-23-4 5-16 26-19 46-24" stroke-width="1.1" stroke-dasharray="3 5"/><path d="m89 38 74-23-34 60-11-25-29-12Z" stroke-width="1.4"/><path d="m118 50 45-35-54 30M118 50l-4 16 10-7" stroke-width="1.1"/><path d="m92 35 68-23M133 75l31-56" stroke-width=".65" opacity=".4"/></svg>`;
// Every overview cover is cropped to one ratio so a mixed portrait/landscape grid stays even.
const GRID_COVER_ASPECT = '3 / 2';

function cssAspect(aspect, fallback = GRID_COVER_ASPECT) {
  const ratio = parseAspect(aspect) ?? parseAspect(fallback);
  return `${ratio.width} / ${ratio.height}`;
}

function coverAspect(entry) {
  return entry.cover?.aspect ?? entry.hero?.aspect ?? GRID_COVER_ASPECT;
}

/** object-position for a cover cropped away from its own ratio; validated, never raw. */
function coverFocus(entry) {
  const focus = String(entry.cover?.focus ?? '50% 50%');
  return /^\d{1,3}% \d{1,3}%$/.test(focus) ? focus : '50% 50%';
}

function renderCover(entry, text, aspect) {
  // A cover shares its alternative text with the photo it is taken from unless the case
  // names another entry, so a card is never described by the wrong picture.
  const alt = text.photos[entry.cover?.altKey ?? entry.hero.key].alt;
  return `<img class="case-cover" src="${e(entry.cover.image)}" alt="${e(alt)}" loading="lazy" style="--case-cover-aspect:${cssAspect(aspect)};--case-cover-focus:${coverFocus(entry)}">`;
}

/** A case without a paired sketch shows the plain photograph; sketches are never a gate. */
function renderCasePhoto(entry, photo, text) {
  const copy = text.photos[photo.key];
  if (photo.sketch) {
    return renderInkPhoto({ id: `case-${entry.id}-${photo.key}`, sketch: photo.sketch, photo: photo.photo, alt: copy.alt, label: copy.label, aspect: photo.aspect, kind: photo.kind });
  }
  return `<img class="case-photo" src="${e(photo.photo)}" alt="${e(copy.alt)}" loading="${photo.eager ? 'eager' : 'lazy'}" style="--case-photo-aspect:${cssAspect(photo.aspect)}">`;
}

// The tags speak for themselves; the list heading is the case name above them, so no
// aria-label is invented here.
function renderTags(entry, tags) {
  const labels = (entry.tags ?? []).map(tag => tags[tag]).filter(Boolean);
  if (!labels.length) return '';
  return `<ul class="case-tags">${labels.map(label => `<li>${e(label)}</li>`).join('')}</ul>`;
}

function renderCard(entry, copy, locale, featured) {
  const text = copy.cases[entry.id];
  const aspect = featured ? coverAspect(entry) : GRID_COVER_ASPECT;
  const orientation = featured ? aspectOrientation(aspect) : 'grid';
  return `<article class="case-card case-card--${orientation}${featured ? ' case-card--featured' : ''}">
    <a class="case-card-link" href="${e(pageHref({ page: 'cases', caseId: entry.id, locale }))}">
      <figure class="case-card-cover">${renderCover(entry, text, aspect)}</figure>
      <div class="case-card-copy">
        <p class="case-card-date">${e(text.dateLabel)}</p>
        <h3 class="case-card-name">${e(text.name)}</h3>
        ${renderTags(entry, copy.tags)}
        <p class="case-card-summary">${e(text.summary)}</p>
        <span class="editorial-link case-card-action">${e(copy.overview.readCase)} <span aria-hidden="true">→</span></span>
      </div>
    </a>
  </article>`;
}

function renderOverview(copy, cases, locale) {
  const o = copy.overview;
  const featured = cases.length === 1;
  return `<section class="editorial-hero cases-overview-hero" aria-labelledby="cases-title"><div class="wrap">
      <p class="editorial-kicker">${e(o.eyebrow)}</p>
      <h1 id="cases-title">${o.title.map((line, i) => `<span${i === 2 ? ' class="editorial-underline"' : ''}>${e(line)}</span>`).join('')}</h1>
      <p class="editorial-intro">${e(o.intro)}</p>
      <a class="editorial-link" href="#cases-list">${e(o.action)} <span aria-hidden="true">↓</span></a>
    </div></section>
    <section class="editorial-section cases-list" id="cases-list" aria-labelledby="cases-list-title"><div class="wrap">
      <div class="editorial-section-heading"><h2 id="cases-list-title">${e(o.listTitle)}</h2></div>
      <div class="case-card-grid${featured ? ' case-card-grid--single' : ''}">${cases.map(entry => renderCard(entry, copy, locale, featured)).join('')}</div>
    </div></section>`;
}

function renderDetailHero(entry, copy, text) {
  const orientation = aspectOrientation(entry.hero.aspect);
  return `<section class="editorial-hero cases-hero" aria-labelledby="cases-title"><div class="wrap cases-hero-layout cases-hero-layout--${orientation}">
      <div class="cases-hero-copy">
        <p class="editorial-kicker">${e(copy.overview.eyebrow)}</p>
        <h1 id="cases-title">${e(text.name)}</h1>
        <p class="editorial-intro">${e(text.summary)}</p>
        <a class="editorial-link" href="#story">${e(copy.overview.readCase)} <span aria-hidden="true">↓</span></a>
        <div class="case-identifier"><span>${e(text.chapter)}</span><span>${e(text.journey)}</span></div>
      </div>
      <figure class="cases-hero-art">${renderCasePhoto(entry, entry.hero, text)}<figcaption>${e(text.photos[entry.hero.key].caption)}</figcaption></figure>
    </div></section>`;
}

function renderStory(entry, text) {
  return `<section class="editorial-section case-story" id="story" aria-labelledby="case-story-title"><div class="wrap">
      <div class="case-facts">${text.facts.map(([label, value, detail]) => `<div><span>${e(label)}</span><h3>${e(value)}</h3><p>${e(detail)}</p></div>`).join('')}</div>
      <div class="case-story-layout"><div class="editorial-section-heading"><p class="editorial-kicker">${e(text.story.eyebrow)}</p><h2 id="case-story-title">${text.story.title.map(e).join('<br>')}</h2></div><div class="case-story-copy">${text.story.paragraphs.map(p => `<p>${e(p)}</p>`).join('')}</div></div>
    </div></section>`;
}

// Optional blocks are decided once, so the section, its heading and its directory entry
// appear or disappear together; a case never shows a heading with nothing under it.
function hasField(entry, text) {
  return Boolean((entry.field?.photos ?? []).length || (text.field?.notes ?? []).length);
}

function hasPress(entry, text) {
  return Boolean((entry.media ?? []).length && (text.press?.links ?? []).length);
}

/** Omitted whole when a case supplied neither field photographs nor field notes. */
function renderField(entry, text) {
  const photos = entry.field?.photos ?? [];
  const notes = text.field?.notes ?? [];
  if (!hasField(entry, text)) return '';
  const art = photos.map(photo => `<figure class="case-field-art">${renderCasePhoto(entry, photo, text)}<figcaption>${e(text.photos[photo.key].caption)}</figcaption></figure>`).join('');
  return `<section class="editorial-section case-field" id="fieldnotes" aria-labelledby="case-field-title"><div class="wrap case-field-layout">
      ${art}
      <div class="case-field-copy"><p class="editorial-kicker">${e(text.field.eyebrow)}</p><h2 id="case-field-title">${text.field.title.map(e).join('<br>')}</h2><p class="editorial-intro">${e(text.field.intro)}</p><ol class="case-notes">${notes.map(([title, body], i) => `<li><span>0${i + 1}</span><div><h3>${e(title)}</h3><p>${e(body)}</p></div></li>`).join('')}</ol></div>
    </div></section>`;
}

/** Each link keeps its own address from cases-data.js, index-matched to its locale entry. */
function renderPress(entry, text) {
  const urls = entry.media ?? [];
  const links = text.press?.links ?? [];
  if (!hasPress(entry, text)) return '';
  return `<section class="editorial-section case-press" id="press" aria-labelledby="case-press-title"><div class="wrap"><h2 id="case-press-title">${e(text.press.title)}</h2><div class="case-press-links">${links.slice(0, urls.length).map(([publisher, title], i) => `<a href="${e(urls[i])}" target="_blank" rel="noopener noreferrer"><span>${e(publisher)}</span><span>${e(title)}</span><span aria-hidden="true">↗</span></a>`).join('')}</div></div></section>`;
}

function renderBack(copy, locale) {
  return `<div class="wrap case-back"><a class="editorial-link" href="${e(pageHref({ page: 'cases', locale }))}"><span aria-hidden="true">←</span> ${e(copy.overview.back)}</a></div>`;
}

function renderDetail(entry, copy, locale) {
  const text = copy.cases[entry.id];
  return `${renderDetailHero(entry, copy, text)}${renderStory(entry, text)}${renderField(entry, text)}${renderPress(entry, text)}${renderBack(copy, locale)}`;
}

/** An unknown or unpublished identifier says so and offers the overview; never a case. */
function renderNotFound(copy, locale) {
  const o = copy.overview;
  return `<section class="editorial-hero case-notfound" aria-labelledby="cases-title"><div class="wrap">
      <p class="editorial-kicker">${e(o.eyebrow)}</p>
      <h1 id="cases-title">${e(o.notFound.title)}</h1>
      <p class="editorial-intro">${e(o.notFound.body)}</p>
      <a class="editorial-link" href="${e(pageHref({ page: 'cases', locale }))}"><span aria-hidden="true">←</span> ${e(o.back)}</a>
    </div></section>`;
}

export function renderCases({ contact = () => '', locale = 'zh-Hant', messages = getMessages(locale), caseId = null, caseState, cases = CASES } = {}) {
  const copy = messages.cases;
  const list = publishedCases(cases);
  const entry = caseId ? findCase(caseId, cases) : null;
  const state = caseState ?? (entry ? 'detail' : caseId ? 'notFound' : 'overview');
  const body = state === 'detail' && entry ? renderDetail(entry, copy, locale)
    : state === 'notFound' || (state === 'detail' && !entry) ? renderNotFound(copy, locale)
      : renderOverview(copy, list, locale);
  const closing = state === 'notFound' || (state === 'detail' && !entry) ? ''
    : `<div class="wrap editorial-closing"><p>${e(copy.overview.closing)}</p>${PAPER_PLANE}</div>`;
  return `<div class="cases-page" data-cases-state="${e(state)}">${body}${closing}</div>${contact()}`;
}

/** The in-page directory for this address: the overview list, or one case's own sections. */
export function caseSectionIds({ caseId = null, caseState, messages = getMessages(), cases = CASES } = {}) {
  const entry = caseId ? findCase(caseId, cases) : null;
  const state = caseState ?? (entry ? 'detail' : caseId ? 'notFound' : 'overview');
  if (state === 'overview') return Object.freeze(['cases-list']);
  if (state !== 'detail' || !entry) return Object.freeze([]);
  const text = messages.cases.cases[entry.id];
  return Object.freeze(['story', ...(hasField(entry, text) ? ['fieldnotes'] : []), ...(hasPress(entry, text) ? ['press'] : [])]);
}

export function initCases() {
  const root = document.querySelector('.cases-page');
  if (root) return initInkPhotos(root);
}
