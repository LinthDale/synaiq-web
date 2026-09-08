# Live design prototype

Last updated: 2026-09-08.

The user-approved visual direction and current Chinese/English copy live here on `codex/prd-wireframes-finish`. This is a client-rendered design prototype, not the separate Phase A Astro implementation. The user's latest instruction limits this release to a Git commit/push to Azure and ADO board updates; Hostinger publication at `synaiq-ai.com` is deferred, not deployed. See the [release status and deferred cutover prerequisites](../../operations/release-status-2026-09-08.md).

## Preview

Current public design review: [Cloudflared temporary preview](https://five-municipal-responsibility-buf.trycloudflare.com/live-prototype/). Home and KIP are both included. Refresh the public page to see saved revisions; it is served by a separate read-only allowlist server, not Vite. Public exposure and process/stop notes: [public-preview-notes.md](public-preview-notes.md).

Current design: KIP shares Home's paper/ink/olive palette, cotton-fibre transitions, hand-drawn diagrams and brand-matched animated demo. The four architecture cards use normal document flow without the rejected pinned-scroll gap. The CIS 5 black/gold transparent logo appears in light sections; the dark footer keeps the white/gold variant.

The KIP capability section's rejected simple SVG is now a dedicated detailed ink illustration of hands, paper, ledger and archive connected by olive thread. See [kip-illustration-notes.md](kip-illustration-notes.md) for the built-in imagegen prompt and selected asset.

From the repository root:

```powershell
node node_modules/vite/bin/vite.js docs/design --config docs/design/live-prototype/vite.config.mjs
```

Open http://127.0.0.1:4317/live-prototype/ on the same computer. The server binds to loopback only. CSS and source changes update through Vite. This config explicitly avoids the legacy root PostCSS configuration.

The page selector switches Home / KIP. The 320–1600 px slider changes the iframe's actual layout viewport; an independent preview scale fits it into the available panel. A Windows scrollbar consumes 15 px of content width in the tested environment. The diagnostic line reports content and scroll widths. “獨立開啟” opens the page without the review shell.

## Design scope

- Paper/ink, serif display, whitespace and alternating dark/light sections follow `../style-language-v1.md`.
- Newsreader + Noto Serif TC is the selected display pairing. Google Fonts requires network access; fallback fonts are defined.
- Fluid type, spacing and containers; responsive architecture layout with all four cards visible; mobile navigation; expandable advantages with explanations and scenarios.
- Home plays a labeled pointer/content animation with pause and replay controls. No product backend is connected.
- Traditional Chinese and English are implemented through four runtime catalogs: `locale-common.js`, `locale-home.js`, `locale-kip.js` and `locale-demo.js`. Shared rendering, locale registration and localized screen generation support adding languages. Follow the [language and shared-logo guide](localization-and-brand-guide.md).
- Direct page URLs use `page.html?page=home&lang=zh-Hant` or `page.html?page=kip&lang=en`; these are client-rendered query routes, not production Astro routes.
- A contact form, authorized customer cases, deployment metrics and commissioned final artwork are not implemented. Contact links open email instead of submitting a form. The prototype has no logo-upload administration interface.

### Current CEO quote

The current text is sourced verbatim from `locale-home.js`; earlier quotation notes below are historical, not the approved copy.

> AI 的價值，是讓被落下的人迎頭趕上。
>
> 我們用 AI，讓企業的知識找得到、用得上；再結合管理的智慧，突破既有框架，把答案變成行動。

邱浩煒 Wilson — CEO of Synaiq

## Verification — 2026-09-08

- Latest complete prototype suite: **69 passed, 1 Windows file-symlink permission skip, 70 total**. Run `node --test docs/design/live-prototype/*.test.mjs` from the repository root. This is prototype verification, not production deployment acceptance.
- Preview HTTP 200 after isolating PostCSS; JS syntax check passed.
- Earlier sampled browser checks measured no horizontal document overflow on both pages at viewport widths 320, 390, 639, 640, 768, 899, 900, 1280, 1440 and 1600 px. Latest quote checks covered Chinese desktop at 1440 px and Chinese/English at 390 px without horizontal overflow.
- Desktop Home/KIP first screens and narrow Home/KIP layouts were visually inspected; KIP mobile menu expansion was verified.
- These checks do not constitute full-page visual acceptance, exhaustive interaction testing, or verification of every intermediate width / reduced-motion environment.

The existing wireframe/token/document draft changes elsewhere are independent of this live prototype.

## Historical iteration notes — Ellipsus + original color assets

The following sections record earlier design and verification steps. Current scope, copy and test totals are stated above; individual iteration totals are not current release totals.

Reference: https://ellipsus.com/#introduction. The corrected homepage follows its centered opening, large product-image stage, layered paper narrative, dark screenshot showcase and image-led product section. This is a composition translation for SynaiQ, not a reproduction of Ellipsus branding or artwork.

Paper/ink describes interface surfaces, not a restriction on product photography. Product images retain full original color. Do not use the grayscale `wireframes-v2/img` derivatives in this homepage.

Image-led sections include the KIP overview and adjacent Wally devices, hand-drawn narrative, animated product-interface study, full Wally series and original-color character key visual. AI hand-drawn illustration drafts are now present; commissioned final artwork remains pending. The KIP visuals are the user-selected brand-matched interface studies with example data, not actual product screenshots. Preserve their paper/ink palette; do not replace them with the dark raw backend interface. Wally imagery retains original color.

Verified source locations (read-only):

- `\\192.168.0.97\行銷部\Morrison\官網\index.html` — original marketing page, references full-color online assets.
- `\\192.168.0.97\行銷部\03.鑫揚相關\11.Wally Serise\2604_素材` — actual folder spelling; it is not nested `2604\_素材`.
- `Wally 瓦力合照1.png` matches `public/brand/wally/wally-series.png` byte-for-byte: SHA-256 `27D8045903EF4813A365961A139168F01908CD8BDB263E577B0A3789D7F81432`.
- Existing local color assets: `/brand/wally/wally-2.png`, `/brand/wally/wally-series.png`, `/brand/wally-mini.png`.
- Character image: `https://synaiq.com/wp-content/uploads/2026/03/toutou-2.png`, as referenced in the supplied marketing source. This preview loads that public original directly; it requires network access.
- Public source page: https://synaiq.com/home.html#success. Case authorization and factual/quantitative claims remain separate pending decisions; this revision does not introduce those claims.

At this earlier iteration, Home was updated before KIP. KIP has since been aligned as described in the current design summary above.

Historical correction verification: Home had no horizontal document overflow at the 12 sampled widths from 320–1600 px. Product image computed filters were `none`. The then-current gallery buttons and six assertions passed. That gallery has since been replaced by the animation described below. The review shell remains width-constrained. Full visual acceptance and reduced-motion device testing remain pending.

## Historical content and product-reference update — 2026-09-08

- Added the supplied enterprise-knowledge narrative and dated survey band. Sources and earlier editorial decisions are recorded in `content-sources.md`; use `locale-home.js` and the current CEO quote above for the latest quotation and attribution.
- Use existing supplied copy and assets; do not invent customer stories, deployment metrics or product commitments.
- A real empty product entrance was inspected read-only. No questions were submitted, conversations created, documents opened or settings changed.
- `assets/kb-entry-redacted.png` is a **reference-only sanitized capture**, not displayed on the homepage. Opaque local masks remove enterprise branding, user information and internal timing. The raw temporary capture was removed. No credentials are stored in this project.
- The user clarified that the preferred product visuals are the original `kip-search-demo.svg` / `kip-library-demo.svg` studies. Both were restored, with accurate “品牌化示意” / example-data labeling.
- Local capture masking is specific to the inspected empty entrance at 1280×720. It is not a general-purpose privacy filter. A different screen requires fresh inspection and new mask geometry.
- Content/masking tests: `node --test docs/design/live-prototype/home-content.test.mjs docs/design/live-prototype/sanitize-capture.test.mjs`.
- Post-copy-update width checks passed at the same 12 widths listed above. These are sampled checks, not proof of every intermediate width or full device acceptance.

## Historical hand-drawn / motion correction

The closing quotation received a dedicated minimal CEO speaking sketch, retained in the current design. Its signature is now 邱浩煒 Wilson / CEO of Synaiq, with no draft label; use the current quote above. See [ceo-sketch-notes.md](ceo-sketch-notes.md) for historical prompts, asset provenance and validation.

Latest material revision: the repeated tiny SVG edge is superseded by a photographic cotton-paper texture with exposed fibres, irregular tear depth and a color-matched paper face. See [paper-material-notes.md](paper-material-notes.md) for the user reference, original AI prompt, asset provenance and 16-test/12-width validation. Clearance is reserved above each incoming tear so existing captions and the hero scroll cue stay visible. The older SVG is retained as iteration history, not the active homepage boundary.

- The complete first-screen background carries the typewriter, scattered glyphs, fine threads, hand and simplified abstract brain. The illustration is behind the hero copy, not an image panel below it.
- The existing screen collage contains Wally 2 / Wally 2 PLUS / Mini side by side, in original color, with full bases. No separate PLUS feature block.
- The knowledge narrative precedes the animated product reveal. Section edges use a fine torn-letter-paper contour; the quotation uses a hand-drawn editorial layout.
- Product motion cycles through question, simulated click, answer, source and knowledge center. Pause/replay are the only actual operations. Reduced-motion preference shows a static source state; offscreen/hidden-page motion pauses.
- Fixed the intermediate-width illustration overflow, preserved illustration aspect ratios, and removed the empty sidebar grid track on narrow screens.
- Latest sampled Home overflow check: 320, 390, 480, 639, 640, 768, 899, 900, 1024, 1280, 1440 and 1600 px passed. Narrow animation measured 335 × 609 px at a 390 px iframe viewport. This does not constitute exhaustive RWD or device acceptance.
- Eleven content/animation/masking tests and both JS syntax checks passed. Desktop/mobile visual checks and playback checks are local prototype checks, not production acceptance. Reduced-motion OS/device testing remains pending.
- The browser console exposed one unlocated `MutationObserver.observe` error. No prototype source uses `MutationObserver`; its origin is not established, so this run does not claim an error-free browser console. The demonstrated playback and responsive checks completed.
- Original prompts, output paths and Wally PLUS provenance: [illustration-notes.md](illustration-notes.md).

```powershell
node --test docs/design/live-prototype/home-content.test.mjs docs/design/live-prototype/demo-animation.test.mjs docs/design/live-prototype/sanitize-capture.test.mjs
```
