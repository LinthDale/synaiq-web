import { getMessages, escapeHtml as esc } from './i18n.js';

export function renderAdvantageSection(messages = getMessages().common) {
  const copy = messages.advantages;
  return `<section class="paper-section advantages" id="advantages" aria-labelledby="advantages-title"><div class="wrap"><div class="section-head"><div><span class="section-no">${esc(copy.eyebrow)}</span><h2 id="advantages-title">${esc(copy.title)}</h2></div><p>${copy.intro.map(esc).join('<br>')}</p></div>${copy.items.map(([title, short, lead, explanation, scenario]) => `<details class="advantage-row"><summary><strong>${esc(title)}</strong><span>${esc(short)}</span></summary><div class="advantage-detail"><div class="advantage-explanation"><p>${esc(lead)}</p><p>${esc(explanation)}</p></div><p class="advantage-scenario"><span>${esc(copy.scenario)}</span>${esc(scenario)}</p></div></details>`).join('')}</div></section>`;
}

export function renderContact(messages = getMessages().common) {
  const copy = messages.contact;
  return `<section class="contact" id="contact"><div class="wrap"><div><h2>${copy.heading.map(esc).join('<br>')}</h2><p>${copy.description.map(esc).join('<br>')}</p></div><div class="contact-invitation"><img class="contact-cat" src="assets/contact-cat-yarn-v1.webp" width="900" height="600" alt="" loading="lazy" decoding="async"><a class="button inverse" href="mailto:service@synaiq.com">${esc(copy.cta)}</a></div></div></section>`;
}
