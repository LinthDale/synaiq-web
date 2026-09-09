# synaiq.com 舊站下架紀錄 — 2026-09-09

狀態：**已完成正式站下架**，2026-09-09 12:13（Asia/Taipei）。

使用者要求移除舊 `home.html`，並巡查及下架 `/en/媒體中心/`、`/en/wally-系列/`、`/wally-2/` 等殘留網站。
操作只限 **synaiq.com / Hostinger 帳戶 u235694681**；未改 DNS、未動 `synaiq-ai.com` 的產品服務、資料庫或憑證。

## 實際變更

- 把 `public_html/.htaccess` 改為核准静態網站的路由白名單；移除舊 WordPress fallback 和舊外掛路由，關閉該站的 LiteSpeed 公開／私人頁面快取查找。
- `/` 繼續內部載入 `/synaiq-release-20260908/index.html`，Home／KIP 中英 query routes 保持原狀。
- `/home.html` **301** 到 `https://synaiq.com/`；原 query string 保留。實體 `public_html/home.html` 已刪除，不只是藏起舊網址。
- 新版 release 的 HTML、CSS、JS、assets／brand 圖片保持可讀；新版使用的 `wp-content/uploads/2026/03/toutou-2.png` 亦保留。
- 其餘舊路徑回傳 **410 Gone**，包含中英舊產品／媒體／聯絡／結帳頁、WordPress 登入／REST API／feed／舊 sitemap 等。未列入保留清單的新 URL 也會回傳 410；未來新增頁面或發布新 release 時必須同步調整路由。
- `.well-known/acme-challenge/` 與 `.well-known/pki-validation/` 的驗證檔路徑仍可由主機處理。

**WordPress 程式與資料庫沒有整批刪除。** 它們已無對外頁面入口；保留它們不等於已建立全站／資料庫備份。這次實體刪除的遠端檔案只有 `home.html`，精確副本留在下表的本機路徑。

## 切換與驗證

1. 唯讀列出根目錄 27 個項目、新版 release 39 個項目（36 個檔案與 3 個目錄）。核對切換前沒有其他新增／改變的項目。
2. 透過舊 sitemap 得到 11 個非首頁路徑，再涵蓋英文 counterparts 與管理／API／舊索引入口，共檢查 36 個路徑；操作前其中 31 個仍為 HTTP 200。
3. 備份 `.htaccess` 與 `home.html`，確認完整位元組數及 SHA-256。路由規則測試 4/4 通過，獨立安全／程式審查 APPROVE。
4. 透過 Hostinger 官方 API 取得短期 File Browser session，將候選路由上傳到指定暫存檔；核對 hash 後 rename 到 `.htaccess`。未把 repo、測試、憑證或私人素材上傳。
5. 核對 **41 個保留頁面／資產全部 HTTP 200、位元組數和 SHA-256 均與切換前一致**，36 個舊路徑全部 HTTP 410，兩個 `home.html` 測項回 HTTP 301 後，才刪除實體舊首頁。
6. File Browser 隨後讀取 `/public_html/home.html` 回 404，確認不是只有 HTTP 路由遮擋。
7. 獨立 Chromium `149.0.7827.55` 瀏覽器檢查：Home／KIP × 繁中／英文 × 390／1440px 共 8 組通過；主標與目前頁面狀態正確、所有圖片載入、無水平溢出，手機目錄與 Escape 正常，無 JavaScript pageerror。
8. 使用者提供的三個精確網址再次確認 410；`www` 首頁 200、`www/wally-2/` 410；HTTP 舊頁先 301 到 HTTPS，再由退役規則處理。不存在的憑證驗證測試路徑回 404 而非被退役規則攔成 410。

原本上線的 release 檔案完全未替換。另一次 CSS 收斂只修改本機 `docs/design/live-prototype/`，仍未部署，不要把本紀錄理解為 CSS 整理版已上線。

## 備份與證據

以下路徑皆位於唯一 repo `C:/Users/User/synaiq/synaiq-web/` 的 ignored `out/`，不公開、不進 Git：

| 路徑（相對 repo） | 內容 |
|---|---|
| `out/site-consolidation-20260909/remote-before/.htaccess` | 本次切換前的完整路由，1,662 bytes |
| `out/site-consolidation-20260909/remote-before/home.html` | 已刪除實體舊首頁的精確副本，53,270 bytes |
| `out/site-consolidation-20260909/retired-site.htaccess` | 本次已套用的新路由 |
| `out/site-consolidation-20260909/preflight.json` | 操作前的資產 hash 與舊路徑 HTTP 狀態 |
| `out/site-consolidation-20260909/retirement-result.json` | 成功事件、刪除對象、新舊 hash、41 個保留檔與 36 個下架路徑的結果 |
| `out/site-consolidation-20260909/public-*-after.json` | 切換後的逐路徑／逐檔案結果 |
| `out/site-consolidation-20260909/production-browser.json` | 8 組正式站瀏覽器檢查 |
| `out/site-consolidation-20260909/final-alias-check.json` | 精確舊 URL、www、HTTP 與憑證路徑的最後核對 |
| `out/site-consolidation-20260909/retire-legacy.mjs` | 本次專用操作腳本；預設唯讀，但已完成後不要重新執行 `--apply` |

| 檔案 | SHA-256 |
|---|---|
| 切換前 `.htaccess` | `3409f82f54a6b62711c0bb788749793cdd17587bf235e4f41503ea020cad64c1` |
| 已生效 `.htaccess` | `e8a7aa53fa884e3061b26f155f2938bb6a8ba7e8f4005ad0d3efc5c5a594c7e3` |
| 已備份並刪除 `home.html` | `b3a114d75ee20ec56f307c322236b15127ab125a6d75868f892bcb2db9adae64` |

## 還原界線

還原本次下架會重新開放舊 WordPress 網站，**需要另外確認是否真的要恢復舊站**，不要當成一般發布步驟。

1. 確認目前 `.htaccess` hash 仍等於上表「已生效」值；有後續變更時不可整份覆蓋。
2. 若要完整回到操作前狀態，先從上述本機精確副本還原 `public_html/home.html`。若目的地已出現新檔，先停止核對，不可直接覆蓋。
3. 上傳本次切換前的 `.htaccess` 到另一個暫存檔，核對 SHA 後 rename 取代目前路由；不要誤用 9 月 8 日「第一次上架前」的更早路由備份。
4. 重新驗證 root／www／Home／KIP、素材，以及這次刻意恢復的舊站 URL。新版 release 仍保留，沒有必要重新上傳或刪除。

本次沒有實際執行還原演練；已保留精確備份、路由切換前後的 hash 防護，以及回應逾時時重新核對遠端狀態的程序。
