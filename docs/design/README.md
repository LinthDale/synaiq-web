# 官網設計維護入口

最後更新：2026-09-09。

目前唯一採用的網站設計是 [live-prototype](live-prototype/README.md)，包含已上線的 Home／KIP 中英雙語版。風格已選定，不再等待三案、首頁 A／B 或字型比較。

## 保留的內容

| 路徑 | 用途 |
|---|---|
| [live-prototype/](live-prototype/README.md) | 核准版型、樣式、手繪素材、品牌化 Demo、預覽工具與測試 |
| [語言與 Logo 維護指南](live-prototype/localization-and-brand-guide.md) | 中英文、後續語言擴充與共用 Logo 更新 |
| [內容出處](live-prototype/content-sources.md) | 文案與引用來源，不是額外的對外產品承諾 |
| [KIP 簡報摘錄](kip-deck-extract.md) | 產品資料的原始來源快照，不作為現行版型或待決清單 |

目前配色與字級以 `live-prototype/` 實際載入的 CSS 為準；展示字採 Newsreader＋Noto Serif TC，產品照片保留原色。不要用 Astro Phase A 的中性樣式替換已核准的設計。

## 清理與歷史查閱

依業主 2026-09-09 指示，移除舊三案提案、首頁 A／B 畫板、wireframe v1／v2、灰階素材與渲染圖、字型比較、首屏候選文案、舊設計語言／token 草稿及舊版素材缺口清單。

共移除 87 個檔案，約 32.1 MiB，包含 `out/repo-consolidation-20260908/bootstrap-local/` 的 4 張重複線框輸出。全部移至 Windows 回收筒；其中 62 個版控檔亦可在 Git commit `428c053ace85de4345ee255fd7e1a8acd28fa779` 查閱。這些不再是待選項目或實作閘門；PRD 的歷史需求不代表目前網站已實作所有功能。

本次不修改網站執行檔、正式素材、Astro 程式、Token、部署包、還原包或正式站。[上架／還原入口](../operations/deploy-hostinger.md) 保持有效。

## 本次清理驗證

- `npm run test:all`：111 通過、1 個既有 Windows symlink 權限測試略過；Astro 建置 19 頁。
- `npm run check`：61 個檔案，0 errors／warnings／hints。
- 檢查 54 份 Markdown 的 141 個相對連結，無新增斷鏈；1 個既有歷史缺失不在本次清理範圍。
- `git diff --check` 通過；現行 runtime、`src/`、`public/`、`scripts/` 與測試無變動，獨立清理審查通過。
- 本次沒有重新部署或進行瀏覽器視覺驗收。
