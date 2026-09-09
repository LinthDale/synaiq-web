# PRD-003：核准視覺與維護範圍

| 版本 | 狀態 | Owner | ADO Feature | 最後更新 |
|---|---|---|---|---|
| v0.4 | 視覺已採用；實作驗收依執行層分開記錄 | Dale | [#1298](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1298) | 2026-09-09 |

## 1. 現行基線

唯一視覺依據是 [live-prototype](../design/live-prototype/README.md)。Home／KIP 中英雙語設計已採用並上線；紙色、墨色、橄欖綠、手繪、撕紙邊界與品牌化產品動畫，以該目錄實際載入的檔案為準。

不再要求三案擇一、首頁 A／B 擇一或重新比較字型。舊稿與 token 草稿已依業主要求清理，見 [設計維護入口](../design/README.md)。

## 2. 範圍與界線

- 執行檔：`docs/design/live-prototype/` 的 HTML、CSS、JavaScript、語系檔與核准素材，以及引用的 `public/brand/` 素材。
- 展示字：Newsreader＋Noto Serif TC。中英文沿用同一套設計，分別驗證流體排版。
- 首頁使用背景式手繪、知識敘事、產品揭露、模擬滑鼠點擊／內容出現動畫；不是實際連線產品的操作 Demo。
- KIP 架構卡採正常文件流，不恢復已否決的釘住捲動空間。
- Astro Phase A 位於 `src/`，尚未套入核准設計；移植需要獨立驗收，不能用中性樣式或中文佔位英文版替換正式站。
- 本次整理不修改正式網站、不切換執行層、不新增產品承諾。

## 3. 原 FR 對應

保留需求編號供 ADO 追蹤；本表不表示遠端工作項目已更新或品質門檻已全數通過。

| FR | 現行處置 |
|---|---|
| FR-301 色彩 | 維護核准版 CSS；Astro token 移植未完成，不採用已移除的候選 token |
| FR-302 字級 | 展示字已選定；修改後驗證中英文桌機、窄幅與中間寬度 |
| FR-303 元件 | 以核准版 Home／KIP 共用導覽、頁尾、按鈕與紙張視覺為依據 |
| FR-304 Logo | 採共用 `brand.js` 與核准 CIS 明暗底素材，見 [Logo 指南](../design/live-prototype/localization-and-brand-guide.md) |
| FR-305 對比 | 完整 AA、Lighthouse 與跨裝置驗收仍需實測，不以本次清理宣稱完成 |
| FR-306 動畫 | 保留模擬滑鼠點擊、答案／出處揭露、暫停／重播、減少動態與離屏暫停行為 |
| FR-307 方向選擇 | 已由核准版取代；移除三案與首頁 A／B 擇案閘門，不重新提案 |

## 4. 品質要求

NFR 依 [PRD Guideline](../guidelines/PRD-Guideline-Web.md) §4。檢查可及性、對比度、流體排版、焦點、閱讀順序與動態降級；測試通過不等同全裝置視覺驗收。

## 5. 風險

早期草稿與 Astro 中性樣式不能覆蓋已接受的設計。改素材需核對公開檔案白名單；Git push 不會自動上架，發布及還原依 [Hostinger 操作索引](../operations/deploy-hostinger.md)。

## 6. 驗證方式

`npm run test:design` 驗證核准版；`npm run test:all` 與 `npm run check` 同時保護 Astro 基礎。版面變動另做兩語系、寬窄與中間寬度的目視驗證。

## 7. 仍未包含的工作

不再保留風格擇案待決清單。Astro 視覺移植、完整效能／可及性驗收、聯絡表單與未授權案例仍是獨立工作，不因刪除草稿而視為完成。

## 8. 變更紀錄

| 版本 | 日期 | 摘要 |
|---|---|---|
| v0.1–v0.3 | 2026-09-07 至 09-08 | 早期設計與線框提案；全文留於 Git `428c053` 及其祖先 |
| v0.4 | 2026-09-09 | 移除過期擇案稿與閘門，改以核准上線設計作維護基線；不修改網站執行檔 |
