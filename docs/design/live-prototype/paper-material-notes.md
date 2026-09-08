# Torn-paper material revision — 2026-09-08

## User reference and scope

Reference viewed in the browser: [Pngtree torn-paper collection](https://zh.pngtree.com/so/%E6%92%95%E7%B4%99). It is a quality reference for exposed cellulose, irregular long tears and localized shadow, not a source asset. No Pngtree image was downloaded, reused or watermark-removed.

The frontend-design review led to a material-first separator replacing the fine repeated SVG edge. Homepage typography, product arrangement and palette stay unchanged. Additional bottom clearance prevents the deeper incoming paper from covering existing content. This is only a local design prototype revision, not a production or deployment change.

## Asset provenance

- Mode: built-in image generation, not CLI.
- Original: `C:/Users/User/.codex/generated_images/01a07f04-d06d-73a3-a3d4-4ef09d6e6690/exec-5a0a2022-65cb-475d-95ee-8535dce9a11d.png` (2172 × 724, true alpha).
- Project asset: `C:/Users/User/synaiq/synaiq-web-astro/docs/design/live-prototype/assets/torn-paper-cotton-v2.webp`.
- Web preparation: crop x=0, y=220, width=2172, height=280; WebP quality=94, alphaQuality=100. Original remains unchanged. No recoloring or semantic image edits.
- Asset size: 116,268 bytes.
- `paper-material.css` uses one nonrepeating raster layer for the exposed fibres and the same alpha translated down slightly for the section-colored face. Phone layouts crop a 980px-wide strip rather than squeeze every fibre into 320px.
- There is no dedicated extra animation or new runtime dependency.

## Validation

- Sixteen tests passed across material, content, animation and sanitization suites.
- Sampled Home viewport widths: 320, 390, 480, 639, 640, 768, 899, 900, 1024, 1280, 1440, 1600. No document horizontal overflow.
- Conservative clearance before the entire incoming pseudo-element rectangle: hero cue ≥19.98px, stage note ≥32px, panorama caption ≥33.98px (53px on phone). The actual opaque tear begins farther down.
- Desktop and phone edge appearance inspected in the live browser. Independent code review's overlap finding was corrected and closed.
- These checks do not imply user visual acceptance or exhaustive cross-browser/device coverage. KIP was not restyled.

## Final generation prompt

```text
Use case: photorealistic-natural.
Asset type: an original photorealistic torn-paper edge texture for a high-end editorial website section separator, transparent PNG.
Primary request: one continuous horizontal hand-torn edge of thick warm off-white cotton writing paper. The actual paper fills the entire LOWER HALF of the canvas and continues beyond the left, right and bottom image boundaries. The UPPER HALF is genuinely transparent alpha. This is a single top torn edge of a large sheet, NOT a narrow strip with two torn edges, NOT a freestanding rectangular card.
Composition: extra wide landscape. The torn edge travels roughly across the middle, with asymmetrical shallow slopes, a few deeper angular tears, and uneven plateau-like sections, never a smooth sine wave. Large changes in height only about 8 percent of image height. Several-scale irregularities: broad changes over long horizontal distances, smaller jagged contours, and tiny natural fuzzy paper fibres at the margin.
Materials: realistic layered white cellulose fibres exposed along the torn cross-section, uneven 3 to 12 pixel-wide bright paper core, subtle grey occlusion between peeling fibre layers, occasional tiny splinters. Matte finely grained warm ivory face, close to #f2f0e8. Blank unprinted paper. Body is clean and evenly lit with only faint natural paper grain. No stains, no wrinkles away from the edge.
Lighting: soft neutral top-left grazing light, delicately readable thickness and a tiny localized shadow at the torn lip, not a thick dark outline.
Background: true transparent alpha above the edge; no grey or checkerboard baked into image. Paper continues solidly to the bottom edge.
Avoid: repeated sawteeth, vector illustration, smooth waves, zigzag scissors, metallic/crumpled foil, heavy 3D bevel, ripped fabric, curled scrolls, rolled corners, isolated fragments, text, logos, watermark, website interface. Only this single paper sheet edge.
```
