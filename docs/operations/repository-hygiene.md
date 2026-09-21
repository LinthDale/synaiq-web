# Repo 保留與清理規則

## 保留範圍

| 類別 | 路徑 | 處理方式 |
|---|---|---|
| 正式網站 | `docs/design/live-prototype/`、其引用的 `public/brand/` | 以預覽／發布白名單及實際引用為準，修改後驗證 |
| Astro 基礎 | `src/`、設定、遷移工具與測試 | 仍有建置與 CI 依賴；未上線不等於無用，整套退役需另行決策 |
| 規格 | `docs/prd/`、`docs/adr/`、`docs/migration/` | 保留需求與測試來源；查現況使用文件索引 |
| 歷史記錄 | `docs/archive/` | 僅供追溯，不當作目前操作指令 |
| 本機依賴／產物 | `node_modules/`、`dist/`、`.astro/`、`.tmp/` | 可由安裝、建置、預覽或測試再生；有程序使用時不移除 |
| 憑證／私人輸入 | 忽略的環境檔、私人參考圖片 | 不列印、不提交、不公開；不因沒有程式引用便刪除 |

## out/ 保留界線

`out/` 不進 Git，但不是垃圾桶。不要改動既有證據內的路徑，也不要批次刪除所有 ignored 檔案。

- **發布與回退**：`synaiq-release-*`、`synaiq-deploy-*`、`synaiq-address-*`、`hostinger-about-maintenance-*`、`site-consolidation-*`。保存原始 artifact、manifest、路由前後副本與驗證結果；新發布另建目錄。
- **使用者交付**：`team-portraits/`、`team-deck-*`、`kip-demo-mp4-*`。保留生成圖、簡報、影片及提示詞；不能從 Git 還原。
- **比較基準與來源**：`approved-demo-*`、`booth-baseline/`、`motion-baseline/`、`legacy-case-assets-*`、`site-pages-archive/` 等。先查相關維護指南與生成腳本，確認來源仍在，再決定是否移除。
- **其他實驗／驗證**：CSS、字型、動態與產品畫面的輸出。可先整理索引；只有確認可再生且不作基準後，才刪除具體檔案。

一次性清理的機器清單存入對應的 `out/repo-cleanup-*/`，不要把輸出與一次性腳本加入公開發布白名單。

## 2026-09-14 整理結果

盤點時 `out/` 有 2,958 檔、約 738 MB；`public/` 約 59.8 MB，`dist/` 約 60.2 MB。這些數值為清理前快照。

本次移除 9 個無執行期引用的受版控檔案，共 35,858,214 bytes（約 34.2 MiB）：

- 未引用的 `NotoSansCJKtc-Medium.otf`、`synaiq-logo-dark.svg`。
- 未引用的 `duoduo-cutout.png`、`wally-2-cutout.png`、`wally/wally-2-hero.png`。
- 前身框架樣板 `public/file.svg`、`public/globe.svg`、`public/window.svg`。
- 未使用的 `live-prototype/vite.config.mjs`；現行預覽由 `share-preview.mjs` 啟動。

6 份歷史文件移至 `docs/archive/`，部署指南另拆出 9/11 歷史。同步修正 Markdown 連結，精簡日常索引。正式站來源與素材白名單未改，Astro 保留，發布備份及新團隊圖片保留。沒有更新官網或主機內容。

精確清單與 SHA-256：`out/repo-cleanup-20260914/plan.json`；文件原文：同目錄 `docs-before.json`。刪除檔案可從清單中的 `baseCommit` 個別取回；還原前先確認目標路徑沒有新修改，不對整個工作區執行 reset／clean。

