# Connected-work illustration — 2026-09-08

The user rejected the KIP capability section's simple single-sheet SVG. Only that decorative artwork is replaced. Existing section heading, API/MCP capability copy and the other four capabilities are unchanged.

- Method: built-in imagegen, using the existing homepage hands illustration as a style-only reference. No CLI/API fallback.
- Final generated PNG: `C:/Users/User/.codex/generated_images/01a07f04-d06d-73a3-a3d4-4ef09d6e6690/exec-f2ead697-1af3-49d5-abe1-63a6e1408ffe.png`.
- Project asset: `assets/kip-connected-work-v1.webp`, 1000 × 667 px, 113,250 bytes.
- Preparation: resize/encode only, WebP quality 92. Fully opaque white background, no fake transparency. CSS multiply blends it into the existing paper color.
- Composition: hands guiding an olive thread through loose sheets, an open ledger and an archive folder. Fine ink hatching preserves the established analog editorial style. No actual system screenshot or customer data.
- Display: full aspect ratio, desktop max 420 px and narrow max 340 px. No cropping of hands/documents. Decorative image is hidden from assistive technology; the adjacent capability list carries the meaning.

## Prompt

```text
Use case: illustration-story. Create a new bespoke editorial pen-and-ink illustration for a paper-themed enterprise knowledge website's section "connect everyday work". The attached image is STYLE REFERENCE ONLY: match its confident, finely crosshatched engraved ink, believable human hands, beautiful paper edges and warm analog sensibility. Do not repeat that reference's exact composition or its floating letters.
Scene: a cropped human hand enters from the lower left, carefully drawing a thin olive-green thread through a small collection of paper documents. On the right a second hand gently guides the same thread into an open archive folder; between them sit an open ledger with subtly ruled pages and two overlapping small document sheets. This is a poetic illustration of connecting work, documents and systems. The continuous thread ties the different paper objects together with one elegant loose loop, not a technical flowchart. Hands are anatomically sound, sleeves shown, fingers natural. Objects are distinguishable even at 400px display width.
Art direction: sophisticated vintage editorial steel-pen sketch, fine charcoal contours with selective delicate crosshatching and stippling for depth at paper folds, cuffs, hands and folder interior; strong enough ink to read at small size; not a simplistic one-line icon, not a cartoon, not a vector flowchart. Detailed yet breathable, a small purposeful still-life vignette. Restrained palette: warm charcoal and muted olive line accents, tiny cream accents only, no saturated colors, no large dark fills.
Composition: landscape 3:2, arranged in a graceful left-to-right arc, generous clean breathing space on all edges, all fingers and paper corners inside canvas, no surrounding frame. Background and empty gaps must be uniform PURE WHITE #FFFFFF, fully opaque, no checkerboard, no fake transparency, no overall paper texture or vignette. It will blend into a warm website paper background using multiply. No labels, no words, no letters, no logos, no API/MCP text. No laptop, robot, brain, lightbulb, gears, circuit board or business icon grid. This is an original illustrative image, not a photo.
```
