# auth.taistro.com.tw

- 網址：`https://auth.taistro.com.tw/`
- 伺服器 IP：`114.35.86.211`
- DNS：Hostinger 管理，`auth` 的 A 記錄為 `114.35.86.211`，TTL 300 秒。
- auth 的 Hostinger CDN 已關閉，舊 Hostinger IPv6 記錄已移除。
- 設定位置：Hostinger → Domains → `taistro.com.tw` → DNS / Nameservers，搜尋 `auth`；[直接開啟 DNS 管理](https://hpanel.hostinger.com/external-domain/taistro.com.tw/dns?tab=dns_records)。

2026-11-03 已確認 Cloudflare 公開 DNS 回傳 `114.35.86.211`。目標主機目前只提供 `synaiq-ai.com` 憑證，`auth.taistro.com.tw` 的 HTTPS 尚未通過。

## 接續方式

1. 在 `114.35.86.211` 的 Web server 加入 `auth.taistro.com.tw`，將請求送到實際登入服務。
2. 為 `auth.taistro.com.tw` 安裝 HTTPS 憑證並設定續期。
3. 部署功能、設定登入與 callback 路徑，再測試正式網址。程式不用上傳 Hostinger。

2026-11-04 依使用者要求，已移除 Hostinger 的 `auth.taistro.com.tw` 子網站，Websites 清單不再顯示它。DNS A 記錄保留，Google／Cloudflare 均重新確認為 `114.35.86.211`；其他 DNS、網站及官網控制檔核對不變。Hostinger 刪除子網站後仍保留原 `public_html/auth/` 目錄與預設頁，已備份，該目錄不再綁定 auth 網域。認證程式部署在外部 IP；Hostinger 的憑證不會自動安裝到外部主機，`taistro.com.tw/auth` 也不作為後續服務入口。

移除與驗證紀錄：`out/auth-hosting-cleanup-20261104/`，包括刪除回應、前後 DNS／網站清單、預設頁備份及 `verification.json`。

設定與驗證紀錄：`out/external-auth-portal-dns-20261103/`；先前 Hostinger 設定保留於 `out/auth-subdomain-20261103/`。官網發布紀錄另見 [部署紀錄](deploy-hostinger.md)。

## PVsim

`portal.pvsim.com.tw` 也已設為 A → `114.35.86.211`，TTL 300 秒；Cloudflare 公開 DNS 已確認，其他 DNS 快取可能尚未更新。

| 網址路徑 | 功能 |
|---|---|
| `https://portal.pvsim.com.tw/trial/` | PVsim 試用版 |
| `https://portal.pvsim.com.tw/download/` | PVsim Pro 下載 |
| `https://portal.pvsim.com.tw/form/` | PVsim 表單 |
| `https://portal.pvsim.com.tw/purchase/` | PVsim 購買（待工程師建立購買流程） |

工程師在 `114.35.86.211` 設定上述四個路徑。2026-11-04 使用者新增 `/purchase/`，並明確指定由工程師建立購買流程；購買方案、金流及訂單處理由工程師接續，尚未部署購買功能。沿用既有 portal DNS，不需要在 Hostinger 另外建立網站、DNS 記錄或 Redirect。

2026-11-04 13:58（Asia/Taipei）以 Cloudflare DNS 解析到 `114.35.86.211`，正常驗證 HTTPS 後，`https://portal.pvsim.com.tw/purchase/` 回應 404。這次連線的 TLS 驗證已通過，但購買頁尚未建立；其他三個功能路徑沒有在本次重測。證據：`out/portal-purchase-20261104/inspection.json`。

`pvsim.com.tw` 仍由中華電信註冊，DNS 已委派至 Hostinger：`pixel.dns-parking.com`、`byte.dns-parking.com`。2026-11-04 已將主網域連接至原 `aquamarine-ibex-708690.hostingersite.com` WordPress 網站；portal 功能仍部署於 `114.35.86.211`。

連接前，原空白站只有 `default.php`（42,559 bytes），已下載備份；先改用 `blue-cobra-562163.hostingersite.com` 釋放正式網域，再連接 WordPress。使用者後續明確確認永久刪除空白站，Hostinger 清單與 API 已確認該站移除，WordPress 保留。

Hostinger 更換網域時移除了舊 DNS 區域；未綁定時復原請求回應 404，保留失敗證據。連接 WordPress 後 DNS 區域重新建立，已復原 `portal` A → `114.35.86.211`（TTL 300）、原 DKIM 與 DMARC；MX、SPF 等郵件紀錄保持原值，主網域／www 由 Hostinger CDN 接到 WordPress。

操作中誤將產品頁 PVsim（1860）設成首頁，使用者已自行改回原「01-首頁」（626）。最後唯讀核對 `https://pvsim.com.tw/` 為 HTTPS 200、沒有轉址，HTML 為 page-id-626。**另曾誤將產品頁 1860 的上層從 1511 改為 0，產品頁網址因此成為 `/pvsim/`；使用者表示已修正首頁後，未再變更頁面，此上層欄位尚未還原。**後續不得再把產品頁設為首頁，也不能默認上述上層調整已獲使用者接受。

本次備份及驗證：`out/pvsim-domain-20261104/`，包括 `wordpress-before.xml`、空白站檔案／SHA-256、前後 DNS／網站清單、`verification-after-user-home-fix.json` 及完成畫面。WordPress XML 是內容匯出，不是完整資料庫／檔案備份。主網域連接不代表 portal 購買流程或通知寄信已驗收。

## 通知寄信

使用者回報 PVsim 使用 Hibox 的 `service@taistro.com.tw` 寄信，帳號可登入及寄出，但 Gmail 沒收到，網站沒有顯示錯誤。這是使用者回報，尚未以實際郵件或 Hibox 寄送追蹤確認送達狀態。

2026-11-04 14:32（Asia/Taipei）已在 Hostinger → Domains → `taistro.com.tw` → DNS / Nameservers，將唯一一筆 `@` TXT SPF 更新為：

```text
v=spf1 include:_spf.mail.hostinger.com include:hibox.hinet.net ~all
```

保留原 Hostinger 授權，加入 Hibox 官方 `include:hibox.hinet.net`；TTL 保持 3600 秒，依當時 include 展開計算共 4 個 DNS 查詢機制。其餘 DNS（包含 MX、DKIM、DMARC、auth 及網站記錄）前後比對相同。這次只補寄信授權，沒有切換收信主機。

14:33 重新讀取 Hostinger 確認新值已儲存，但 Google／Cloudflare 仍回傳舊 SPF，快取剩餘約 3556 秒；公開解析與實際 Gmail 收信仍待驗證。不能只憑補上 SPF 就認定通知已恢復，或認定缺少 SPF 是這次未送達的唯一原因。

目前 `taistro.com.tw` 的 MX 仍為 Hostinger：`mx1.hostinger.com`（5）、`mx2.hostinger.com`（10）。使用者已釐清，本次只要使用 `@taistro.com.tw` 公司信箱透過 Hibox 寄信給 Gmail，因此不處理 MX 收信切換，也不需要先決定公司信箱搬遷或到中華電信更換名稱伺服器。14:37 重新核對 Hostinger 已保留新 SPF、MX 與原值相同；Google／Cloudflare 公開查詢仍是舊 SPF，尚待同步及原網站重寄測試。

工程師接續：待新 SPF 公開解析後，以原 PVsim 通知流程重寄 Gmail，保存 Message-ID 與 SMTP／Hibox 寄送追蹤結果，核對 Gmail 收件匣及垃圾郵件。若仍未收到，依退信或投遞紀錄檢查實際寄件 IP、MAIL FROM／From 網域，以及 Hibox DKIM 簽章與網域對齊。不得以「網站沒有顯示錯誤」代替收件驗證。

前後 DNS、驗證、回復用請求與公開查詢結果保存在 `out/hibox-spf-20261104/`。參考：[Hibox 官方 DNS 設定](https://w3.hibox.hinet.net/iwc_static/c11n/allDomain/layout/login/en-us/QA_support.html)、[Gmail 寄件者指南](https://support.google.com/mail/answer/81126?hl=zh-Hant)。
