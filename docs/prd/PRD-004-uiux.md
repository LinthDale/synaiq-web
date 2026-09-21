# PRD-004：UIUX 更新與雙語資訊架構

> **歷史需求快照（2026-09-09 整理註）**：以下保留早期路由、需求與決策沿革，不是目前網站現況或待選風格清單。舊線框及缺口稿已刪除，僅存 Git `428c053` 歷史；目前 Home／KIP 中英雙語見 [設計維護入口](../design/README.md)，正式站與 Astro 界線見 [專案 README](../../README.md)。本次不更改需求或 ADO 狀態。

| 版本 | 狀態 | Owner | ADO Feature | 最後更新 |
|---|---|---|---|---|
| v0.4 | Draft | Dale | [#1299](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1299) | 2026-09-08 |

> NFR 一律繼承 [`../guidelines/PRD-Guideline-Web.md`](../guidelines/PRD-Guideline-Web.md) §4，本文只列差異。
> 路由表與內容管線見 [`../../HANDOVER.md`](../archive/HANDOVER-2026-09-07.md) §2。
> 資訊架構、線框與各頁區塊來源見 `../design/wireframes-v1.md`（已移除，僅存 Git `428c053` 歷史），本文不複述。

## 1. 問題與目標

**問題**：站上有 9 條路由，但導覽列只露出 4 項（關於公司／產品／媒體中心／聯絡我們），
`/wally`、`/knowledge-base`、`/generative-ai`、`/agi` 只能靠內文連結或直接輸入網址進入，
訪客找不到主要內容。RWD 斷點在 CSS 中混用 560／900／1199／1200 多組，未經整體檢視；
可及性未做過完整檢查；而網站即將改為繁體中文加英文雙語，URL 策略、語言切換與 `hreflang`
都還沒有結構。在資訊架構與雙語結構定案前先改視覺，會整批做白工。

| 項目 | 內容 |
|---|---|
| Goal | 1. M1 拍板後的 8 條路由全部可在兩次點擊內從首頁到達，4 條舊路由以 301 承接；2. 全站達 WCAG 2.2 AA，Lighthouse A11y ≥ 95；3. 雙語結構落地：每頁 `<html lang>` 正確、`hreflang` 成對、語言切換保留當前頁面 |
| Non-Goal | 不改文案內容（PRD-002）、不套用最終品牌樣式（PRD-003）、不做第三語系、不做會員或登入流程 |
| Constraints | PRD-002 M1（KIP 路由與導覽）已於 2026-09-08 拍板，見 FR-401；需 PRD-005 手冊定案提供色票與字級；per-locale 內容結構與 i18n 路由由 PRD-001 先行交付，本 PRD 不得在其之前開工；改文案仍必須重新 build |
| 角色 | 潛在客戶（找產品資訊）、國際訪客（讀英文）、使用輔助科技的訪客 |

## 2. 範圍

| 項目 | 內容 |
|---|---|
| 涵蓋路由 | M1 拍板後的 8 條：`/`、`/kip`、`/kip/security`、`/wally`、`/generative-ai`、`/cases`、`/about`、`/contact`，以及全部的 `/en/` 對應；另含 `/products`、`/knowledge-base`、`/agi`、`/media` 四條舊路由的 301 |
| 涵蓋檔案 | 換底後（[ADR-001](../adr/ADR-001-astro-react-islands-hostinger.md)）為 `src/pages/**` 與 `src/layouts/BaseLayout.astro` 的結構與語意標記、`src/content.config.ts` 的 schema、`src/content/pages/<locale>/` 的內容、`src/styles/` 的斷點與版面、`SiteHeader` 導覽元件（含行動選單 island） |
| 涵蓋設計工作 | **per-locale 內容結構的設計屬本 PRD 範圍**：目前 `content/pages/*.md` 為單一語系並在 build 時以 `?raw` 內嵌，本 PRD 負責設計擴充為每語系一份檔案的結構與載入方式；實際英文文案的撰寫屬 PRD-002 M2 |
| 不涵蓋 | 品牌色票與字級的最終數值（PRD-005）、樣式套用（PRD-003）、英文文案內容（PRD-002 FR-205） |
| 依賴 PRD | PRD-005（手冊）；PRD-002 M1 硬閘門已於 2026-09-08 解除；PRD-003 依賴本 PRD 的產出 |

## 3. 功能需求

| FR | 需求 | 驗收條件 | ADO Task |
|---|---|---|---|
| FR-401 | **資訊架構已決（2026-09-08，業主裁定即 PRD-002 M1）**：`/products`、`/knowledge-base` 併入 `/kip`，`/agi` 併入 `/kip#ika`，`/media` 併入 `/cases`；新增 `/kip/security` 與 `/cases`；主導覽 5 項加 1 CTA（KIP 平台／Wally 數位人／生成式 AI／應用實績／關於 SynaiQ 加「洽談導入」），無下拉，`/generative-ai` 不進主導覽仍由頁尾與內鏈進入 | 網站地圖與導覽與 wireframes §2.2／§2.3（已移除，僅存 Git `428c053` 歷史） 逐項一致；首頁起算兩次點擊可達每一條路由；`src/content/site/<locale>.md` 的 `nav[]` 同步更新；wireframes §2.4（已移除，僅存 Git `428c053` 歷史） 的 4 條 301 以 `.htaccess` `Redirect 301` 實作（中英各一組），部署後逐條驗證狀態碼為 301 且落點正確 | TBD |
| FR-402 | **i18n URL 策略與語言切換**：路由機制已由 [ADR-001](../adr/ADR-001-astro-react-islands-hostinger.md) 定為 Astro 內建 i18n（zh-Hant 無前綴、英文 `/en/` 前綴）並由 PRD-001 FR-101／FR-106 建骨架；本 FR 負責確認該形式、實作 header 語言切換器與缺頁行為。**業主裁定（2026-09-08）**：英文文案完成前切換器即顯示；目標語系無對應頁時切到該語系的上層區段頁並顯示可見提示，不靜默導回首頁；英文路由在 PRD-002 M2 前維持 `noindex` 且不進 sitemap。本裁定**取代** PRD-001 FR-104 驗收條件中的「不顯示切換器」 | 每頁 `<html lang>` 為 `zh-Hant` 或 `en`；每對頁面互指 `hreflang` 且含 `x-default`（指向無前綴 zh-Hant）；語言切換停留在對應的同一頁而非回首頁；缺對應頁時落在該語系上層區段頁且提示對鍵盤與螢幕報讀器可達；M2 前 `/en/**` 皆輸出 `<meta name="robots" content="noindex, follow">` 且不在 `sitemap.xml` | TBD |
| FR-403 | per-locale 內容結構已由 PRD-001 FR-103／FR-104 以 Astro Content Collections 加 zod schema 交付（`src/content/pages/<locale>/*.md`）；本 FR 只負責驗收該結構並補足 IA 調整所需的欄位 | 兩語系各自 build 綠燈；任一語系缺必填欄位時建置期即失敗並指出檔名與欄位路徑；新增語系不需修改任何 `.astro` | TBD |
| FR-404 | **全站 RWD（業主 2026-09-08 明示為硬性要求）**：單一流動式版面、mobile-first，不做桌機與手機兩套固定版。斷點集中定義於 `src/styles/`（建議三段：≤ 767 手機、768 至 1279 平板、≥ 1280 桌機，容器上限 1440）並全站引用；字級與間距以 `clamp()` 流動；圖片用 `<picture>`／`srcset`＋`sizes` 與 `loading="lazy"`；表格於窄幅依 wireframe 註解轉為堆疊卡片或容器內橫向捲動；導覽於 < 1024 轉抽屜；觸控目標 ≥ 44px；`prefers-reduced-motion` 有降級。每個區塊在 1440／768／390 的重排規則以 wireframes-v2（已移除，僅存 Git `428c053` 歷史） 為準。做法依據 MDN「Responsive design」與 web.dev「Learn Responsive Design」 | 自動化：`tests/rwd.test.mjs` 以 headless Chrome 用 320／390／768／1024／1280／1440／1920 七個寬度渲染 `dist/` 全部路由，斷言 `document.documentElement.scrollWidth <= window.innerWidth`（零橫向捲軸）且無元素右緣超出視窗；Lighthouse 行動裝置達 guideline §4 門檻。人工：iPhone SE、iPad 直式、1920 桌機各一輪目視無破版、字不被截、表格可讀 | TBD |
| FR-405 | WCAG 2.2 AA 全站符合：語意標記、標題階層、焦點順序與可見焦點、跳至主要內容連結、圖片替代文字、鍵盤可操作 | 自動掃描零 violation；鍵盤單獨走完全部路由與導覽展開／收合；`src/content/pages/**` 內每張圖有 alt；Lighthouse A11y ≥ 95 | TBD |
| FR-406 | `/contact` 互動方式**已決（2026-09-08）**：採 [ADR-002](../adr/ADR-002-contact-form-php-endpoint.md) 的 Hostinger 自架 PHP 收信端點（wireframes §5 選項 B），表單欄位為 wireframes §3.7（已移除，僅存 Git `428c053` 歷史） 三問加姓名／單位／聯絡方式 | ADR-002 §驗收 5 項全數通過（含 security-reviewer 零 CRITICAL）；頁面同時保留電話與 Email 明碼；同意勾選框預設不勾選；關閉 JS 仍可送出並看到結果頁 | TBD |
| FR-407 | 導覽與頁尾的雙語一致性：兩語系的導覽項數量與順序一致 | 兩語系導覽項對應完整，無單語系獨有項目（例外需書面說明） | TBD |

## 4. NFR 差異

| 維度 | 目標值 | 與基準線差異原因 |
|---|---|---|
| 語系標記 | 為本 PRD 的 Goal 之一，需逐頁驗收 | FR-402 是基準線中 `lang`／`hreflang` 條目的唯一實作者 |
| 無障礙 | WCAG 2.2 AA，且需人工鍵盤走查一輪 | 自動掃描抓不到焦點順序與操作流程問題 |

## 5. 風險

| 風險 | 機率 | 衝擊 | 緩解 |
|---|---|---|---|
| M1 已拍板但新頁（`/kip`、`/kip/security`、`/cases`）文案未到位，IA 上線後頁面半空 | M | M | 三頁主體文案可由 `S1`–`S3` 直接產出（PRD-002 FR-201）；文案未齊的區塊不上線而非留空 |
| i18n URL 策略選錯，日後改動導致既有連結全失效 | M | H | FR-402 以 ADR 記錄決策與替代方案；一旦有對外連結流通即不可再改，改動需新 ADR 加 301 導向 |
| IA 調整新增的欄位破壞 PRD-001 交付的 zod schema 與「缺欄位即建置失敗」特性 | M | M | FR-403 明列此特性為驗收條件；schema 變更先在單一路由試作再全站推廣 |
| 英文文案未就緒導致英文頁半空 | H | M | 英文路由在 PRD-002 M2 完成前 `noindex` 且不列入 sitemap；切換器照常顯示，缺頁退到該語系上層區段頁並顯示提示（FR-402） |
| 4 條舊路由 301 併入新路由，既有 SEO 權重與外部連結流失 | M | M | wireframes §2.4 全表以 `.htaccess` 301 承接（非 302、非 JS 導向），名片與展場物料的舊網址亦可承接；上線後逐條驗證並觀察 Search Console |
| `/contact` PHP 端點成為全站唯一伺服器端攻擊面 | M | H | [ADR-002](../adr/ADR-002-contact-form-php-endpoint.md) 已列驗收 5 項；go-live 前須經 security-reviewer 審過；日誌零個資 |

## 6. 驗收方式

| # | 方式 | 通過條件 |
|---|---|---|
| 1 | 資訊架構業主簽核 | 已於 2026-09-08 簽核，存於 `../design/wireframes-v1.md`（已移除，僅存 Git `428c053` 歷史） §2 |
| 2 | 自動無障礙掃描（8 條路由 × 2 語系） | 零 violation |
| 3 | 鍵盤單獨走查（不用滑鼠） | 可完成導覽、切換語言、觸發所有 CTA |
| 4 | 檢視每頁 `<html lang>` 與 `hreflang` | 逐頁正確且成對，含 `x-default` |
| 5 | 320px 至 1920px 逐段檢視 | 無破版、無橫向捲軸 |
| 6 | `npm run build`、`npm test`、Lighthouse 行動裝置 | 綠燈且 A11y ≥ 95 |
| 7 | 舊路由 301 驗證（4 條 × 中英兩組） | 回應碼為 301，落點與 wireframes §2.4 一致 |
| 8 | 語言切換缺頁走查（挑 2 條尚無英文的路由） | 落在該語系上層區段頁且提示可見，未靜默導回首頁 |

## 7. Open Questions

| # | 問題 | 待決者 | 期限 |
|---|---|---|---|
| OQ-1 | **i18n URL 策略**：[ADR-001](../adr/ADR-001-astro-react-islands-hostinger.md) 已定為 zh-Hant 無前綴加英文 `/en/` 前綴，待業主書面確認；若要改子網域需新開 ADR | 業主 + 開發者 | FR-402 開工前 |
| OQ-2 | **已決（2026-09-08）**：主導覽 5 項加 1 CTA、無下拉，`/generative-ai` 不進主導覽（wireframes §2.3） | 業主 | 已決 |
| OQ-3 | **已決（2026-09-08）**：KIP 取代 `/products` 成為 `/kip`，不新增第三個入口（即 PRD-002 M1） | 業主 + 行銷部 | 已決 |
| OQ-4 | 英文版是否需要獨立的 metadata 與 OG 圖 | 行銷部 | FR-402 開工前 |
| OQ-5 | **已決（2026-09-08）**：採 [ADR-002](../adr/ADR-002-contact-form-php-endpoint.md) 自架 PHP 端點；收件 `service@synaiq.com`，不落地資料庫、不經第三方 | 業主 | 已決 |
| OQ-6 | 成效指標與是否導入 analytics（站上目前完全沒有任何追蹤碼） | 業主 | 本 PRD 開工前 |

## 8. 變更紀錄

| 版本 | 日期 | 變更摘要 | commit / ADR |
|---|---|---|---|
| v0.1 | 2026-09-07 | 初版，建立 FR-401 至 FR-407，納入雙語資訊架構 | |
| v0.2 | 2026-09-07 | 依換底決策調整：涵蓋檔案改為 `src/**`，i18n 路由與 per-locale 內容結構改由 PRD-001 交付，本 PRD 只負責 IA、切換 UX 與驗收；OQ-1 由「待決策」改為「待確認」 | [ADR-001](../adr/ADR-001-astro-react-islands-hostinger.md) |
| v0.3 | 2026-09-08 | 業主裁定三案落地：FR-401 資訊架構定案（`/kip` 為主軸、4 條 301、5 項導覽，即 PRD-002 M1）、FR-402 語言切換器提前顯示並定義缺頁行為（取代 PRD-001 FR-104 的「不顯示切換器」）、FR-406 表單採 ADR-002；OQ-2／OQ-3／OQ-5 標記已決，風險與驗收各補兩列 | [ADR-002](../adr/ADR-002-contact-form-php-endpoint.md)、wireframes-v1（已移除，僅存 Git `428c053` 歷史） |
| v0.4 | 2026-09-08 | 業主明示 RWD 為硬性要求：FR-404 改寫為單一流動式版面的具體做法與可自動化驗收（七個寬度零橫向捲軸的 headless 測試、Lighthouse 行動裝置門檻）；wireframes-v1 因結構被否決而作廢，改以 wireframes-v2（1440／768／390 三切片加逐區塊重排規則）為版面依據 | wireframes-v2（進行中） |
