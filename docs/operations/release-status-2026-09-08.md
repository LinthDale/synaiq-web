# Website release status

Last updated: 2026-09-08. This records the pre-push checkpoint; it is not evidence of a completed deployment.

## Requested release

The user initially requested Azure DevOps publication, ADO board updates and Hostinger deployment at `synaiq-ai.com`, then narrowed the instruction to **「你推ado 還有 commit and push 就好」**. The current task is only the Git commit/push and ADO updates. Hostinger deployment is deferred by that latest instruction; no cutover is authorized in this turn.

- Source branch: `codex/prd-wireframes-finish` in the `synaiq-web` Azure repository.
- Accepted prototype: [`docs/design/live-prototype`](../design/live-prototype/README.md), including Home, KIP, Traditional Chinese / English, shared logo configuration and branded demo animation.
- Latest prototype tests: **69 passed, 1 Windows file-symlink permission skip, 70 total**. Run `node --test docs/design/live-prototype/*.test.mjs` from the repository root. These ran with the current local `node_modules`, not a clean `npm ci` installation or Azure CI run.
- ADO prototype PBI [#1321](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1321) is Done under Feature #1298 for the accepted prototype work. Deployment item [#1307](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1307) is deferred, not deployed; prototype completion does not mean production is live.
- Azure push remains pending at this checkpoint. Record the pushed commit ID and subsequent work-item changes after verification.
- Hostinger production deployment is **deferred by the user's latest instruction**. No production files were replaced.

## Source and artifact boundaries

- Current approved visual direction is `live-prototype`. Earlier `wireframes-v2`, `content-gap-list`, `PRD-003` and `tokens-v1` documents record the A/B design stage; their older A/B decisions, pin/wipe behavior or English-pending conditions must not override the current runtime. They remain historical records, not the current release baseline.
- Preserve the unmerged Phase A work on `feat/astro-rebuild`; it is separate from the accepted prototype. The pipeline on that branch builds the earlier unstyled Astro artifact and uses `clean: true` for deployment. **Do not execute it against the production target as-is.**
- Exclude `.astro/` and these local reference assets from the pending Git commit and public release: `docs/design/live-prototype/assets/kb-entry-redacted.png`, `docs/design/live-prototype/assets/synaiq-logo-cis-5.jpg`, and `docs/design/live-prototype/assets/synaiq-logo-cis-6.jpg`.
- Publish only approved runtime files and assets, not the repository, design documents, tests, capture references or local tools. The review server's allowlist is documented in [`public-preview-notes.md`](../design/live-prototype/public-preview-notes.md); a production artifact still needs an explicit manifest and verification.
- Current page selection and language are client-rendered query routes (`page.html?page=home&lang=zh-Hant`, `page.html?page=kip&lang=en`). The preview shell is not a production landing page. Product interactions are demonstration animation only; contact is `mailto`, not the planned PHP form.
- Language extension and centralized logo replacement are documented in the [language and logo guide](../design/live-prototype/localization-and-brand-guide.md). There is no upload CMS; changing these prototype assets does not integrate them automatically into the separate Astro implementation.

## Deferred cutover prerequisites

These are recorded for a future, explicitly resumed deployment task. Do not continue deployment preparation or execute a cutover under the current Git/ADO-only scope.

1. Resolve whether `synaiq-ai.com/kb` and other existing product services must be preserved. The user previously used `/kb`; its replacement scope remains pending clarification.
2. Verify hPanel access, the exact Hostinger site and document root, and how domain routing reaches existing services. Do not infer the target from the earlier temporary-domain plan.
3. Create and verify a restorable backup of the exact in-scope files and relevant routing configuration before overwriting anything; record the rollback procedure.
4. Resolve deployment credentials and environment configuration. The ADO variable-group listing returned no groups during this release check; `synaiq-web-hostinger` is not confirmed available. Do not place credentials in source or logs.
5. Prepare and validate an artifact containing the accepted visual design, test both languages and asset paths, and verify retained services before and after cutover. Only then mark the deployment complete on ADO.
