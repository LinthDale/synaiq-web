# Hostinger 操作索引與部署界線

最後更新：2026-09-11。

## 目前線上版本

`synaiq.com` 目前使用 commit `9780a00` 的 `docs/design/live-prototype/` 封裝版本，2026-09-11 14:25（Asia/Taipei）完成切換。三段 KIP 動畫已套用核准的同色撕邊、紙質側欄、小型手繪對話線稿、右上 KIP 字標及「寄出＋手繪筆」；查看原文時才展開淡格線筆記。首頁「KIP 畫面＋信紙＋Wally」與 KIP 頁首的靜態產品圖也已同步，中英四張生成 SVG、動畫及頁首引文共用設備採購示例，不再保留指定第 12 頁的舊問答。

既有 Home／KIP 中英雙語、地址與 quote、兩份 CSS、字型／動畫設定、新聞剪報及三片切換機制保留。KIP 動畫下方的獨立知識中心說明區塊仍已移除，動畫內的知識中心保留；資料接入文案仍使用「掃描文件」。它是客戶端渲染的靜態網站，**不是** `src/` 的 Astro Phase A `dist/`。

既有三支中文版 MP4 的交付位置見 [維護指引的 MP4 段落](../design/live-prototype/STYLE-GUIDE.md#匯出-mp4-的維護界線)。本次紙質介面改版未重新錄製 MP4；它們不是網站播放來源，也不包含在 38 檔公開包中。

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
| `out/synaiq-release-20260911-paper-products/` | 本次 artifact、逐檔 SHA-256 manifest、路由備份與本機／主機／正式站瀏覽器驗證；只有 `artifact/` 內的核准檔案上傳，其餘不進 Git、不公開 |
| `out/synaiq-release-20260910-a4c0924/` | 前次發布與檢查資料；保留，不重跑 |
| `out/synaiq-release-20260911-paper-demo/` | 先前未完成的動畫候選與回退診斷；未納入補漏的產品圖，不是現行版本，不重跑 |
| `out/synaiq-release-20260910-kip-cleanup/` | 上一次 KIP 區塊清理發布的 artifact、manifest、路由備份與檢查資料；保留，不重跑 |
| `out/synaiq-release-20260909-purchasing/` | 上一次採購動畫發布的 artifact、manifest、路由備份與檢查資料；保留，不重跑 |
| `out/synaiq-release-20260909-design/` | 更早的設計發布資料；保留，不重跑 |
| Hostinger `public_html/synaiq-release-20260911-paper-products/` | 目前正式站版本；38 個核准公開檔案 |
| Hostinger `public_html/synaiq-release-20260910-a4c0924/` | 上一版，保留供還原與既有快取資源使用，不再當作現行版本修改 |
| Hostinger `public_html/synaiq-release-20260910-kip-cleanup/` | 更早版本，保留供既有快取資源使用，不原地覆寫 |
| Hostinger `public_html/synaiq-release-20260911-paper-demo/` | 未採用候選，未在現行公開路由白名單內；不當作還原目標 |
| Hostinger `public_html/synaiq-release-20260909-purchasing/` | 更早版本，保留供既有快取資源使用，不原地覆寫 |
| Hostinger `public_html/synaiq-release-20260909-design/` | 更早版本，保留供既有快取資源使用，不原地覆寫 |
| Hostinger `public_html/synaiq-release-20260908/` | 更早版本，保留供既有快取資源使用，不原地覆寫 |
| Hostinger `backup-synaiq-20260908/.htaccess` | 上架前的路由備份，位於公開目錄外 |
| `out/site-consolidation-20260909/remote-before/` | 9 月 9 日舊站下架前的精確路由與已刪除 home.html 備份；不進 Git |

正式站透過 `public_html/.htaccess` 把 `/` 內部轉交到 `synaiq-release-20260911-paper-products/index.html`；`/home.html` 仍 301 到 root，實體檔已刪除。舊 WordPress 頁面、API、登入及其餘非白名單路徑回傳 410，不再 fallback 到 `index.php`。WordPress 程式、資料庫及 `wp-content` 仍在，但除了新版依賴的 `wp-content/uploads/2026/03/toutou-2.png`，不再公開舊素材路徑。`synaiq-ai.com` 與其產品服務不在這次範圍。

## 現行版本的發布與還原

本次先將 38 個核准公開檔案上傳至獨立新目錄，逐檔核對公開 SHA-256，再以不改首頁的白名單路由開放直接驗證。主機直接網址通過 Home／KIP × 中英 × 390／1440px 瀏覽器檢查後才切換 `/`；切換後重驗相同八組、圖片、兩份 CSS、三段動畫、手機導覽、無水平溢出與 JavaScript 錯誤。原 Wally 角色圖 hash 不變；指定舊產品／媒體頁、WordPress 管理／API 仍 410，`home.html?lang=en` 仍 301 並保留 query。

採購問答另核對中英問句、設備採購流程檔名、虛構示範標示，以及回答／原文展開的紙面邊界。此次公開 payload 對應 commit `9780a00`，已推送 ADO main；沒有將本機文件或憑證一起上傳。另核對首頁組圖與 KIP 頁首實際載入的 SVG 含新版撕邊、側欄與筆圖示，不再只驗證下方動畫；KIP 頁的獨立說明區塊仍不存在。

CSS、JS 與素材 URL 已改寫為本次版本前綴，避免舊七天快取混入。公開包不含預覽 iframe 外框、測試、文件、部署腳本、憑證或私人參考圖。操作腳本與 API session 不對外公開，session 也不落檔。

精確還原資訊位於 `out/synaiq-release-20260911-paper-products/`：

| 檔案 | 用途／SHA-256 |
|---|---|
| `manifest.json` | source commit、38 個公開檔案的位元組數／hash，與三種路由 hash |
| `routing-before.htaccess` | 本次切換前、指向上一版 a4c0924 且已下架舊站的路由；`af670e5040952049b95da60a6fd9788199e20e75244221ed9bf2a951547330e2` |
| `routing-preview.htaccess` | 僅開放候選直接網址、首頁未切換的路由；`0f5488f2c2997d8bcea381d859675af4ed843b5d97d1c42da82417231d458667` |
| `routing-live.htaccess` | 目前路由；`8177eb8d4dd525d05eb0d73d573336e6ed8e8d8ca2792d35d6ed478694415e18` |
| `staged.json`／`activated.json` | 主機驗證與入口切換後的逐檔公開結果 |
| `browser-local.json`／`browser-staged.json`／`browser-live.json` | 本機封裝、主機直接網址與正式入口的瀏覽器檢查 |

要回到上一版 `synaiq-release-20260910-a4c0924`（**不重新開放 WordPress**）：

1. 在唯一 repo 目錄確認 `routing-before.htaccess` 與 `manifest.json` 齊全，以及主機上一版目錄仍存在；不要使用更早的「第一次上架前」路由。
2. 取得還原授權後執行 `node out/synaiq-release-20260911-paper-products/release.mjs rollback`。腳本先核對三份本機路由 hash 與主機目前 hash，經暫存檔驗證後 rename；遇到未知外部路由變更會停止、不覆寫。
3. 確認 root hash 回到 `preflight.json` 記錄的上一版，重新檢查中英文頁面／素材及舊站仍 410。新版本目錄可以保留，不需要刪除。

`stage`／`activate` 已完成，不要重跑。其失敗流程會辨識遠端實際路由，已知新路由驗證失敗時退回切換前版本；未知外部變更則停止。回應逾時時先讀取 `failure-*.json` 及實際遠端狀態，不能盲目重試。公開唯讀 GET 遇到暫時連線錯誤或 502／503／504 最多嘗試三次；上傳與路由修改不自動重試。

先前 `paper-demo` 候選在驗證未完成後已自動回退，並唯讀確認上一版根頁與路由 hash 一致。隨後納入靜態產品圖補漏，以全新的 `paper-products` 版本完成發布；不重用前次的候選封裝或驗證報告。本版未另行人工演練還原。

## 還原與後續發布

完整人工操作步驟見上表的本機手冊，以及 [部署紀錄的 Routing and rollback](deployment-synaiq-com-2026-09-08.md#routing-and-rollback)。本次 repo 整併沒有執行還原演練，也沒有建立新的整站或資料庫備份。

- 目前有效路由標記為 `BEGIN SynaiQ static site 20260909`／`END SynaiQ static site 20260909`；若要還原舊站下架，請走 [9 月 9 日的還原界線](legacy-retirement-2026-09-09.md#還原界線)，不可直接套用第一次上架前的舊路由。
- 若要整份還原 `.htaccess`，先確認上架後沒有其他需要保留的變更。
- 路由仍指向新版時，不可移除其版本目錄。保留舊站檔案不等於已完成可還原的全站備份。
- 下次發布需另行核准，使用新的版本目錄、重新封裝對應資源路徑，先驗證直接網址及回退方案，再切換入口。
- 現行路由只開放 `synaiq-release-20260911-paper-products`、保留的 `synaiq-release-20260910-a4c0924`／`synaiq-release-20260910-kip-cleanup`／`synaiq-release-20260909-purchasing`／`synaiq-release-20260909-design`／`synaiq-release-20260908` 核准檔案型別、必要單張舊圖和憑證驗證路徑。未來新 release 的直接預覽 URL、額外頁面、robots／sitemap 等需先加入經審核的路由；否則會 410。不要為了發布而恢復 WordPress fallback。
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
