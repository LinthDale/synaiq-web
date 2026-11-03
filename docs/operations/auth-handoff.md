# auth.taistro.com.tw

- 網址：`https://auth.taistro.com.tw/`
- Hostinger 網站：`synaiq.com`，子網域掛在 `taistro.com.tw` 下。
- 檔案位置：`public_html/auth/`
- 完整路徑：`/home/u235694681/domains/synaiq.com/public_html/auth/`
- DNS：`auth` → `auth.taistro.com.tw.cdn.hstgr.net.`，Hostinger 管理，TTL 300 秒。
- SSL：由 Hostinger 自動簽發及續期。

2026-11-03 已驗證公開 DNS 與 HTTPS 200，網址保持 `auth.taistro.com.tw`。部分網路可能仍有舊 DNS 快取。

## 接續方式

1. 功能放在 Hostinger：確認所需執行環境受方案支援，再將程式部署到 `public_html/auth/`。這個目錄不走官網的 release／GitHub Actions 流程。
2. 功能放在其他主機：提供目的 IP 或主機名稱，調整 `auth` 的 DNS，並在目的服務綁定 `auth.taistro.com.tw` 及 HTTPS。後端不用上傳 Hostinger。
3. 登入網址與 callback 使用 `https://auth.taistro.com.tw/` 下的實際路徑。

目前只建立子網域，沒有登入或驗證功能。目錄內的 `default.php` 是 Hostinger 預設頁。先前準備的 `taistro.com.tw/auth` 不作為後續服務入口。

設定與驗證紀錄：`out/auth-subdomain-20261103/`。官網發布紀錄另見 [部署紀錄](deploy-hostinger.md)。
