# PRD-003：設計更新

| 版本 | 狀態 | Owner | ADO Feature | 最後更新 |
|---|---|---|---|---|
| v0.1 | Draft | Dale | [#1298](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1298) | 2026-09-07 |

> NFR 一律繼承 [`../guidelines/PRD-Guideline-Web.md`](../guidelines/PRD-Guideline-Web.md) §4，本文只列差異。

## 1. 問題與目標

**問題**：現行視覺樣式沿用上游樣板，色票、字級、圓角、陰影散落在 `app/globals.css` 的
`clamp()` 與硬編碼值之中，沒有一份成文準則可對照，因此無法判斷任何一頁「是不是符合品牌」。
本 PRD 的工作是把 PRD-005 的視覺手冊實際套用到 9 條路由上，讓設計產出可被驗收。

| 項目 | 內容 |
|---|---|
| Goal | 1. 9 條路由的色彩、字級、間距全部改由手冊定義的 token 供給，零新增硬編碼色值；2. 全站文字與 UI 元件對比度達 WCAG 2.2 AA；3. Lighthouse Performance ≥ 90（行動裝置） |
| Non-Goal | 不改資訊架構與導覽（PRD-004）、不改文案（PRD-002）、不做深色／淺色雙主題切換 |
| Constraints | 手冊（PRD-005）與版面（PRD-004）皆定案後才開工；Tailwind 去留取決於 PRD-001 FR-108；樣式集中於單一 `app/globals.css`，拆檔與否需先評估 |
| 角色 | 潛在客戶（第一印象與信任感）、設計師（可對照手冊驗收） |

## 2. 範圍

| 項目 | 內容 |
|---|---|
| 涵蓋路由 | 全部 9 條 |
| 涵蓋檔案 | `app/globals.css`、各 `app/**/page.tsx` 的 class 與行內樣式、`public/brand/` 的 logo 與圖像引用方式 |
| 不涵蓋 | `content/pages/*.md` 內容、導覽結構、i18n 結構、新元件的功能行為 |
| 依賴 PRD | PRD-005（手冊定案）、PRD-004（版面與斷點定案）、PRD-001（資產瘦身完成） |

### 現況基線（已驗證）

- `app/globals.css` `:root` 已有品牌色 `--ink:#120725`、`--purple:#612271`、`--violet:#8b5fd3`、`--lavender:#c498ee`、`--gold:#d0ae68`、`--paper:#f5f1ea`、`--white:#fff`，以及一組 shadcn/ui 相容的 semantic token（`--primary`、`--muted`、`--border` 等）與 `--radius:.75rem`。
- 字級全部以 `clamp()` 就地寫在各選擇器內，未抽成階層 token。
- Tailwind v4 已安裝並 `@import`，但全站零 utility class。

## 3. 功能需求

| FR | 需求 | 驗收條件 | ADO Task |
|---|---|---|---|
| FR-301 | 依手冊校正 `:root` 色票，並確認既有 semantic token 的角色對應正確 | `globals.css` 的品牌色值與手冊逐一相符；全 repo 搜尋十六進位色碼，僅 `:root` 區塊有命中 | TBD |
| FR-302 | 建立字級階層 token（display／h1／h2／h3／body／caption），各頁改為引用 token | 9 條路由的標題與內文字級皆來自 token；同一層級在不同頁面的字級一致 | TBD |
| FR-303 | 依手冊統一元件樣式：按鈕（primary／secondary／CTA）、卡片、導覽列、頁尾、表格 | 每類元件在 9 條路由的外觀一致；截圖對照手冊逐項通過 | TBD |
| FR-304 | 依手冊的 logo 用法與禁則調整站上引用（現有 `synaiq-logo-light.svg`、`synaiq-logo-s.webp`；`synaiq-logo-dark.svg` 由 PRD-001 FR-105 刪除） | 站上 logo 的最小尺寸、留白、可用背景皆符合手冊；無變形或改色 | TBD |
| FR-305 | 對比度複驗並修正不合格處（含 `--muted-foreground:rgba(255,255,255,.68)` 這類半透明文字） | 內文 ≥ 4.5:1、大字與 UI 元件 ≥ 3:1；量測結果逐項留存 | TBD |
| FR-306 | 首頁 GSAP 捲動敘事的動態表現對齊手冊，並提供 `prefers-reduced-motion` 降級 | 開啟減少動態偏好時無視差與自動位移；CLS ≤ 0.1 | TBD |

## 4. NFR 差異

| 維度 | 目標值 | 與基準線差異原因 |
|---|---|---|
| 無 | 全數繼承 guideline §4 | 本 PRD 是達成基準線視覺與效能門檻的主要執行者 |

## 5. 風險

| 風險 | 機率 | 衝擊 | 緩解 |
|---|---|---|---|
| 手冊未定案就開工，樣式反覆重做 | M | H | 硬性依賴 PRD-005 Locked；未 Locked 不開 Task |
| 樣式集中於單一 `globals.css`，改動牽一髮動全身 | H | M | 先以 token 收斂，再視情況依區塊拆檔；每個 FR 獨立 commit 便於 `git revert` |
| 品牌色 `--gold` 與 `--violet` 在深底上對比不足 | M | H | FR-305 先量測再套用，不足者由 PRD-005 提供替代色階 |
| 動效調整影響 LCP／CLS | M | M | 每次改動後跑 Lighthouse 行動裝置，未達門檻不合併 |

## 6. 驗收方式

| # | 方式 | 通過條件 |
|---|---|---|
| 1 | 9 條路由截圖對照手冊（桌機 + 行動裝置） | 逐項符合，差異需有書面例外 |
| 2 | 對比度量測工具逐頁掃描 | 無 AA 未達標項目 |
| 3 | Lighthouse 行動裝置 | Perf ≥ 90、A11y ≥ 95、Best ≥ 95、SEO ≥ 95 |
| 4 | `npm run build` 與 `npm test` | 綠燈 |

## 7. Open Questions

| # | 問題 | 待決者 | 期限 |
|---|---|---|---|
| OQ-1 | 設計方向由誰產出：內部設計、Figma 委外，或直接由手冊推導 | 業主 | PRD-005 Locked 前 |
| OQ-2 | 是否保留首頁 GSAP 捲動敘事，或改為靜態區塊 | 業主 + 設計 | 本 PRD 開工前 |
| OQ-3 | 是否需要淺色版（`--paper` 已定義但站上幾乎未用） | 業主 | 本 PRD 開工前 |
| OQ-4 | 英文版是否沿用同一套字級階層（西文與 CJK 視覺重量不同） | 設計 + PRD-004 | FR-302 開工前 |

## 8. 變更紀錄

| 版本 | 日期 | 變更摘要 | commit / ADR |
|---|---|---|---|
| v0.1 | 2026-09-07 | 初版，建立 FR-301 至 FR-306 與現況基線 | |
