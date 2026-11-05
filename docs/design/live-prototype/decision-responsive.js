import { DECISION_FRAME_COUNT, DECISION_MOBILE_BUNDLE_FILES, decisionFrameFile, decisionMobileFrameFile } from './decision-frames.js';

export const DECISION_SMALL_MEDIA = '(max-width: 899px)';
export const DECISION_PHONE_MEDIA = '(max-width: 479px)';
export const DECISION_PORTRAIT_MEDIA = '(orientation: portrait)';
export const DECISION_PORTRAIT_BUNDLE_FILES = Object.freeze(Array.from({ length: Math.ceil(DECISION_FRAME_COUNT / 32) }, (_, i) => `assets/kip-d-scroll-portrait-bundles-v1/frames-${String(i).padStart(3, '0')}.json`));
export const DECISION_PORTRAIT_SMALL_BUNDLE_FILES = Object.freeze(Array.from({ length: Math.ceil(DECISION_FRAME_COUNT / 32) }, (_, i) => `assets/kip-d-scroll-portrait-small-bundles-v1/frames-${String(i).padStart(3, '0')}.json`));
export const DECISION_PORTRAIT_PHONE_BUNDLE_FILES = Object.freeze(Array.from({ length: Math.ceil(DECISION_FRAME_COUNT / 32) }, (_, i) => `assets/kip-d-scroll-portrait-phone-bundles-v1/frames-${String(i).padStart(3, '0')}.json`));
export const DECISION_VARIANTS = Object.freeze({
  'landscape-small': Object.freeze({ width: 576, height: 384, poster: decisionMobileFrameFile(0), bundles: DECISION_MOBILE_BUNDLE_FILES }),
  'landscape-large': Object.freeze({ width: 1152, height: 768, poster: 'assets/kip-d-opening-v5.webp', frameFile: decisionFrameFile }),
  'portrait-small': Object.freeze({ width: 432, height: 768, poster: 'assets/kip-d-scroll-portrait-small-v1/frame-000.webp', bundles: DECISION_PORTRAIT_SMALL_BUNDLE_FILES }),
  'portrait-phone': Object.freeze({ width: 360, height: 640, poster: 'assets/kip-d-scroll-portrait-phone-v1/frame-000.webp', bundles: DECISION_PORTRAIT_PHONE_BUNDLE_FILES }),
  'portrait-large': Object.freeze({ width: 864, height: 1536, poster: 'assets/kip-d-scroll-portrait-v1/frame-000.webp', bundles: DECISION_PORTRAIT_BUNDLE_FILES }),
});
export const DECISION_RESPONSIVE_FILES = Object.freeze([
  ...DECISION_PORTRAIT_BUNDLE_FILES, ...DECISION_PORTRAIT_SMALL_BUNDLE_FILES, ...DECISION_PORTRAIT_PHONE_BUNDLE_FILES,
  DECISION_VARIANTS['portrait-phone'].poster,
  DECISION_VARIANTS['portrait-small'].poster, DECISION_VARIANTS['portrait-large'].poster,
]);
export function decisionVariantAt(width, height) {
  if (height >= width && width < 480) return 'portrait-phone';
  return `${height >= width ? 'portrait' : 'landscape'}-${width < 900 ? 'small' : 'large'}`;
}
