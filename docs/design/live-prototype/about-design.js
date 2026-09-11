import { getMessages, escapeHtml as esc } from './i18n.js';
import { renderInkPhoto, initInkPhotos } from './ink-photo.js';

const portraits = Object.freeze({
  wilson: { photo: '/brand/team/wilson-web-1.jpg', sketch: 'assets/team/wilson-sketch.webp' },
  sunny: { photo: '/brand/team/sunny-web-1.1.jpg', sketch: 'assets/team/sunny-sketch.webp' },
  leef: { photo: '/brand/team/leff-web-1.jpg', sketch: 'assets/team/leef-sketch.webp' },
  celestine: {
    photo: 'assets/team/celestine-photo.webp', sketch: 'assets/team/celestine-sketch.webp',
    photoCrop: { x: 265, y: 58, width: 310, height: 310, sourceWidth: 864, sourceHeight: 1184 },
  },
  lou: { photo: '/brand/team/lou-web-1.jpg', sketch: 'assets/team/lou-sketch.webp' },
  steve: {
    photo: 'assets/team/steve-20260624-photo.webp', sketch: 'assets/team/steve-20260624-sketch.webp',
    photoCrop: { x: 0, y: 0, width: 1004, height: 1004, sourceWidth: 1004, sourceHeight: 1236 },
  },
  dale: {
    photo: 'assets/team/dale-20260624-photo.webp', sketch: 'assets/team/dale-20260624-sketch.webp',
    photoCrop: { x: 310, y: 76, width: 435, height: 435, sourceWidth: 1045, sourceHeight: 1567 },
    companion: { sketch: 'assets/team/dale-tuxedo-kitten-ink.webp', photo: 'assets/team/dale-tuxedo-kitten-photo.webp', silhouette: 'assets/team/dale-tuxedo-kitten.webp' },
  },
});

const personalize = (text, name) => text.replace('{name}', name);

function renderMember(member, copy) {
  const name = [member.name, member.nativeName].filter(Boolean).join(' ');
  return `<article class="team-profile" aria-labelledby="team-${esc(member.id)}-name">
    <figure class="team-portrait">${renderInkPhoto({
      id: `portrait-${member.id}`,
      ...portraits[member.id],
      alt: personalize(copy.alt, name),
      label: personalize(copy.label, name),
      aspect: '1 / 1',
      kind: 'portrait',
    })}</figure>
    <div class="team-copy">
      <p class="team-role">${esc(member.role)}</p>
      <h3 class="team-name" id="team-${esc(member.id)}-name">${esc(member.name)}${member.nativeName ? `<span class="team-native-name">${esc(member.nativeName)}</span>` : ''}</h3>
      <ul class="team-credentials" aria-label="${esc(copy.credentials)}">${member.credentials.map(text => `<li>${esc(text)}</li>`).join('')}</ul>
    </div>
  </article>`;
}

function renderTeamGroup(id, group, portraitCopy) {
  return `<section class="editorial-section about-team about-team--${id}" id="${id}" aria-labelledby="${id}-title">
    <div class="wrap">
      <div class="editorial-section-heading">
        <div><p class="editorial-kicker">${esc(group.eyebrow)}</p><h2 id="${id}-title">${esc(group.title)}</h2></div>
        <p>${esc(group.intro)}</p>
      </div>
      <div class="team-grid">${group.members.map(member => renderMember(member, portraitCopy)).join('')}</div>
    </div>
  </section>`;
}

export function renderAbout({ contact, locale = 'zh-Hant', messages = getMessages(locale) }) {
  const copy = messages.about;
  return `<div class="about-page">
    <section class="editorial-hero about-hero" aria-labelledby="about-title">
      <div class="wrap">
        <p class="editorial-kicker">${esc(copy.hero.eyebrow)}</p>
        <h1 class="about-title" id="about-title">${copy.hero.title.map(text => `<span>${esc(text)}</span>`).join(locale === 'en' ? ' ' : '')}</h1>
        <div class="about-hero-bottom">
          <p class="about-intro">${esc(copy.hero.intro)}</p>
          <a class="editorial-link" href="#leadership">${esc(copy.hero.action)} <span aria-hidden="true">↘</span></a>
        </div>
        <p class="about-handnote">${esc(copy.hero.note)}</p>
      </div>
    </section>
    <section class="editorial-section about-approach" id="approach" aria-labelledby="approach-title">
      <div class="wrap">
        <div class="editorial-section-heading">
          <div><p class="editorial-kicker">${esc(copy.approach.eyebrow)}</p><h2 id="approach-title">${esc(copy.approach.title)}</h2></div>
          <p>${esc(copy.approach.intro)}</p>
        </div>
        <div class="about-principles">${copy.approach.principles.map((principle, index) => `<article class="about-principle"><span class="about-principle-number" aria-hidden="true">0${index + 1}</span><h3>${esc(principle.title)}</h3><p>${esc(principle.description)}</p></article>`).join('')}</div>
      </div>
    </section>
    ${renderTeamGroup('leadership', copy.leadership, copy.portrait)}
    ${renderTeamGroup('technical', copy.technical, copy.portrait)}
  </div>${contact()}`;
}

export function initAbout() {
  const root = document.querySelector('.about-page');
  return root ? initInkPhotos(root) : () => {};
}
