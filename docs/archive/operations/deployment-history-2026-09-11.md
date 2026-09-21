# 2026-09-11 發布與快取維護歷史

> 歷史資料，不是現行上架指令。現行入口見 [部署指南](../../operations/deploy-hostinger.md)。

## 目前線上狀態與這次修補

根入口仍由 `public_html/.htaccess` 內部轉交到 `synaiq-release-20260911-team-pages/index.html`。`page=home|kip|cases|about` 與 `lang=zh-Hant|en` 選擇四頁中英文內容；正式網站來源是 `docs/design/live-prototype/`，不是 Astro Phase A 的 `dist/`。

原四頁公開包來自 commit `5aba844496bb26883806a4dd82acf1238ad2cd2d`，共有 64 個檔案。之後使用者以 commit `95bcbf85b4b051c3eafab256044b15a3746cb53a` 更新團隊中文內容並上傳。本次在此基礎同步 Wilson 的 CEO、Lou 的協理與 ISO27001:2022 資訊安全管理系統主任稽核員英文內容，再修補載入鏈與快取設定。

本次只替換目前目錄的五個公開檔案：`locale-about.js`、`i18n.js`、`prototype.js`、`page.html`、`index.html`；另更新根 `.htaccess`，增加檔案管理員用的 `00-SYNAIQ-START-HERE.txt`。HTML → prototype → i18n → 六個 locale 的載入鏈使用一次性版本 `20260911-team-content`，讓已有舊快取的瀏覽器進入新載入鏈。`locale-*.js` 改為 `Cache-Control: no-cache, must-revalidate`，停用該類檔案的 Expires；其他 JS 的既有七天快取保留。此快取規則不代表所有 locale 都能不經封裝直接上傳。

驗證資料均在本機 `out/hostinger-about-maintenance-20260911/`，不進 Git、不公開：

| 證據 | 已驗證內容 |
|---|---|
| `sources.json`／`public.json` | 修補前使用者上傳的正確檔案與本機相同；當時仍有 `max-age=604800` |
| `browser-local-cache.json` | 5 組通過：舊七天快取能在一般重新整理後更新；模擬同網址覆蓋 about 與 common 文案均能重新驗證 |
| `applied.json` | 5 個公開檔案與四頁中英入口，共 13 個 HTTP／SHA-256 檢查通過 |
| `browser-live-cache.json` | 正式站中英 × 390／1440px 共 4 組通過；七位成員、更新職稱及 ISO 內容正確，無水平溢出、JavaScript 或 HTTP 錯誤 |
| `locale-headers.json` | 六個 locale 檔均 HTTP 200，且回傳 `no-cache, must-revalidate` |
| `patch-manifest.json`、`before/`、`after/` | 本次七個目標的精確前後 hash、修補前副本與修補後檔案 |
| `guide-clarified.json` | 17:35 更新管理指引，明確限於 about 純文字單檔上傳；主機 hash 核對通過，公開路徑仍 410 |

修補完成當下的 SHA-256 如下；以後若再手動更新文案，需保留新的實際檔案與 hash，不能繼續把這張表當作最新內容：

| 目標 | SHA-256 |
|---|---|
| 根 `.htaccess` | `36602942c762f62652635e994ee75302a98c243ffedc684c0c78ebd549d5224e` |
| `locale-about.js` | `b3bdccf9d0ca5d327b2763278b89c3b42d082b1519f67feaba37ef5f6da47ccf` |
| `i18n.js` | `c61432e1d95e5447f5c1884ee39c715ef3ac158a904bc08f68f1c30e13a7ed2b` |
| `prototype.js` | `30f00c3665f8afdfd27ac079f9691148a2db0df14ef0d7c93b622a62179b052b` |
| `page.html`、`index.html` | `eb793ffbefe249e27fdb4026b9f7a6b4a2444e859e9c1d72a2c0947dee31413e` |
| 根 `00-SYNAIQ-START-HERE.txt` | `6a0e83bbd191b70e70be0610d3228fbb1784bf72fc268d8f1063ee8364c2e506` |

管理指引修訂後，現行 `patch-manifest.json` 與 `after/` 已同步該文件的最新 hash，五個公開檔案與路由保持不變。第一次套用的 manifest 與指引另保留為 `patch-manifest-initial-applied.json`、`guide-initial-applied.txt`，便於追溯。

## 修補還原與後續發布

**原 `out/synaiq-release-20260911-team-pages/manifest.json` 是 16:32 四頁發布時的 64 檔基準，不再完整代表目前線上內容。** 本次 `patch-manifest.json` 的五個公開檔案與路由 hash 覆蓋對應舊基準；其餘檔案沿用原包。不要直接重跑原 release 的 `verify`、`stage`、`activate` 或 `rollback`。

若要撤回這次文案／快取修補：

1. 確認 `out/hostinger-about-maintenance-20260911/patch-manifest.json`、`before/`、`after/` 齊全，並核對主機沒有後續需要保留的修改。
2. 在既有還原授權範圍內執行 `node out/hostinger-about-maintenance-20260911/patch.mjs rollback`。使用現行 `patch-manifest.json`，不要換回保留的 initial manifest。腳本只接受本次已知前後 hash；遇到額外手動更新便停止，不覆蓋未知內容。未來再更新後，必須先重做備份與還原檢查，不能盲目套用舊指令。
3. 此回退恢復的是 **本次修補前已包含使用者中文更新** 的五個公開檔案，並移除新增的管理指引；路由回到 `75fda7cc73e43efe7f352cd0904334e33e670ac3bf20cca1c317ee2fcc10f435`。它不會把團隊文案直接退回原始 `5aba844`。
4. 回退後重新核對中英文內容、入口與快取狀態。已快取新載入鏈的瀏覽器也須納入檢查，不能只憑檔案還原便判定瀏覽器已還原。

若還要回到四頁發布前的 `synaiq-release-20260911-paper-products`，須先完成以上 patch 回退，再確認路由與原 release 的備份一致，才可在還原授權範圍內執行 `node out/synaiq-release-20260911-team-pages/release.mjs rollback`。該流程會回到 `8177eb8d4dd525d05eb0d73d573336e6ed8e8d8ca2792d35d6ed478694415e18` 的路由，重新核對 root 與 `preflight.json`、中英文素材及舊站仍 410；不重新開放 WordPress。未另行人工演練此兩階段回退。

完整發布適用於 HTML、非文案 JS、CSS、圖片、新頁面或更大改版：

1. 在已授權的發布範圍內，先整合主機最新文案到唯一 repo，建立新的版本目錄並封裝全部引用路徑。
2. 本機檢查通過後，上傳核准公開檔案，以主機直接網址核對逐檔 hash 與瀏覽器畫面；入口仍維持現行版本。
3. 核對回退副本與路由後才切換 root，再驗證正式站。同步更新本文件及 `00-SYNAIQ-START-HERE.txt` 的唯一維護目錄。

不要原地覆寫歷史 release，或把整個 repo、測試、設計文件、私人參考圖、本機工具與憑證上傳。路由仍指向某版本時不可移除其目錄。API 回應逾時須先讀取失敗紀錄及實際主機狀態，不能盲目重試；上傳與路由修改不自動重試。既有完整發布腳本的公開唯讀 GET 對暫時連線錯誤或 502／503／504 最多嘗試三次。

## 路由與主機界線

現行標記為 `BEGIN SynaiQ static site 20260909`／`END SynaiQ static site 20260909`，新增文案快取區塊標記為 `BEGIN SynaiQ editable content cache`／`END SynaiQ editable content cache`。本版路由依原 manifest 明列 64 個核准公開檔案，包含團隊、場域 JPG 與檔名中的點；不以寬泛副檔名規則開放整個目錄。未來新 release、額外頁面、robots／sitemap 等都需加入經審核的路由，否則會 410。

`/home.html` 仍 301 到 root 並保留 query，實體檔已在 2026-09-09 刪除。舊 WordPress 頁面、API、登入及其餘非白名單路徑仍 410，不 fallback 到 `index.php`。WordPress 程式、資料庫及 `wp-content` 仍在；只保留新版需要的 `wp-content/uploads/2026/03/toutou-2.png` 公開，以及憑證驗證路徑。維護指引與部署工具不在公開白名單內。

此流程不變更 DNS；`synaiq-ai.com` 與其產品服務不在範圍。若要整份還原 `.htaccess`，先確認後續變更；若要撤回舊站下架，遵循 [9 月 9 日的還原界線](legacy-retirement-2026-09-09.md#還原界線)，不可直接套用第一次上架前的 WordPress 路由。保留舊站檔案不等於完成可還原的全站或資料庫備份。

## 歷史發布與保留位置

下列位置用於追溯或還原，不是日常更新目錄。

| 位置 | 用途 |
|---|---|
| `out/hostinger-about-maintenance-20260911/` | 現行文案與快取修補的前後副本、manifest、HTTP 與瀏覽器結果；不進 Git |
| `out/synaiq-release-20260911-team-pages/` | 原四頁發布的 64 檔 artifact、manifest、路由與檢查資料；五檔與路由已由本次 patch 接續 |
| `out/synaiq-release-20260911-paper-products/` | 四頁發布前的紙質介面與靜態產品圖版本；保留供還原，不重跑 |
| `out/synaiq-release-20260910-a4c0924/` | 更早發布與檢查資料；保留，不重跑 |
| `out/synaiq-release-20260911-paper-demo/` | 驗證未完成後自動回退的動畫候選，未納入補漏產品圖；不是現行版本或還原目標 |
| `out/synaiq-release-20260910-kip-cleanup/` | KIP 區塊清理發布的 artifact、manifest、路由與檢查資料 |
| `out/synaiq-release-20260909-purchasing/` | 採購動畫發布資料 |
| `out/synaiq-release-20260909-design/` | 更早設計發布資料 |
| Hostinger `public_html/synaiq-release-20260911-paper-products/` | 上一版公開目錄，供還原與既有快取資源使用 |
| Hostinger `public_html/synaiq-release-20260910-a4c0924/`、`synaiq-release-20260910-kip-cleanup/` | 更早版本，保留供既有快取資源使用，不修改 |
| Hostinger `public_html/synaiq-release-20260909-purchasing/`、`synaiq-release-20260909-design/`、`synaiq-release-20260908/` | 更早版本，保留供既有快取資源使用，不修改 |
| Hostinger `public_html/synaiq-release-20260911-paper-demo/` | 未採用候選，不在現行公開路由白名單，不當作還原目標 |
| `out/synaiq-deploy-20260908/` | 第一次上架的 release、ZIP、SHA-256 manifest 與完整操作手冊 |
| `out/synaiq-address-20260908/` | 地址修正三檔更新／還原包 |
| `out/synaiq-address-20260909-cache/` | 地址載入鏈快取修正四檔與還原副本 |
| `out/site-consolidation-20260909/remote-before/` | 舊站下架前的精確路由與已刪除 `home.html` 備份 |
| Hostinger `backup-synaiq-20260908/.htaccess` | 第一次上架前路由，位於公開目錄外；不可當作現在的日常還原版本 |
| `C:\Users\User\Documents\synaiq-web\SynaiQ-網站上架與還原操作手冊-20260908.md` | 使用者保留的歷史手冊；舊 repo 路徑須對照目前唯一工作目錄 |

### 2026-09-11 四頁發布基準

原包於 16:32:51（Asia/Taipei）切換、16:36 完成正式站瀏覽器檢查，來源 commit `5aba844` 已推送 ADO main。先通過本機瀏覽器檢查，再上傳、逐檔核對 SHA-256，以首頁不變的白名單路由開放直接網址；主機檢查通過後才切換 root。

本機、主機直接網址與正式站各通過 17 組：四頁 × 中英 × 390／1440px 共 16 組，另加 835px 導覽。涵蓋圖片與 SVG 照片解碼、兩份 CSS、三段 KIP 動畫、導覽、語言切換、手機選單，無水平溢出、JavaScript 或 HTTP 錯誤。root 及 `www.synaiq.com` 四頁中英 query 均 200 且 HTML hash 符合當時 manifest；Wally 原圖 hash 不變、舊入口仍 410、`home.html?lang=en` 仍 301，部署工具公開路徑仍被拒絕。

七位團隊成員包含李昱儒 Celestine，以及公司簡介更新的 Dale、Steve。Dale 學經歷為「中央大學永續與綠能科技研究所」，Steve 為「逢甲大學資訊工程研究所博士班」。人物、Dale 右下角黑白小貓與兩組場域照片均通過顯影檢查；移入逐漸變真照、點擊保留進度、再點擊繼續，未暫停時移出還原。小貓有獨立線稿／照片風格素材與輪廓，四組遮罩同步。

四頁共用 `site.css` 的版面及 `tokens.css` 的字型、色彩與動畫設定，各頁結構與中英文內容分檔。Home／KIP 地址、quote、新聞剪報、三段動畫與三片切換保留；紙質介面、設備採購示例及靜態產品圖沿用核准版本。KIP 動畫下方的獨立知識中心說明仍已移除，動畫內知識中心保留，資料接入文案為「掃描文件」。三支中文版 MP4 的交付位置見 [維護指引](../../design/live-prototype/STYLE-GUIDE.md#匯出-mp4-的維護界線)；此發布未重錄，它們不是網站播放來源，也不在 64 檔包中。

原四頁發布的精確資料位於 `out/synaiq-release-20260911-team-pages/`：

| 檔案 | 歷史用途／SHA-256 |
|---|---|
| `manifest.json` | source commit、原 64 檔位元組／hash 與三種路由 hash |
| `routing-before.htaccess` | 指向 paper-products、已退役舊站；`8177eb8d4dd525d05eb0d73d573336e6ed8e8d8ca2792d35d6ed478694415e18` |
| `routing-preview.htaccess` | 只開放候選直接網址；`27c40e9530194ed74d6f016a7ce33947f1c4643d07b790ea4647e1f416743c09` |
| `routing-live.htaccess` | 原四頁路由，已由本次 patch 更新；`75fda7cc73e43efe7f352cd0904334e33e670ac3bf20cca1c317ee2fcc10f435` |
| `staged.json`／`activated.json` | 當時主機驗證與切換後的逐檔結果 |
| `browser-local.json`／`browser-staged.json`／`browser-live.json` | 當時三階段各 17 組瀏覽器結果 |
| `public-extra.json` | 當時 www 與非公開工具路徑 HTTP 檢查 |

### 2026-09-08／09 上架與舊站退役

實際初次上架、smoke checks、備份限制與路由事實，保留在 [2026-09-08 部署紀錄](deployment-synaiq-com-2026-09-08.md)。repo 整併沒有重新執行上架、還原演練，或建立整站／資料庫備份。

[地址更新紀錄](address-update-2026-09-08.md) 保留三檔更新、公開 HTTP／JavaScript VM 驗證與還原資訊。後續地址載入鏈快取修正通過 origin 及七個公開網址的 HTTP、位元組與 SHA-256 驗證；該次未完成瀏覽器視覺驗證，不應與後來四頁發布的瀏覽器結果混為一談。

2026-09-09 的地址 API 操作只替換帳戶 `u235694681` 下 `public_html/synaiq-release-20260908/` 指定檔案，不使用部署整份壓縮檔的 Deploy 端點，也不改路由或 WordPress。當日 12:13 另依使用者要求下架 WordPress 入口並刪除實體 `home.html`；路由、36 個舊路徑 410 與精確備份見 [舊站下架紀錄](legacy-retirement-2026-09-09.md)。這些原始操作事實不隨本文件整理而改寫。

## API、ADO 與 Astro 的界線

API token 依使用者要求保留於 repo 根目錄的 `.env.hostinger.local`，由 Git 忽略，只供本機授權使用；不能列印值、提交或包入公開網站。每次 API 替換須核對遠端 hash、保留精確還原副本，再驗證公開檔案；API 可用不代表 Git push 會自動部署。

[`azure-pipelines.yml`](../../../azure-pipelines.yml) 是人工觸發的建置、測試及 artifact 發布管線，沒有正式站上傳階段，不使用 FTP 變數群組或部署環境。推送／合併 `main` 不會依這份 YAML 發布網站。

`npm run build` 的 `dist/` 是 Astro Phase A 檢驗產物；Phase A 與核准設計尚未完成視覺和內容整合，不能把此 artifact 當作現行正式站。執行入口見 [根 README](../../../README.md)。

早期 PRD-001／ADR-001 曾規劃「ADO 建置 Astro → FTP → 暫時網域 → 正式站」與 18 個 Astro URL；此規劃未用於實際上架，也不再是操作手冊。自動清空遠端、移除 WordPress 後上傳 `dist/` 的舊指示已撤除。歷史背景見 [ADR-001](../../adr/ADR-001-astro-react-islands-hostinger.md) 與 [Phase A 紀錄](../../migration/phaseA-log.md)；未來要啟用 Astro 部署或改變舊站退役界線，須在具體授權範圍內重新核對視覺、語言、路由、相依素材與備份／還原。
