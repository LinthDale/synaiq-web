import { getMessages, escapeHtml as esc } from './i18n.js';

export function renderAdvantageSection(messages = getMessages().common) {
  const copy = messages.advantages;
  return `<section class="paper-section advantages" id="advantages" aria-labelledby="advantages-title"><div class="wrap"><div class="section-head"><div><span class="section-no">${esc(copy.eyebrow)}</span><h2 id="advantages-title">${esc(copy.title)}</h2></div><p>${copy.intro.map(esc).join('<br>')}</p></div><div class="advantage-notes">${copy.items.map(([title, short, lead, explanation, scenario], index) => `
    <div class="advantage-item">
      <div class="advantage-sheet">
        <span class="advantage-paper" aria-hidden="true"></span><span class="advantage-tape" aria-hidden="true"></span>
        <div class="advantage-content">
          <button class="advantage-note" type="button" aria-expanded="false" aria-controls="advantage-panel-${index}"><strong id="advantage-title-${index}">${esc(title)}</strong><span class="advantage-short">${esc(short)}</span></button>
          <div class="advantage-panel" id="advantage-panel-${index}" role="region" aria-labelledby="advantage-title-${index}" hidden>
            <div class="advantage-detail"><div class="advantage-explanation"><p>${esc(lead)}</p><p>${esc(explanation)}</p></div><p class="advantage-scenario"><span>${esc(copy.scenario)}</span>${esc(scenario)}</p></div>
          </div>
        </div>
        <button class="advantage-close" type="button" aria-label="${esc(copy.close)}" hidden><span aria-hidden="true">×</span></button>
      </div>
    </div>`).join('')}</div></div></section>`;
}

export function initAdvantages(root = document) {
  const section = root.querySelector('#advantages');
  if (!section) return;
  const doc = section.ownerDocument;
  const win = doc.defaultView;
  let active = null;
  let returningFocus = false;
  let leaveTimer;
  const returning = new Map();
  const reducedMotion = win.matchMedia('(prefers-reduced-motion: reduce)');
  function finishReturn(record, restoreFocus = false) {
    const { item, sheet, note, panel, closeButton } = record;
    win.clearTimeout(record.returnTimer);
    sheet.removeEventListener('animationend', record.onReturnEnd);
    returning.delete(item);
    returningFocus = true;
    const focusInside = item.contains(doc.activeElement) || (record.hadFocus && doc.activeElement === doc.body);
    item.classList.remove('is-expanded', 'is-returning');
    note.setAttribute('aria-expanded', 'false');
    sheet.hidePopover();
    sheet.removeAttribute('popover');
    sheet.removeAttribute('style');
    item.style.removeProperty('height');
    panel.hidden = true;
    panel.inert = false;
    closeButton.hidden = true;
    closeButton.inert = false;
    if (restoreFocus && focusInside) {
      note.focus({ preventScroll: true });
    }
    returningFocus = false;
  }
  function close(restoreFocus = false, immediate = false) {
    if (!active) return;
    const record = active;
    const { item, sheet, note, panel, closeButton } = record;
    record.hadFocus = item.contains(doc.activeElement);
    active = null;
    win.clearTimeout(leaveTimer);
    if (immediate || reducedMotion.matches) {
      finishReturn(record, restoreFocus);
      return;
    }
    // Measure the live paper, including an interrupted opening animation.
    // Keep its grid slot until the paper and tape have both returned.
    const current = sheet.getBoundingClientRect();
    const slot = item.getBoundingClientRect();
    sheet.style.width = `${current.width}px`;
    sheet.style.height = `${current.height}px`;
    sheet.style.left = `${current.left}px`;
    sheet.style.top = `${current.top}px`;
    sheet.style.setProperty('--note-to-width', `${slot.width}px`);
    sheet.style.setProperty('--note-to-height', `${slot.height}px`);
    sheet.style.setProperty('--note-to-x', `${slot.left - current.left}px`);
    sheet.style.setProperty('--note-to-y', `${slot.top - current.top}px`);
    item.classList.remove('is-expanded');
    item.classList.add('is-returning');
    sheet.querySelector('.advantage-content').scrollTop = 0;
    note.setAttribute('aria-expanded', 'false');
    // Fading controls must not keep receiving keyboard focus.
    panel.inert = true;
    closeButton.inert = true;
    record.onReturnEnd = event => {
      if (event.target === sheet && event.animationName === 'advantage-refold') finishReturn(record, restoreFocus);
    };
    returning.set(item, record);
    sheet.addEventListener('animationend', record.onReturnEnd);
    const duration = parseFloat(win.getComputedStyle(sheet).animationDuration) * 1000;
    record.returnTimer = win.setTimeout(() => finishReturn(record, restoreFocus), duration + 100);
  }
  for (const item of section.querySelectorAll('.advantage-item')) {
    const sheet = item.querySelector('.advantage-sheet');
    const note = item.querySelector('.advantage-note');
    const panel = item.querySelector('.advantage-panel');
    const closeButton = item.querySelector('.advantage-close');
    function open(mode) {
      win.clearTimeout(leaveTimer);
      if (active?.item === item) { active.mode = mode; return; }
      close();
      const interrupted = returning.get(item);
      const startBounds = interrupted?.sheet.getBoundingClientRect();
      if (interrupted) finishReturn(interrupted);
      const bounds = item.getBoundingClientRect();
      const from = startBounds ?? bounds;
      // The existing paper moves to the top layer; its grid slot stays in place.
      // No second surface or duplicate title is created when the note unfolds.
      item.style.height = `${item.offsetHeight}px`;
      active = { item, sheet, note, panel, closeButton, mode };
      note.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
      closeButton.hidden = false;
      sheet.setAttribute('popover', 'manual');
      sheet.showPopover();
      const headerBottom = doc.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0;
      const topLimit = Math.max(28, headerBottom + 28);
      const width = Math.min(480, doc.documentElement.clientWidth - 40);
      sheet.style.width = `${width}px`;
      sheet.style.height = 'auto';
      const height = Math.min(sheet.scrollHeight, Math.max(100, win.innerHeight - topLimit - 24));
      const left = Math.max(20, Math.min(bounds.left - (width - bounds.width) / 2, doc.documentElement.clientWidth - width - 20));
      const top = Math.max(topLimit, Math.min(bounds.top - 8, win.innerHeight - height - 24));
      sheet.style.height = `${height}px`;
      sheet.style.left = `${left}px`;
      sheet.style.top = `${top}px`;
      sheet.style.setProperty('--note-from-width', `${from.width}px`);
      sheet.style.setProperty('--note-from-height', `${from.height}px`);
      sheet.style.setProperty('--note-from-x', `${from.left - left}px`);
      sheet.style.setProperty('--note-from-y', `${from.top - top}px`);
      item.classList.add('is-expanded');
    }
    item.addEventListener('pointerenter', () => win.clearTimeout(leaveTimer));
    // Only physical pointer movement opens a note. Closing one can uncover
    // another underneath the stationary pointer; that must not reopen it.
    item.addEventListener('pointermove', event => {
      if (event.pointerType === 'mouse') {
        if (active?.item === item) active.mode = 'hover';
        else open('hover');
      }
    });
    item.addEventListener('pointerleave', () => {
      if (active?.item === item && active.mode === 'hover') {
        leaveTimer = win.setTimeout(() => {
          if (active?.item === item && active.mode === 'hover') close();
        }, 140);
      }
    });
    item.addEventListener('focusin', event => {
      if (!returningFocus && (event.target !== note || note.matches(':focus-visible'))) open('keyboard');
    });
    item.addEventListener('focusout', event => {
      if (active?.item === item && !item.contains(event.relatedTarget)) close();
    });
    note.addEventListener('click', () => {
      if (active?.item === item) {
        if (active.mode !== 'hover') close();
      } else open('touch');
    });
    closeButton.addEventListener('click', () => close(true));
  }
  doc.addEventListener('keydown', event => {
    if (event.key === 'Escape' && active) {
      const restoreFocus = active.item.contains(doc.activeElement);
      event.preventDefault();
      close(restoreFocus);
    }
  });
  doc.addEventListener('pointerdown', event => {
    if (active && !active.item.contains(event.target)) close();
  });
  for (const eventName of ['scroll', 'resize']) {
    win.addEventListener(eventName, () => {
      if (active) close(active.sheet.contains(doc.activeElement), true);
      for (const record of [...returning.values()]) finishReturn(record, record.item.contains(doc.activeElement));
    });
  }
}

export function renderContact(messages = getMessages().common) {
  const copy = messages.contact;
  return `<section class="contact" id="contact"><div class="wrap"><div><h2>${copy.heading.map(esc).join('<br>')}</h2><p>${copy.description.map(esc).join('<br>')}</p></div><div class="contact-invitation"><img class="contact-cat" src="assets/contact-cat-yarn-v1.webp" width="900" height="600" alt="" loading="lazy" decoding="async"><a class="button inverse" href="mailto:service@taistro.com.tw">${esc(copy.cta)}</a></div></div></section>`;
}
