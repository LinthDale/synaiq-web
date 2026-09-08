# PRD-002：SYNAIQ KIP 產品線資訊更新

| 版本 | 狀態 | Owner | ADO Feature | 最後更新 |
|---|---|---|---|---|
| v0.3 | Draft | Dale | [#1297](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1297) | 2026-09-08 |

> NFR 一律繼承 [`../guidelines/PRD-Guideline-Web.md`](../guidelines/PRD-Guideline-Web.md) §4，本文只列差異。
> 內容管線規則見 [`../../HANDOVER.md`](../../HANDOVER.md) §2，本文不複述。
> KIP 文案的事實來源為 [`../design/kip-deck-extract.md`](../design/kip-deck-extract.md)（`S1`–`S6`）；
> 逐頁的沿用／改寫／新寫分工見 [`../design/content-gap-list.md`](../design/content-gap-list.md)。

## 1. 問題與目標

**問題**：全站文案未圍繞 SYNAIQ KIP 產品線組織，訪客看不出主力產品是什麼。
`media.md` 仍有 5 處「待補」佔位文字，`wally.md` 的系列情境展示區塊因為資料表沒有任何資料列
而只剩標題加一片空白。全站僅有繁體中文，尚無英文版，海外與國際客戶無法閱讀。

| 項目 | 內容 |
|---|---|
| Goal | 1. 全部路由的文案皆以 KIP 產品線為敘事主軸；2. 全站零佔位文字、零空表格；3. 全部路由皆有英文版且與中文版資訊等價 |
| Non-Goal | 不改版面與樣式（PRD-003／004）、不做部落格或新聞稿系統、不做第三語系 |
| Constraints | KIP 定位與規格待行銷部簡報定稿（外部阻塞）；文案只能改 `## key` 標題底下的內容，標題本身是程式識別碼不得更動；改文案必須重新 build 才會生效 |
| 角色 | 潛在客戶（找解決方案）、合作夥伴（評估技術能力）、求職者（看團隊與媒體） |

## 2. 範圍

| 項目 | 內容 |
|---|---|
| 涵蓋路由 | M1 拍板後的 8 條：`/`、`/kip`、`/kip/security`、`/wally`、`/generative-ai`、`/cases`、`/about`、`/contact` |
| 涵蓋檔案 | `src/content/pages/<locale>/*.md` 全部 8 頁（含新增的 `kip`、`kip/security`、`cases`）加 `src/content/site/<locale>.md` 的導覽標籤與 CTA 預設值 |
| 不涵蓋 | 版面結構與 CSS、路由與導覽實作（PRD-004 FR-401）、301 設定 |
| 依賴 | 行銷部 KIP 簡報（外部阻塞）；M2 英文文案依賴 zh-Hant 文案定稿與 KIP 簡報 final；per-locale 檔案結構已由 PRD-001 FR-103／FR-104 於 Phase A 落地 |

### 里程碑

| 里程碑 | 內容 | 閘門條件 |
|---|---|---|
| M1 | **已拍板（2026-09-08）**：KIP 即主軸，取代 `/products` 成為 `/kip`；`/knowledge-base` 併入 `/kip`、`/agi` 併入 `/kip#ika`、`/media` 併入 `/cases`；新增 `/kip/security` 與 `/cases`；主導覽 5 項加 1 CTA，**不新增第三個產品入口**。全表見 [wireframes §2](../design/wireframes-v1.md)，實作歸 PRD-004 FR-401 | 閘門解除，PRD-004 可開工 |
| M2 | 英文文案產出（8 條路由全數） | 需 zh-Hant 文案定稿（M1 之後的內容工作完成）**且** KIP 簡報 final；per-locale 檔案結構已於 PRD-001 Phase A 落地，可直接放檔 |

## 3. 功能需求

| FR | 需求 | 驗收條件 | ADO Task |
|---|---|---|---|
| FR-201 | 以 KIP 為主軸撰寫 `home` 與新頁 `kip`、`kip/security` 的產品敘事與 metadata，事實來源為 `kip-deck-extract.md` `S1`–`S6`；原 `products.md`、`knowledge-base.md`、`agi.md` 的可用文字併入 `kip` | 首頁與 `/kip` 皆可在 3 秒內看出 KIP 是什麼、解決什麼問題；三頁的區塊與 wireframes §3.1／§3.2／§3.3 對應表一致；`npm run build` 綠燈（缺欄位由 zod 在建置期失敗） | TBD |
| FR-202 | 補齊 `wally` 的 `models` 區塊資料列，並補上 5 型號的實際尺寸數據（尺度比較圖所需） | `/wally` 的系列情境區塊有實際資料列，無空白區塊；5 型號皆有高／寬數據 | TBD |
| FR-203 | 清除 `media` 的 5 處佔位文字並隨 M1 併入新頁 `cases`（活動與展會、媒體露出、主案例） | 全 `src/content/` 搜尋「待補」零命中；缺圖者移除該筆而非留空；`/cases` 無空區塊 | TBD |
| FR-204 | 依 M1 決策調整 `src/content/site/<locale>.md` 的 `nav[]`（5 項加 CTA）與 `defaultAction` 預設 CTA | 導覽標籤與 wireframes §2.3 逐項一致；中英兩語系項數與順序相同（PRD-004 FR-407） | TBD |
| FR-205 | 產出 8 條路由的英文文案（M2），並移除 Phase A 暫掛在 `/en/` 標題上的 `[EN] ` 前綴與 `draft` 標記 | 每個 zh-Hant frontmatter 欄位皆有對應英文內容，無漏欄位；英文版 build 綠燈；`dist/en/**` 搜尋 `[EN] ` 零命中；專有名詞（KIP、Wally、IKA、IKS、KC、公司全名）用詞表一致 | TBD |
| FR-206 | 建立中英文對照用詞表（產品名、技術名詞、公司抬頭） | 用詞表存於 `docs/`，FR-205 全數依表；同一詞在全站無兩種譯法 | TBD |

## 4. NFR 差異

| 維度 | 目標值 | 與基準線差異原因 |
|---|---|---|
| SEO | 每條路由中英文各自唯一的 title／description | 雙語站台的 metadata 需逐 locale 撰寫，屬本 PRD 的內容工作 |

## 5. 風險

| 風險 | 機率 | 衝擊 | 緩解 |
|---|---|---|---|
| 行銷部 KIP 簡報延遲，內容工作全線阻塞 | H | H | 先做不依賴 KIP 定位的 FR-202／FR-203；M1 只需資訊架構結論，不需完整文案 |
| M1 拍板後新增 3 頁（`/kip`、`/kip/security`、`/cases`），新寫文案量（問答演示 3 組、主案例全文、IKA 定義段）壓在行銷部 | H | M | `S1`–`S3` 可直接上站的部分先行；新寫項目逐條列於 [`../design/content-gap-list.md`](../design/content-gap-list.md) 並標負責人 |
| 英文文案由非母語者撰寫，品質不一 | M | M | FR-206 用詞表加母語者校對一輪，校對紀錄留存 |
| 改錯 frontmatter 欄位名導致建置期 zod 驗證失敗 | L | M | 錯誤訊息已含檔名與欄位路徑（PRD-001 FR-103）；`npm run build` 為每次文案 commit 的必過關卡 |

## 6. 驗收方式

| # | 方式 | 通過條件 |
|---|---|---|
| 1 | `npm run build` | 綠燈（key 缺漏會在建置期失敗） |
| 2 | 全 `src/content/` 搜尋「待補」、`TODO`、`Lorem` | 零命中 |
| 3 | 8 條路由逐頁人工閱讀（中英各一輪） | 無空區塊、無空表格、專有名詞一致 |
| 4 | 中英 frontmatter 欄位對照檢查 | 兩個 locale 的欄位集合完全相同 |

## 7. Open Questions

| # | 問題 | 待決者 | 期限 |
|---|---|---|---|
| OQ-1 | KIP 的定位、產品規格與命名（含是否含子產品線） | 行銷部 | M1 之前 |
| OQ-2 | **已決（2026-09-08）**：不併入 `/products`，而是 `/products` 併入 `/kip`；KIP 即主軸（見 M1） | 業主 + 行銷部 | 已決 |
| OQ-3 | **已決（2026-09-08）**：Wally 是 KIP 的現場化身，同一產品線的兩個出口。`/wally` Hero 定位句、首頁 Wally 區塊與 `/kip` 的「現場出口」段落皆依此撰寫；同日裁定對外優勢採 `S2` 的八項 | 業主 | 已決 |
| OQ-4 | 英文版的目標市場與語調（正式／技術／行銷） | 行銷部 | M2 開工前 |
| OQ-5 | `media.md` 的活動年份、地點、圖片由誰提供 | 行銷部 | 2026-09-21 |
| OQ-6 | 成效指標為何（詢問數、停留時間），站上目前無任何 analytics | 業主 | 與 PRD-004 OQ 併案 |

## 8. 變更紀錄

| 版本 | 日期 | 變更摘要 | commit / ADR |
|---|---|---|---|
| v0.1 | 2026-09-07 | 初版，建立 M1／M2 里程碑與 FR-201 至 FR-206 | |
| v0.2 | 2026-09-08 | **M1 拍板**：KIP 取代 `/products` 成為 `/kip` 並吸收 `/knowledge-base`、`/agi`，`/media` 併入 `/cases`，新增 `/kip/security`；路由數由 9 改為 8，涵蓋檔案改為 `src/content/**`；文案事實來源明列為 `kip-deck-extract.md`；OQ-2 已決、OQ-3 補記展位照片事實仍待裁定；FR-201／203／204／205 依新架構調整 | [wireframes-v1](../design/wireframes-v1.md) §2、PRD-004 FR-401 |
| v0.3 | 2026-09-08 | 業主裁定：Wally 是 KIP 的現場化身（OQ-3 已決）；對外優勢採 `S2` 八項而非 `S1` 十項。文案結構以 [wireframes-v2](../design/wireframes-v2.md) 為準 | wireframes-v2 |
