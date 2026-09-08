# CEO speaking sketch — 2026-09-08

Last updated: 2026-09-08.

Local design prototype only. Built-in imagegen used (no API-key CLI, no external generation plugin).

## Selected result

- Identity reference: user-supplied `\\192.168.0.97\行銷部\05.常用素材\經營團隊人員照片\wilson.png`; source unchanged.
- Final generation: `C:/Users/User/.codex/generated_images/01a07f04-d06d-73a3-a3d4-4ef09d6e6690/exec-df87fefb-f977-45aa-88ab-65b37f874941.png`.
- Served asset: `assets/ceo-speaking-sketch-v1.webp`, 960 × 1440 px, 142,946 bytes.
- Web preparation: Sharp resize to 960 px width and WebP quality 94. No local semantic image edits.
- The selected raster has an opaque white background, not alpha transparency. CSS multiply blends the white field into the existing paper surface. It is an interpretive speaking pose, not a photograph of a real event.
- The first result was too densely shaded. The second was simpler but contained an opaque checkerboard. Both were rejected; only the cleaned third result is displayed.

## Copy boundary

Current approved attribution: **邱浩煒 Wilson / CEO of Synaiq**. Current copy from `locale-home.js`, verbatim:

> AI 的價值，是讓被落下的人迎頭趕上。
>
> 我們用 AI，讓企業的知識找得到、用得上；再結合管理的智慧，突破既有框架，把答案變成行動。

The earlier sketch-only request did not authorize a quote rewrite; that unsolicited rewrite and draft label were removed. The user later explicitly requested and approved the refinement above and corrected the name. The illustration and its provenance remain unchanged. Do not restore the older text or alter this copy during layout/image edits. See [content-sources.md](content-sources.md) for the current-versus-historical editorial record.

## Historical sketch verification

These results belong to the sketch iteration; see [README.md](README.md#verification--2026-09-08) for the latest full prototype suite.

- 16 content, animation, paper and masking tests passed.
- Home has no horizontal document overflow at sampled iframe widths 320, 390, 480, 639, 640, 768, 899, 900, 1024, 1280, 1440 and 1600 px.
- Desktop parallel composition and mobile stacked portrait inspected in the live prototype. This is local design QA, not visual acceptance or production deployment.

## Generation prompts

### 1. Identity and speaking composition

```text
Use case: identity-preserve / style-transfer.
Asset type: a minimalist editorial CEO speaking sketch for the left side of an ivory-paper website quotation section.
Input image 1 is the sole identity reference, not a layout to reproduce. Preserve this exact adult man's recognizable facial proportions, eyes, eyebrows, short swept-up hairstyle and general age.
Create an original waist-up speaking pose of this same man, facing slightly toward the right, with a handheld microphone near his chest in one hand and a modest, natural open-palmed conversational gesture with the other. Wearing the same open-collar shirt and tailored blazer, no tie. Warm composed expression, slightly speaking, not a large grin.
Style: EXTREMELY SPARE hand-drawn pen sketch, elegant imperfect contour drawing with many interrupted/open lines. Minimal ink. Draw the face with a few carefully chosen features, hair with only a handful of directional strokes, jacket with a few outline and lapel lines. Most of the figure interior should remain empty. No filled black hair, no shaded jacket, no dense crosshatching, no photographic tracing texture, no engravings, no pencil-smudge shading, no cartoon caricature. A sophisticated rapid editorial figure sketch.
Composition: portrait canvas, head and both gesturing hands fully visible with breathing room. Waist-up only, lines gently trail off near the lower torso. Figure should occupy about 80% of the canvas height. Transparent background with genuinely transparent alpha; warm dark graphite/charcoal lines only. No white rectangle, no paper texture, no vignette.
Do not include any text, logo, signature, quote marks, lectern, conference stage, audience, decorative letters, scattered paper, brain or extra objects. This is an interpretive illustration, not evidence of a real speech. Keep recognizable likeness without introducing a different person.
```

### 2. Reduce linework

```text
Edit this speaking portrait into a MUCH more minimal line drawing. Keep the same person's likeness, pose, microphone, both hands and clothing contours. Remove virtually ALL crosshatching, stippling, shading, grain and photographic texture. Reduce linework density by about eighty percent. The face should be drawn using a clean open outline, simple eyebrows and eyes, two or three nose strokes and simple mouth strokes, with NO cheek/neck shadow. The hair must be an airy outline plus approximately 8 to 12 directional hair strokes, not a dark filled mass. Jacket and sleeves should be just a few light interrupted outline and lapel lines with unfilled interiors. Use slender warm charcoal pen lines. This is a refined, very spare editorial sketch, not an engraving or a realistic pencil portrait. Keep the hand anatomy clear with minimal contours. Use genuine transparent alpha everywhere except the ink strokes, including face and shirt interiors. Remove any checkerboard or white fills from the actual pixels; do not draw a checkerboard. No background, new objects, letters or text. Preserve framing and identity.
```

### 3. Remove baked checkerboard (selected result)

```text
Change ONLY the background of this minimalist line portrait. The grey-and-white checkerboard pattern is accidentally baked into the image. REMOVE every checkerboard square and replace it with completely uniform solid pure white (#FFFFFF), including all spaces inside the hair, face, clothing and hands. Output an ordinary fully opaque white-background image, NOT transparency and NOT a transparency grid. Keep all dark pen strokes, the same person's face, pose, microphone and hands exactly as they are. No new shading, no texture, no paper grain, no grey areas, no vignette. The entire empty canvas and all empty interiors must be featureless pure white. Preserve every useful dark contour and keep the minimalist drawing.
```
