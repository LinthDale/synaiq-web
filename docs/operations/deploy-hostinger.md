# Hostinger 操作索引與部署界線

最後更新：2026-09-09。

## 目前線上版本

`synaiq.com` 目前使用 commit `1af91b7` 的 `docs/design/live-prototype/` 封裝版本，2026-09-09 17:23（Asia/Taipei）完成切換。內容包含核准的 Home／KIP 中英雙語、地址與 quote 調整、兩份 CSS、集中字型／動畫設定、新聞剪報，以及共用 KIP 對話介面的三段動畫；第一段中英動畫已改為新進同仁採購筆電流程，並包含最新文案與動畫字級調整。它是客戶端渲染的靜態網站，**不是** `src/` 的 Astro Phase A `dist/`。

三支中文版 MP4 已另行重新錄製，交付位置見 [維護指引的 MP4 段落](../design/live-prototype/STYLE-GUIDE.md#匯出-mp4-的維護界線)。MP4 不是網站播放來源，不包含在 34 檔公開包中。

地址更新的上傳、公開 HTTP／JavaScript VM 驗證與三檔還原資訊，見 [地址更新紀錄](address-update-2026-09-08.md)。後續載入鏈快取版本修正也已上架，通過 origin 核對及七個公開網址的 HTTP、位元組數與 SHA-256 驗證；新中英文地址均可從公開目錄取得。該次地址修補沒有完成瀏覽器視覺驗證；現行版本的瀏覽器檢查範圍見下節。

實際上架、已執行的 smoke checks、備份限制與路由內容，見 [2026-09-08 部署紀錄](deployment-synaiq-com-2026-09-08.md)。這份部署紀錄保持原始操作事實；repo 整併不會重新執行上架。

**2026-09-09 12:13 已依使用者要求下架舊 WordPress 網站入口並刪除實體 `home.html`。** 當次路由、36 個舊路徑的 410 驗證與精確備份，見 [舊站下架紀錄](legacy-retirement-2026-09-09.md)。本次設計發布保留這個退役界線；兩檔 CSS 與新動畫現已上線。

| 位置 | 用途 |
|---|---|
| `C:\Users\User\synaiq\synaiq-web\docs\design\live-prototype\` | 現行核准設計來源 |
| `C:\Users\User\synaiq\synaiq-web\out\synaiq-deploy-20260908\` | 本機 release 目錄、ZIP、SHA-256 manifest 與完整操作手冊；不進 Git |
| `C:\Users\User\synaiq\synaiq-web\out\synaiq-address-20260908\` | 已上架地址修正的三檔更新／還原包；不進 Git |
| `C:\Users\User\synaiq\synaiq-web\out\synaiq-address-20260909-cache\` | 已上架並驗證的四檔載入鏈快取修正與還原副本；不進 Git |
| `C:\Users\User\Documents\synaiq-web\SynaiQ-網站上架與還原操作手冊-20260908.md` | 使用者保留的上架／還原手冊；歷史舊 repo 路徑須對照新的唯一工作目錄 |
| `out/synaiq-release-20260909-purchasing/` | 本次 artifact、逐檔 SHA-256 manifest、路由備份與本機／主機／正式站瀏覽器驗證；只有 `artifact/` 內的核准檔案上傳，其餘不進 Git、不公開 |
| `out/synaiq-release-20260909-design/` | 上一次設計發布的 artifact、manifest、路由備份與檢查資料；保留，不重跑 |
| Hostinger `public_html/synaiq-release-20260909-purchasing/` | 目前正式站版本；34 個核准公開檔案 |
| Hostinger `public_html/synaiq-release-20260909-design/` | 上一版設計，保留供還原與既有快取資源使用，不再當作現行版本修改 |
| Hostinger `public_html/synaiq-release-20260908/` | 更早版本，保留供既有快取資源使用，不原地覆寫 |
| Hostinger `backup-synaiq-20260908/.htaccess` | 上架前的路由備份，位於公開目錄外 |
| `out/site-consolidation-20260909/remote-before/` | 9 月 9 日舊站下架前的精確路由與已刪除 home.html 備份；不進 Git |

正式站透過 `public_html/.htaccess` 把 `/` 內部轉交到 `synaiq-release-20260909-purchasing/index.html`；`/home.html` 仍 301 到 root，實體檔已刪除。舊 WordPress 頁面、API、登入及其餘非白名單路徑回傳 410，不再 fallback 到 `index.php`。WordPress 程式、資料庫及 `wp-content` 仍在，但除了新版依賴的 `wp-content/uploads/2026/03/toutou-2.png`，不再公開舊素材路徑。`synaiq-ai.com` 與其產品服務不在這次範圍。

## 現行版本的發布與還原

本次先將 34 個核准公開檔案上傳至獨立新目錄，逐檔核對公開 SHA-256，再以不改首頁的白名單路由開放直接驗證。主機直接網址通過 Home／KIP × 中英 × 390／1440px 瀏覽器檢查後才切換 `/`；切換後重驗相同八組、圖片、兩份 CSS、三段動畫、手機導覽、無水平溢出與 JavaScript 錯誤。原 Wally 角色圖 hash 不變；指定舊產品／媒體頁、WordPress 管理／API 仍 410，`home.html?lang=en` 仍 301 並保留 query。

採購問答另核對中英問句、設備採購流程檔名、虛構示範標示，以及回答／原文展開時不侵入輸入框。此次公開 payload 對應 commit `1af91b7`；維護文件的未提交調整不屬公開包，沒有將本機文件或憑證一起上傳。

CSS、JS 與素材 URL 已改寫為本次版本前綴，避免舊七天快取混入。公開包不含預覽 iframe 外框、測試、文件、部署腳本、憑證或私人參考圖。操作腳本與 API session 不對外公開，session 也不落檔。

精確還原資訊位於 `out/synaiq-release-20260909-purchasing/`：

| 檔案 | 用途／SHA-256 |
|---|---|
| `manifest.json` | source commit、34 個公開檔案的位元組數／hash，與三種路由 hash |
| `routing-before.htaccess` | 本次切換前、指向上一版 design 且已下架舊站的路由；`3513cf188fc10c0b37c79d529f4fe3874ddce799faf598b30313d7f20cd72a97` |
| `routing-live.htaccess` | 目前路由；`1f95d1b2c6c8877b811f0e60cb75143683604b28ef02e9633f5541854171023b` |
| `staged.json`／`activated.json` | 主機驗證與入口切換後的逐檔公開結果 |
| `browser-local.json`／`browser-staged.json`／`browser-live.json` | 本機封裝、主機直接網址與正式入口的瀏覽器檢查 |

要回到上一版 `synaiq-release-20260909-design`（**不重新開放 WordPress**）：

1. 在唯一 repo 目錄確認 `routing-before.htaccess` 與 `manifest.json` 齊全，以及主機上一版目錄仍存在；不要使用更早的「第一次上架前」路由。
2. 取得還原授權後執行 `node out/synaiq-release-20260909-purchasing/release.mjs rollback`。腳本先核對三份本機路由 hash 與主機目前 hash，經暫存檔驗證後 rename；遇到未知外部路由變更會停止、不覆寫。
3. 確認 root hash 回到 `preflight.json` 記錄的上一版，重新檢查中英文頁面／素材及舊站仍 410。新版本目錄可以保留，不需要刪除。

`stage`／`activate` 已完成，不要重跑。其失敗流程會辨識遠端實際路由，已知新路由驗證失敗時退回切換前版本；未知外部變更則停止。回應逾時時先讀取 `failure-*.json` 及實際遠端狀態，不能盲目重試。此次沿用上一輪已通過本機失敗回退模擬的機制，未實際對正式站演練回退。

## 還原與後續發布

完整人工操作步驟見上表的本機手冊，以及 [部署紀錄的 Routing and rollback](deployment-synaiq-com-2026-09-08.md#routing-and-rollback)。本次 repo 整併沒有執行還原演練，也沒有建立新的整站或資料庫備份。

- 目前有效路由標記為 `BEGIN SynaiQ static site 20260909`／`END SynaiQ static site 20260909`；若要還原舊站下架，請走 [9 月 9 日的還原界線](legacy-retirement-2026-09-09.md#還原界線)，不可直接套用第一次上架前的舊路由。
- 若要整份還原 `.htaccess`，先確認上架後沒有其他需要保留的變更。
- 路由仍指向新版時，不可移除其版本目錄。保留舊站檔案不等於已完成可還原的全站備份。
- 下次發布需另行核准，使用新的版本目錄、重新封裝對應資源路徑，先驗證直接網址及回退方案，再切換入口。
- 現行路由只開放 `synaiq-release-20260909-purchasing`、保留的 `synaiq-release-20260909-design`／`synaiq-release-20260908` 核准檔案型別、必要單張舊圖和憑證驗證路徑。未來新 release 的直接預覽 URL、額外頁面、robots／sitemap 等需先加入經審核的路由；否則會 410。不要為了發布而恢復 WordPress fallback。
- 不可將整個 repo、測試、設計文件、私人參考素材或本機工具公開上傳。

## Hostinger API 使用界線

2026-09-09 的地址更新使用 API 檔案上傳，僅替換帳戶 `u235694681` 下 `public_html/synaiq-release-20260908/` 的指定檔案，不使用會部署整份壓縮檔的 Deploy 端點，也不改動路由或既有 WordPress。每次替換前須核對遠端雜湊並保留對應還原副本，完成後驗證公開檔案。

公開 JavaScript 有七天瀏覽器快取。正常發布使用全新版本目錄，並改寫 HTML、CSS、JS、品牌與素材引用；不要原地覆蓋已封存的 release。如果另外核准原地修補，須同步更新載入鏈版本參數與 HTML 入口，再驗證新網址；只覆蓋回舊檔案不會清除瀏覽器快取。

API token 依使用者要求保留在 repo 根目錄的 `.env.hostinger.local`；該檔由 Git 忽略，只供本機授權使用，不能列印值、提交或包入網站上傳檔。API 可用不代表 Git push 會自動部署。

## ADO 管線現在只做驗證

[`azure-pipelines.yml`](../../azure-pipelines.yml) 為人工觸發的建置、測試及 artifact 發布管線；不再使用 FTP 變數群組、部署環境或正式站上傳階段。推送／合併 `main` 不會依此 YAML 自動發布網站。

`npm run build` 的 `dist/` 是 Astro Phase A 的檢驗產物。Phase A 基礎與核准設計雖位於同一 repo，尚未完成兩者的視覺與內容整合；不能把這個 artifact 當成現行正式站版本。執行入口見 [根 README](../../README.md)。

## 已封存的 Phase A 部署計畫

早期 PRD-001／ADR-001 路徑 A 規劃過「ADO 建置 Astro → FTP 上傳 → 暫時網域驗證 → 正式站切換」，並列出 18 個 Astro 內容 URL。**該規劃沒有用於本次實際上架，也不再是可執行操作手冊。** 原先自動清空遠端目錄、移除 WordPress 後上傳 `dist/` 的指示已撤除。

架構決策仍可查閱 [ADR-001](../adr/ADR-001-astro-react-islands-hostinger.md) 與 [Phase A 紀錄](../migration/phaseA-log.md)。若未來要啟用 Astro 部署或退役 WordPress，必須另行確認核准視覺、語言與路由完整性、舊站相依素材、備份／還原驗證及具體切換授權；不能從 Git 合併或本文件推定已獲准。
