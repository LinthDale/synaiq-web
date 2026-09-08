# Public design preview — 2026-09-08

The user explicitly requested a temporary Cloudflared URL to share this design. This is not a production deployment, ADO change, domain switch or Astro rebuild merge.

## Open

- [Review shell: Home / KIP and continuous width slider](https://five-municipal-responsibility-buf.trycloudflare.com/live-prototype/)
- [Direct KIP page](https://five-municipal-responsibility-buf.trycloudflare.com/live-prototype/page.html?page=kip)
- [Direct Home page](https://five-municipal-responsibility-buf.trycloudflare.com/live-prototype/page.html?page=home)
- [English Home](https://five-municipal-responsibility-buf.trycloudflare.com/live-prototype/page.html?page=home&lang=en)
- [English KIP](https://five-municipal-responsibility-buf.trycloudflare.com/live-prototype/page.html?page=kip&lang=en)
- [English resizable preview](https://five-municipal-responsibility-buf.trycloudflare.com/live-prototype/?page=home&lang=en)

Anyone holding the URL can access the approved design. There is no authentication. `noindex` discourages indexing; it is not access control. No exact lifetime or availability is guaranteed. The local computer, static server and tunnel must remain running and online. Restarting the quick tunnel generally generates a new URL. See [Cloudflare Quick Tunnels](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/).

The public service reads current allowlisted files on each request; refresh to see saved changes. It does not expose Vite HMR or the repository filesystem.

## Scope and safeguards

- `share-preview.mjs` binds only `127.0.0.1:4318`; Cloudflared proxies that port.
- 37 explicit runtime/asset files are allowed, including the shared language runtime, English screen illustrations, connected-work and final contact-cat illustrations. GET and HEAD only; no upload, product backend, form submission or directory listing.
- Original CIS sheets 5/6, internal docs, PRDs, source/provenance notes, tests, KB redacted reference capture, raw portrait, `.git`, environment files and Vite special routes are not public.
- Paths are checked before normalization; symlinks/junctions are rejected. Errors do not disclose local paths.
- Headers include no-store/noindex/nosniff/same-origin framing, restricted CSP and disabled sensor permissions.
- Prototype uses original public marketing product imagery and the already approved generated illustration studies. No account credentials or private product data are served.

## Running processes

These are the specific processes created for this request; older Node/Cloudflared processes were left untouched.

- Cloudflared: PID `45960`, created 2026-09-08 around 15:09 Asia/Taipei, target `http://127.0.0.1:4318`, HTTP/2, no autoupdate.
- Static server: PID `53192`, replacing this task's verified PID `1724` to load the English runtime allowlist; command `node docs/design/live-prototype/share-preview.mjs`. Cloudflared PID `45960` was not restarted, preserving the existing URL. Re-verify process identity before any future stop/reload.
- Logs: repository `.tmp/design-share-20260908/` (not allowlisted).

To stop sharing, first verify the current PID still refers to this exact Cloudflared invocation/target (PIDs may be reused), then stop that tunnel process. The static server can also be stopped after verifying its command. Do not terminate all Node or Cloudflared processes. No scheduled shutdown was requested or created.

To create a fresh share later, verify port 4318 is available, start the allowlist server, then use the installed official Cloudflared binary with `tunnel --no-autoupdate --url http://127.0.0.1:4318 --protocol http2`. Never tunnel the Vite docs root on port 4317.

## Logo provenance

User's latest reference: CIS `JPG/5.jpg`, superseding the dark-field preference inferred from `JPG/6.jpg`.

- Header and product studies: `assets/synaiq-logo-ink.svg`. Exact existing native geometry from `public/brand/synaiq-logo-light.svg`, with only letter fill changed from white to black as shown in CIS 5; gold remains `#cca858`.
- Dark footer: the original transparent white/gold vector, without a separate background plaque.
- Product SVG studies embed the same native ink mark. No AI generation, tracing, photo filter or font approximation used for the Logo.
- Full CIS sheets remain local reference-only and return 404 through the public service.

## Verification

- All prototype tests after navigation, advantage-detail and contact-cat updates: 44 pass, 0 fail, 1 Windows file-symlink permission skip. Internal/external junction tests pass.
- 32 original KIP copy blocks and shared sections covered by persistent tests. Existing Home/CEO wording is preserved.
- KIP document overflow sampled at 320, 390, 480, 639, 640, 699, 700, 768, 899, 900, 999, 1000, 1024, 1280, 1440 and 1600 px: none.
- Local mobile hero, process tear, architecture stack, navigation Escape and demo pause visually/behaviorally checked. Short/tall/reduced-motion pin fallback has unit coverage; full OS/device acceptance remains pending.
- Public HTTPS Home/KIP, current transparent Logo, KIP CSS/JS return 200. Docs, CIS sheets, redacted KB reference and Vite filesystem URL checks return 404.
- Public Home and KIP rendered in the browser with correct transparent ink Logo and product image. Some enhanced inspection calls timed out after public iframe navigation; basic browser rendering and HTTPS checks succeeded. No claim of exhaustive device testing or an error-free browser console.
- Independent code reviews approved the scoped design changes and the allowlist server. User visual acceptance remains separate.

## Navigation, expanded advantages and contact cat

- Primary navigation contains Home / KIP only, with `aria-current` and an active underline. The redundant visible current-page label was removed at the user's request. Contextual directory links belong only to the current page. Mobile primary links remain visible; its directory can open at any scroll position and closes on selection, Escape or breakpoint change.
- Desktop primary header remains 74 px, mobile is 112 px in sampled sizes; anchor offset follows the measured header height. KIP architecture now stays in normal flow at every viewport; its old forced 1450 px section height and generic pin classes were removed following the user's empty-scroll report.
- The original eight title/summary/explanation triples remain intact. Each expansion adds two explanatory sentences plus a clearly labeled work-scenario example. The section is at most 1080 px wide with compact rows; bottom paper-edge clearance is preserved.
- Final black/white pen-and-ink cat faces left, loosely tangled in yarn, and sits above the email CTA on both pages. Consultation and CEO copy are unchanged. The edge mask identified during independent review was removed so ball and tail stay complete.
- Home overflow measurements at 320, 390, 640, 768, 899, 900, 1024, 1440 and 1600 px: no horizontal overflow. KIP expanded accordion visually checked at 390 / 1440 px; mobile explanations and scenario reflow to a single column. Mobile directory opened while scrolled deep in page and Escape closed it.
- Public Home / KIP / final cat asset return 200; cat-generation notes and server source return 404. Public contact section visually inspected with the final illustration. Review screenshots are in the thread visualization directory, not public-server files.

## Architecture empty-scroll correction

- The old desktop pin consumed scroll distance only to recolor four already-visible cards. Removed that extra scroll budget and scroll/resize machinery; all four cards retain their highlighted paper treatment, existing copy and incoming torn-paper clearance.
- Regression tests were red before the change and green afterward. KIP module statement/branch/function coverage is 100%; full prototype suite remains 44 pass, 0 fail, 1 Windows file-symlink permission skip.
- Browser samples: 1440 × 1100 and 1440 × 700 yield section height = panel height = 987.78 px; 390 × 844 yields 1187.73 px for both. All are static-position panels, with zero horizontal overflow. A 385 px desktop scroll moves section and panel together by 385 px, without a sticky pause. Browser viewport override reset afterward.
- Independent review found no actionable issues. Existing public URL serves the updated files; no service or tunnel restart was needed for this correction.

## English localization and shared branding

- Home, KIP, shared navigation/contact/advantages/footer, animated demo and resizable preview now use complete Traditional Chinese / English catalogs with matching semantic keys. Add languages through the explicit registry; query parameters never select arbitrary import paths.
- Both language selectors preserve page and URL fragment. Page switches retain language. This does not promise restoration of arbitrary unanchored scroll positions. Document language/direction, titles, alt/aria and demo playback states are translated.
- Current full prototype suite: **68 pass, 0 fail, 1 existing Windows file-symlink permission skip**. Independent review approved the runtime, new screens, generator, path restrictions and English responsive corrections.
- English Home / KIP layout checks at frame widths 320, 390, 768 and 1440 report no document horizontal overflow (content widths 305, 375, 753 and 1425 after the scrollbar). Visual review included mobile navigation, Home hero/demo/source panel, KIP hero/capabilities, desktop Home and CEO quote. Fixed hidden-break English word joining, citation filename wrapping, overly large narrow KIP headings and long nonwrapping English quote text. This is sampled browser QA, not exhaustive device acceptance.
- Shared `brand.js` drives header/footer/demo and screen generation. Four localized static SVG screens embed the same ink master. Generation uses fixed templates and escaped locale text; `--check` verifies freshness without writing. Physical logo paths stay inside assets and intermediate symlinks/junctions are rejected.
- [Language extension and logo replacement guide](localization-and-brand-guide.md) describes actual steps and exclusions. No upload administration UI was built. Private templates, tests, guide and generator are not publicly served.
- Availability incident during integration: the entry module referenced new i18n files before the running public server had loaded the extended allowlist. The user saw a failed page. Reloaded only the identity-verified design server, then reloaded the original public URL and verified full Home content. New runtime modules return 200; original tunnel and hostname were retained. Future changes must make dependencies available and verify them **before** switching the live entry point.
