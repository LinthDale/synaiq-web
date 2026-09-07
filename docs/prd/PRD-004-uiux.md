# PRD-004：UIUX 更新與雙語資訊架構

| 版本 | 狀態 | Owner | ADO Feature | 最後更新 |
|---|---|---|---|---|
| v0.2 | Draft | Dale | [#1299](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1299) | 2026-09-07 |

> NFR 一律繼承 [`../guidelines/PRD-Guideline-Web.md`](../guidelines/PRD-Guideline-Web.md) §4，本文只列差異。
> 路由表與內容管線見 [`../../HANDOVER.md`](../../HANDOVER.md) §2。

## 1. 問題與目標

**問題**：站上有 9 條路由，但導覽列只露出 4 項（關於公司／產品／媒體中心／聯絡我們），
`/wally`、`/knowledge-base`、`/generative-ai`、`/agi` 只能靠內文連結或直接輸入網址進入，
訪客找不到主要內容。RWD 斷點在 CSS 中混用 560／900／1199／1200 多組，未經整體檢視；
可及性未做過完整檢查；而網站即將改為繁體中文加英文雙語，URL 策略、語言切換與 `hreflang`
都還沒有結構。在資訊架構與雙語結構定案前先改視覺，會整批做白工。

| 項目 | 內容 |
|---|---|
| Goal | 1. 9 條路由（加 M1 可能新增者）全部可在兩次點擊內從首頁到達；2. 全站達 WCAG 2.2 AA，Lighthouse A11y ≥ 95；3. 雙語結構落地：每頁 `<html lang>` 正確、`hreflang` 成對、語言切換保留當前頁面 |
| Non-Goal | 不改文案內容（PRD-002）、不套用最終品牌樣式（PRD-003）、不做第三語系、不做會員或登入流程 |
| Constraints | 需 PRD-002 M1（KIP 是否新增路由／導覽項）先拍板；需 PRD-005 手冊定案提供色票與字級；per-locale 內容結構與 i18n 路由由 PRD-001 先行交付，本 PRD 不得在其之前開工；改文案仍必須重新 build |
| 角色 | 潛在客戶（找產品資訊）、國際訪客（讀英文）、使用輔助科技的訪客 |

## 2. 範圍

| 項目 | 內容 |
|---|---|
| 涵蓋路由 | `/`、`/about`、`/products`、`/wally`、`/knowledge-base`、`/generative-ai`、`/agi`、`/media`、`/contact`，加 M1 可能新增的 KIP 路由，以及所有路由的英文對應 |
| 涵蓋檔案 | 換底後（[ADR-001](../adr/ADR-001-astro-react-islands-hostinger.md)）為 `src/pages/**` 與 `src/layouts/BaseLayout.astro` 的結構與語意標記、`src/content.config.ts` 的 schema、`src/content/pages/<locale>/` 的內容、`src/styles/` 的斷點與版面、`SiteHeader` 導覽元件（含行動選單 island） |
| 涵蓋設計工作 | **per-locale 內容結構的設計屬本 PRD 範圍**：目前 `content/pages/*.md` 為單一語系並在 build 時以 `?raw` 內嵌，本 PRD 負責設計擴充為每語系一份檔案的結構與載入方式；實際英文文案的撰寫屬 PRD-002 M2 |
| 不涵蓋 | 品牌色票與字級的最終數值（PRD-005）、樣式套用（PRD-003）、英文文案內容（PRD-002 FR-205） |
| 依賴 PRD | PRD-005（手冊）、PRD-002 M1（硬閘門）；PRD-003 依賴本 PRD 的產出 |

## 3. 功能需求

| FR | 需求 | 驗收條件 | ADO Task |
|---|---|---|---|
| FR-401 | 盤點 9 條路由的內容與定位，重整導覽（含是否分層、是否收納次要路由） | 產出資訊架構圖並經業主簽核；首頁起算兩次點擊可達每一條路由；`site.md` 的 `header.navigation` 表同步更新 | TBD |
| FR-402 | **i18n URL 策略與語言切換**：路由機制已由 [ADR-001](../adr/ADR-001-astro-react-islands-hostinger.md) 定為 Astro 內建 i18n（zh-Hant 無前綴、英文 `/en/` 前綴）並由 PRD-001 FR-101／FR-106 建骨架；本 FR 只負責確認該形式、實作 header 語言切換器與缺頁行為 | 每頁 `<html lang>` 為 `zh-Hant` 或 `en`；每對頁面互指 `hreflang` 且含 `x-default`；語言切換停留在對應的同一頁而非回首頁；缺對應頁時的行為明確定義；`sitemap.xml` 涵蓋兩語系 | TBD |
| FR-403 | per-locale 內容結構已由 PRD-001 FR-103／FR-104 以 Astro Content Collections 加 zod schema 交付（`src/content/pages/<locale>/*.md`）；本 FR 只負責驗收該結構並補足 IA 調整所需的欄位 | 兩語系各自 build 綠燈；任一語系缺必填欄位時建置期即失敗並指出檔名與欄位路徑；新增語系不需修改任何 `.astro` | TBD |
| FR-404 | 統一 RWD 斷點（現況混用 560／900／1199／1200 多組），定義行動、平板、桌機三段規則 | 斷點集中定義且全站引用；320px 至 1920px 逐段檢視無破版、無橫向捲軸 | TBD |
| FR-405 | WCAG 2.2 AA 全站符合：語意標記、標題階層、焦點順序與可見焦點、跳至主要內容連結、圖片替代文字、鍵盤可操作 | 自動掃描零 violation；鍵盤單獨走完 9 條路由與導覽展開／收合；`content/pages` 內每張圖有 alt；Lighthouse A11y ≥ 95 | TBD |
| FR-406 | `/contact` 的互動方式定案：現況為 `mailto:` 連結、無表單與後端。決定是否導入實際表單 | 決策記錄於 §8；若維持 `mailto:` 則需在頁面明示替代聯絡方式；若導入表單則另開 ADR 說明後端與個資處理 | TBD |
| FR-407 | 導覽與頁尾的雙語一致性：兩語系的導覽項數量與順序一致 | 兩語系導覽項對應完整，無單語系獨有項目（例外需書面說明） | TBD |

## 4. NFR 差異

| 維度 | 目標值 | 與基準線差異原因 |
|---|---|---|
| 語系標記 | 為本 PRD 的 Goal 之一，需逐頁驗收 | FR-402 是基準線中 `lang`／`hreflang` 條目的唯一實作者 |
| 無障礙 | WCAG 2.2 AA，且需人工鍵盤走查一輪 | 自動掃描抓不到焦點順序與操作流程問題 |

## 5. 風險

| 風險 | 機率 | 衝擊 | 緩解 |
|---|---|---|---|
| PRD-002 M1 未拍板就開工，資訊架構重做 | M | H | M1 設為硬閘門，未拍板不開 Task；逾期由業主裁定暫用現有導覽 |
| i18n URL 策略選錯，日後改動導致既有連結全失效 | M | H | FR-402 以 ADR 記錄決策與替代方案；一旦有對外連結流通即不可再改，改動需新 ADR 加 301 導向 |
| IA 調整新增的欄位破壞 PRD-001 交付的 zod schema 與「缺欄位即建置失敗」特性 | M | M | FR-403 明列此特性為驗收條件；schema 變更先在單一路由試作再全站推廣 |
| 英文文案未就緒導致英文頁半空 | H | M | 英文路由在 PRD-002 M2 完成前不對外開放（不列入 sitemap、不顯示切換器） |
| 導覽重整改變 URL，既有 SEO 權重流失 | L | M | 盡量不改既有 9 條路由的 URL；必須改時同 commit 加 301 導向 |

## 6. 驗收方式

| # | 方式 | 通過條件 |
|---|---|---|
| 1 | 資訊架構圖業主簽核 | 已簽核並存於 `docs/` |
| 2 | 自動無障礙掃描（9 條路由 × 2 語系） | 零 violation |
| 3 | 鍵盤單獨走查（不用滑鼠） | 可完成導覽、切換語言、觸發所有 CTA |
| 4 | 檢視每頁 `<html lang>` 與 `hreflang` | 逐頁正確且成對，含 `x-default` |
| 5 | 320px 至 1920px 逐段檢視 | 無破版、無橫向捲軸 |
| 6 | `npm run build`、`npm test`、Lighthouse 行動裝置 | 綠燈且 A11y ≥ 95 |

## 7. Open Questions

| # | 問題 | 待決者 | 期限 |
|---|---|---|---|
| OQ-1 | **i18n URL 策略**：[ADR-001](../adr/ADR-001-astro-react-islands-hostinger.md) 已定為 zh-Hant 無前綴加英文 `/en/` 前綴，待業主書面確認；若要改子網域需新開 ADR | 業主 + 開發者 | FR-402 開工前 |
| OQ-2 | 導覽重整範圍：維持 4 項加下拉，或全數展開為 9 項 | 業主 | FR-401 開工前 |
| OQ-3 | KIP 是否新增路由（與 PRD-002 M1 同一決策） | 業主 + 行銷部 | 本 PRD 開工前 |
| OQ-4 | 英文版是否需要獨立的 metadata 與 OG 圖 | 行銷部 | FR-402 開工前 |
| OQ-5 | `/contact` 是否需要真表單；若需要，送出後由誰接收、如何處理個資 | 業主 | FR-406 開工前 |
| OQ-6 | 成效指標與是否導入 analytics（站上目前完全沒有任何追蹤碼） | 業主 | 本 PRD 開工前 |

## 8. 變更紀錄

| 版本 | 日期 | 變更摘要 | commit / ADR |
|---|---|---|---|
| v0.1 | 2026-09-07 | 初版，建立 FR-401 至 FR-407，納入雙語資訊架構 | |
| v0.2 | 2026-09-07 | 依換底決策調整：涵蓋檔案改為 `src/**`，i18n 路由與 per-locale 內容結構改由 PRD-001 交付，本 PRD 只負責 IA、切換 UX 與驗收；OQ-1 由「待決策」改為「待確認」 | [ADR-001](../adr/ADR-001-astro-react-islands-hostinger.md) |
