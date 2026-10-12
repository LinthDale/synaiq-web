# GitHub → Hostinger 自動部署

設定日期：2026-10-12（Asia/Taipei）。

目前狀態：**已啟用並完成首次正式部署與清理**。[Run 38197100197](https://github.com/LinthDale/synaiq-web/actions/runs/38197100197) 的 test／deploy 均成功。來源 `56ae861516927e7ae77234b0880be31730bc1ef6`，正式目錄 `synaiq-release-ci-38197100197-1`。2026-10-12 11:03（Asia/Taipei）獨立重驗三個保留版本逐檔雜湊、四個舊版已刪除及正式 HTTPS 通過。`HOSTINGER_DEPLOY_ENABLED=true`；改成 `false` 可暫停後續部署。

加密備份位於草稿 Release `hostinger-backup-38197100197-1`，包含 `backup.tar.gz.enc` 與 `evidence.tar.gz.enc`；Actions 產物日誌確認僅上傳這兩個檔案。詳細路由 hash、保留／清理清單見 [部署紀錄](deploy-hostinger.md)。

## 平常如何更新

在 `docs/design/live-prototype/` 修改官網，push 到 **GitHub** `main`，或將 PR merge 到 `main`。正式網址為 <https://taistro.com.tw/>。

- GitHub repository：<https://github.com/LinthDale/synaiq-web>，本機 remote 名稱是 **github**。
- `origin` 是 Azure DevOps；`git push origin main` 不會觸發 GitHub Actions。
- Workflow：`.github/workflows/hostinger.yml`；[執行紀錄](https://github.com/LinthDale/synaiq-web/actions/workflows/hostinger.yml)。
- PR 執行測試及封裝預覽，沒有部署密鑰。正式部署只允許此 repository 的 `main`。
- 官網來源、品牌素材、部署工具、workflow 或 package 檔案變更會觸發自動部署。`docs/design/live-prototype/` 以外的文件、EMS 獨立服務及 Astro 原始碼變更不會上架官網；該目錄內的 `README.md`、`STYLE-GUIDE.md` 等說明也在觸發範圍內，推送後同樣會跑一次部署。
- 不需要為快取更動 `?v=` 版本參數：每次部署的新目錄已讓所有資源網址改變；`address-cache.test.mjs` 釘住現值。
- Actions 頁面的 **Run workflow** 可手動發布 `main`。若 main 已有較新的部署輸入，舊 commit 的重跑會在寫入主機前跳過；只有純文件等無關變更時，仍可完成原本待部署的網站更新。
- 正常更新不必手動上傳檔案；不要把本機預覽 `index.html` 當成正式入口。

## 發布及保留流程

1. 設計測試、部署防護測試、Astro／repository 測試全部成功。
2. 按公開 allowlist 從 Git commit 封裝 88 個檔案（數量隨 allowlist 調整），正式 `index.html` 由 `page.html` 產生。CSS、JS、圖片指向唯一的新版本目錄。
3. 本機瀏覽器測試：六頁 × 中英 × 手機／桌面，另加 EMS／PVsim 的 320／835px，以及每個公開案例的中英內頁 × 手機／桌面（案例清單取自 `page-metadata.js` 的 `crawlTargets()`，與 sitemap 相同；兩個案例時共 36 組）；包含圖片、語言切換、案例頁 canonical 及 PVsim 3D。
4. 核對主機路由、目前版本逐檔 hash；首次導入另比對 `bootstrap-hashes.json` 中六個已知正式版本。任何主機外部修改都會停止，不能自行更新 hash 掩蓋差異。
5. 上傳到 `public_html/synaiq-release-ci-<run_id>-<attempt>/`，authenticated raw 下載逐檔核對 SHA-256。
6. 用候選檔＋原 hash 保護 rename 開放新版本直接網址，逐檔核對公開資源，再執行 staged 同一組瀏覽器檢查；成功後才切換 root、robots 與 sitemap。Hostinger 原始檔必須精確符合 SHA-256；CDN 圖片另核對可解碼、尺寸、比例及畫素差異。依使用者 2026-10-12 要求，64 × 64 採樣的平均誤差低於 3 正常，3 至未滿 12 僅記警示並繼續，達 12 才因明顯差異停止；這是實務檢查值，不代表內容相同的數學保證。已目視確認的特殊照片仍可用 `cdn-approved-images.json` 精確來源／回應 hash 配對通過。
7. 清除兩網域快取，正式網址檢查及同一組瀏覽器驗證成功後，更新主機私有維護說明及 `.hostinger-ci-state.json`。
8. 按**實際成功啟用順序**保留現行版＋最近兩版。先重驗保留檔案及跨版本相依，完整下載待刪版本並建立逐檔清單。
9. 備份 tar.gz 以 AES-256-GCM 加密，解包核對每個檔案，存至 GitHub **草稿 Release**，重新下載、比對 SHA-256 並驗證解密後才允許刪除。
10. 再次核對路由、保留版本、待刪版本及備份；僅刪除清單內的 `synaiq-release-*` 目錄。清理完成後重新核對公開站，將最終證據加密存入同一份草稿 Release。

WordPress、`.private`、其他網域、未納管的失敗／未知目錄都不會自動刪除。它們列在 audit 的 `unmanaged`；納管前須另確認內容、相依與備份。初次成功發布後，六個已知舊版本中會保留 pvsim-3d、solutions 與新 CI 版本，其餘四版經備份後清理。

GitHub production concurrency 不取消正在執行的部署，避免中途打斷上傳或清理。新的待執行任務可能取代更舊的待執行任務。不要在 CI 運作時手動改主機；hash 保護會停止發現的外部變更，但不是主機全域交易鎖。

## 一次性設定與密鑰

GitHub environment 名稱為 `production`，只允許 `main`，不設人工審核等待。Repository variable `HOSTINGER_DEPLOY_ENABLED=true` 才會啟用正式部署；改成 `false` 可暫停後續發布，已在執行中的工作不會因此取消。

Environment secrets：

| 名稱 | 用途 |
|---|---|
| `HOSTINGER_API_TOKEN` | Hostinger 檔案 API 與快取 API。token 不寫入 Git、公開 artifact 或日誌。 |
| `HOSTINGER_BACKUP_KEY` | 32 個隨機 bytes 的 64 字元 hex，用於 AES-256-GCM 備份。離線復原時也需要同一把 key。 |

Hostinger 的 account／domain 仍為 `u235694681`／`synaiq.com`，公開網址為 `taistro.com.tw`；檔案 session 僅接受 `https://srv1865-files.hstgr.io` 與已知 URL 格式。若 Hostinger 遷移主機，必須重新核對設定，不放寬驗證。

加密 key 的本機恢復副本位於 `.env.hostinger-ci-backup.local`，被 `.gitignore` 排除。由維護者將此檔另存至安全的密鑰保管處；GitHub Secrets 無法讀回原值。不要無故更換 key；若輪替，舊 key 仍須保留以恢復舊備份。

API token 更新後，可執行唯讀 audit（PowerShell）：

```powershell
node --use-system-ca --env-file=.env.hostinger.local scripts/hostinger/cli.mjs audit audit-YYYYMMDD
```

新的 audit 使用新的 id，證據寫在 `out/hostinger-ci/<id>/`。token 必須有效、可存取此站，再透過 GitHub CLI 的 stdin 設為 environment secret；不可把密鑰放在命令參數、PR 或聊天。啟用 variable 後手動執行一次 workflow，以 Actions 的 deploy job 與公開網址驗證成功為正式完成。

## 紀錄與備份

- Actions job summary 記錄來源 SHA、正式目錄、保留／清理版本和 backup tag；CI 不自行 commit 維護紀錄，避免循環觸發。
- 私有主機維護入口是 `00-SYNAIQ-START-HERE.txt`；`.hostinger-ci-state.json` 保存成功發布順序及檔案 hash。兩者公開請求必須回 410。
- 每次成功流程的草稿 Release `hostinger-backup-<run_id>-<attempt>` 保存 `backup.tar.gz.enc` 與 `evidence.tar.gz.enc`。保留為草稿，不發布；不自動刪除備份。
- Actions artifacts 僅以明確檔名上傳三種加密封存（backup／evidence／failure-evidence），保留 90 天，是方便存取的副本，不能取代草稿 Release 的持久備份。禁止使用 `*.enc` 通配符；解密驗證目錄以 `.restored` 結尾，避免目錄被遞迴收集。公開 repository 的 artifacts 可供有讀取權限的已登入使用者下載，因此不得上傳未加密主機備份。
- 加密備份內包括封裝 artifact、路由前後檔、維護入口前文、state、逐檔清理備份、manifest、驗證及 archive inventory；不包含 token、session 或 backup key。

## 失敗與復原

### 2026-10-12 導入期間的已處理問題

- 修正新版 npm 乾淨安裝所需的兩筆 lockfile 依賴，固定 Node／npm 版本；內嵌 SVG logo 統一 LF，讓 Windows 與 Linux 的生成圖一致。
- Run `38196226321` 在公開圖片驗證停止，未切換正式首頁。已核對 `rollback.json`，原路由 SHA-256 恢復為 `baf517aea5155e9820bb53c46751cc7397a49b5ab259ca3eb939f69cdfd1917b`。失敗目錄保留供調查，不列入成功版本清理。
- 該 run 的 Actions 產物曾因 `*.enc` 同時匹配解密驗證目錄而包含明文資料（網站封裝、hash 清單及主機維護說明等）。雲端 artifact `11723712588` 已刪除，API 確認該 run 剩餘產物數為 0；本機保留完整證據。檢查其中 99 個檔案，未包含 Hostinger token 或備份 key。無法從現有紀錄確認刪除前是否有其他人下載。
- 已改為明確列出加密檔名、將解密目錄改用 `.restored` 後綴，並新增回歸測試；Run `38196905733` 在測試階段取消，尚未寫入主機。

### 復原原則

測試、上傳或 staged 檢查失敗不切換正式版本。已切換但尚未完成正式驗證時，僅在即時路由仍為本次已知 hash 的前提下自動恢復舊路由、清快取並核對首頁。已確認成功的發布若後續備份／清理失敗，保留新站並將 workflow 標示失敗；不要為清理故障回退正常網站。

任何不確定的上傳、rename 或刪除結果都不會盲目重試。先檢查 `failure.json`、路由及 `cleanup-operations.jsonl`。若某個舊版本刪除後工作中斷，state 可能仍列著它；後续自動流程會停止，應先從已驗證備份復原原名目錄，或核對 delete-intent／delete-verified 與實際檔案後修正 state。不可繞過 snapshot 檢查。失敗上傳留在原目錄供調查，下次 run 使用新名稱。

下載並解密備份：

```powershell
gh release download hostinger-backup-RUN-ATTEMPT --repo LinthDale/synaiq-web --pattern '*.enc' --dir out/restore-RUN
node --env-file=.env.hostinger-ci-backup.local scripts/hostinger/cli.mjs decrypt out/restore-RUN/backup.tar.gz.enc
# 先查看 tar 目錄，再解包到全新的空目錄；按 archive-inventory.json 逐檔驗證。
tar -tzf out/restore-RUN/backup.tar.gz.enc.tar.gz
```

通常回退以 GitHub `main` revert 問題 commit，讓同一條完整驗證流程發布修正版本。若須緊急恢復舊目錄，先暫停部署、下載此次加密證據，確保舊目錄完整，再以即時路由 hash 保護恢復 `routing-before.htaccess`，同步 state 與維護入口、清快取並驗證。已歸檔的版本須先依原名還原並核對 hash；不要直接執行過去 `out/` 的版本綁定腳本。

## 驗證命令與官方參考

```powershell
npm run test:deploy
npm run test:design
npm test
node scripts/hostinger/cli.mjs package local-check-UNIQUE
$env:HOSTINGER_BROWSER_CHANNEL='chrome'
node scripts/hostinger/cli.mjs local local-check-UNIQUE
```

GitHub runner 固定 Node 24.21.0（npm 11.19.0），使用安裝的 Chromium；Windows 可使用現有 Chrome。更新依賴時須用相同 npm 版本更新 lockfile，並以乾淨安裝確認完整性。TLS 使用預設驗證，不設定 ignoreHTTPSErrors 或停用 certificate validation。

- [GitHub deployment concurrency 與 environment](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments)
- [GitHub artifact 存取與期限](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/download-workflow-artifacts)
- [Hostinger cache API](https://github.com/hostinger/api-php-sdk/blob/main/docs/Api/HostingCacheApi.md)
