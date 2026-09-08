# synaiq.com deployment — 2026-09-08

The user explicitly resumed production publication with 「上架網站，取代synaiq.com」. This supersedes the earlier Git/ADO-only restriction for this deployment. The deployed target is synaiq.com, not synaiq-ai.com.

## Deployed artifact

- Source: commit 752008b, branch codex/prd-wireframes-finish, docs/design/live-prototype.
- Hostinger site: synaiq.com, existing Business hosting.
- Runtime: public_html/synaiq-release-20260908/, 36 allowlisted public runtime files/assets.
- Local package and SHA-256 manifest: out/synaiq-deploy-20260908/.
- The release contains the accepted Home/KIP bilingual client-rendered design. The review shell, design notes, tests, local tools and private references were excluded.
- Packaging changes only: runtime asset paths prefixed with /synaiq-release-20260908/, page.html copied to index.html, public page titles changed from design prototype labels to SynaiQ/KIP titles.
- No Phase A pipeline, Astro merge, database change, DNS change or product-service deployment was performed.

## Routing and rollback

The original public_html/.htaccess was copied to backup-synaiq-20260908/.htaccess outside public_html. Its presence and 1.44 KiB size were verified in the Hostinger file manager before cutover. Existing WordPress files, home.html and wp-content images remain in place.

The following block was prepended to the original .htaccess; the editor clipboard exactly matched the intended block plus the original contents before saving:

```apache
# BEGIN SynaiQ release 20260908
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteRule ^(?:|home\.html)$ /synaiq-release-20260908/index.html [L]
</IfModule>
# END SynaiQ release 20260908
```

To roll back, restore backup-synaiq-20260908/.htaccess to public_html/.htaccess, or remove exactly the marked SynaiQ block. Existing WordPress routing then resumes. No WordPress data restore is needed for this cutover. This was a routing backup, not a new full-site/database backup.

The uploaded ZIP was moved to backup-synaiq-20260908/ after extraction. Keep the release directory while the routing block points to it.

## Verified live

- https://synaiq.com/ shows the new Traditional Chinese homepage.
- https://www.synaiq.com/ shows the new homepage.
- https://synaiq.com/home.html shows the new homepage.
- Header navigation opens Chinese KIP at /?page=kip&lang=zh-Hant.
- Language switching opens English KIP at /?page=kip&lang=en.
- English Home navigation preserves English at /?page=home&lang=en.
- Live inspected images had no broken completed images; sampled desktop and 390px English Home had no horizontal overflow.
- The 390px Contents button opened the mobile menu (aria-expanded=true); viewport was reset afterward.
- Homepage screenshot was visually inspected in-browser.
- Source prototype tests: 69 passed, 1 skipped because this Windows user cannot create file symlinks, 70 total.

The root npm test command targets legacy vinext and could not run because vinext is absent from the installed dependencies; it is not the deployed runtime. These checks are deployment smoke tests, not exhaustive device or SEO acceptance. Contact remains mailto:service@synaiq.com and product demonstrations are animations, consistent with the accepted design.