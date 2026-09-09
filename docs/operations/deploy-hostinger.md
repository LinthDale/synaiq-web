# Hostinger 操作索引與部署界線

最後更新：2026-09-09。

## 目前線上版本

`synaiq.com` 使用 commit `752008b` 的 `docs/design/live-prototype/` 封裝版本，包含核准的 Home／KIP 中英雙語設計；2026-09-09 已透過 Hostinger API 套用 `6e437d2` 的中英文地址更新。它是客戶端渲染的靜態網站，**不是** `src/` 的 Astro Phase A `dist/`。

地址更新的上傳、公開 HTTP／JavaScript VM 驗證與三檔還原資訊，見 [地址更新紀錄](address-update-2026-09-08.md)。後續載入鏈快取版本修正也已上架，通過 origin 核對及七個公開網址的 HTTP、位元組數與 SHA-256 驗證；新中英文地址均可從公開目錄取得。沒有完成瀏覽器視覺驗證。

實際上架、已執行的 smoke checks、備份限制與路由內容，見 [2026-09-08 部署紀錄](deployment-synaiq-com-2026-09-08.md)。這份部署紀錄保持原始操作事實；repo 整併不會重新執行上架。

**2026-09-09 12:13 已依使用者要求下架舊 WordPress 網站入口並刪除實體 `home.html`。** 現行路由、36 個舊路徑的 410 驗證與本次精確備份，見 [舊站下架紀錄](legacy-retirement-2026-09-09.md)。核准靜態 release 的 41 個頁面／資產維持原 hash。兩檔 CSS 收斂仍是本機變更，未部署。

| 位置 | 用途 |
|---|---|
| `C:\Users\User\synaiq\synaiq-web\docs\design\live-prototype\` | 現行核准設計來源 |
| `C:\Users\User\synaiq\synaiq-web\out\synaiq-deploy-20260908\` | 本機 release 目錄、ZIP、SHA-256 manifest 與完整操作手冊；不進 Git |
| `C:\Users\User\synaiq\synaiq-web\out\synaiq-address-20260908\` | 已上架地址修正的三檔更新／還原包；不進 Git |
| `C:\Users\User\synaiq\synaiq-web\out\synaiq-address-20260909-cache\` | 已上架並驗證的四檔載入鏈快取修正與還原副本；不進 Git |
| `C:\Users\User\Documents\synaiq-web\SynaiQ-網站上架與還原操作手冊-20260908.md` | 使用者保留的上架／還原手冊；歷史舊 repo 路徑須對照新的唯一工作目錄 |
| Hostinger `public_html/synaiq-release-20260908/` | 已上架的版本目錄 |
| Hostinger `backup-synaiq-20260908/.htaccess` | 上架前的路由備份，位於公開目錄外 |
| `out/site-consolidation-20260909/remote-before/` | 9 月 9 日舊站下架前的精確路由與已刪除 home.html 備份；不進 Git |

正式站透過 `public_html/.htaccess` 把 `/` 內部轉交到上述版本；`/home.html` 現在 301 到 root，實體檔已刪除。舊 WordPress 頁面、API、登入及其餘非白名單路徑回傳 410，不再 fallback 到 `index.php`。WordPress 程式、資料庫及 `wp-content` 仍在，但除了新版依賴的 `wp-content/uploads/2026/03/toutou-2.png`，不再公開舊素材路徑。`synaiq-ai.com` 與其產品服務不在這次範圍。

## 還原與後續發布

完整人工操作步驟見上表的本機手冊，以及 [部署紀錄的 Routing and rollback](deployment-synaiq-com-2026-09-08.md#routing-and-rollback)。本次 repo 整併沒有執行還原演練，也沒有建立新的整站或資料庫備份。

- 目前有效路由標記為 `BEGIN SynaiQ static site 20260909`／`END SynaiQ static site 20260909`；若要還原舊站下架，請走 [9 月 9 日的還原界線](legacy-retirement-2026-09-09.md#還原界線)，不可直接套用第一次上架前的舊路由。
- 若要整份還原 `.htaccess`，先確認上架後沒有其他需要保留的變更。
- 路由仍指向新版時，不可移除其版本目錄。保留舊站檔案不等於已完成可還原的全站備份。
- 下次發布需另行核准，使用新的版本目錄、重新封裝對應資源路徑，先驗證直接網址及回退方案，再切換入口。
- 現行路由只開放 `synaiq-release-20260908` 的核准檔案型別、必要單張舊圖和憑證驗證路徑。新 release 的直接預覽 URL、額外頁面、robots／sitemap 等需先加入經審核的路由；否則會 410。不要為了發布而恢復 WordPress fallback。
- 不可將整個 repo、測試、設計文件、私人參考素材或本機工具公開上傳。

## Hostinger API 使用界線

2026-09-09 的地址更新使用 API 檔案上傳，僅替換帳戶 `u235694681` 下 `public_html/synaiq-release-20260908/` 的指定檔案，不使用會部署整份壓縮檔的 Deploy 端點，也不改動路由或既有 WordPress。每次替換前須核對遠端雜湊並保留對應還原副本，完成後驗證公開檔案。

公開 JavaScript 有七天瀏覽器快取。之後修改語言目錄或還原時，須同步更新三段載入鏈的版本參數與兩個 HTML 入口，再驗證新網址；只覆蓋回舊檔案不會清除瀏覽器快取。

API token 依使用者要求保留在 repo 根目錄的 `.env.hostinger.local`；該檔由 Git 忽略，只供本機授權使用，不能列印值、提交或包入網站上傳檔。API 可用不代表 Git push 會自動部署。

## ADO 管線現在只做驗證

[`azure-pipelines.yml`](../../azure-pipelines.yml) 為人工觸發的建置、測試及 artifact 發布管線；不再使用 FTP 變數群組、部署環境或正式站上傳階段。推送／合併 `main` 不會依此 YAML 自動發布網站。

`npm run build` 的 `dist/` 是 Astro Phase A 的檢驗產物。Phase A 基礎與核准設計雖位於同一 repo，尚未完成兩者的視覺與內容整合；不能把這個 artifact 當成現行正式站版本。執行入口見 [根 README](../../README.md)。

## 已封存的 Phase A 部署計畫

早期 PRD-001／ADR-001 路徑 A 規劃過「ADO 建置 Astro → FTP 上傳 → 暫時網域驗證 → 正式站切換」，並列出 18 個 Astro 內容 URL。**該規劃沒有用於本次實際上架，也不再是可執行操作手冊。** 原先自動清空遠端目錄、移除 WordPress 後上傳 `dist/` 的指示已撤除。

架構決策仍可查閱 [ADR-001](../adr/ADR-001-astro-react-islands-hostinger.md) 與 [Phase A 紀錄](../migration/phaseA-log.md)。若未來要啟用 Astro 部署或退役 WordPress，必須另行確認核准視覺、語言與路由完整性、舊站相依素材、備份／還原驗證及具體切換授權；不能從 Git 合併或本文件推定已獲准。
