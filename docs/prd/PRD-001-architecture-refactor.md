# PRD-001：架構重整與死碼清理

| 版本 | 狀態 | Owner | ADO Feature | 最後更新 |
|---|---|---|---|---|
| v0.1 | Draft | Dale | [#1296](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1296) | 2026-09-07 |

> NFR 一律繼承 [`../guidelines/PRD-Guideline-Web.md`](../guidelines/PRD-Guideline-Web.md) §4，本文只列差異。
> 技術現況、缺陷清單、待釐清事項的唯一事實來源為 [`../../HANDOVER.md`](../../HANDOVER.md)，本文不複述。

## 1. 問題與目標

**問題**：接手的站台帶著指向 `http://localhost:8400` 且 URL 內含 token 的開發用 live script、
對外訪客可見的內部「畫布編輯」按鈕、依賴未安裝套件的死檔，以及一組讀 `.tsx` 原始碼做 regex
比對的不可信測試。在這個狀態下，任何後續改動既不安全（token 已外洩、mixed content 被擋）
也無法驗證（合法重構會誤報失敗，真正的破壞抓不到）。四條工作線都疊在這個地基上。

| 項目 | 內容 |
|---|---|
| Goal | 1. 全站輸出 HTML 零 `localhost` 引用、零 mixed content；2. `npm install → build → test` 在本機一次綠燈且測試斷言全部驗證輸出 HTML；3. `public/` 總量由 60 MB 以上降至 ≤ 15 MB |
| Non-Goal | 不改任何文案（PRD-002）、不改視覺樣式（PRD-003）、不動資訊架構與導覽（PRD-004） |
| Constraints | `vinext` 為 1.0.0-beta.2，升版風險自負；repo 內無 CI 與部署設定；重構不得讓日後的 per-locale 內容結構（PRD-004）更難做 |
| 角色 | 開發者（唯一角色，本 PRD 對訪客無可見變更，除 FR-103 移除內部按鈕外） |

## 2. 範圍

| 項目 | 內容 |
|---|---|
| 涵蓋路由 | 全部 9 條（僅影響共用 layout 與首頁），不改任何路由結構 |
| 涵蓋檔案 | `app/layout.tsx`、`app/page.tsx`、`app/_sites-preview/`、`db/`、`drizzle/`、`app/chatgpt-auth.ts`、`next.config.ts`、`scripts/status-reporter.mjs`、`WEBSITE_CODE_HANDOFF.md`、`tests/rendered-html.test.mjs`、`package.json`、`public/fonts/`、`public/brand/` |
| 不涵蓋 | `content/pages/*.md` 的內容、`app/globals.css` 的視覺樣式、`worker/index.ts` 的請求邏輯 |
| 依賴 PRD | 無（本案第一順位） |

## 3. 功能需求

| FR | 需求 | 驗收條件 | ADO Task |
|---|---|---|---|
| FR-101 | 移除 `app/layout.tsx:26` 指向 `http://localhost:8400` 且帶 token 的 live script；該 token 視為已外洩，另列輪替待辦 | `npm run build` 後於 `dist/` 全文搜尋 `localhost` 與 `8400` 皆零命中；9 條路由的輸出 HTML 皆無 `http://` 外部資源；輪替待辦已建 ADO Task 並指派負責人 | TBD |
| FR-102 | 刪除整個 `app/_sites-preview/`（`SkeletonPreview.tsx` 匯入的 `react-loading-skeleton` 不在 `package.json` 也不在 lock 檔） | 目錄不存在；`npm run build` 綠燈；全 repo 搜尋 `react-loading-skeleton` 零命中 | TBD |
| FR-103 | `app/page.tsx:551` 的「畫布編輯」浮動按鈕改為僅在 `?edit=1` 或開發環境渲染（目前無條件渲染，CSS 也無隱藏規則） | 生產 build 下 `/` 的輸出 HTML 不含該按鈕；加上 `?edit=1` 後按鈕與面板皆出現 | TBD |
| FR-104 | **決策後移除**死檔：`db/`、`drizzle/`、`drizzle-orm`、`drizzle-kit`、`app/chatgpt-auth.ts`、`next.config.ts`、`scripts/status-reporter.mjs`、`WEBSITE_CODE_HANDOFF.md`。移除授權尚未取得，見 §7 OQ-7 | 取得業主書面授權後：上述路徑不存在；`package.json` 移除 `drizzle-orm`／`drizzle-kit` 與 `db:generate`／`status` script；`npm run build`、`npm test`、`npm run lint` 綠燈 | TBD |
| FR-105 | 資產瘦身：`NotoSansCJKtc-Medium.otf`（16.5 MB）subset 後轉 WOFF2；刪除零引用的 `synaiq-logo-dark.svg`（7.5 MB）；壓縮 `wally-series.png`（13.3 MB）等大圖 | 字型 ≤ 300 KB；單張圖 ≤ 500 KB；`public/` 總量 ≤ 15 MB；9 條路由目視無缺字、無破圖 | TBD |
| FR-106 | 重寫 `tests/rendered-html.test.mjs`：斷言一律針對 build 後的輸出 HTML，移除所有 `.tsx` 原始碼 regex 與字型檔 byte 數斷言。**本 FR 為 FR-101/102/103/104/105 的前置** | 測試檔內零 `readFile('*.tsx')` 類原始碼讀取、零 byte 數斷言；9 條路由各有至少一條「關鍵區塊存在」斷言；改 class 名或抽元件不會使測試變紅 | TBD |
| FR-107 | 建立本機 `npm install → npm run build → npm test` 綠燈基線，並把 OpenAI Sites 的實際部署動作寫入 `docs/`（repo 目前無 CI 與部署設定） | 三道指令在乾淨 clone 上依序綠燈，輸出留存；`docs/` 內有一份可照做的部署步驟，經一次實際部署驗證 | TBD |
| FR-108 | Tailwind v4 去留決策（全站零 utility class，只用到 preflight 與少數 CSS 變數） | 產出一句話決策並記錄於 §8；若決定移除則 `tailwindcss`／`@tailwindcss/postcss` 自 `package.json` 消失且 9 條路由視覺無差異（截圖比對） | TBD |

## 4. NFR 差異

| 維度 | 目標值 | 與基準線差異原因 |
|---|---|---|
| Lighthouse | 本 PRD 只要求「不低於重構前」 | 效能達標由 PRD-003／004 負責；本階段僅建立可量測的基線數字 |
| 資產體積 | 與基準線相同，且為本 PRD 的 Goal 之一 | FR-105 是達成基準線的主要手段 |

## 5. 風險

| 風險 | 機率 | 衝擊 | 緩解 |
|---|---|---|---|
| 測試不可信導致重構誤報或漏報 | H | H | FR-106 排在其他 FR 之前，先把測試換成輸出 HTML 斷言再動程式碼 |
| `vinext` 為 1.0.0-beta.2，升版或行為變動破壞 Next 相容層 | M | H | 本 PRD 不升版，鎖定現有版本；升版另開 ADR，並以 FR-106 的測試當回歸網 |
| 部署路徑不明，改完無法驗證是否真的上線 | M | H | FR-107 要求走完一次實際部署並寫成文件，未走通前不宣告完成 |
| 刪除 `db/` 後日後要做會員區需重建 | M | M | FR-104 綁 OQ-7 授權；刪除以獨立 commit 進行，必要時 `git revert` 即可復原 |
| 字型 subset 漏字造成 CJK 缺字 | M | M | subset 字集由 `content/pages/*.md` 全文加常用字表產生，並保留 fallback 字族 |

## 6. 驗收方式

| # | 方式 | 通過條件 |
|---|---|---|
| 1 | `npm install && npm run build && npm test` | 三者皆綠燈，輸出留存並附給業主 |
| 2 | `npm run lint` | 零 error |
| 3 | 在 `dist/` 搜尋 `localhost`、`8400`、`http://` | 零命中 |
| 4 | 量測 `public/` 總量與最大單檔 | ≤ 15 MB、單張圖 ≤ 500 KB、字型 ≤ 300 KB |
| 5 | 9 條路由人工目視（桌機加行動裝置） | 無缺字、無破圖、首頁無「畫布編輯」按鈕 |
| 6 | 一次實際部署至 OpenAI Sites | 線上站台可開，且步驟已寫入 `docs/` |

## 7. Open Questions

| # | 問題 | 待決者 | 期限 |
|---|---|---|---|
| OQ-1 | OpenAI Sites 的實際部署動作為何？`dist/` 產出後如何上線 | 業主／上游交接窗口 | FR-107 開工前 |
| OQ-2 | `vinext` 是否會讀取 `next.config.ts`？若不讀該檔應刪 | 開發者（`npm install` 後實測） | FR-104 開工前 |
| OQ-3 | 上游是否還有含 `.git` 的原始工作樹？兩邊內容是否已分歧 | 上游交接窗口 | 2026-09-14 |
| OQ-4 | `app/chatgpt-auth.ts` 是刻意保留供日後做會員區，還是純殘留 | 業主 | FR-104 開工前 |
| OQ-5 | Cloudflare D1／R2 是否有上線計畫？確定不用才可整組移除 drizzle | 業主 | FR-104 開工前 |
| OQ-6 | `localhost:8400` 的 live bridge 屬於哪套開發工具？token 向誰申請輪替 | 上游交接窗口 | FR-101 完成後 3 日內 |
| OQ-7 | **死碼刪除授權**：FR-104 列出的 8 個路徑是否核准移除（逐項或整批） | 業主 | FR-104 開工前 |

## 8. 變更紀錄

| 版本 | 日期 | 變更摘要 | commit / ADR |
|---|---|---|---|
| v0.1 | 2026-09-07 | 初版，依 `HANDOVER.md` 建立 FR-101 至 FR-108 | |
