# Hand-drawn homepage illustration record — 2026-09-08

Design-only prototype revision. Generated using the built-in image generation tool (not CLI). These are original AI illustration drafts, not commissioned final brand artwork.

## Current layout decisions

- The typewriter, scattered letters, hand and abstract brain are one full-bleed first-screen background behind the accepted hero copy. There is no standalone illustration panel below the headline.
- Wally 2, Wally 2 PLUS and Mini are adjacent in the existing KIP screen collage; PLUS has no separate feature section. All product photos retain original color.
- The software stage follows the knowledge narrative. Its entrance is scroll-triggered; no scroll hijacking.
- The product demonstration is a 16-second mouse/content animation using labeled example data. Only pause and replay are functional; no backend is connected.
- Fine torn-paper masks replace broad waves. The quotation uses an asymmetric hand-drawn paper layout, with source context expandable.

## Final illustration assets

| Asset | Local path | Generation output |
| --- | --- | --- |
| Abstract-brain hero | `assets/knowledge-threads-v2.png` | `C:/Users/User/.codex/generated_images/01a07f04-d06d-73a3-a3d4-4ef09d6e6690/exec-6be230b3-0fc9-4cc5-a069-4dcf3f435c37.png` |
| Hands sharing knowledge | `assets/shared-knowledge-hands-v1.png` | `C:/Users/User/.codex/generated_images/01a07f04-d06d-73a3-a3d4-4ef09d6e6690/exec-ee0688e9-0436-4c33-9b7a-7e42ec7454dc.png` |

Initial hero output `exec-981d3648-fe70-4509-8986-c2863af0d60a.png` was superseded by the simpler-brain edit. The PNGs were copied unchanged. CSS places the hero behind the text with low opacity and a readability veil; the SVG paper contour is authored separately.

Wally 2 PLUS: `public/brand/wally-2-plus.png`, byte-identical to the user's network-share PNG, SHA-256 `66DD513BE83FB18F077E49144D827FDDD4C4FC1CACEDBF400902AC20BF8EC4DF`.

## Hero generation prompt

```text
Use case: illustration-story.
Asset type: original hand-drawn editorial website hero illustration, wide landscape composition.
Primary request: a mechanical typewriter releases many scattered typewritten letters, fragments and loose scraps; almost-transparent hair-thin threads gather those fragments into one human hand and continue from the hand to a clearly recognizable floating brain. This is the visual metaphor of scattered organizational knowledge finding a connection.
Composition: small intricate vintage typewriter at lower left; a spacious cloud of scattered letters and small paper fragments through the middle; one graceful realistically proportioned hand gently pinching the filament bundle near the lower right; a delicate outlined brain above the hand at upper right. The complete typewriter, hand and brain must fit inside the picture with generous margins. No giant figure. The fragile connecting threads must visibly reach the fingers and then the brain, with a few loose trailing loops. Leave open areas between the objects so this feels like an editorial collage, not a diagram.
Style: sophisticated hand-drawn pen and dry graphite engraving, varied wobbly ink contours, sparse crosshatching, tactile handmade draftsmanship. Almost black ink with faint gray filaments, not thick ropes. Letters are decorative tiny typewriter glyphs, no readable statements or names.
Background: genuinely transparent alpha, no white paper rectangle, no drop shadow. Only the ink drawing and floating fragments.
Constraints: original artwork; no Ellipsus branding or copied characters, no website UI, no headline, no logos, no watermark, no stock icons, no 3D rendering, no photorealism, no neon, no cartoon brain face, no anatomical gore. This will be placed on charcoal with CSS inversion and on paper in the original ink tone. Produce one finished wide illustration.
```

## Simpler abstract brain edit prompt

The initial hero image above was the sole reference.

```text
Edit ONLY the floating brain in the upper-right of this illustration. Replace its realistic anatomical engraving with a very simple abstract hand-drawn brain symbol: one soft irregular outer silhouette and only 4 to 6 loose meandering inner strokes, lots of empty space, no dense folds, no crosshatching, no medical or anatomical detail. It should look like an artist's quick poetic pen sketch. Keep the brain at exactly the same location and approximately the same overall size. Preserve the fine threads connecting it down to the hand. Keep the typewriter, hand, flying letters, paper fragments, composition, colors and transparent background unchanged. Do not add anything else.
```

## Hands spot illustration prompt

```text
Use case: illustration-story.
Asset type: original hand-drawn editorial spot illustration for an ivory-paper website section and a large quotation.
Primary request: two human hands share and lift a loose sheet of paper, with several page fragments and stray typewriter letters rising between them. A very fine looping thread connects the hands, pages and letters, suggesting shared knowledge helping someone move forward.
Style: spare black pen line drawing, airy vintage editorial engraving with very light crosshatching, irregular confident contours, tiny handwritten gestures. Elegant, human, tactile, not corporate vector clipart. One hand reaches up from the lower left, another reaches in from upper right and gently offers the page. Natural hand anatomy, no extra fingers. Keep the page blank apart from a few abstract printed lines.
Composition: a single airy diagonal arrangement, square canvas, entire hands and page visible, broad empty margins, no frame. Black ink lines only with small pale ivory paper interiors.
Background: truly transparent alpha, no solid rectangle, no smoky glow, no gradient halo, no drop shadow.
Constraints: no people faces, no portrait of any public figure, no brain in this asset, no readable names or slogans, no logos, no watermark, no UI, no 3D, no photorealism. This is a poetic hand-drawn insert for a website, not a finished poster.
```
