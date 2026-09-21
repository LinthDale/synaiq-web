# 官網發布入口

處理本專案網站更新、commit／push、Hostinger 上架或回退時，先讀取 [WEBSITE-UPDATE-README.md](WEBSITE-UPDATE-README.md)。即時版本以主機 `.htaccess` 為準，歷史紀錄在 [部署指南](docs/operations/deploy-hostinger.md)。

- 使用者明確要求上架時，正常發布步驟已在其授權範圍內，不要逐階段重問「是否繼續」。
- 遵守目前執行環境的權限要求；本文件不取代沙箱／網路核准，不允許繞過拒絕。
- 只要求文件、分析或預覽時，不自動部署。
- 官網來源是 `docs/design/live-prototype/`，不是 Astro `dist/`。Git push 不會自動上架。
- 現有 `out/` 發布腳本綁定歷史版本且不進 Git；依 README 準備新目錄與參數，不能原地重跑舊發布。
- 保留其他人的修改與所有發布／回退證據；完成需包含正式網址驗證及維護紀錄同步。
