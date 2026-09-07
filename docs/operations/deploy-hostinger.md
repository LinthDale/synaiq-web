# Hostinger 部署手冊（PRD-001 FR-109）

管線檔：[`../../azure-pipelines.yml`](../../azure-pipelines.yml)　決策依據：[ADR-001](../adr/ADR-001-astro-react-islands-hostinger.md) 部署路徑 A。

站台是純靜態 `dist/`。Hostinger 不執行 build，所以 **build 在 Azure DevOps 完成，只把 `dist/` 上傳**。
先在暫時網域 `*.hostingersite.com` 驗證，通過後才切 `synaiq.com`。

---

## 1. 前置作業（業主）

### 1.1 取得 FTP 資訊

hPanel → 左側 **Websites** → 選擇網站 → **Files** → **FTP Accounts**。
該頁會列出：

| 欄位 | 對應的管線變數 |
|---|---|
| FTP hostname / IP | `HOSTINGER_FTP_HOST` |
| FTP username | `HOSTINGER_FTP_USER` |
| 密碼（可在同頁 **Change account password** 重設） | `HOSTINGER_FTP_PASSWORD` |
| 目錄（通常 `public_html`） | `HOSTINGER_REMOTE_DIR` |

Hostinger 的 FTP 支援 FTPS（顯性 TLS），管線的 `serverUrl` 已用 `ftps://`。

### 1.2 建立 ADO 變數群組

Azure DevOps → **Pipelines → Library → + Variable group**，名稱必須是 **`synaiq-web-hostinger`**，
加入上表四個變數：

- `HOSTINGER_FTP_PASSWORD` 一定要按鎖頭圖示標記為 **secret**。
- `HOSTINGER_REMOTE_DIR` 建議勾選 **Settable at queue time**，這樣 staging 與正式站
  可以在執行時輸入不同目錄，不必改群組。
- 群組建立後按 **Pipeline permissions**，授權給本管線。

> 密鑰一律不進 repo。任何情況下都不要把這四個值寫進 `azure-pipelines.yml` 或任何檔案。

### 1.3 建立環境（核准關卡）

Pipelines → **Environments** → 新增 `synaiq-web-staging` 與 `synaiq-web-production`。
在 `synaiq-web-production` 加 **Approvals and checks → Approvals**，指定核准人。
之後任何一次正式站部署都會停在核准畫面等人按同意。

---

## 2. 首次 staging 部署

> **重要**：暫時網域 `*.hostingersite.com` 現在是一個空白 WordPress。
> 管線的 `clean: true` 會在上傳前清空遠端目錄，**那個空白 WordPress 會被整個覆蓋掉**。
> 這是預期行為（業主已確認），但請先確定該網域上沒有任何要保留的東西。

1. 把 `HOSTINGER_REMOTE_DIR` 設成暫時網域對應的目錄
   （hPanel 的 Websites 清單會顯示每個網站的根目錄，通常是
   `domains/<暫時網域>/public_html`，主網站則是 `public_html`）。
2. Pipelines → 選 `synaiq-web` 管線 → **Run pipeline**：
   - Branch：`main`
   - 參數 `target`：`staging`
3. 等 `build` 階段綠燈（`npm ci` → `npm run build` → `npm test`）。
   任一步紅燈就停下修正，**不要**手動上傳繞過。
4. `deploy` 階段完成後，打開暫時網域首頁確認。

## 3. 驗證清單（18 個 URL）

把 `<base>` 換成當次部署的網域（staging 是暫時網域，正式站是 `https://synaiq.com`）。

| # | zh-Hant | # | English（draft） |
|---|---|---|---|
| 1 | `<base>/` | 10 | `<base>/en/` |
| 2 | `<base>/about/` | 11 | `<base>/en/about/` |
| 3 | `<base>/products/` | 12 | `<base>/en/products/` |
| 4 | `<base>/wally/` | 13 | `<base>/en/wally/` |
| 5 | `<base>/knowledge-base/` | 14 | `<base>/en/knowledge-base/` |
| 6 | `<base>/generative-ai/` | 15 | `<base>/en/generative-ai/` |
| 7 | `<base>/agi/` | 16 | `<base>/en/agi/` |
| 8 | `<base>/media/` | 17 | `<base>/en/media/` |
| 9 | `<base>/contact/` | 18 | `<base>/en/contact/` |

每個 URL 要確認：

- HTTP 200，不是 404、也不是 WordPress 的頁面。
- HTTPS 正常、瀏覽器沒有「不安全」警示。
- 開發者工具 Console 與 Network 沒有 mixed content 警告（站內零 `http://` 依賴，
  這點由 `npm test` 先擋過一次）。
- 圖片沒有破圖。

另外 `<base>/sitemap-index.xml` 與 `<base>/styleguide/` 也要能開；
`/styleguide/` 是內部參考頁，標 `noindex` 且不在 sitemap 內。

> 若 Hostinger 沒有自動把 `/about/` 對應到 `/about/index.html`，
> 在遠端目錄放一個 `.htaccess` 補上 `DirectoryIndex index.html` 即可
> （Astro 已設 `trailingSlash: 'always'` + `build.format: 'directory'`，路徑結構就是為此）。

## 4. 切換 `synaiq.com`（正式站）

`synaiq.com` 現在跑的是 WordPress，切換等於**用靜態站取代整個 `public_html`**。

1. **備份現行 WordPress（必做，不可跳過）**
   - hPanel → **Files → Backups** → 對 `synaiq.com` 產生一份新備份，並下載到本機。
   - 另外 hPanel → **Databases → phpMyAdmin** → 匯出該站資料庫 SQL，一起留存。
   - 兩份檔案存檔並記錄日期，這是唯一的回滾來源。
2. 確認 staging 的 18 個 URL 全數通過（§3）。
3. 選擇低流量時段，通知業主開始切換。
4. Run pipeline：
   - 參數 `target`：`production`
   - `HOSTINGER_REMOTE_DIR`：`public_html`（正式站根目錄）
5. 在 `synaiq-web-production` 環境按下核准。
6. 管線的 `clean: true` 會清空 `public_html` 後上傳 `dist/`
   —— **WordPress 檔案會在這一步被刪除**，所以第 1 步的備份必須先完成。
7. 依 §3 對 `https://synaiq.com` 再跑一次 18 個 URL 驗證。
8. Google Search Console 重新提交 `https://synaiq.com/sitemap-index.xml`。

## 5. 回滾

| 情況 | 做法 |
|---|---|
| 新版靜態站有問題，但舊 WordPress 已不需要 | 在 ADO 找到上一次成功的執行 → **Run pipeline** 重跑該 commit，或直接 `git revert` 後推 `main` |
| 需要退回 WordPress | hPanel → **Files → Backups** → 選切換前那份還原；資料庫用 phpMyAdmin 匯入備份 SQL |
| 只是想暫停對外 | hPanel 的網站設定可先指向維護頁；靜態站沒有伺服器端邏輯，不會有半套狀態 |

還原後務必再跑一次 §3 的 18 個 URL。

## 6. 尚未確認的事項

- **CDN**：Hostinger 若啟用 CDN，部署後可能需要清快取。業主尚未確認方案是否含 CDN。
- **SSH**：若之後開通 SSH，可改用 `rsync` 取代 FTP（更快、支援差異同步），需另開 ADR。
- **安全標頭**：HSTS、CSP、`X-Content-Type-Options`、`Referrer-Policy` 在共享主機上
  要靠 `.htaccess` 設定，屬於 PRD-Guideline-Web §4 的基準線，本階段未實作。
