# Hostinger 操作索引與部署界線

最後更新：2026-09-08。

## 目前線上版本

`synaiq.com` 已使用 commit `752008b` 的 `docs/design/live-prototype/` 封裝版本，包含核准的 Home／KIP 中英雙語設計。它是客戶端渲染的靜態網站，**不是** `src/` 的 Astro Phase A `dist/`。

實際上架、已執行的 smoke checks、備份限制與路由內容，見 [2026-09-08 部署紀錄](deployment-synaiq-com-2026-09-08.md)。這份部署紀錄保持原始操作事實；repo 整併不會重新執行上架。

| 位置 | 用途 |
|---|---|
| `C:\Users\User\synaiq\synaiq-web\docs\design\live-prototype\` | 現行核准設計來源 |
| `C:\Users\User\synaiq\synaiq-web\out\synaiq-deploy-20260908\` | 本機 release 目錄、ZIP、SHA-256 manifest 與完整操作手冊；不進 Git |
| `C:\Users\User\Documents\synaiq-web\SynaiQ-網站上架與還原操作手冊-20260908.md` | 使用者保留的上架／還原手冊；歷史舊 repo 路徑須對照新的唯一工作目錄 |
| Hostinger `public_html/synaiq-release-20260908/` | 已上架的版本目錄 |
| Hostinger `backup-synaiq-20260908/.htaccess` | 上架前的路由備份，位於公開目錄外 |

正式站透過 `public_html/.htaccess` 的標記區塊，把 `/` 與 `/home.html` 內部轉交到上述版本。既有 WordPress 檔案、`home.html` 及 `wp-content` 均保留；部分公開圖片仍依賴舊素材路徑。`synaiq-ai.com` 與其產品服務不在這次上架／整併範圍。

## 還原與後續發布

完整人工操作步驟見上表的本機手冊，以及 [部署紀錄的 Routing and rollback](deployment-synaiq-com-2026-09-08.md#routing-and-rollback)。本次 repo 整併沒有執行還原演練，也沒有建立新的整站或資料庫備份。

- 還原此次入口切換時，只處理 `BEGIN SynaiQ release 20260908`／`END SynaiQ release 20260908` 的標記路由；保留原有及後來新增的其他設定。
- 若要整份還原 `.htaccess`，先確認上架後沒有其他需要保留的變更。
- 路由仍指向新版時，不可移除其版本目錄。保留舊站檔案不等於已完成可還原的全站備份。
- 下次發布需另行核准，使用新的版本目錄、重新封裝對應資源路徑，先驗證直接網址及回退方案，再切換入口。
- 不可將整個 repo、測試、設計文件、私人參考素材或本機工具公開上傳。

## ADO 管線現在只做驗證

[`azure-pipelines.yml`](../../azure-pipelines.yml) 為人工觸發的建置、測試及 artifact 發布管線；不再使用 FTP 變數群組、部署環境或正式站上傳階段。推送／合併 `main` 不會依此 YAML 自動發布網站。

`npm run build` 的 `dist/` 是 Astro Phase A 的檢驗產物。Phase A 基礎與核准設計雖位於同一 repo，尚未完成兩者的視覺與內容整合；不能把這個 artifact 當成現行正式站版本。執行入口見 [根 README](../../README.md)。

## 已封存的 Phase A 部署計畫

早期 PRD-001／ADR-001 路徑 A 規劃過「ADO 建置 Astro → FTP 上傳 → 暫時網域驗證 → 正式站切換」，並列出 18 個 Astro 內容 URL。**該規劃沒有用於本次實際上架，也不再是可執行操作手冊。** 原先自動清空遠端目錄、移除 WordPress 後上傳 `dist/` 的指示已撤除。

架構決策仍可查閱 [ADR-001](../adr/ADR-001-astro-react-islands-hostinger.md) 與 [Phase A 紀錄](../migration/phaseA-log.md)。若未來要啟用 Astro 部署或退役 WordPress，必須另行確認核准視覺、語言與路由完整性、舊站相依素材、備份／還原驗證及具體切換授權；不能從 Git 合併或本文件推定已獲准。
