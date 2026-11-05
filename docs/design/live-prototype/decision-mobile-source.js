import { DECISION_FRAME_COUNT, DECISION_MOBILE_BUNDLE_SIZE, DECISION_MOBILE_BUNDLE_FILES } from './decision-frames.js';

// Keep compressed strings separate from decoded Image objects. At most eight
// immutable bundles are held; loading another frame never decodes the bundle.
export function createDecisionMobileSource({ signal, fetcher = fetch, files = DECISION_MOBILE_BUNDLE_FILES, initial } = {}) {
  const bundles = new Map(), failed = new Set();
  const matches = initial?.url === new URL(files[0], import.meta.url).href;
  let firstText = matches ? initial.text : null;
  const cancelFirst = initial?.cancel;
  if (!matches) cancelFirst?.();
  else if (signal?.aborted) cancelFirst?.();
  else if (cancelFirst) signal?.addEventListener('abort', cancelFirst, { once: true });
  function load(index) {
    if (!Number.isInteger(index) || index < 0 || index >= DECISION_FRAME_COUNT) throw new RangeError('Invalid mobile frame');
    const id = Math.floor(index / DECISION_MOBILE_BUNDLE_SIZE);
    if (!bundles.has(id)) {
      const early = id === 0 ? firstText : null;
      if (id === 0) firstText = null;
      const textPromise = early || fetcher(new URL(files[id], import.meta.url), { signal, cache: 'force-cache', priority: 'low' }).then(async response => {
        if (!response.ok) throw new Error('Mobile frame bundle unavailable');
        return response.text();
      });
      const promise = Promise.resolve(textPromise).then(text => {
        if (typeof text !== 'string' || text.length > 3_000_000) throw new Error('Mobile frame bundle too large');
        const bundle = JSON.parse(text), start = id * DECISION_MOBILE_BUNDLE_SIZE;
        if (bundle.schema !== 1 || bundle.start !== start || !Array.isArray(bundle.frames)
          || bundle.frames.length !== Math.min(DECISION_MOBILE_BUNDLE_SIZE, DECISION_FRAME_COUNT - start)
          || !bundle.frames.every(value => typeof value === 'string' && value.length < 100_000 && /^data:image\/webp;base64,[A-Za-z0-9+/]+={0,2}$/.test(value))) {
          throw new Error('Invalid mobile frame bundle');
        }
        return bundle.frames;
      }).catch(error => { failed.add(id); throw error; });
      bundles.set(id, promise);
    }
    return bundles.get(id);
  }
  return {
    async frame(index) { return (await load(index))[index % DECISION_MOBILE_BUNDLE_SIZE]; },
    async prepare(index) { await load(index); },
    retryFailed() { for (const id of failed) bundles.delete(id); failed.clear(); },
    clear() { bundles.clear(); failed.clear(); firstText = null; if (matches) { signal?.removeEventListener('abort', cancelFirst); cancelFirst?.(); } },
  };
}
