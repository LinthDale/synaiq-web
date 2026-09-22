// Published case registry: fixed identifiers, dates, ordering, assets and media addresses.
// No translated prose (locale-cases.js owns every string) and no private evidence: material
// that is not cleared for publication stays out of this file instead of being hidden behind
// a flag. Pure data — no imports, no DOM, no location.

/** Identifiers are permanent: a case keeps its id when its name or its order changes. */
export const DEFAULT_CASE = 'tokyo-foodex-2026';
// An identifier reaches the address bar and the document head, so its shape is fixed here.
export const CASE_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;

const TOKYO_FOODEX_2026 = Object.freeze({
  id: 'tokyo-foodex-2026',
  published: true,
  featured: false,
  // Real precision only; a case known to the month never gains an invented day.
  date: Object.freeze({ start: '2026-03-10', end: '2026-03-10', precision: 'day' }),
  // Label text for each tag lives in locale-cases.js under the same key.
  tags: Object.freeze(['exhibition', 'multilingual', 'digitalHuman']),
  // The overview grid crops every cover to one ratio, so a portrait source names its focus.
  cover: Object.freeze({ image: 'assets/cases/tokyo-2-scaled.jpg', focus: '50% 32%' }),
  hero: Object.freeze({
    key: 'hero', photo: 'assets/cases/tokyo-2-scaled.jpg',
    sketch: 'assets/cases/tokyo-2-sketch.webp', aspect: '3 / 4', kind: 'scene', eager: true,
  }),
  field: Object.freeze({
    photos: Object.freeze([Object.freeze({
      key: 'team', photo: 'assets/cases/tokyo-5.jpg',
      sketch: 'assets/cases/tokyo-5-sketch.webp', aspect: '3 / 4', kind: 'scene',
    })]),
  }),
  // Index-matched to press.links in locale-cases.js; each case manages its own coverage.
  media: Object.freeze([
    'https://n.yam.com/Article/20260311616052',
    'https://www.ettoday.net/news/20260311/3130564.htm',
  ]),
});

export const CASES = Object.freeze([TOKYO_FOODEX_2026]);

/** Newest first, with a single featured case lifted to the top of the overview. */
export function publishedCases(cases = CASES) {
  return Object.freeze(cases.filter(entry => entry.published).slice().sort((a, b) =>
    Number(b.featured) - Number(a.featured) || b.date.start.localeCompare(a.date.start)));
}

export function caseIds(cases = CASES) {
  return Object.freeze(publishedCases(cases).map(entry => entry.id));
}

export function findCase(id, cases = CASES) {
  return publishedCases(cases).find(entry => entry.id === id) ?? null;
}

/** An unknown or unpublished identifier resolves to null; it is never used as a file path. */
export function resolveCaseId(value, cases = CASES) {
  const id = String(value ?? '');
  return CASE_ID_PATTERN.test(id) && findCase(id, cases) ? id : null;
}

/** A ratio reaches CSS, so it is parsed and rebuilt rather than passed through. */
export function parseAspect(aspect) {
  const parts = /^\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*$/.exec(String(aspect ?? ''));
  if (!parts || +parts[1] <= 0 || +parts[2] <= 0) return null;
  return Object.freeze({ width: +parts[1], height: +parts[2] });
}

/** Landscape covers lead above the copy; portrait covers sit beside it. */
export function aspectOrientation(aspect) {
  const ratio = parseAspect(aspect);
  return ratio && ratio.width / ratio.height >= 1 ? 'landscape' : 'portrait';
}
