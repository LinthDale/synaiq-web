# 官網更新與部署 README

給工程師及新的 AI session。最後核對：2026-09-29。

## 先看這張表

| 工作 | 唯一入口 |
|---|---|
| 修改正式網站 | `docs/design/live-prototype/`，品牌素材在 `public/brand/` |
| 公開檔案白名單 | `docs/design/live-prototype/share-preview.mjs` 的 `PUBLIC_FILES` |
| 上傳位置 | `public_html/<本次新 release>/`，每次完整發布使用新目錄 |
| 驗收網址 | https://taistro.com.tw/，四頁的 `?page=home/kip/cases/about&lang=zh-Hant/en` 組合；舊網域 HTTPS 應 301 轉到新網址 |
| 目前版本及回退紀錄 | [部署紀錄](deploy-hostinger.md)；主機 `.htaccess` 才是即時依據 |
| 本機發布工具與證據 | `out/synaiq-release-20260929-tainan-photos/`；供讀取參考，不可原地重跑新發布 |
| 本機憑證 | `.env.hostinger.local` 的 `HOSTINGER_API_TOKEN`；由程式讀取，不顯示值 |
| Git 遠端 | `origin`：Azure DevOps `SynaiqDev/_git/synaiq-web`；目前使用 `main` |

**Git push 不會自動部署官網。正式站來源是 live-prototype，不是 Astro `dist/`。**

2026-09-23 已切換主網址為 `https://taistro.com.tw/`；Hostinger API 的既有主機識別仍用 `domain: synaiq.com`。修改網域轉址後需清除 synaiq.com 與 taistro.com.tw 的 Hostinger CDN 快取，避免沿用先前的 301。CDN 會最佳化圖片，來源檔案仍需精確 hash 核對，CDN 圖片則另驗證比例與可見內容，不能直接要求壓縮後檔案 hash 等於來源。

`index.html` 是本機預覽外框；正式入口由 `page.html` 封裝成發布包的 `index.html`。不能直接上傳本機外框，也不能上傳整個 repo 或 `out/`。

## 給 AI：授權與權限怎麼處理

使用者說「commit push 然後上架官網」「部署官網」時，已授權完成該次更新的正常發布流程：檢查差異、必要修正與測試、提交、推送、新目錄上傳、驗證、切換入口、更新部署紀錄及私有維護入口。**不要每個階段再用聊天詢問一次「是否繼續／是否確定上架」。** 本文件不代表每次改檔都要自動部署；僅要求 README、分析或預覽時，不因此切換官網。

這次發布若造成故障，可在路由仍符合本次已知 hash、且沒有他人後續變更時，依本次備份恢復原入口。無法確認現況時先讀取主機，不能強制覆蓋。

環境權限與部署意願是兩件事：

- README 不會授予網路、Git 寫入或沙箱外執行權限，也不會讓其他電腦自動繼承核准規則。
- 先沿用當前工具提供的有效核准規則。需要 escalation 時，直接對具體命令提出工具權限要求，說明它對應已授權的哪個部署步驟；不要先在聊天詢問一次，再跳第二次核准。
- 網路或沙箱拒絕時，依執行環境規則重試並要求適當權限；不可換工具繞過拒絕。`git status` 對全域 ignore 的警告不等於失敗，依退出碼與實際結果判斷。
- 若工具支援保存命令前綴，可使用精確的發布腳本入口或 `git push origin main`；不要要求任意 `node`、PowerShell、Python 的廣泛執行權限。核准前仍須檢查該腳本本次的內容與目標。
- 命令、檔案修改、網路操作分開執行；不要把產生腳本的 here-string、上傳、切換路由混成一個核准命令。發布各階段有先後依賴，依序執行並檢查退出碼。
- 若自動核准審查拒絕，明確告知被拒絕的操作及理由，不改稱「未連線」，也不宣稱完成。

只有缺少必要憑證、無法取得發布工具／基準、他人修改造成內容取捨不明，或工作超出已授權範圍時，才需要使用者補充或決策。DNS、資料庫、其他網域、刪除歷史版本與私人資料不包含在正常上架範圍內。

## 開始前：查現況，不重建背景

```powershell
git status -sb
git log -5 --oneline
git remote -v
git diff --stat
git diff --check
Test-Path .env.hostinger.local
Test-Path out/synaiq-release-20260929-tainan-photos/release.mjs
```

不要列印環境檔內容。依 `package.json` 安裝 Node／依賴；缺少 `node_modules` 才需要 `npm ci`。瀏覽器驗證使用 Playwright 與已安裝的 Chrome（`channel: 'chrome'`）。

讀取 [網站維護說明](../design/live-prototype/README.md)、[部署紀錄](deploy-hostinger.md)，再檢查該次改動。共用工作區有其他修改時，不清空、不 reset、不默認全部納入；明確列出本次提交檔案。現有發布腳本要求乾淨工作區，不能刪掉這個檢查來硬封裝；必要時在隔離的 checkout 準備已提交來源及本機工具。

### 已驗證的主機存取方式

現有 `audit.mjs`／`release.mjs` 以本機 token 呼叫 Hostinger：

1. `POST https://developers.hostinger.com/api/hosting/v1/files/upload-urls`，帶 Bearer token，目標 `username: u235694681`、`domain: synaiq.com`。
2. 檢查回傳 upload URL 的來源及結構。9/21 已驗證主機為 `https://srv1865-files.hstgr.io`，路徑 `/rest/<session>/api/tus/public_html`；新回應不符合時先核對，不能移除檢查。
3. 使用回傳的 `auth_key`／`rest_auth_key` 作為 `X-Auth`／`X-Auth-Rest`。它們與 session URL 都不要印出或寫入 Git。
4. `/api/resources/` 讀取目錄／文字內容；TUS `POST` 建立檔案，`PATCH` 分段上傳並核對 offset。每次變更都檢查回應與檔案內容。
5. `.htaccess` 先上傳成暫存候選檔，核對原路由 hash 未變，再以已驗證的 rename 操作替換；保留原文與新文。

API 已可用時，直接使用既有實作，不必每次重新走 Hostinger 瀏覽器登入。上述是本專案已驗證實作，不代表任意 Hostinger 主機都可套用。

## 每次新發布：固定流程

### 1. 測試與提交

```powershell
npm run test:design
# 動到 Astro、共用素材或 repo 結構時，也執行：
npm test
git diff --check
```

依改動檢查中英文、圖片與生成素材。KIP 介面圖片改動需同步 `docs/design/live-prototype/scripts/sync-brand-screens.mjs`產生的 SVG；不能只改動畫文字。

測試通過後，明確 `git add <本次檔案>`，commit，`git push origin main`。推送遭遠端新提交拒絕時先 fetch、檢查差異並整合，不 force push。記錄完整來源 commit。

### 2. 建立新發布目錄與工具

例如 `out/synaiq-release-YYYYMMDD-<簡短名稱>/`；同日第二次發布另取唯一名稱。不要覆蓋既有證據。

**現況限制：repo 尚無通用的 `npm run deploy`。** 9/21 的腳本是單次發布腳本，放在 Git 忽略的 `out/`。新的 clone 不會自帶這些工具、manifest 或憑證；需從原工作機／團隊保管的發布備份取得，不能當成已存在。此 README 沒有建立 CI 自動部署或通用 CLI。

在新目錄準備下列工具，以 9/21 最終檔案為參考：

| 工具 | 必須核對／更新的地方 |
|---|---|
| `audit.mjs` | 在新目錄執行，只讀主機；產生 inventory 與路由備份 |
| `baseline.mjs` | 舊 manifest 路徑改成主機實際現行版本，逐檔核對公開內容 |
| `release.mjs` | `RELEASE`＝新名稱；`OLD`＝即時現行目錄；`EXPECTED`＝即時路由 hash；`SOURCE`＝本次完整 commit |
| `release.mjs` 檔案數檢查 | 依 `PUBLIC_FILES` 排除 `index.html`、`preview.js` 後加 1，不能固定套用 62 或 64 |
| `smoke.mjs` | 使用 9/21 最終版本；依本次需求更新內容斷言，保留導覽、資源、溢出與錯誤檢查 |
| `capture-guide.mjs`／`update-guide.mjs` | 更新版本名稱、日期、唯一候選檔名；先備份私有維護入口，替換前核對原 hash |
| `check-cache.mjs` | 更新新 release 路徑 |

不要直接重跑舊 `prepare.mjs`／`update-smoke.mjs`／`prepare-doc.mjs`：它們有舊版本、姓名、數量及日期假設。直接以**最終腳本**為參考，只調整本次必要參數。9/21 團隊頁是七張彩色靜態照片、Daniel Shih；不能套回舊 Celestine、手繪顯影或 Dale 小貓斷言。未來若名單變動，依新核准來源驗證。

`audit.mjs` 會寫 `routing-before.htaccess`，但 `preflight` 用 exclusive create 寫同名檔。在全新的發布目錄跑完 audit 後，將其保留為 `routing-audit.htaccess`，再跑 preflight；不要刪掉原文或關閉 exclusive create。

舊站內容若與前次 manifest 不同，先保存現值並比對來源，避免丟失主機端文字修改。不要更新 hash 來掩蓋差異。

### 3. 按階段執行

以下是**新目錄及參數準備完成後**的命令範本，`$releaseDir` 必須換成本次目錄，不能指向歷史發布目錄。每行成功且前置條件滿足後才執行下一行；不要整塊盲貼。

```powershell
$releaseDir = 'out/synaiq-release-YYYYMMDD-name'
node "$releaseDir/audit.mjs"
# 保存 audit 產生的路由原文，依 inventory 設定 OLD／EXPECTED。
Move-Item -LiteralPath "$releaseDir/routing-before.htaccess" -Destination "$releaseDir/routing-audit.htaccess"
node "$releaseDir/baseline.mjs"
node "$releaseDir/release.mjs" preflight
node "$releaseDir/release.mjs" package
node "$releaseDir/smoke.mjs" local
# 檢視本機截圖，確認符合本次更新。
node "$releaseDir/capture-guide.mjs"
node "$releaseDir/release.mjs" stage
node "$releaseDir/smoke.mjs" staged
# 直接網址的 hash、瀏覽器與視覺驗證通過，才切入口。
node "$releaseDir/release.mjs" activate
node "$releaseDir/smoke.mjs" live
node "$releaseDir/check-cache.mjs"
node "$releaseDir/update-guide.mjs"
```

| 階段 | 成功依據 |
|---|---|
| preflight | 主機路由符合即時基準、新目錄不存在；root、保留圖片與舊站 410 正常 |
| package | 來源等於指定 commit；產生 allowlist artifact、manifest、逐檔 hash、測試與正式路由候選 |
| local | 本機瀏覽器報告 passed，實際檢視受影響頁面截圖 |
| stage | 新目錄逐檔 hash 相同；開放 allowlist 直接網址；root 仍是舊版 |
| staged | 直接網址四頁中英文及手機／桌面正常，沒有資源或 JS 錯誤 |
| activate | 再核對路由沒有被他人更動，切入口，root 各 query 的內容與新入口相同 |
| live | 正式網址瀏覽器報告 passed；title 無預覽字樣、圖片、導覽、語言、排版正常 |
| guide | 主機私有 `00-SYNAIQ-START-HERE.txt` 指向新目錄；其公開網址仍為 410 |

封裝會改寫 `/brand/`、`assets/`、入口 CSS／JS 路徑到新 release，保留模組載入關係。檢查完整 `page.html → prototype.js → i18n.js → locale-*.js` 鏈；locale 的 `Cache-Control` 應為 `no-cache, must-revalidate`。保留既有 LiteSpeed、WordPress 舊站 410、Wally 圖片白名單及所有歷史版本。

9/21 的三階段瀏覽器檢查各有 17 組：四頁 × 中英文 × 390／1440px，再加 835px 導覽。這是當次基準；本次改到其他斷點或互動時，增加相應驗證，不把舊報告複製成新 passed。

### 4. 收尾才算完成

更新 [部署紀錄](deploy-hostinger.md) 的現行目錄、來源 commit、驗證、證據路徑、回退版本與 hash。只在驗證實際通過後寫「完成」。提交並推送這份紀錄，再確認 `git status -sb`。

最後回報：官網連結、Git commit／push 狀態、上線版本、驗證結果、舊版保留。Git 成功不能代替正式網址成功。只更新文件時，不需要再封裝或切換官網。

## 失敗、重試與回退

- GET 可有限次重試。上傳、rename、activate 回應不明時，先讀主機檔案、offset、路由 hash 及本次 `failure-*.json`，不要直接重跑寫入。
- 若 release 目錄已存在，現有 stage 會拒絕。先確認它是完整、部分上傳或他人的目錄；保留證據，必要時另建新名稱，不刪目錄以躲過檢查。
- 回退使用**造成問題的當次發布目錄**中 `release.mjs rollback`，先確認現行路由是它的已知 hash。它恢復該次備份指向的舊版，不是任意想像的「上一個日期」。
- 另依 `guide-before.txt` 恢復私有維護入口，先核對目前檔案仍符合該次記錄，避免覆蓋後續編輯。
- 回退後重新檢查 root、中英文、圖片與快取。不刪除新舊 release；原始發布包、manifest、路由與驗證證據永久保留供追溯。

## 可直接貼給下一個 AI session

> 請先讀取 docs/operations/WEBSITE-UPDATE-README.md，依其中流程將本次網站修改 commit、push 並部署 synaiq.com。這個指令已包含正常發布、驗證、切換正式入口及維護紀錄同步的授權，不必逐階段再問是否繼續。沿用可用的主機存取與發布實作，先核對即時路由及來源，保留其他人的修改與歷史 release。需要系統權限時用工具提出具體要求，不重複詢問部署意願；缺少必要資料或遇到他人衝突時才提出問題。以正式網址驗證通過及 Git 同步為完成條件。
