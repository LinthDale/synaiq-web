# PRD-001：架構重整：Astro + React islands 換底重建

| 版本 | 狀態 | Owner | ADO Feature | 最後更新 |
|---|---|---|---|---|
| v1.1 | Locked | Dale | [#1296](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1296) | 2026-09-08 |

> NFR 繼承 [`../guidelines/PRD-Guideline-Web.md`](../guidelines/PRD-Guideline-Web.md) §4，本文只列差異；換底決策、被否決方案與查證來源見 [`ADR-001`](../adr/ADR-001-astro-react-islands-hostinger.md)；舊樹現況見 [`../../HANDOVER.md`](../../HANDOVER.md)。三者皆不複述。

## 1. 問題與目標

**問題**：站台建立在 `vinext@1.0.0-beta.2` 上，跑在 Cloudflare Worker、託管 OpenAI Sites，而公司實際持有的是 Hostinger 帳號，repo 內零部署設定，改完既無法上線也無法驗證。
內容靠自寫 `## key` 解析器載入，無 schema、無 per-locale 結構；Tailwind 裝了零使用；測試讀 `.tsx` 原始碼做 regex 比對。原地清理只會把四條工作線繼續疊在一個無升級路徑、無部署路徑的 beta 相容層上。

| 項目 | 內容 |
|---|---|
| Goal | 1. **建置與部署**：乾淨 clone 執行 `npm ci && npm run build` 產出純靜態 `dist/`，並依文件化步驟成功部署到 Hostinger `public_html` 一次；2. **效能**：內容頁（§2 islands 表列之外）client JS 為 0 bytes，Lighthouse 行動裝置達 guideline §4 四項門檻，`public/` ≤ 15 MB；3. **內容**：9 頁 × 2 語系以 Content Collections 加 zod schema 載入，任一必填欄位缺漏在 build 期失敗並指出檔名與欄位路徑 |
| Non-Goal | 1. 不做視覺改版（PRD-003）、不改資訊架構與導覽項（PRD-004）、不改文案（PRD-002）；2. 不移植舊視覺（業主裁定全面重做）：token **數值**只放一組中性佔位（灰階加一個強調色），正式色票與字級歸 PRD-005；3. 不寫英文文案（PRD-002 M2），本案只建 `/en/` 路由骨架與佔位內容 |
| Constraints | Hostinger Git 部署不執行 build、原生自動部署僅綁 GitHub，而本 repo 在 Azure DevOps，故 build 必須在 Hostinger 之外完成；Astro 7 需 Node ≥ 22.12.0；Hostinger 方案已確認為 Business Web Hosting，`synaiq.com` 現為其上的 WordPress 站，CDN 與 SSH 未確認（§7）；重建期間舊站與現行 WP 皆維持現狀不動 |
| 角色 | 開發者（重建執行者）、內容編輯（改 frontmatter 欄位，仍需重新 build 才生效） |

## 2. 範圍

```
astro.config.mjs        output:'static'、i18n（zh-Hant 無前綴／en 前綴）、integrations:[react()]
src/content.config.ts   defineCollection + glob() loader + zod schema
src/content/site/{zh-hant,en}.md
src/content/pages/{zh-hant,en}/{home,about,products,wally,knowledge-base,generative-ai,agi,media,contact}.md
src/layouts/、src/components/**.astro（零 client JS）、src/components/islands/**（唯一可寫 React 之處）
src/pages/{index,about,…,styleguide}.astro、src/pages/en/**
src/styles/tokens.css（token 單一事實來源）、public/（字型與品牌資產，經 FR-108 瘦身）
```

導覽、頁尾、`/styleguide` 與全部內容區塊皆為 `.astro`，零水合。候選 island 只有下列四項：

| 元件 | 是否 island | 水合指令 | 備註 |
|---|---|---|---|
| 行動選單開合 | 是 | `client:media` | 先試純 CSS，不成立才升為 island |
| 語言切換器 | 否（預設） | — | 對應 URL 在 build 期可算出，`<a>` 即可；PRD-004 若要求下拉互動再升為 island |
| 首頁 GSAP 捲動敘事 | 待定 | `client:visible` | 是否保留由 PRD-003 決定（OQ-3），保留則為全站最大 island |
| `/contact` 表單 | 待定 | — | 現況 `mailto:`，是否做表單歸 PRD-004 FR-406 |

### 內容模型與編輯規則

| Collection | 檔案 | frontmatter 欄位（正文 markdown 走 `render()` 的 `<Content />`） |
|---|---|---|
| `site` | `src/content/site/<locale>.md` | `header{skipLink,homeLabel,menuOpen,menuClose,navigationLabel}`、`nav[]{label,href,style}`、`footer{company,copyright}`、`defaultAction{eyebrow,title}` |
| `pages` 基底 | `src/content/pages/<locale>/<slug>.md` | `metadata{title,description,titleTemplate?,ogImage?}`、`hero{eyebrow?,title,description,caption?,imageAlt?,scrollHint?,primaryAction?,secondaryAction?}`、`action{eyebrow?,title?,description?,label}`、`draft?`、`blocks[]` |
| `blocks[]` | 同上，`z.discriminatedUnion('type')` | `services{items[],documents[]{kind,label},target}`、`products{items[]{name,description,href},itemAction}`、`technology{abilities[]{code,title,description}}`、`experience{items[],images[]{src,alt,caption},devicesLabel}`、`capabilities`／`features`／`vision`／`selection`／`approach`{eyebrow,title,description?,items[]}、`flow{steps[]}`、`models{items[],scenarioLabel,comparisonLabel,comparisonHeadings[]}`、`screenshots{items[]}`、`team{groups[]{eyebrow,title,members[]}}`、`supporting{photos[]}`、`news{empty{title,description,action}}`、`events{items[]{title,status,details,imagePlaceholder}}`、`social{platform,status,description,action,actionLabel}`、`consultation{steps[]}`、`contact{cards[]}`、`deployment{items[]}`、`useCases{description}` |

| 編輯者面向 | 之前 | 之後 |
|---|---|---|
| 區塊識別 | `## key` 二階標題，`##` 之前的內容視為註解 | YAML frontmatter 欄位名，`---` 之後為正文 |
| 表格 | markdown 表格由 `table()` 解析成物件陣列 | frontmatter 的 YAML 陣列，欄位名即 key |
| 語系 | 單一檔案、單一語系 | 每語系一份檔案，路徑即語系 |
| 錯誤時機 | build 期 throw，訊息只有 key 名 | build 期 zod 驗證失敗，訊息含檔名與欄位路徑（仍需重新 build 才生效） |

**不沿用**：舊樹 `app/**`、`worker/`、`build/sites-vite-plugin.ts`、`.openai/`、`db/`、`drizzle/`、`app/chatgpt-auth.ts`、`app/_sites-preview/`、`next.config.ts`、
`scripts/status-reporter.mjs`、`WEBSITE_CODE_HANDOFF.md`、Tailwind v4、`tests/rendered-html.test.mjs` 一律不移植；沿用者只有 `content/pages/*.md` 的文字、`public/brand/**` 與字型；舊色票**不沿用**，暫用 token 為中性佔位。
**構造上即滿足**：`http://localhost:8400` 帶 token 的 live script、首頁「畫布編輯」按鈕、`app/_sites-preview/`、讀 `.tsx` 原始碼的 regex 測試在新樹中**都不存在**，
舊 FR-101／102／103 無須實作；該 token 仍視為已外洩，輪替待辦另掛 ADO Task 並指派上游窗口。

## 3. 功能需求

| FR | 需求 | 驗收條件 | ADO Task |
|---|---|---|---|
| FR-101 | Astro 7 骨架：`@astrojs/react`、`output:'static'`、i18n（`defaultLocale:'zh-Hant'`、`routing.prefixDefaultLocale:false`） | `npm ci && npm run build` 綠燈並產出 `dist/`；`dist/index.html` 與 `dist/en/index.html` 皆存在；README 記錄 Node ≥ 22.12.0 | TBD |
| FR-102 | CSS 手冊三合一機制：`src/styles/tokens.css` 為唯一 custom property 來源（`.astro` scoped `<style>` 與 island 的 CSS Modules 只引用 token），加 `/styleguide` 路由與 `docs/` 手冊文件 | 全 repo 除 `tokens.css` 外零硬編碼色值；改一個 token 值後 `/styleguide` 與至少兩條路由同步變動；`dist/styleguide/index.html` 含 `<meta name="robots" content="noindex">` 且不在 sitemap；頁面列出全部 token 的變數名與實際值 | TBD |
| FR-103 | `src/content.config.ts`：以 `glob()` loader 加 zod 定義 `site` 與 `pages` 兩個 collection，per-locale | 任一必填欄位缺漏時 `astro build` 失敗並輸出檔名與欄位路徑；新增語系只需加目錄與 config 一行，不改任何 `.astro` | TBD |
| FR-104 | 內容遷移：9 頁加 `site.md` 的 zh-Hant 文字由 `## key` 轉為 frontmatter 與正文 | 舊 key 對照表由遷移腳本產生並留存，逐頁 diff 零遺漏；`/en/` 以 zh-Hant 佔位並標 `draft: true`，不入 sitemap、不顯示切換器 | TBD |
| FR-105 | 元件重建：9 條路由以 `.astro` 重建，React 僅限 `src/components/islands/`。**閘門：wireframe（PRD-004）與設計方向（PRD-005 token、PRD-003）定案後才開工**；在此之前頁面只以結構化語意 HTML 呈現內容，不做視覺 | `dist/` 內容頁除 §2 表列 islands 外零 `<script type="module">`；`client:` 指令出現位置與 §2 表一致 | TBD |
| FR-106 | 語系與 SEO 骨架：兩語系 `sitemap.xml`、`hreflang` 成對含 `x-default`、canonical、每頁唯一 title/description | sitemap 涵蓋兩語系且排除 `draft` 與 `/styleguide`；每對頁面互指 `hreflang`；title 全站無重複 | TBD |
| FR-107 | 測試改為對 `dist/` HTML 斷言 | 測試檔零 `.astro`／`.tsx` 原始碼讀取、零 byte 數斷言；9 條路由 × 2 語系各有「關鍵區塊存在」「`<html lang>` 正確」「`<title>` 全站唯一」三類斷言；改 class 名或抽元件不變紅 | [#1303](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1303) |
| FR-108 | 資產瘦身與搬遷：字型 subset 轉 WOFF2、刪零引用大檔、壓縮大圖 | 字型 ≤ 300 KB、單張圖 ≤ 500 KB、`public/` ≤ 15 MB；18 個頁面目視無缺字、無破圖 | TBD |
| FR-109 | Hostinger 部署基線：定案並文件化「乾淨 clone → build → 上傳 `dist/` → 驗證」，且實際走一次 | `docs/` 內有可照做步驟；部署方式（SFTP、Hostinger Git 加 SSH、或 CI 推送）已定案；上線後 18 個 URL 可開、零 mixed content、HTTPS 正常 | [#1307](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1307) |

### Sprint 22 既有 Task 處置

| ID | 處置 | 提案新標題／理由 |
|---|---|---|
| [#1303](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1303) | 保留改題（→ FR-107） | `[官網] PRD-001 FR-107 測試改為對 dist/ HTML 斷言` |
| [#1304](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1304) | 關閉為 superseded | 新樹不含該 live script，構造上即滿足；token 輪替另開 Task |
| [#1305](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1305) | 關閉為 superseded | 新樹不存在 `app/_sites-preview/` |
| [#1306](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1306) | 關閉為 superseded | 新樹不存在「畫布編輯」按鈕 |
| [#1307](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1307) | 保留改題（→ FR-109） | `[官網] PRD-001 FR-109 Hostinger 部署基線` |

## 4. NFR 差異

| 維度 | 目標值 | 與基準線差異原因 |
|---|---|---|
| Client JS | 內容頁（§2 islands 表列之外）0 bytes | 基準線只規範 CWV，未規範 JS 量；Astro 零 JS 為預設，可直接當驗收條件 |
| 語系、SEO 與建置 | 本 PRD 只交付語系機制骨架（`lang`／`hreflang`／兩語系 sitemap），英文文案歸 PRD-002、切換 UX 歸 PRD-004；`/styleguide` 為 `noindex` 且排除於 sitemap；建置指令為 `npm ci && npm run build && npm test`，Node ≥ 22.12.0 | 基準線把語系標記寫成單一條目，需切分歸屬以免重工；手冊頁不對外索引；Astro 7 有 Node 下限 |

## 5. 風險

| 風險 | 機率 | 衝擊 | 緩解 |
|---|---|---|---|
| Hostinger 部署路徑未確認（不 build、原生自動部署綁 GitHub，本 repo 在 Azure DevOps） | H | H | FR-109 提前到 FR-101 之後的第二優先；未走通一次實際部署前不進內容遷移；備案為 SFTP 上傳 `dist/` 或 ADO Pipeline 推送 |
| 內容 schema 遷移遺漏或錯置（9 頁、上百個 key） | H | M | FR-104 以腳本產生舊 key 對照表逐頁 diff，非人工搬運；zod 必填欄位讓遺漏在 build 期爆 |
| island 邊界劃錯，整頁 JS 被拉回來 | M | H | §2 明列 islands 白名單；FR-105 以 `dist/` 內 `<script type="module">` 數量為驗收條件，超出即失敗 |
| `/en/` 前綴上線後再改，既有連結與 SEO 權重流失 | M | H | 英文頁在 PRD-002 M2 前標 `draft` 不入 sitemap；zh-Hant 既有 9 條 URL 不改；日後變更需新 ADR 加 301 導向 |
| 團隊不熟 Astro，island 與 scoped CSS 上手期拖慢進度 | H | M | FR-101 至 FR-102 先做一條最小垂直切片再全站推廣；`/styleguide` 同時當內部範例頁 |
| 首頁 GSAP 捲動敘事移植成本被低估 | M | M | OQ-3 在 FR-105 開工前拍板；未拍板前首頁先上靜態版本，敘事以獨立 island 後補 |

## 6. 驗收方式

| # | 方式 | 通過條件 |
|---|---|---|
| 1 | 乾淨 clone 執行 `npm ci && npm run build && npm test`，再故意刪一個必填 frontmatter 欄位重跑 build | 三者綠燈且原始輸出留存並附給業主；刪欄位後建置失敗且訊息含檔名與欄位路徑 |
| 2 | `grep -rn "script type=\"module\"" dist/`、`grep -rn "client:" src/`、在 `dist/` 搜尋 `localhost`／`8400`／`http://` | 前兩者命中位置與 §2 islands 表一致；後者零命中 |
| 3 | 量測 `public/` 總量與最大單檔 | ≤ 15 MB、單張圖 ≤ 500 KB、字型 ≤ 300 KB |
| 4 | 依 FR-109 文件實際部署一次，並對首頁與兩條內頁跑 Lighthouse 行動裝置 | 18 個 URL 可開、HTTPS 正常、零 mixed content；Lighthouse 達 guideline §4 四項門檻 |

## 7. Open Questions

| # | 問題 | 待決者 | 期限 |
|---|---|---|---|
| OQ-1 | **已決（2026-09-07）**：部署路徑 A，ADO Pipeline 建置後以 SFTP 推送 `dist/`。FTP 主機、帳號與密碼由業主放入 ADO 變數群組，不進 repo。CDN 與 SSH 是否可用仍未確認 | 業主 | 已決 |
| OQ-1b | **已決（2026-09-07）**：staging 用帳號內的 `*.hostingersite.com` 暫時網域（現為空白 WordPress，部署時覆蓋）；`synaiq.com` 的 WP 在 staging 驗證通過前不動，切換窗口另定 | 業主 | 切換窗口待定 |
| OQ-2 | **確認舊樹無任何內容需移植**（原 v0.2 OQ-7「授權刪除死碼」已不適用：本案為新樹重建，除文字、品牌資產與 7 個色票外零沿用） | 業主 | FR-104 開工前 |
| OQ-3 | 首頁 GSAP 捲動敘事是否保留（保留則為最大 island，成本另估） | 業主 → PRD-003 | FR-105 開工前 |
| OQ-4 | `/contact` 維持 `mailto:` 或導入真表單（純靜態託管下表單需外部服務） | 業主 → PRD-004 FR-406 | FR-105 開工前 |
| OQ-5 | 英文 URL 前綴確認為 `/en/`（Astro `prefixDefaultLocale:false` 的預設形式） | 業主 → PRD-004 FR-402 | FR-101 開工前 |
| OQ-6 | CI 選型：ADO Pipelines 建置後推送，或維持本機建置人工上傳 | 業主 | FR-109 開工前 |

## 8. 變更紀錄

| 版本 | 日期 | 變更摘要 | commit / ADR |
|---|---|---|---|
| v0.1 | 2026-09-07 | 初版，依 `HANDOVER.md` 建立 FR-101 至 FR-108 | |
| v0.2 | 2026-09-07 | 掛接 Sprint 22：PBI [#1302](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1302) 與 Task #1303 至 #1307（FR-106／101／102／103／107）。FR-104、105、108 未排入 sprint | |
| v0.3 | 2026-09-07 | 業主裁定換底重建：Astro 加 React islands、託管 Hostinger、純 CSS token、Content Collections、Astro 內建 i18n。全文改寫，FR 重編為 FR-101 至 FR-109，補 Sprint 22 Task 處置表 | [ADR-001](../adr/ADR-001-astro-react-islands-hostinger.md) |
| v1.0 | 2026-09-07 | **Locked**。業主接受 ADR-001；OQ-1 定為部署路徑 A、OQ-1b 定為暫時網域 staging；裁定視覺全面重做，故不移植舊色票，FR-106 閘在設計方向定案之後 | ADR-001 Accepted |
| v1.1 | 2026-09-08 | 內文不動（Locked），僅記錄兩件事：**Phase A 已於分支 `feat/astro-rebuild` 實作完成**（7 commits、`npm run build` 產出 19 頁、`npm test` 25/25、內容頁零 client JS、191 個舊 key 遷移 0 未對應；`/en/` 標題暫掛 `[EN] ` 前綴、draft 頁輸出 `noindex, follow`、header 因無可用 logo 暫用文字「SynaiQ」）；**FR-104 驗收條件中的「不顯示切換器」由 PRD-004 FR-402 取代**（2026-09-08 業主裁定：切換器提前顯示、缺頁退到上層區段頁並標示，英文路由維持 `noindex` 且不入 sitemap），同日 OQ-4 由 [ADR-002](../adr/ADR-002-contact-form-php-endpoint.md) 定案為自架 PHP 端點，§2 islands 表的「`/contact` 表單」據此成立 | [ADR-002](../adr/ADR-002-contact-form-php-endpoint.md)、[PRD-004](PRD-004-uiux.md) v0.3 |
