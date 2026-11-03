# /auth 入口交接

用途：預留 `https://taistro.com.tw/auth` 給工程師後續串接服務。本次只建立可連線的靜態準備頁；沒有實作登入、帳號、資料庫或驗證 API。

## 網址與 Hostinger 位置

- 正式網址：`https://taistro.com.tw/auth`，`/auth/` 亦支援。
- 網址類型：主網域下的路徑，不是 `auth.taistro.com.tw` 子網域；不需新增 DNS 或獨立 SSL 憑證。
- Hostinger 帳戶：`u235694681`，既有網站管理識別仍為 `synaiq.com`，正式公開網域為 `taistro.com.tw`。
- 原始碼：`docs/design/live-prototype/auth/index.html`。
- 主機檔案：`public_html/<目前 release>/auth/index.html`。目前 release 以 `public_html/.htaccess` 的首頁規則及 `public_html/00-SYNAIQ-START-HERE.txt` 為準，每次部署會更換。
- 主機 `public_html/.htaccess` 的 `RewriteRule ^auth/?$ /<目前 release>/auth/index.html [L]` 提供入口；實作來源是 `scripts/hostinger/core.mjs`。

## 工程師接續方式

1. 先讀 [官網更新入口](WEBSITE-UPDATE-README.md)。修改上述原始碼，將新靜態資源逐一加入 `docs/design/live-prototype/share-preview.mjs` 的 `PUBLIC_FILES` 來源白名單。
2. 執行 `npm run test:deploy`、`npm run test:design` 與 `git diff --check`，提交後推送 GitHub `main`（`git push github main`），由 Actions 部署到 Hostinger。
3. 確認 Actions 成功，再以正式 HTTPS 網址驗證。不要直接修改受 CI 管理的 release 或 `.htaccess`，否則下次部署會因內容／路由差異停止。

目前只開放 `/auth` 與 `/auth/`；`/auth/callback`、API 與其他子路徑尚未設定。需要正式登入、OAuth callback、反向代理或外部服務轉址時，請先確認服務位置與回呼路徑，再更新路由及相應測試。準備頁設有 `noindex, nofollow`，不列入 sitemap。

## 發布證據

發布完成後以 [部署紀錄](deploy-hostinger.md) 的 2026-11-03 `/auth` 紀錄為準；需包含正式網址 HTTP 狀態、來源 commit、Actions run 與主機目錄。
