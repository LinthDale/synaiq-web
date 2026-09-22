import { escapeHtml as esc } from './i18n.js';

let instance = 0;
const initialized = new WeakMap();

function imagePath(value) {
  const path = String(value ?? '');
  if (!path || !['https:', 'http:'].includes(new URL(path, 'https://synaiq.invalid/').protocol)) {
    throw new TypeError('Ink photos require a relative or HTTP image URL');
  }
  return esc(path);
}

function renderCanvas({ key, width, height, sketch, source, alt, companion = false, silhouette }) {
  return `<svg class="ink-photo__canvas${companion ? ' ink-photo__canvas--companion' : ''}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" ${companion ? 'aria-hidden="true"' : `role="img" aria-label="${esc(alt ?? '')}"`} focusable="false">
    <defs>
      <filter id="${key}-grain" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency=".013 .018" numOctaves="3" seed="${instance % 19 + 1}" result="grain"/>
        <feDisplacementMap in="SourceGraphic" in2="grain" scale="64" xChannelSelector="R" yChannelSelector="G"/>
        <feGaussianBlur stdDeviation="10"/>
      </filter>
      <mask id="${key}-bloom" maskUnits="userSpaceOnUse" x="-200" y="-200" width="${width + 400}" height="${height + 400}" style="mask-type:alpha">
        <circle data-ink-bloom cx="${width / 2}" cy="${height * .45}" r="0" fill="white" filter="url(#${key}-grain)"/>
      </mask>
      <mask id="${key}-erase" maskUnits="userSpaceOnUse" x="-200" y="-200" width="${width + 400}" height="${height + 400}" style="mask-type:luminance">
        <rect x="0" y="0" width="${width}" height="${height}" fill="white"/>
        <circle data-ink-erase cx="${width / 2}" cy="${height * .45}" r="0" fill="black" filter="url(#${key}-grain)"/>
      </mask>
      ${silhouette ? `<mask id="${key}-silhouette" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}" style="mask-type:alpha"><image href="${imagePath(silhouette)}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice"/></mask>` : ''}
    </defs>
    ${silhouette ? `<g class="ink-photo__silhouette" mask="url(#${key}-silhouette)">` : ''}
    <g class="ink-photo__drawing" mask="url(#${key}-erase)"><image class="ink-photo__sketch" href="${imagePath(sketch)}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice"/></g>
    <g class="ink-photo__photo" mask="url(#${key}-bloom)">${source}</g>
    ${silhouette ? '</g>' : ''}
  </svg>`;
}

/** A real photo blooms through a feathered ink mask; the image itself stays sharp. */
export function renderInkPhoto({ id, sketch, photo, alt, label, aspect = '1 / 1', kind = 'portrait', photoCrop, companion, hint }) {
  const dimensions = /^\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*$/.exec(aspect);
  if (!dimensions || +dimensions[1] <= 0 || +dimensions[2] <= 0) throw new TypeError('Invalid ink photo aspect ratio');
  const width = Math.round(1000 * dimensions[1] / dimensions[2]);
  const height = 1000;
  const key = `ink-${String(id ?? 'photo').replace(/[^\w-]/g, '-')}-${++instance}`;
  const variant = /^[a-z][a-z0-9-]*$/i.test(kind) ? kind : 'portrait';
  let source = `<image href="${imagePath(photo)}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice"/>`;
  if (photoCrop !== undefined) {
    const fields = ['x', 'y', 'width', 'height', 'sourceWidth', 'sourceHeight'];
    if (!photoCrop || !fields.every(field => Number.isSafeInteger(photoCrop[field]))
        || photoCrop.x < 0 || photoCrop.y < 0 || photoCrop.width <= 0 || photoCrop.height <= 0
        || photoCrop.sourceWidth <= 0 || photoCrop.sourceHeight <= 0
        || photoCrop.x + photoCrop.width > photoCrop.sourceWidth
        || photoCrop.y + photoCrop.height > photoCrop.sourceHeight) {
      throw new TypeError('Ink photo crop must be an integer rectangle within the source image');
    }
    // A nested viewport frames the untouched source; the outer mask keeps its own coordinates.
    source = `<svg class="ink-photo__crop" x="0" y="0" width="${width}" height="${height}" viewBox="${photoCrop.x} ${photoCrop.y} ${photoCrop.width} ${photoCrop.height}" preserveAspectRatio="xMidYMid slice" overflow="hidden"><image href="${imagePath(photo)}" x="0" y="0" width="${photoCrop.sourceWidth}" height="${photoCrop.sourceHeight}" preserveAspectRatio="none"/></svg>`;
  }
  return `<button type="button"${id ? ` id="${esc(id)}"` : ''} class="ink-photo ink-photo--${variant}" data-ink-photo data-ink-state="sketch" aria-pressed="false" aria-label="${esc(label ?? alt ?? '')}" style="--ink-photo-aspect:${+dimensions[1]} / ${+dimensions[2]}">
    <span class="ink-photo__art">
      ${renderCanvas({ key, width, height, sketch, source, alt })}
      ${companion ? renderCanvas({ key: `${key}-companion`, width: 1000, height: 1000, sketch: companion.sketch, source: `<image href="${imagePath(companion.photo)}" x="0" y="0" width="1000" height="1000" preserveAspectRatio="xMidYMid slice"/>`, companion: true, silhouette: companion.silhouette }) : ''}
      <span class="ink-photo__ripple" aria-hidden="true"></span>
    </span>
    ${hint ? `<span class="ink-photo__hint" aria-hidden="true">
      <span class="ink-photo__hint-touch">${esc(hint.touch)}</span><span class="ink-photo__hint-hover">${esc(hint.hover)}</span>
      <svg viewBox="0 0 80 60" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M73 4C53 7 29 17 31 31c2 12 20 10 18-1C46 15 19 24 12 52M7 43l5 9 10-5"/><path d="M69 2C53 6 41 11 35 18" stroke-width=".55" opacity=".45"/></svg>
    </span>` : ''}
  </button>`;
}

export function initialInkState() {
  return { hovered: false, focused: false, paused: false, suppressed: false, touchTarget: null };
}

/** Pausing freezes progress; hover and focus keep tracking the direction to resume. */
export function transitionInkState(state, action) {
  switch (action) {
    case 'enter': return { ...state, hovered: true, suppressed: false, touchTarget: null };
    case 'leave': return { ...state, hovered: false };
    case 'focus': return { ...state, focused: true, suppressed: false, touchTarget: null };
    case 'blur': return { ...state, focused: false };
    case 'click': return { ...state, paused: !state.paused };
    case 'touch-show': return { ...state, paused: false, suppressed: false, touchTarget: true };
    case 'touch-hide': return { ...state, paused: false, suppressed: false, touchTarget: false };
    case 'escape': return { ...state, paused: false, suppressed: true, touchTarget: null };
    default: return state;
  }
}

export function isInkRevealed(state) {
  return !state.suppressed && (state.touchTarget ?? (state.hovered || state.focused));
}

function durationFromCss(view, button) {
  const value = view.getComputedStyle(button).getPropertyValue('--ink-reveal-duration').trim();
  const parsed = /^(\d+(?:\.\d+)?)(ms|s)$/.exec(value);
  return parsed ? Number(parsed[1]) * (parsed[2] === 's' ? 1000 : 1) : 0;
}

/** Initializes a batch once and returns a cleanup function for page replacement. */
export function initInkPhotos(root = document) {
  const documentNode = root.ownerDocument || root;
  const view = documentNode.defaultView || window;
  const reduced = view.matchMedia('(prefers-reduced-motion: reduce)');
  const hover = view.matchMedia('(hover: hover)');
  const active = new Set();
  let observer;

  for (const button of root.querySelectorAll('[data-ink-photo]')) {
    if (initialized.has(button)) continue;
    const surfaces = [...button.querySelectorAll('.ink-photo__canvas')].map(svg => {
      const [, , width, height] = svg.getAttribute('viewBox').split(/\s+/).map(Number);
      return { width, height, masks: [...svg.querySelectorAll('[data-ink-bloom], [data-ink-erase]')], radius: 0 };
    }).filter(surface => surface.masks.length === 2);
    if (!surfaces.length) continue;
    let state = initialInkState();
    let progress = 0;
    let frame = 0;
    let destroyed = false;
    let lastPointerType;
    const events = [];

    const listen = (name, handler) => {
      button.addEventListener(name, handler);
      events.push([name, handler]);
    };
    const cancel = () => {
      if (frame) view.cancelAnimationFrame(frame);
      frame = 0;
    };
    const setOrigin = (clientX, clientY) => {
      if (progress > 0) return;
      const bounds = button.querySelector('.ink-photo__art').getBoundingClientRect();
      const x = Number.isFinite(clientX) && bounds.width ? Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width)) : .5;
      const y = Number.isFinite(clientY) && bounds.height ? Math.max(0, Math.min(1, (clientY - bounds.top) / bounds.height)) : .45;
      for (const surface of surfaces) {
        for (const mask of surface.masks) {
          mask.setAttribute('cx', x * surface.width);
          mask.setAttribute('cy', y * surface.height);
        }
        surface.radius = Math.hypot(Math.max(x, 1 - x) * surface.width, Math.max(y, 1 - y) * surface.height) + 160;
      }
      button.style.setProperty('--ink-origin-x', `${x * 100}%`);
      button.style.setProperty('--ink-origin-y', `${y * 100}%`);
    };
    const paint = value => {
      progress = value;
      for (const surface of surfaces) {
        for (const mask of surface.masks) mask.setAttribute('r', value * surface.radius);
      }
      button.style.setProperty('--ink-progress', String(value));
    };
    const render = () => {
      const target = Number(isInkRevealed(state));
      button.setAttribute('aria-pressed', String(state.paused));
      button.classList.toggle('is-locked', state.paused);
      cancel();
      if (state.paused) {
        // Keep the exact radius and reveal class, even if hover/focus or media changes.
        button.dataset.inkState = 'paused';
        return;
      }
      button.classList.toggle('is-revealed', Boolean(target));
      const duration = reduced.matches ? 0 : durationFromCss(view, button) * Math.abs(target - progress);
      if (!duration) {
        paint(target);
        button.dataset.inkState = target ? 'photo' : 'sketch';
        return;
      }
      button.dataset.inkState = target ? 'revealing' : 'hiding';
      const from = progress;
      const start = view.performance.now();
      const step = now => {
        frame = 0;
        if (!button.isConnected || destroyed) { destroy(); return; }
        const elapsed = Math.min(1, Math.max(0, (now - start) / duration));
        const eased = elapsed * elapsed * (3 - 2 * elapsed);
        paint(from + (target - from) * eased);
        if (elapsed < 1) frame = view.requestAnimationFrame(step);
        else button.dataset.inkState = target ? 'photo' : 'sketch';
      };
      frame = view.requestAnimationFrame(step);
    };
    const dispatch = action => {
      state = transitionInkState(state, action);
      render();
    };
    const mediaChanged = () => {
      if (!hover.matches) state = transitionInkState(state, 'leave');
      render();
    };
    const destroy = () => {
      if (destroyed) return;
      destroyed = true;
      cancel();
      for (const [name, handler] of events) button.removeEventListener(name, handler);
      reduced.removeEventListener('change', mediaChanged);
      hover.removeEventListener('change', mediaChanged);
      initialized.delete(button);
      active.delete(controller);
      if (!active.size) observer?.disconnect();
    };
    const controller = { button, destroy };
    listen('pointerenter', event => {
      if (!hover.matches || event.pointerType === 'touch') return;
      setOrigin(event.clientX, event.clientY);
      dispatch('enter');
    });
    listen('pointerleave', () => dispatch('leave'));
    listen('pointerdown', event => {
      lastPointerType = event.pointerType;
      setOrigin(event.clientX, event.clientY);
    });
    listen('focus', () => {
      if (!button.matches(':focus-visible')) return;
      setOrigin();
      dispatch('focus');
    });
    listen('blur', () => dispatch('blur'));
    listen('click', event => {
      if (event.detail === 0) setOrigin();
      const touchClick = event.detail !== 0 && (event.pointerType === 'touch' || lastPointerType === 'touch' || !hover.matches);
      // On touch, the first tap supplies the absent hover. Further taps pause/resume;
      // a tap at a settled endpoint begins the opposite transition.
      if (touchClick && !state.paused && !frame && (progress === 0 || progress === 1)) {
        dispatch(progress === 0 ? 'touch-show' : 'touch-hide');
      } else dispatch('click');
    });
    listen('keydown', event => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      dispatch('escape');
    });
    reduced.addEventListener('change', mediaChanged);
    hover.addEventListener('change', mediaChanged);
    active.add(controller);
    initialized.set(button, controller);
    setOrigin();
    render();
  }

  if (active.size && view.MutationObserver) {
    observer = new view.MutationObserver(() => {
      for (const controller of active) if (!controller.button.isConnected) controller.destroy();
    });
    observer.observe(documentNode.documentElement, { childList: true, subtree: true });
  }
  return () => { for (const controller of active) controller.destroy(); observer?.disconnect(); };
}
