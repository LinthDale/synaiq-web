// Generated from the task's ComfyUI output; the allowlist enumerates only this sequence.
export const DECISION_FRAME_COUNT = 243;
export const decisionFrameFile = index => `assets/kip-d-scroll-v5/frame-${String(index).padStart(3, '0')}.webp`;
export const DECISION_FRAME_FILES = Object.freeze(Array.from({length: DECISION_FRAME_COUNT}, (_, i) => decisionFrameFile(i)));
export const decisionMobileFrameFile = index => `assets/kip-d-scroll-mobile-v1/frame-${String(index).padStart(3, '0')}.webp`;
export const DECISION_MOBILE_FRAME_FILES = Object.freeze(Array.from({length: DECISION_FRAME_COUNT}, (_, i) => decisionMobileFrameFile(i)));
export const DECISION_MOBILE_BUNDLE_SIZE = 32;
export const DECISION_MOBILE_BUNDLE_FILES = Object.freeze(Array.from({ length: Math.ceil(DECISION_FRAME_COUNT / DECISION_MOBILE_BUNDLE_SIZE) }, (_, i) => `assets/kip-d-scroll-mobile-bundles-v1/frames-${String(i).padStart(3, '0')}.json`));
