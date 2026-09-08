# Company address update — 2026-09-08

Status: source updated and tested; **production upload pending**. Public HTTP checks still return the former address. Do not treat the Git commit or the prepared ZIP as evidence of a completed deployment.

## Approved content

- Traditional Chinese: `407臺中市西屯區何安里臺灣大道二段910號10樓之2`
- English translation: `10F.-2, No. 910, Sec. 2, Taiwan Blvd., He’an Vil., Xitun Dist., Taichung City 407, Taiwan`
- Updated the shared Home/KIP locale catalog and no-JavaScript footer, plus all four Astro Home/Contact content files. The Astro English files remain Chinese-content drafts, consistent with their existing status.
- Historical wireframes and the original content migration fixture remain unchanged. Migration tests allow only the two approved Home/Contact `contact.cards` address substitutions.

## Verification

- `npm run test:all`: 107 passed, one existing Windows symlink-permission skip.
- `npm run check`: zero errors, warnings or hints.
- Address/migration code review: approved; 15 focused tests independently passed.
- `git diff --check`: passed.

## Prepared address-only production patch

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

All three publicly served files returned HTTP 200 and matched the expected old hashes before preparing this patch. Recheck before upload; stop and reconcile if they have changed meanwhile.

## Resume publication

Both browser-control transports currently report `Transport closed`. No configured Hostinger FTP environment variables or `synaiq-web-hostinger` ADO variable group were available. No external files were modified in this address-update session.

1. Restore browser-control access to the authenticated Hostinger session, or configure an explicitly authorized upload connection. Do not retrieve credentials from browser storage.
2. Confirm the target is **synaiq.com**, `public_html/synaiq-release-20260908/`. See [original deployment record](deployment-synaiq-com-2026-09-08.md).
3. Verify the three current files against the old hashes and retain the rollback copies outside `public_html`.
4. Replace only these three files using the publish package. The ZIP already includes the release directory; avoid nesting it inside another directory of the same name. Keep ZIPs outside the public web root.
5. Do not change `.htaccess`, WordPress, DNS, the database, or deploy Astro `dist/` as part of this address patch.
6. Verify public file hashes against the updated hashes, and inspect Home/KIP in both `zh-Hant` and `en`. Confirm the new address, absence of the former address, and no layout or asset regressions.
7. Only after those checks, update this status to deployed. If necessary, restore the same three files from the rollback package; no routing rollback is needed for this patch.
