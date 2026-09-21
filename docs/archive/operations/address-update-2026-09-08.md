# Company address update — 2026-09-08

> 歷史快照：本文的版本、待辦與路徑描述當時狀態。現行操作以 [專案入口](../../../README.md) 與 [部署指南](../../operations/deploy-hostinger.md) 為準。

Last updated: 2026-09-09 (Asia/Taipei).

Status: **address deployed and verified** on `synaiq.com` on 2026-09-09. The address files were uploaded at approximately 09:01; the subsequent cache-version patch passed origin and public verification. Address source commit `6e437d2` was already pushed to Azure `main`. The production base remains the approved static prototype release from `752008b`, not Astro `dist/`.

## Approved content

- Traditional Chinese: `407臺中市西屯區何安里臺灣大道二段910號10樓之2`
- English translation: `10F.-2, No. 910, Sec. 2, Taiwan Blvd., He’an Vil., Xitun Dist., Taichung City 407, Taiwan`
- Updated the shared Home/KIP locale catalog and no-JavaScript footer, plus all four Astro Home/Contact content files. The Astro English files remain Chinese-content drafts, consistent with their existing status.
- Historical wireframes and the original content migration fixture remain unchanged. Migration tests allow only the two approved Home/Contact `contact.cards` address substitutions.

## Source verification

- Initial address patch: `npm run test:all` passed 107 tests, with one existing Windows symlink-permission skip.
- After the cache-version source change: `npm run test:all` passed 111 tests (32 Astro, 79 design), with the same existing skip.
- `npm run check`: 61 files checked; zero errors, warnings or hints.
- Address/migration code review: approved; 15 focused tests independently passed.
- `git diff --check`: passed.

## Deployed address-only production patch

Canonical repository: `C:/Users/User/synaiq/synaiq-web`.

Local output directory: `out/synaiq-address-20260908/` (ignored, not committed).

- Publish: `synaiq-address-publish-20260908.zip`, 9,122 bytes.
- Rollback: `synaiq-address-rollback-20260908.zip`, 9,066 bytes.
- Each ZIP contains only `synaiq-release-20260908/index.html`, `page.html`, and `locale-common.js`.
- ZIP SHA-256, publish: `2BEBA2D3AADA236B309A901739945B49E6557B927B3C3CF37CD0867DEFB18507`.
- ZIP SHA-256, rollback: `6DF814BB6C16E957DBA1DD7D4C03F82A424A2C95BEE827C52EBE129557EF88D8`.

The patch was derived from the original production release, not copied blindly from prototype source. Exact text comparison verified that only the addresses changed, preserving production titles and `/synaiq-release-20260908/` asset paths. The original release package remains untouched.

| File | Expected old SHA-256 | Updated SHA-256 |
| --- | --- | --- |
| index.html / page.html | `0CAD91CF273D9663C2D98D78DC9352FEAA509FB66991B3F7A81EA2DE3F290354` | `A77D287194BAA41BED553075718181A0943DDEE76AD405AE7A5DDA64CE50125E` |
| locale-common.js | `A3D7D57285C0C54DBE44E686F39F19CAB84E39EC5A9676AEB4EF031CDCB4B110` | `ACDA0895DF09D9E06041FE12EC971D40D0F379F70D6810E1F6C74CD9E619761C` |

All three publicly served files matched the expected old hashes before replacement. After replacement, all three returned HTTP 200 and matched the updated SHA-256 hashes above.

## Publication and live verification — 2026-09-09

- Target: Hostinger account `u235694681`, domain **synaiq.com**, existing `public_html/synaiq-release-20260908/` directory.
- Uploaded only the three files above through the Hostinger API's file-upload flow. TUS upload creation returned HTTP 201; data PATCH returned HTTP 204, with final offsets of 13,455 bytes for the catalog and 3,528 bytes for each HTML file.
- Origin API file contents, after normalizing its trailing line feed, and reported file sizes matched the approved patch. The public file hashes matched the exact approved bytes without normalization.
- Public `/`, `www` root, `/home.html`, and Home/KIP URLs in both `zh-Hant` and `en` returned HTTP 200. The shared catalog contains both approved addresses and no former address. HTTP and JavaScript VM checks were performed; no browser visual inspection is claimed because browser control was unavailable.
- The token source is the ignored repository-root `.env.hostinger.local`, retained locally at the user's request. Its value was not logged, committed, or included in uploads. Do not include this file in any release package.
- No `.htaccess`, WordPress, DNS, database, layout, or Astro deployment changes were made. This was scoped file upload, **not** the whole-archive Deploy endpoint.

The [original deployment record](deployment-synaiq-com-2026-09-08.md) remains unchanged as historical evidence.

## Follow-up cache-version patch — deployed and verified

The uploaded patch versions the JavaScript load chain with `?v=20260909-address`: HTML loads `prototype.js`, which loads `i18n.js`, which loads `locale-common.js`. It changes resource references only, not the layout or approved address text.

Local directory: `out/synaiq-address-20260909-cache/`, with separate `publish/` and `rollback/` copies of four files. The rollback copies represent the **new address before cache versioning**; they are not the former-address baseline.

| File | Pre-cache SHA-256 / rollback | Uploaded cache-version SHA-256 |
| --- | --- | --- |
| index.html / page.html | `A77D287194BAA41BED553075718181A0943DDEE76AD405AE7A5DDA64CE50125E` | `37771B0A5528A830A8F82D9177AEAE817401FEB5E5F3A93A5CF6CEF670AD9743` |
| prototype.js | `4D963253F79D5AFF3C216B3078BFA2F955BBDAE222B784056D4D6A9955513B40` | `7FDD1D731D688FF954F1D9DDB260CD4EFBA66DC26F3DC5805B1AB00FDA947978` |
| i18n.js | `F988637062856C2EF159074305C24DC212DA214AB40D634470B6452A19513A6B` | `5A88E7CB2528F4157DE5217CF2F1BF5530D50DE3C42A1FCAA0568C22CC243F9E` |

All four uploads returned TUS POST 201 and PATCH 204. Final offsets were 2,407 bytes for `i18n.js`, 5,052 for `prototype.js`, and 3,547 for each HTML file. Origin API text and file sizes matched the approved cache patch.

An independent public check passed all seven requests: root, `www` root, `/home.html`, direct `page.html`, and the three versioned JavaScript URLs. Every response returned HTTP 200 with its expected byte count and exact SHA-256. The four HTML responses were 3,547 bytes and matched the cache-version HTML hash above. The served HTML → `prototype.js` → `i18n.js` → `locale-common.js` chain resolved with `?v=20260909-address` at each step. The final 13,455-byte catalog matched the address-patch hash, contained the new Traditional Chinese and English addresses, and contained neither `文心` nor `Wenxin`.

## Rollback boundaries

- Keep all rollback copies and ZIPs outside `public_html`; do not upload the repository, local credentials, or private design materials.
- To undo only cache versioning, restore its four `rollback/` files; the new address remains.
- To restore the former address after cache versioning, first undo cache versioning, then restore the original three-file address rollback package. The original release and address rollback packages remain unchanged.
- Public JavaScript can remain in browser caches for seven days. Future catalog changes and rollbacks must use a fresh, consistent version across all three load-chain references (and both HTML entry files). Restoring old file bytes alone does not clear browser caches; verify the resulting versioned URLs after any rollback.
- Neither patch requires a routing rollback. Check for intervening changes before restoring files; stop and reconcile differences rather than overwriting unrelated edits.
