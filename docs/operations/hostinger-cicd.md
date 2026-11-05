# GitHub → Hostinger 自動部署

設定日期：2026-10-12（Asia/Taipei）。

目前狀態：**已啟用，直式背景 RWD 與首次捲動修正已上線**。[Run 41951556292](https://github.com/LinthDale/synaiq-web/actions/runs/41951556292) 來源 `3bcbd0a19269fb7f162e292b6603bd27d401e912`，現行 `synaiq-release-ci-41951556292-1`。直橫向選構圖、直向依 480／900px 分級，橫向短邊小於 480px 也用輕量素材；首包提前下載、按包預取並限制附近幀解碼；local／staged／live 各 52 組及正式站 24 組 RWD 檢查通過。`HOSTINGER_DEPLOY_ENABLED=true`；改為 `false` 可暫停後續部署。詳見 [部署紀錄](deploy-hostinger.md)。

本次備份在草稿 Release `hostinger-backup-41951556292-1`，包含 `backup.tar.gz.enc` 與 `evidence.tar.gz.enc`；歷次清理與發布的加密備份仍保留。

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
2. 按公開 allowlist 從 Git commit 封裝檔案（2026-11-02 為 338 檔，含 243 張背景動畫幀；數量隨 allowlist 調整），正式 `index.html` 由 `page.html` 產生。CSS、JS、圖片指向唯一的新版本目錄。精確檔名白名單可拆成多條路由，每條小於 8,000 bytes，仍只開放已封裝檔案；後續發布會保留現行版的全部白名單路由。
3. 本機瀏覽器測試：六頁 × 繁中／英文／德文 × 手機／桌面，另加 EMS／PVsim 的 320／835px，以及每個公開案例的三語內頁 × 手機／桌面（案例清單取自 `page-metadata.js` 的 `crawlTargets()`，與 sitemap 相同；兩個案例時共 52 組）；包含圖片、語言切換、案例頁 canonical 及 PVsim 3D。 三語手機首頁使用正常動態模式、觸控與 DPR 3，反覆上下捲動至頁尾，確認輕量背景存在且沒有桌面解析度幀請求；桌面首頁也使用正常動態模式並檢查反覆解碼，其餘內頁保留減少動態模式。本機驗收只跑一次；報告綁定來源 commit、release 與完整 manifest 摘要，deploy job 重建封裝、核對相同才沿用。
4. 核對主機路由、目前版本逐檔 hash；首次導入另比對 `bootstrap-hashes.json` 中六個已知正式版本。任何主機外部修改都會停止，不能自行更新 hash 掩蓋差異。
5. 入口文件上傳到 `public_html/synaiq-release-ci-<run_id>-<attempt>/`；圖片、動畫、模型、JS、CSS、SVG 等靜態資源以封裝後內容的 SHA-256 儲存在 `public_html/synaiq-assets-v1/<sha256>.<副檔名>`。已存在的資源先透過 authenticated raw 核對大小與 SHA-256，完全相同才重用；缺少時才上傳及下載驗證，絕不覆寫既有 hash 檔案。獨立檔案最多四個並行，失敗會等已開始的操作結束再回退。
6. 用候選檔＋原 hash 保護 rename 開放新版本直接網址，逐檔核對公開資源，再執行 staged 同一組瀏覽器檢查；成功後才切換 root、robots 與 sitemap。Hostinger 原始檔必須精確符合 SHA-256；CDN 圖片另核對可解碼、尺寸、比例及畫素差異。依使用者 2026-10-12 要求，64 × 64 採樣的平均誤差低於 3 正常，3 至未滿 12 僅記警示並繼續，達 12 才因明顯差異停止；這是實務檢查值，不代表內容相同的數學保證。已目視確認的特殊照片仍可用 `cdn-approved-images.json` 精確來源／回應 hash 配對通過。
7. 清除兩網域快取，正式網址檢查及同一組瀏覽器驗證成功後，更新主機私有維護說明及 `.hostinger-ci-state.json`。
8. 按**實際成功啟用順序**保留現行版＋最近兩版。先重驗保留檔案及跨版本相依，完整下載待刪版本並建立逐檔清單。
9. 備份 tar.gz 以 AES-256-GCM 加密，解包核對每個檔案，存至 GitHub **草稿 Release**，重新下載、比對 SHA-256 並驗證解密後才允許刪除。
10. 再次核對路由、保留版本、待刪版本及備份；刪除清單內的 `synaiq-release-*` 目錄。共用素材也依三個保留版本的引用清單回收：只有無引用、路由未開放、已備份並核對 hash 的物件才可刪除；有未納管候選目錄時暫停素材回收。清理完成後重新核對公開站，將最終證據加密存入同一份草稿 Release。

共用儲存保留每版原有網址，例如 `/<release>/prototype.js`，由精確 RewriteRule 在主機內部對應到 hash 檔案，不做瀏覽器轉址。相對 ES module imports、`import.meta.url`、動畫幀與 CSS 相對路徑仍以原網址解析；公開白名單只開放現行／候選版所需的確切檔案，私有 `.hostinger-assets.json` 不開放。生成語系的 `no-cache, must-revalidate` 規則涵蓋改寫後的 hash JS 檔名。

每版的私有素材清單及 state 的 `releases[].assets` 記錄原路徑、共用路徑、大小與 hash。封裝 artifact 仍包含所有檔案，備份保留完整還原能力；節省的是 Hostinger 重複上傳與儲存，GitHub 的加密備份仍會上傳。第一次導入需建立共用素材庫；後續發布由 `transfer.json` 與 Actions summary 分別記錄實際上傳／重用數量與 bytes，不把核對下載量算成零傳輸。

WordPress、`.private`、其他網域、未納管的失敗／未知目錄都不會自動刪除。它們列在 audit 的 `unmanaged`；納管前須另確認內容、相依與備份。初次成功發布後，六個已知舊版本中會保留 pvsim-3d、solutions 與新 CI 版本，其餘四版經備份後清理。

2026-11-04 使用者另授權清除盤點的三個未納管目錄。專用 workflow `hostinger-maintenance.yml` 僅接受 main 的手動觸發，與部署共用 `hostinger-production` concurrency；`scripts/maintenance/hostinger-unmanaged.mjs` 固定已審閱的 active、路由／state hash、三個目錄名稱、檔案數與大小。先完整下載、加密存至草稿 Release、重下載並驗證可還原，再重驗所有保留版本及待刪內容，最後刪除並核對公開站。路由、state 與維護入口保持原值；不是清空 `public_html` 的工具。重跑若現況已變會停止，不能直接更換基準來掩蓋差異。

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
- 主機備份與失敗證據的 Actions artifacts 僅以明確檔名上傳三種加密封存（backup／evidence／failure-evidence），保留 90 天，是方便存取的副本，不能取代草稿 Release 的持久備份。禁止使用 `*.enc` 通配符；解密驗證目錄以 `.restored` 結尾，避免目錄被遞迴收集。公開 repository 的 artifacts 可供有讀取權限的已登入使用者下載，因此不得上傳未加密主機備份。
- test job 另存公開的 `browser-local.json` 驗收報告，保留 7 天，僅含公開頁面測試及封裝摘要，不含主機資料或密鑰。deploy job 僅下載同一 run／attempt 的這份報告，使用 `actions: read`，並在操作主機前核對完整 manifest 摘要。
- 加密備份內包括封裝 artifact、路由前後檔、維護入口前文、state、逐檔清理備份、manifest、驗證及 archive inventory；不包含 token、session 或 backup key。

## 失敗與復原

### 2026-11-02 大量動畫幀的精確路由修復

Run `41405851048` 在上傳前因公開檔案白名單超過單條 RewriteRule 的 8,000-byte 限制停止，未修改正式站。來源 `800791b` 將長白名單分成多條有起訖錨點的精確檔名規則，保留原有單行長度檢查；沒有改成整個目錄公開。新增回歸檢查涵蓋 243 張動畫幀、未列入的檔案及下一次發布保留舊版多條規則，39 項部署測試通過。

### 2026-10-28 已審閱的 LiteSpeed 路由基準修復

Run `40654021896` 在上傳前發現 `.htaccess` 與 state 不符。解密前次成功備份並逐行比對，確認僅 LSCACHE 區塊新增 REST AUTH／POSTPASS 不快取條件及擴充設定檔保護規則；官網路由未變。使用者已授權保留這些規則並修復發布。

`scripts/hostinger/reviewed-routing-repair.mjs` 固定此次現行版本、原始 state 檔 SHA-256、原路由 SHA-256 與已審閱主機路由 SHA-256。正式 deploy 的 audit 只有四項全部一致才接受此差異；額外逐檔核對所有保留版本，再重驗路由與 state 沒有並行變更。一般唯讀 `audit` 仍拒絕路由差異，不會自動接受其他 LiteSpeed 更新。

核對過程只在記憶體調整基準，保存 `routing-repair.json`、原始 `routing-before.htaccess` 與 `state-original.json`，不先寫入主機 state。正常部署沿用現有主機規則；新站驗證成功後才寫入新的部署紀錄。失敗時依既有雜湊保護回復本次開始時的路由及 state。上述證據隨發布或失敗資料加密保存。成功部署後版本與 state 已改變，這筆修復紀錄無法套用到後續版本；未來差異須重新比對，不可擴大成略過整個 LSCACHE 區塊的檢查。

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

使用共用儲存的版本還原時，依 manifest 的 `files[].sharedPath` 將 artifact 中相對路徑的檔案放回該 hash 位址，其餘檔案放回原 release 目錄，並還原私有素材清單。若回退到仍在主機的三個保留版本，須同時驗證它的實體檔案與 `releases[].assets`，不能只確認入口目錄存在。備份中的 `backup/synaiq-assets-v1/` 保存被回收的素材；完整 artifact、前後 state／路由與 inventory 用於核對重建結果。任何 hash 不符皆停止，不覆寫同名素材或沿用目前版本的素材清單。

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
