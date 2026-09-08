# PRD-003：設計更新

| 版本 | 狀態 | Owner | ADO Feature | 最後更新 |
|---|---|---|---|---|
| v0.2 | Draft | Dale | [#1298](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1298) | 2026-09-08 |

> NFR 一律繼承 [`../guidelines/PRD-Guideline-Web.md`](../guidelines/PRD-Guideline-Web.md) §4，本文只列差異。
> 版面結構與各頁記憶點見 [`../design/wireframes-v1.md`](../design/wireframes-v1.md)，本文只談視覺。

## 1. 問題與目標

**問題**：業主已裁定**視覺全面重做**（2026-09-07），舊樹樣式一律不沿用，因此本 PRD 的工作
不是「把手冊套到既有版面上」，而是**在 wireframes-v1 的結構上做一套全新設計**。目前既無設計
方向（三案未提），也無正式 token 數值（Phase A 只落了 44 個中性佔位），任何一頁「是不是符合
品牌」仍無從判斷。

| 項目 | 內容 |
|---|---|
| Goal | 1. 產出並選定一個設計方向（FR-307），成為 PRD-001 FR-105 元件重建的依據；2. 全部路由的色彩、字級、間距皆由 `src/styles/tokens.css` 供給，零新增硬編碼色值；3. 全站文字與 UI 元件對比度達 WCAG 2.2 AA，Lighthouse Performance ≥ 90（行動裝置） |
| Non-Goal | 不改資訊架構與導覽（PRD-004）、不改文案（PRD-002）、不做深色／淺色雙主題切換、不移植舊樹任何視覺 |
| Constraints | 手冊（PRD-005）與版面（PRD-004）定案後才進 FR-301 之後的工作；FR-307 設計方向為 PRD-001 FR-105 的前置閘門；Tailwind 已由 ADR-001 移除，樣式為純 CSS 加 token |
| 角色 | 潛在客戶（第一印象與信任感）、設計師（可對照手冊驗收） |

## 2. 範圍

| 項目 | 內容 |
|---|---|
| 涵蓋路由 | M1 拍板後的 8 條（含新頁 `/kip`、`/kip/security`、`/cases`）與其 `/en/` 對應 |
| 涵蓋檔案 | `src/styles/tokens.css` 的用法、`.astro` 元件的 scoped `<style>`、island 的 CSS Modules、`public/brand/` 的 logo 與圖像引用方式 |
| 不涵蓋 | `src/content/**` 內容、導覽結構、i18n 結構、新元件的功能行為 |
| 依賴 PRD | PRD-005（手冊定案）、PRD-004（版面與斷點定案）、PRD-001（Phase A token 機制已交付，資產瘦身 FR-108 進行中） |

### 現況基線（2026-09-08 更新）

- 舊樹 `app/globals.css` 的 7 個品牌色與 `--radius` **不沿用**（PRD-001 §1 Non-Goal，業主裁定視覺全面重做），此處僅備查。
- Phase A 已落 `src/styles/tokens.css`（44 個中性佔位 token）與 `/styleguide` 驗收頁；**正式數值仍 TBD**，由 PRD-005 FR-501／FR-502 供給。
- Tailwind 已依 [ADR-001](../adr/ADR-001-astro-react-islands-hostinger.md) 移除，樣式為純 CSS。

## 3. 功能需求

執行順序：**FR-307 → FR-301／FR-302 → FR-303 至 FR-306**。FR-307 未通過前不得開始元件視覺。

| FR | 需求 | 驗收條件 | ADO Task |
|---|---|---|---|
| FR-301 | 依手冊寫定 `src/styles/tokens.css` 的正式色票，取代 Phase A 的 44 個中性佔位，並確認 semantic token 的角色對應正確 | token 值與手冊逐一相符；全 repo 搜尋十六進位色碼，僅 `tokens.css` 有命中 | TBD |
| FR-302 | 建立字級階層 token（display／h1／h2／h3／body／caption），各頁改為引用 token | 全部路由的標題與內文字級皆來自 token；同一層級在不同頁面的字級一致 | TBD |
| FR-303 | 依手冊統一元件樣式：按鈕（primary／secondary／CTA）、卡片、導覽列、頁尾、表格 | 每類元件在全部路由的外觀一致；截圖對照手冊逐項通過 | TBD |
| FR-304 | 依手冊的 logo 用法與禁則調整站上引用。**現況：Phase A 的 header 暫用文字「SynaiQ」**，因 `synaiq-logo-light.svg` 為純白（淺底不可見）、`synaiq-logo-dark.svg` 為 7 MB 內嵌 PNG，兩者皆不可用；可用 logo 檔由 PRD-005 OQ-7 供給 | 取得可用 logo 後 header 不再是純文字；最小尺寸、留白、可用背景皆符合手冊；無變形或改色 | TBD |
| FR-305 | 對比度複驗並修正不合格處（含半透明文字如 `rgba(255,255,255,.68)` 這類寫法） | 內文 ≥ 4.5:1、大字與 UI 元件 ≥ 3:1；量測結果逐項留存 | TBD |
| FR-306 | **首頁六幕 GSAP 捲動敘事移除（2026-09-08 已決）**，改為 [wireframes §3.1／§4](../design/wireframes-v1.md) 的**點擊觸發問答演示** island：訪客點預設問題後答案逐句浮出並標出出處，含一題「查不到」的示範；非使用者觸發的動態一律不做 | `package.json` 與 `dist/` 皆零 GSAP／ScrollTrigger；首頁唯一 island 為問答演示且資料內嵌、零網路請求；`prefers-reduced-motion: reduce` 時逐句效果改為一次顯示、內容不減；CLS ≤ 0.1 | TBD |
| FR-307 | **設計方向提案 3 案**：依 wireframes-v1 的首頁與 `/kip` 版面，各出一案（色彩情緒、字級對比、版面節奏、記憶點呈現），業主擇一。**本 FR 是 PRD-001 FR-105 元件重建的前置閘門** | 3 案皆含首頁與 `/kip` 兩頁的視覺稿或可點的 HTML 原型；每案標明與 PRD-005 token 的對應；業主書面擇一並存於 `docs/design/`；未擇定前 FR-105 不開工 | TBD |

## 4. NFR 差異

| 維度 | 目標值 | 與基準線差異原因 |
|---|---|---|
| 無 | 全數繼承 guideline §4 | 本 PRD 是達成基準線視覺與效能門檻的主要執行者 |

## 5. 風險

| 風險 | 機率 | 衝擊 | 緩解 |
|---|---|---|---|
| 手冊未定案就開工，樣式反覆重做 | M | H | 硬性依賴 PRD-005 Locked；未 Locked 不開 Task |
| 設計方向三案遲遲未定，PRD-001 FR-105 元件重建全線停擺 | H | H | FR-307 為最先執行項；停擺期間頁面以結構化語意 HTML 上線（PRD-001 FR-105 已允許），不做視覺 |
| 無專業設計資源下「全新設計」淪為換色，與舊站無實質差異 | M | M | FR-307 三案須各有明確差異點並對照 wireframes 的記憶點驗收，非同一版三種配色 |
| 品牌色 `--gold` 與 `--violet` 在深底上對比不足 | M | H | FR-305 先量測再套用，不足者由 PRD-005 提供替代色階 |
| 動效調整影響 LCP／CLS | M | M | 每次改動後跑 Lighthouse 行動裝置，未達門檻不合併 |

## 6. 驗收方式

| # | 方式 | 通過條件 |
|---|---|---|
| 1 | 全部路由截圖對照手冊（桌機 + 行動裝置） | 逐項符合，差異需有書面例外 |
| 2 | 對比度量測工具逐頁掃描 | 無 AA 未達標項目 |
| 3 | Lighthouse 行動裝置 | Perf ≥ 90、A11y ≥ 95、Best ≥ 95、SEO ≥ 95 |
| 4 | `npm run build` 與 `npm test` | 綠燈 |

## 7. Open Questions

| # | 問題 | 待決者 | 期限 |
|---|---|---|---|
| OQ-1 | FR-307 三案由誰產出：內部設計、Figma 委外，或直接由 token 推導 | 業主 | FR-307 開工前 |
| OQ-2 | **已決（2026-09-08）**：首頁六幕 GSAP 捲動敘事**移除**，改為點擊觸發的問答演示（理由見 [wireframes §4](../design/wireframes-v1.md)：一個記憶點、兩種訪客都在掃描、與 ADR-001 零 JS 預設衝突、50–70 KB 成本、`prefers-reduced-motion` 降級後等於維護兩套首頁） | 業主 + 設計 | 已決 |
| OQ-3 | 是否需要淺色版（`--paper` 已定義但站上幾乎未用） | 業主 | 本 PRD 開工前 |
| OQ-4 | 英文版是否沿用同一套字級階層（西文與 CJK 視覺重量不同） | 設計 + PRD-004 | FR-302 開工前 |

## 8. 變更紀錄

| 版本 | 日期 | 變更摘要 | commit / ADR |
|---|---|---|---|
| v0.1 | 2026-09-07 | 初版，建立 FR-301 至 FR-306 與現況基線 | |
| v0.2 | 2026-09-08 | 範圍由「套用手冊樣式」改為**全新設計**（業主裁定舊視覺不沿用）；新增 FR-307 設計方向 3 案並定為 PRD-001 FR-105 前置閘門；OQ-2 已決，FR-306 由 GSAP 六幕改為點擊觸發問答演示；涵蓋檔案改為 `src/**` 與 `tokens.css`，現況基線改記 Phase A 的 44 個佔位 token；FR-304 補記 logo 不可用的現況 | [ADR-001](../adr/ADR-001-astro-react-islands-hostinger.md)、[wireframes-v1](../design/wireframes-v1.md) §4 |
