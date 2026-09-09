# Website release status

Last updated: 2026-09-08. This records the pre-push checkpoint; it is not evidence of a completed deployment.

> **Historical checkpoint — superseded later on 2026-09-08.** Commit `752008b` was subsequently pushed, and a separately authorized task deployed the accepted static Home/KIP runtime to **synaiq.com**, not synaiq-ai.com. Use the [actual deployment record](deployment-synaiq-com-2026-09-08.md) for publication facts and the [repository consolidation record](repository-consolidation-2026-09-08.md) for the current local source layout. The unmerged-branch, pending-push, deferred-deployment and old FTP-pipeline statements below describe this earlier checkpoint only; they are not current instructions. Current pipeline scope is manual build/test/artifact only.

## Requested release

The user initially requested Azure DevOps publication, ADO board updates and Hostinger deployment at `synaiq-ai.com`, then narrowed the instruction to **「你推ado 還有 commit and push 就好」**. The current task is only the Git commit/push and ADO updates. Hostinger deployment is deferred by that latest instruction; no cutover is authorized in this turn.

- Source branch: `codex/prd-wireframes-finish` in the `synaiq-web` Azure repository.
- Accepted prototype: [`docs/design/live-prototype`](../design/live-prototype/README.md), including Home, KIP, Traditional Chinese / English, shared logo configuration and branded demo animation.
- Latest prototype tests: **69 passed, 1 Windows file-symlink permission skip, 70 total**. Run `node --test docs/design/live-prototype/*.test.mjs` from the repository root. These ran with the current local `node_modules`, not a clean `npm ci` installation or Azure CI run.
- ADO prototype PBI [#1321](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1321) is Done under Feature #1298 for the accepted prototype work. Deployment item [#1307](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1307) is deferred, not deployed; prototype completion does not mean production is live.
- Azure push remains pending at this checkpoint. Record the pushed commit ID and subsequent work-item changes after verification.
- Hostinger production deployment is **deferred by the user's latest instruction**. No production files were replaced.

## Source and artifact boundaries

- Current approved visual direction is `live-prototype`. **2026-09-09 cleanup note:** obsolete wireframes, content-gap lists and candidate style/token documents were removed; their versions remain in Git history at `428c053`. PRD-003/005 now point to the approved baseline. Older A/B, pin/wipe and English-pending conditions no longer apply; see the [design maintenance index](../design/README.md).
- Preserve the unmerged Phase A work on `feat/astro-rebuild`; it is separate from the accepted prototype. The pipeline on that branch builds the earlier unstyled Astro artifact and uses `clean: true` for deployment. **Do not execute it against the production target as-is.**
- Exclude `.astro/` and these local reference assets from the pending Git commit and public release: `docs/design/live-prototype/assets/kb-entry-redacted.png`, `docs/design/live-prototype/assets/synaiq-logo-cis-5.jpg`, and `docs/design/live-prototype/assets/synaiq-logo-cis-6.jpg`.
- Publish only approved runtime files and assets, not the repository, design documents, tests, capture references or local tools. The review server's allowlist is documented in the [preview maintenance guide](../design/live-prototype/README.md#安全預覽與分享); a production artifact still needs an explicit manifest and verification.
- Current page selection and language are client-rendered query routes (`page.html?page=home&lang=zh-Hant`, `page.html?page=kip&lang=en`). The preview shell is not a production landing page. Product interactions are demonstration animation only; contact is `mailto`, not the planned PHP form.
- Language extension and centralized logo replacement are documented in the [language and logo guide](../design/live-prototype/localization-and-brand-guide.md). There is no upload CMS; changing these prototype assets does not integrate them automatically into the separate Astro implementation.

## Deferred cutover prerequisites

These are recorded for a future, explicitly resumed deployment task. Do not continue deployment preparation or execute a cutover under the current Git/ADO-only scope.

1. Resolve whether `synaiq-ai.com/kb` and other existing product services must be preserved. The user previously used `/kb`; its replacement scope remains pending clarification.
2. Verify hPanel access, the exact Hostinger site and document root, and how domain routing reaches existing services. Do not infer the target from the earlier temporary-domain plan.
3. Create and verify a restorable backup of the exact in-scope files and relevant routing configuration before overwriting anything; record the rollback procedure.
4. Resolve deployment credentials and environment configuration. The ADO variable-group listing returned no groups during this release check; `synaiq-web-hostinger` is not confirmed available. Do not place credentials in source or logs.
5. Prepare and validate an artifact containing the accepted visual design, test both languages and asset paths, and verify retained services before and after cutover. Only then mark the deployment complete on ADO.
