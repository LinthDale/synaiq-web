# PRD-005：對外統一視覺手冊（網站限定）

| 版本 | 狀態 | Owner | ADO Feature | 最後更新 |
|---|---|---|---|---|
| v0.3 | Draft | Dale | [#1300](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1300) | 2026-09-08 |

> NFR 一律繼承 [`../guidelines/PRD-Guideline-Web.md`](../guidelines/PRD-Guideline-Web.md) §4，本文只列差異。

## 1. 問題與目標

**問題**：公司沒有一份成文的色票、字級與 logo 用法準則。現況只有 `app/globals.css` 裡的
一組 CSS 變數，沒有說明各色的用途、可用背景與禁則；`public/brand/` 有 20 餘個資產但無清冊，
也不知道哪些還在用。結果是設計與 UIUX 的產出無從驗收，「符不符合品牌」只能靠個人判斷。

| 項目 | 內容 |
|---|---|
| Goal | 1. 產出一份可逐項對照驗收的網站視覺手冊，涵蓋色票、字級、logo、影像四類；2. 完成 `public/brand/**` 資產清冊，標註每項的引用位置與去留；3. 手冊內每一條規則都可被截圖或量測證明違反與否 |
| Non-Goal | 不涵蓋簡報、社群貼文、印刷物、名片與展場物料；不做完整 CI 品牌識別系統；不產出新的 logo 或吉祥物設計 |
| Constraints | 範圍限定網站；日後擴充至其他媒材必須先開 ADR；需 PRD-001 的資產瘦身結果（字型格式與大圖處理）確定後才能寫定字型與影像規範 |
| 角色 | 設計師（依手冊產出）、前端開發者（依手冊實作 token）、行銷（對外用圖時查禁則） |

## 2. 範圍

| 項目 | 內容 |
|---|---|
| 產出物 | 三合一手冊的**內容**：`docs/` 內一份 markdown 視覺手冊、`src/styles/tokens.css` 的 token **數值與用法**、`public/brand/**` 資產清冊。檔案位置、`/styleguide` 路由與建置串接等**機制**由 PRD-001 FR-102 提供（[ADR-001](../adr/ADR-001-astro-react-islands-hostinger.md)） |
| 涵蓋資產 | `public/brand/synaiq-logo-light.svg`、`synaiq-logo-s.webp`、`public/fonts/NotoSansCJKtc-Medium.otf`（PRD-001 FR-105 後為 WOFF2）、Wally 與 Duoduo 角色圖、團隊照 `public/brand/team/*`、`public/favicon.svg` |
| 不涵蓋 | 簡報／社群／印刷物範本（Non-Goal）、實際套用到頁面（PRD-003）、版面與斷點（PRD-004） |
| 依賴 PRD | PRD-001（資產清冊與字型格式確定）；PRD-003 與 PRD-004 依賴本 PRD |

### 現況基線（已驗證）

| 項目 | 現況 |
|---|---|
| 品牌色 | `--ink:#120725`、`--purple:#612271`、`--violet:#8b5fd3`、`--lavender:#c498ee`、`--gold:#d0ae68`、`--paper:#f5f1ea`、`--white:#fff`（舊樹 `app/globals.css` `:root`），無用途說明。換底後這 7 個值由 PRD-001 原樣搬入 `src/styles/tokens.css` 作暫用值，正式數值由本 PRD 覆寫 |
| 字型 | `NotoSansCJKtc-Medium.otf` 16.1 MB 全量載入，`font-weight:500` 單一字重；fallback 為 PingFang TC／Microsoft JhengHei；無指定西文字型 |
| Logo | **無可用檔（2026-09-08 Phase A 發現）**：`synaiq-logo-light.svg` 為純白，淺底看不見；`synaiq-logo-dark.svg`（7.3 MB）內容是內嵌 PNG 而非向量。Phase A 的 header 因此暫用文字「SynaiQ」。缺口見 OQ-7 與 [`../design/content-gap-list.md`](../design/content-gap-list.md) |
| Token 機制 | **已落地（Phase A）**：`src/styles/tokens.css` 共 44 個中性佔位 token，`/styleguide` 可目視驗收；**數值全部 TBD**，由本 PRD FR-501／FR-502 覆寫 |
| 影像 | `public/brand/` 共 20 餘檔，多張超過 1 MB，最大 `wally-series.png` 13.0 MB；瘦身歸 PRD-001 FR-108 |

## 3. 功能需求

| FR | 需求 | 驗收條件 | ADO Task |
|---|---|---|---|
| FR-501 | 色票表：每色列出名稱、hex、CSS 變數名、用途、可用背景、與主要文字色的對比度 | 現有 7 個品牌色全部有列；每組「文字色 × 背景色」的允許組合皆標註對比度且達 AA；不允許的組合明列為禁則 | TBD |
| FR-502 | 字級與字型規範：字族（CJK 與西文各自指定）、字重、字級階層（display／h1／h2／h3／body／caption）、行高、字距 | 階層表可直接對應 PRD-003 FR-302 的 token；西文字型已指定；字型檔格式與 subset 策略與 PRD-001 FR-105 一致 | TBD |
| FR-503 | Logo 用法與禁則：可用版本、最小尺寸、安全留白、可用背景、favicon 規格，加禁則清單（禁改色、禁變形、禁加陰影、禁放低對比底）。**前置：先取得可用的向量 logo 原稿（OQ-7），現有兩個檔案皆不可用** | 至少一個深底版與一個淺底版為真向量 SVG 且 ≤ 50 KB；每條規則附正例與反例圖示；站上引用逐一對照可判定通過或違反；PRD-003 FR-304 可據此把 header 的文字「SynaiQ」換回 logo | TBD |
| FR-504 | 影像與插圖規範：Wally／Duoduo 角色圖的使用情境與去背規則、團隊照的裁切與比例、單張體積上限與格式（WebP／AVIF 優先） | 規範內的體積上限與 guideline §4 的「單張圖 ≤ 500 KB」一致；現有大圖逐張標註處理方式 | TBD |
| FR-505 | `public/brand/**` 資產清冊：每項標註檔名、尺寸、體積、引用位置、去留決策 | 清冊涵蓋 `public/` 全部檔案，零遺漏；每項有明確去留；零引用者標為待刪並連到 PRD-001 FR-105 | TBD |
| FR-506 | 交付與維護：手冊存放位置、版本規則、後續修改流程 | 手冊位於 `docs/`，掛 v1.0 並在 [`../README.md`](../README.md) 連結；手冊每條 token 規則皆對應 `src/styles/tokens.css` 的一個變數並可在 `/styleguide` 目視驗收；修改流程與 guideline §6 一致；擴充至非網站媒材需開 ADR | TBD |

## 4. NFR 差異

| 維度 | 目標值 | 與基準線差異原因 |
|---|---|---|
| 無 | 全數繼承 guideline §4 | 本 PRD 產出文件，不改程式；手冊內的體積與對比度門檻須與 §4 一致 |

## 5. 風險

| 風險 | 機率 | 衝擊 | 緩解 |
|---|---|---|---|
| 無專業品牌設計資源，手冊淪為現況追認 | H | H | 先以現況加對比度量測產出 v0.1 可用版，再視 PRD-003 OQ-1 決定是否委外強化 |
| 現有紫金配色在深底上對比不足，手冊寫死後 PRD-003 無法達 AA | M | H | FR-501 以實測對比度為準，不足者當場補色階，不留給下游處理 |
| 手冊範圍被要求擴張到簡報與印刷物，時程失控 | M | M | Non-Goal 已明列網站限定；擴充需開 ADR 並重估時程 |
| 資產清冊與實際檔案脫節 | M | L | FR-505 的清冊與 PRD-001 FR-105 同一批次執行，完成後以 `public/` 實際檔案列表對帳 |

## 6. 驗收方式

| # | 方式 | 通過條件 |
|---|---|---|
| 1 | 手冊逐節業主與設計簽核 | 四類（色票／字級／logo／影像）皆簽核 |
| 2 | 對比度實測所有允許的色彩組合 | 全數達 AA，不合格組合已列入禁則 |
| 3 | 資產清冊對帳 `public/` 實際檔案 | 零遺漏、零多列 |
| 4 | 抽三條路由用手冊做一次驗收演練 | 每條規則都能判定通過或違反，無「看情況」項目 |

## 7. Open Questions

| # | 問題 | 待決者 | 期限 |
|---|---|---|---|
| OQ-1 | 色票是否沿用現有紫金配色，或重新定調 | 業主 | FR-501 開工前 |
| OQ-2 | 是否有既存的公司 CI 文件或原始 logo 檔（AI／SVG 向量原稿） | 業主 | 2026-09-14 |
| OQ-3 | logo 用法禁則由誰認可（有無法務或商標考量） | 業主 | FR-503 開工前 |
| OQ-4 | 品牌語調（Tone of Voice）是否納入手冊，或歸 PRD-002 | 業主 + 行銷部 | FR-506 開工前 |
| OQ-5 | 西文字型選型（需與 Noto Sans CJK TC 視覺重量搭配且授權可商用） | 設計 | FR-502 開工前 |
| OQ-6 | Wally／Duoduo 角色資產是否有外部授權或委託合約限制 | 業主 | FR-504 開工前 |
| OQ-7 | **可用 logo 檔缺口（2026-09-08 開立）**：現有 `synaiq-logo-light.svg` 純白、`synaiq-logo-dark.svg` 為 7.3 MB 內嵌 PNG，皆無法用於淺底 header；需業主提供向量原稿或授權重製深／淺底兩版 | 業主 | PRD-003 FR-304 開工前 |

## 8. 變更紀錄

| 版本 | 日期 | 變更摘要 | commit / ADR |
|---|---|---|---|
| v0.1 | 2026-09-07 | 初版，建立 FR-501 至 FR-506 與資產現況基線 | |
| v0.2 | 2026-09-07 | 依換底決策調整：token 檔案改為 `src/styles/tokens.css`、新增 `/styleguide` 驗收面，本 PRD 只負責 token 數值與用法，機制歸 PRD-001 FR-102 | [ADR-001](../adr/ADR-001-astro-react-islands-hostinger.md) |
| v0.3 | 2026-09-08 | 現況基線更新：token 機制已於 Phase A 落地（44 個中性佔位，`/styleguide` 可驗收，數值仍 TBD）；新增 OQ-7 記錄**無可用 logo 檔**（純白 SVG 加 7.3 MB 內嵌 PNG，header 暫用文字），FR-503 補前置條件與向量檔驗收 | PRD-001 Phase A、PRD-003 FR-304 |
