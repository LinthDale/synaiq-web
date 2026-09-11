import test from 'node:test';
import assert from 'node:assert/strict';
import { initialInkState, transitionInkState, isInkRevealed, renderInkPhoto, initInkPhotos } from './ink-photo.js';

test('pause tracks hover and focus without forcing a reveal; resuming uses the current direction', () => {
  for (const entry of ['enter', 'focus']) {
    let state = transitionInkState(initialInkState(), entry);
    assert.equal(isInkRevealed(state), true);
    state = transitionInkState(state, 'click');
    assert.equal(state.paused, true);
    state = transitionInkState(state, 'click');
    assert.equal(state.paused, false);
    assert.equal(isInkRevealed(state), true);
    state = transitionInkState(state, entry === 'enter' ? 'leave' : 'blur');
    assert.equal(isInkRevealed(state), false);
    state = transitionInkState(state, entry);
    assert.equal(isInkRevealed(state), true);
    state = transitionInkState(state, 'click');
    state = transitionInkState(state, 'leave');
    state = transitionInkState(state, 'blur');
    assert.equal(state.paused, true);
    assert.equal(isInkRevealed(state), false);
    state = transitionInkState(state, 'escape');
    assert.equal(state.paused, false);
    assert.equal(isInkRevealed(state), false);
  }
});

test('photo and drawing share complementary spatial masks, escaped copy and isolated IDs', () => {
  const options = { id: 'sample', sketch: 'assets/sketch.webp', photo: 'assets/real.jpg', alt: 'Person <with> "quotes"', label: 'Reveal & hold', aspect: '3 / 4' };
  const first = renderInkPhoto(options);
  const second = renderInkPhoto(options);
  assert.match(first, /type="button"/);
  assert.match(first, /aria-pressed="false"/);
  assert.match(first, /Person &lt;with&gt; &quot;quotes&quot;/);
  assert.match(first, /viewBox="0 0 750 1000"/);
  assert.match(first, /<feTurbulence/);
  assert.match(first, /<svg class="ink-photo__canvas"[^>]*role="img"/);
  assert.doesNotMatch(first, /<img\s/);
  assert.match(first, /mask-type:luminance/);
  assert.match(first, /<g class="ink-photo__drawing" mask="url\(#[^"]+-erase\)"/);
  assert.match(first, /<g class="ink-photo__photo" mask="url\(#[^"]+-bloom\)"/);
  assert.match(first, /<circle data-ink-erase[^>]*fill="black"/);
  const bloomFilter = first.match(/<circle data-ink-bloom[^>]*filter="([^"]+)"/)[1];
  const eraseFilter = first.match(/<circle data-ink-erase[^>]*filter="([^"]+)"/)[1];
  assert.equal(bloomFilter, eraseFilter);
  assert.match(first, /<circle[^>]* filter=/);
  assert.doesNotMatch(first, /<image[^>]* filter=/);
  assert.notEqual(first.match(/id="([^"]+-bloom)"/)[1], second.match(/id="([^"]+-bloom)"/)[1]);
  assert.throws(() => renderInkPhoto({ ...options, photo: 'javascript:alert(1)' }), /image URL/);
  assert.throws(() => renderInkPhoto({ ...options, aspect: '1; color:red' }), /aspect ratio/);
});

test('an optional SVG crop frames the unchanged original image inside the outer reveal mask', () => {
  const options = { sketch: 'assets/sketch.webp', photo: 'assets/team/celestine-photo.webp', alt: 'Portrait', photoCrop: { x: 304, y: 78, width: 232, height: 232, sourceWidth: 864, sourceHeight: 1184 } };
  const markup = renderInkPhoto(options);
  assert.match(markup, /<g class="ink-photo__photo" mask="url\(#[^"]+-bloom\)"><svg class="ink-photo__crop"/);
  assert.match(markup, /viewBox="304 78 232 232"/);
  assert.match(markup, /<image href="assets\/team\/celestine-photo\.webp" x="0" y="0" width="864" height="1184" preserveAspectRatio="none"/);
  for (const photoCrop of [null, { ...options.photoCrop, x: -1 }, { ...options.photoCrop, width: 0 }, { ...options.photoCrop, x: 700 }, { ...options.photoCrop, y: 1100 }, { ...options.photoCrop, width: 232.5 }, { ...options.photoCrop, sourceWidth: Infinity }, { ...options.photoCrop, x: '304" onload="x' }]) {
    assert.throws(() => renderInkPhoto({ ...options, photoCrop }), /integer rectangle/);
  }
});

test('a companion shares one button with isolated complementary masks and decorative semantics', () => {
  const markup = renderInkPhoto({ id: 'with-cat', sketch: 'person-sketch.webp', photo: 'person.webp', alt: 'Person', companion: { sketch: 'cat-sketch.webp', photo: 'cat-photo.webp' } });
  assert.equal((markup.match(/<button\b/g) || []).length, 1);
  assert.equal((markup.match(/data-ink-bloom/g) || []).length, 2);
  assert.equal((markup.match(/data-ink-erase/g) || []).length, 2);
  assert.match(markup, /<svg class="ink-photo__canvas ink-photo__canvas--companion"[^>]*aria-hidden="true"/);
  assert.match(markup, /href="cat-sketch.webp"/);
  assert.match(markup, /href="cat-photo.webp"/);
  const ids = [...markup.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
});

test('an optional companion silhouette uses source alpha around both states without cutting out white fur', () => {
  const markup = renderInkPhoto({ sketch: 'person-sketch.webp', photo: 'person.webp', companion: { sketch: 'cat-ink.webp', photo: 'cat-photo.webp', silhouette: 'cat-alpha.webp' } });
  assert.equal((markup.match(/id="[^"]+-silhouette"/g) || []).length, 1);
  assert.match(markup, /<mask id="[^"]+-silhouette"[^>]*style="mask-type:alpha"><image href="cat-alpha.webp"[^>]*preserveAspectRatio="xMidYMid slice"\/><\/mask>/);
  assert.match(markup, /<g class="ink-photo__silhouette" mask="url\(#[^"]+-silhouette\)">\s*<g class="ink-photo__drawing"[^>]*>[\s\S]*?<\/g>\s*<g class="ink-photo__photo"[^>]*>[\s\S]*?<\/g>\s*<\/g>/);
  assert.equal((markup.match(/data-ink-bloom/g) || []).length, 2);
  assert.equal((markup.match(/data-ink-erase/g) || []).length, 2);
  assert.doesNotMatch(renderInkPhoto({ sketch: 'person-sketch.webp', photo: 'person.webp' }), /silhouette/);
});

function fixture({ reduced = false, hovering = true, keyboardFocus = true, companion = false } = {}) {
  let now = 0;
  let sequence = 0;
  const frames = new Map();
  const handlers = new Map();
  const attrs = new Map();
  const circleAttrs = new Map();
  const eraseAttrs = new Map();
  const companionCircleAttrs = new Map();
  const companionEraseAttrs = new Map();
  const cssProperties = new Map();
  const classes = new Set();
  const media = matches => ({ matches, addEventListener() {}, removeEventListener() {} });
  const reduceQuery = media(reduced);
  const hoverQuery = media(hovering);
  const surface = (width, height, bloom, erase) => ({
    getAttribute: () => `0 0 ${width} ${height}`,
    querySelectorAll: () => [bloom, erase].map(attributes => ({ setAttribute: (key, value) => attributes.set(key, Number(value)) })),
  });
  const surfaces = [surface(750, 1000, circleAttrs, eraseAttrs)];
  if (companion) surfaces.push(surface(1000, 1000, companionCircleAttrs, companionEraseAttrs));
  const button = {
    isConnected: true, dataset: {}, style: { setProperty: (key, value) => cssProperties.set(key, value) },
    classList: { toggle(name, present) { if (present) classes.add(name); else classes.delete(name); } },
    querySelector(selector) {
      if (selector === '[data-ink-bloom]') return { setAttribute: (key, value) => circleAttrs.set(key, Number(value)) };
      if (selector === '[data-ink-erase]') return { setAttribute: (key, value) => eraseAttrs.set(key, Number(value)) };
      if (selector === '.ink-photo__canvas') return { getAttribute: () => '0 0 750 1000' };
      return { getBoundingClientRect: () => ({ left: 0, top: 0, width: 300, height: 400 }) };
    },
    querySelectorAll: () => surfaces,
    addEventListener: (name, handler) => handlers.set(name, handler),
    removeEventListener: name => handlers.delete(name),
    setAttribute: (name, value) => attrs.set(name, value),
    matches: () => keyboardFocus,
  };
  const root = { querySelectorAll: () => [button], defaultView: {
    matchMedia: query => query.includes('reduced-motion') ? reduceQuery : hoverQuery,
    getComputedStyle: () => ({ getPropertyValue: () => '1.6s' }),
    performance: { now: () => now },
    requestAnimationFrame: callback => { frames.set(++sequence, callback); return sequence; },
    cancelAnimationFrame: id => frames.delete(id),
  } };
  const destroy = initInkPhotos(root);
  return {
    button, attrs, circleAttrs, eraseAttrs, companionCircleAttrs, companionEraseAttrs, cssProperties, frames, handlers, destroy,
    fire: (name, event = {}) => handlers.get(name)?.({ pointerType: 'mouse', clientX: 150, clientY: 200, detail: 1, ...event }),
    tick(milliseconds) { now += milliseconds; const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(now)); },
  };
}

test('the mask expands over CSS duration, reverses from its current radius, and cancels on detach', () => {
  const f = fixture();
  f.fire('pointerenter');
  assert.equal(f.button.dataset.inkState, 'revealing');
  f.tick(800);
  const middle = f.circleAttrs.get('r');
  assert.ok(middle > 0);
  f.fire('pointerleave');
  assert.equal(f.circleAttrs.get('r'), middle);
  f.tick(800);
  assert.equal(f.circleAttrs.get('r'), 0);
  assert.equal(f.button.dataset.inkState, 'sketch');
  f.fire('pointerenter');
  f.tick(1600);
  assert.ok(f.circleAttrs.get('r') > middle);
  assert.equal(f.button.dataset.inkState, 'photo');
  f.fire('pointerleave');
  f.button.isConnected = false;
  f.tick(20);
  assert.equal(f.frames.size, 0);
  assert.equal(f.handlers.size, 0);
});

test('click freezes the exact mid-transition radius through mouse focus, leaving and elapsed time', () => {
  const f = fixture({ keyboardFocus: false });
  f.fire('pointerenter');
  f.tick(640);
  const frozen = f.circleAttrs.get('r');
  const frozenProgress = f.cssProperties.get('--ink-progress');
  assert.ok(frozen > 0);
  assert.deepEqual(f.eraseAttrs, f.circleAttrs);
  f.fire('pointerdown');
  f.fire('focus'); // Browsers focus a mouse-clicked button before dispatching click.
  f.fire('click');
  assert.equal(f.circleAttrs.get('r'), frozen);
  assert.equal(f.attrs.get('aria-pressed'), 'true');
  assert.equal(f.button.dataset.inkState, 'paused');
  assert.equal(f.frames.size, 0);
  f.fire('pointerleave');
  f.tick(5000);
  assert.equal(f.circleAttrs.get('r'), frozen);
  assert.equal(f.eraseAttrs.get('r'), frozen);
  assert.equal(f.cssProperties.get('--ink-progress'), frozenProgress);
  assert.deepEqual(f.eraseAttrs, f.circleAttrs);
  assert.equal(f.button.dataset.inkState, 'paused');
  f.fire('click');
  assert.equal(f.attrs.get('aria-pressed'), 'false');
  assert.equal(f.circleAttrs.get('r'), frozen);
  assert.equal(f.button.dataset.inkState, 'hiding');
  f.tick(1600);
  assert.equal(f.circleAttrs.get('r'), 0);
  assert.equal(f.eraseAttrs.get('r'), 0);
  f.destroy();
});

test('person and companion reveal, freeze and reverse together through one animation controller', () => {
  const f = fixture({ companion: true, keyboardFocus: false });
  f.fire('pointerenter');
  f.tick(800);
  const mainRadius = Math.hypot(375, 500) + 160;
  const companionRadius = Math.hypot(500, 500) + 160;
  assert.equal(f.circleAttrs.get('r') / mainRadius, .5);
  assert.equal(f.companionCircleAttrs.get('r') / companionRadius, .5);
  assert.equal(f.companionCircleAttrs.get('cx'), 500);
  assert.equal(f.companionCircleAttrs.get('cy'), 500);
  assert.deepEqual(f.eraseAttrs, f.circleAttrs);
  assert.deepEqual(f.companionEraseAttrs, f.companionCircleAttrs);
  const frozen = [new Map(f.circleAttrs), new Map(f.companionCircleAttrs)];
  f.fire('click');
  f.fire('pointerleave');
  f.tick(5000);
  assert.deepEqual(f.circleAttrs, frozen[0]);
  assert.deepEqual(f.companionCircleAttrs, frozen[1]);
  assert.deepEqual(f.companionEraseAttrs, frozen[1]);
  assert.equal(f.frames.size, 0);
  f.fire('click');
  assert.equal(f.frames.size, 1);
  f.tick(1600);
  for (const attrs of [f.circleAttrs, f.eraseAttrs, f.companionCircleAttrs, f.companionEraseAttrs]) assert.equal(attrs.get('r'), 0);
  assert.equal(f.button.dataset.inkState, 'sketch');
  f.destroy();
});

test('keyboard activation freezes a partial reveal and resumes it while focused; Escape resets', () => {
  const f = fixture();
  f.fire('focus');
  f.tick(800);
  const frozen = f.circleAttrs.get('r');
  f.fire('click', { detail: 0 });
  f.tick(5000);
  assert.equal(f.circleAttrs.get('r'), frozen);
  f.fire('click', { detail: 0 });
  assert.equal(f.button.dataset.inkState, 'revealing');
  f.tick(1600);
  assert.ok(f.circleAttrs.get('r') > frozen);
  assert.equal(f.button.dataset.inkState, 'photo');
  f.fire('click', { detail: 0 });
  f.fire('keydown', { key: 'Escape', preventDefault() {} });
  assert.equal(f.attrs.get('aria-pressed'), 'false');
  f.tick(1600);
  assert.equal(f.circleAttrs.get('r'), 0);
  f.destroy();
});

test('touch starts, freezes and resumes a partial reveal, then returns at the settled endpoint', () => {
  const f = fixture({ hovering: false, keyboardFocus: false });
  f.fire('pointerenter', { pointerType: 'touch' });
  assert.equal(f.circleAttrs.get('r'), 0);
  f.fire('pointerdown', { pointerType: 'touch' });
  f.fire('click', { pointerType: 'touch' });
  assert.equal(f.attrs.get('aria-pressed'), 'false');
  f.tick(640);
  const frozen = f.circleAttrs.get('r');
  f.fire('click', { pointerType: 'touch' });
  assert.equal(f.attrs.get('aria-pressed'), 'true');
  f.fire('pointerleave');
  f.tick(5000);
  assert.equal(f.circleAttrs.get('r'), frozen);
  f.fire('click', { pointerType: 'touch' });
  assert.equal(f.attrs.get('aria-pressed'), 'false');
  f.tick(1600);
  assert.equal(f.button.dataset.inkState, 'photo');
  f.fire('click', { pointerType: 'touch' });
  f.tick(1600);
  assert.equal(f.circleAttrs.get('r'), 0);
  f.destroy();
});

test('reduced motion changes endpoints immediately and never queues frames, including pause/reset', () => {
  const f = fixture({ reduced: true });
  f.fire('focus');
  const radius = f.circleAttrs.get('r');
  assert.ok(radius > 0);
  f.fire('click', { detail: 0 });
  f.fire('blur');
  assert.equal(f.circleAttrs.get('r'), radius);
  assert.equal(f.button.dataset.inkState, 'paused');
  f.fire('keydown', { key: 'Escape', preventDefault() {} });
  assert.equal(f.circleAttrs.get('r'), 0);
  assert.equal(f.frames.size, 0);
  f.destroy();
});
