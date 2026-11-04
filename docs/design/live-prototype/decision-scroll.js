import { DECISION_FRAME_COUNT, decisionFrameFile, decisionMobileFrameFile } from './decision-frames.js';
import { createDecisionMobileSource } from './decision-mobile-source.js';

export const DECISION_POLICIES = Object.freeze({
  mobile: Object.freeze({ cacheSize: 6, concurrent: 2, ahead: 2, behind: 1, warmWholeSequence: false, warmAhead: 48, warmBehind: 12, warmConcurrent: 6, visibleOnly: true }),
  desktop: Object.freeze({ cacheSize: 32, concurrent: 6, ahead: 20, behind: 8, warmWholeSequence: true, warmConcurrent: 2, visibleOnly: false }),
});

const clamp = value => Math.max(0, Math.min(1, value));
export function decisionPreloadOrder(current, direction = 1, count = DECISION_FRAME_COUNT) {
  const start = Math.max(0, Math.min(count - 1, Math.round(current)));
  const order = [start];
  for (let distance = 1; distance < count; distance++) {
    for (const index of [start + distance * direction, start - distance * direction]) {
      if (index >= 0 && index < count) order.push(index);
    }
  }
  return order;
}
export function decisionFrameAt(progress, count = DECISION_FRAME_COUNT) {
  return Math.round(clamp(Number.isFinite(progress) ? progress : 0) * (count - 1));
}
// V5: ease into the snap/morph, spend more scroll distance on illumination,
// then ease out. Integrating weights keeps the map continuous and reversible.
const smoothstep = value => { const t=clamp(value); return t*t*(3-2*t); };
const pacingDistances = [0];
for(let frame=0;frame<DECISION_FRAME_COUNT-1;frame++) {
  const midpoint=frame+0.5;
  const emphasis=smoothstep((midpoint-155)/18)*(1-smoothstep((midpoint-217)/18));
  pacingDistances.push(pacingDistances.at(-1)+1+2.2*emphasis);
}
export function decisionPacedFrameAt(progress) {
  const distance=clamp(Number.isFinite(progress)?progress:0)*pacingDistances.at(-1);
  let low=0,high=DECISION_FRAME_COUNT-1;
  while(high-low>1) {
    const middle=Math.floor((low+high)/2);
    if(pacingDistances[middle]<=distance)low=middle;else high=middle;
  }
  return Math.round(low+(distance-pacingDistances[low])/(pacingDistances[high]-pacingDistances[low]));
}
export function buildDecisionTimeline(surfaces, {viewportHeight, headerHeight, start, end}) {
  const bands = [];
  for (const band of surfaces.filter(b => Number.isFinite(b.top) && Number.isFinite(b.bottom) && b.bottom > b.top).sort((a,b) => a.top-b.top)) {
    const last = bands.at(-1);
    if (last && band.top <= last.bottom) last.bottom = Math.max(last.bottom, band.bottom);
    else bands.push({...band});
  }
  if (end <= start || viewportHeight <= headerHeight) return {segments:[],total:0};
  // Visible height changes linearly between these entry/exit positions.
  // Integrating it makes completely covered gaps consume no animation frames,
  // and slows the sequence down near a torn edge where little is visible.
  const knots = [...new Set([start,end,...bands.flatMap(b => [
    b.top-viewportHeight,b.top-headerHeight,b.bottom-viewportHeight,b.bottom-headerHeight,
  ]).filter(y => y > start && y < end)])].sort((a,b) => a-b);
  const visible = y => bands.reduce((sum,b) => sum + Math.max(0, Math.min(b.bottom,y+viewportHeight)-Math.max(b.top,y+headerHeight)),0);
  let total = 0;
  const segments = [];
  for (let i=1; i<knots.length; i++) {
    const from = knots[i-1], to = knots[i];
    const v0 = visible(from), v1 = visible(to);
    const area = (v0+v1)*(to-from)/2;
    segments.push({from,to,v0,v1,before:total});
    total += area;
  }
  return {segments,total};
}

export function decisionTimelineFrame(scrollPosition, timeline) {
  if (!timeline.total || !Number.isFinite(scrollPosition)) return 0;
  const segment = timeline.segments.find(s => scrollPosition < s.to);
  if (!segment) return DECISION_FRAME_COUNT-1;
  const distance = Math.max(0,scrollPosition-segment.from);
  const area = segment.before + segment.v0*distance + (segment.v1-segment.v0)*distance*distance/(2*(segment.to-segment.from));
  return decisionPacedFrameAt(area/timeline.total);
}

export function easeDecisionFrame(current, target, elapsed) {
  const next = current + (target-current)*(1-Math.exp(-Math.max(0,elapsed)/80));
  return Math.abs(next-target) < 0.25 ? target : next;
}

export function scenePlacement(width, height, imageWidth, imageHeight) {
  const scale = Math.max(width / imageWidth, height / imageHeight);
  const drawnWidth = imageWidth * scale;
  const drawnHeight = imageHeight * scale;
  // Portrait cropping keeps the hand and bulb on the right in the same frame.
  const anchor = width < 640 ? 0.9 : width < 1100 ? 0.68 : 0.5;
  return { width: drawnWidth, height: drawnHeight, x: (width - drawnWidth) * anchor, y: (height - drawnHeight) * 0.55 };
}

export function initDecisionScroll() {
  const mobile = matchMedia('(max-width: 899px), (pointer: coarse)');
  let stop = () => {};
  const update = () => {
    stop();
    stop = initAnimatedDecisionScroll(mobile.matches ? 'mobile' : 'desktop');
  };
  mobile.addEventListener('change', update);
  update();
  return () => { mobile.removeEventListener('change', update); stop(); };
}

function initAnimatedDecisionScroll(profile) {
  const hero = document.querySelector('.home-opening');
  const proof = document.getElementById('proof');
  if (!hero || !proof) return () => {};
  const policy = DECISION_POLICIES[profile];
  const frameFile = profile === 'mobile' ? decisionMobileFrameFile : decisionFrameFile;
  document.body.dataset.decisionProfile = profile;
  const surfaces = [...document.querySelectorAll('[data-decision-surface]')];
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const abort = new AbortController();
  const source = profile === 'mobile' ? createDecisionMobileSource({ signal: abort.signal }) : null;
  const surfaceFrames = new Map();
  const cache = new Map();
  const pending = new Map();
  const failed = new Set();
  // HTTP cache holds compressed frames; only the nearby window stays decoded.
  const warmed = new Set();
  const warming = new Set();
  const warmFailed = new Set();
  let warmTask = null;
  const idle = globalThis.requestIdleCallback
    ? callback => requestIdleCallback(callback, { timeout: 1200 })
    : callback => setTimeout(callback, profile === 'mobile' ? 0 : 200);
  const cancelIdle = globalThis.cancelIdleCallback ?? clearTimeout;
  let requested = 0;
  let target = 0;
  let scrub = 0;
  let lastTime = 0;
  let lastScroll = null;
  let direction = 1;
  let displayed = -1;
  let displayedUrl = '';
  let raf = 0;
  let disposed = false;
  let ready = false;
  let imageWidth = 1152;
  let imageHeight = 768;
  let headerHeight = 74;
  let timeline = {segments:[],total:0};

  function measure() {
    headerHeight = document.querySelector('.site-header')?.offsetHeight ?? 74;
    const start = hero.getBoundingClientRect().top + scrollY - headerHeight;
    const end = proof.getBoundingClientRect().bottom + scrollY - innerHeight;
    const bands = surfaces.map(surface => {
      const rect = surface.getBoundingClientRect();
      let bottom = rect.bottom + scrollY;
      const next = surface.nextElementSibling;
      if (next) {
        const edge = getComputedStyle(next,'::before');
        const offset = edge.content !== 'none' && edge.display !== 'none' ? Math.min(0,Number.parseFloat(edge.top)||0) : 0;
        // Conservatively exclude the incoming opaque paper's entire torn edge.
        bottom = Math.min(bottom,next.getBoundingClientRect().top+scrollY+offset);
      }
      return {top:rect.top+scrollY,bottom};
    });
    // All black sections share one timeline. Text and product cards are foreground
    // content, not playback gates. Only wholly opaque sections consume no frames.
    timeline = buildDecisionTimeline(bands,{
      viewportHeight:innerHeight,headerHeight,start,end,
    });
    schedule();
  }

  function positionSurfaces() {
    const viewportHeight = innerHeight - headerHeight;
    const scene = scenePlacement(innerWidth, viewportHeight, imageWidth, imageHeight);
    for (const surface of surfaces) {
      const bounds = surface.getBoundingClientRect();
      if (policy.visibleOnly && (bounds.bottom < -256 || bounds.top > innerHeight + 256)) {
        surface.style.removeProperty('--decision-frame');
        surfaceFrames.delete(surface);
        continue;
      }
      if (displayed >= 0 && surfaceFrames.get(surface) !== displayed) {
        surface.style.setProperty('--decision-frame', `url("${displayedUrl}")`);
        surfaceFrames.set(surface, displayed);
      }
      const top = headerHeight + scene.y - bounds.top;
      surface.style.setProperty('--decision-size', `${scene.width}px ${scene.height}px`);
      surface.style.setProperty('--decision-position', `${scene.x - bounds.left}px ${top}px`);
      // The incoming torn edge shares viewport coordinates with the section below it.
      const edge = getComputedStyle(surface, '::after');
      const edgeTop = Number.parseFloat(edge.top) || 0;
      surface.style.setProperty('--decision-tear-position', `${scene.x - bounds.left}px ${top - edgeTop}px`);
    }
  }

  function display(index) {
    const image = cache.get(index);
    if (!image || disposed) return;
    imageWidth = image.naturalWidth;
    imageHeight = image.naturalHeight;
    document.body.classList.add('decision-scroll-ready');
    document.body.dataset.decisionFrame = String(index);
    displayed = index;
    displayedUrl = image.src;
    if (!ready) { ready = true; measure(); }
    positionSurfaces();
  }

  function wantedFrames() {
    // Contiguous look-ahead avoids the old 1/3/6-frame holes during a wheel tick.
    // Keep the destination warm too, so anchors and fast drags need not decode a movie.
    return (preference.matches ? [requested] : [requested,target,
      ...Array.from({length:policy.ahead},(_,i)=>requested+(i+1)*direction),
      ...Array.from({length:policy.behind},(_,i)=>requested-(i+1)*direction)])
      .filter(index => index >= 0 && index < DECISION_FRAME_COUNT);
  }
  function fillCache() {
    if (disposed) return;
    for (const index of wantedFrames()) {
      if (pending.size >= policy.concurrent) break;
      if (index < 0 || index >= DECISION_FRAME_COUNT || cache.has(index) || pending.has(index) || failed.has(index)) continue;
      const image = new Image();
      pending.set(index, image);
      image.decoding = 'async';
      image.fetchPriority = index === requested || index === target ? 'high' : 'low';
      const decode = src => {
        if (disposed) return;
        image.src = src;
        return image.decode();
      };
      const loading = source ? source.frame(index).then(decode) : decode(new URL(frameFile(index), import.meta.url).href);
      loading.then(() => {
        if (disposed) return;
        cache.set(index, image);
        warmed.add(index);
        document.body.dataset.decisionPreloaded = String(warmed.size);
        if (index === requested) display(index);
        else if (!ready && index === target) display(index);
        // Keep the requested window first. Distance alone evicted the look-ahead
        // frame just decoded, then finally() decoded it again indefinitely.
        const wanted = new Set(wantedFrames());
        const removable = [...cache.keys()].filter(key => key !== requested && key !== target && key !== displayed)
          .sort((a,b) => Number(wanted.has(a)) - Number(wanted.has(b)) || Math.abs(b-requested)-Math.abs(a-requested));
        while (cache.size > policy.cacheSize && removable.length) {
          const old = removable.shift(); cache.get(old).removeAttribute('src'); cache.delete(old);
        }
        document.body.dataset.decisionCached = String(cache.size);
      }).catch(() => { failed.add(index); }).finally(() => {
        pending.delete(index);
        fillCache();
        scheduleWarm();
      });
    }
  }

  function canWarm() {
    const connection = navigator.connection;
    return (policy.warmWholeSequence || policy.warmAhead > 0) && !disposed && ready && !preference.matches && !document.hidden
      && !connection?.saveData && !['slow-2g', '2g'].includes(connection?.effectiveType);
  }
  function scheduleWarm() {
    if (!canWarm() || warmTask !== null || warmed.size >= DECISION_FRAME_COUNT || warming.size >= policy.warmConcurrent) return;
    warmTask = idle(() => {
      warmTask = null;
      if (!canWarm()) return;
      // Compressed HTTP responses may look farther ahead without retaining
      // decoded images. This separates first-scroll network latency from the
      // small pixel-memory window; touch devices never idle-fetch all 243.
      const order = decisionPreloadOrder(requested, direction).filter(index => {
        const distance = (index - requested) * direction;
        return policy.warmWholeSequence || (distance >= -policy.warmBehind && distance <= policy.warmAhead);
      });
      while (warming.size < policy.warmConcurrent) {
        const index = order.find(value => !warmed.has(value) && !warming.has(value) && !pending.has(value) && !warmFailed.has(value));
        if (index === undefined) break;
        warming.add(index);
        const preparation = source ? source.prepare(index) : fetch(new URL(frameFile(index), import.meta.url), {
          cache: 'force-cache', priority: 'low', signal: abort.signal,
        }).then(async response => {
          if (!response.ok) throw new Error('Frame preload failed');
          await response.arrayBuffer(); // Consume the response so the browser can cache it.
        });
        preparation.then(() => {
          if (!disposed) {
            warmed.add(index);
            document.body.dataset.decisionPreloaded = String(warmed.size);
          }
        }).catch(() => { if (!disposed) warmFailed.add(index); }).finally(() => {
          warming.delete(index);
          scheduleWarm();
        });
      }
    });
  }

  function draw(time) {
    raf = 0;
    if (disposed) return;
    // A deterministic visibility-weighted map also supports reverse scrolling
    // and direct anchor entry without accumulating hidden scroll distance.
    const y = scrollY;
    const nextTarget = preference.matches ? DECISION_FRAME_COUNT - 1 : decisionTimelineFrame(y, timeline);
    if (nextTarget !== target) direction = nextTarget > target ? 1 : -1;
    target = nextTarget;
    const segment = timeline.segments.find(s=>y>=s.from&&y<s.to);
    const covered = !segment || (segment.v0===0 && segment.v1===0);
    // A brief scrub softens discrete wheel events. Never run it through a hidden
    // section, a direct anchor jump, or reduced-motion mode.
    if (lastScroll===null || preference.matches || covered || Math.abs(y-lastScroll)>innerHeight/2) scrub=target;
    else scrub=easeDecisionFrame(scrub,target,time-lastTime>80?16:Math.min(32,Math.max(0,time-lastTime)));
    requested=Math.round(scrub);
    lastScroll=y;
    lastTime=time;
    document.body.dataset.decisionTarget = String(target);
    if (cache.has(requested) && displayed !== requested) display(requested);
    else if (ready) positionSurfaces();
    fillCache();
    scheduleWarm();
    if (scrub!==target) schedule();
  }
  function schedule() {
    if (!raf && !disposed) raf = requestAnimationFrame(draw);
  }
  const resize = new ResizeObserver(measure);
  for (const surface of surfaces) {
    resize.observe(surface);
    if (surface.nextElementSibling) resize.observe(surface.nextElementSibling);
  }
  resize.observe(document.getElementById('main'));
  addEventListener('scroll', schedule, {passive:true, signal:abort.signal});
  addEventListener('resize', measure, {passive:true, signal:abort.signal});
  preference.addEventListener('change', measure, {signal:abort.signal});
  document.addEventListener('visibilitychange', scheduleWarm, {signal:abort.signal});
  addEventListener('online', () => { failed.clear(); warmFailed.clear(); source?.retryFailed(); fillCache(); scheduleWarm(); }, {signal:abort.signal});
  function dispose() {
    disposed = true;
    abort.abort();
    resize.disconnect();
    cancelAnimationFrame(raf);
    if (warmTask !== null) cancelIdle(warmTask);
    for (const image of [...cache.values(), ...pending.values()]) image.removeAttribute('src');
    cache.clear(); pending.clear();
    source?.clear(); surfaceFrames.clear(); displayedUrl = '';
    document.body.classList.remove('decision-scroll-ready');
    for (const key of ['decisionFrame', 'decisionTarget', 'decisionPreloaded', 'decisionProfile', 'decisionCached']) delete document.body.dataset[key];
    for (const surface of surfaces) for (const property of ['--decision-frame', '--decision-size', '--decision-position', '--decision-tear-position']) surface.style.removeProperty(property);
  }
  addEventListener('pagehide', event => { if (!event.persisted) dispose(); }, {signal:abort.signal});
  addEventListener('pageshow', measure, {signal:abort.signal});
  measure();
  return dispose;
}
