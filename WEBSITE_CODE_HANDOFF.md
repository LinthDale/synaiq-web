# SynaiQ Website 程式碼交接說明

> 交接範圍：只包含網站的程式結構、執行時內容、公開素材、建置設定與測試方式。
> 本文件不包含聊天紀錄、對話逐字稿、Agent session 或其他聊天脈絡。
>
> 盤點日期：2026-08-28<br>
> 專案路徑：`D:\codex\synaiqweb`

## 1. 交接邊界

### 必要交接內容

- `app/`：Next App Router 頁面、共用元件、Markdown parser 與全站 CSS。
- `content/pages/`：網站實際執行時讀取的 Markdown 內容來源。
- `public/brand/`、`public/fonts/`：網站引用的 Logo、產品圖、團隊照片、產品介面圖與品牌字型。
- `package.json`、`package-lock.json`、`tsconfig.json`、`next.config.ts`、`vite.config.ts`、`postcss.config.mjs`、`eslint.config.mjs`：安裝、建置與檢查設定。
- `worker/`、`build/`：Cloudflare Worker entry 與 Sites build plugin。
- `tests/`、`scripts/`：目前的 server-rendering 回歸測試與唯讀狀態盤點工具。
- `types/`：Markdown raw import 的 TypeScript 宣告。

### 可作為技術參考、但不是網站執行時內容

- `DESIGN.md`、`PRODUCT.md`、`UIUX_IMPLEMENTATION_BRIEF.md`：設計、產品定位與 UI/UX 參考。
- `PROJECT_DASHBOARD.md`、`PROJECT_HANDOFF.md`、`website_content_editable.md`、`website_subpages_content_editable.md`、`PROJECT_CONFIRMATION_CHECKLIST.md`：專案管理、歷史彙整或內容確認文件；本次只交接網站程式碼，不要求轉移聊天紀錄，也不把這些文件內容複製到本說明之外。
- 若以整個 Git repository 交接，上述檔案可以原樣保留；但接收者應以本文件、`app/`、`content/pages/` 與目前實際程式碼為執行依據。

### 不應作為正式網站交接物

- 聊天紀錄、session export、Agent 任務逐字稿。
- `.env*`、API key、token、Cookie、私鑰或任何憑證。
- `node_modules/`、`.next/`、`dist/`、`.wrangler/` 等可重新產生的輸出。
- `.impeccable/live/` 等本機視覺檢視暫存內容；正式環境不可依賴本機 review bridge。

## 2. 目前程式狀態

以下是本次交接盤點時的 checkout 狀態，不代表已建立新的 release：

| 項目 | 目前狀態 |
| --- | --- |
| Branch | `codex/dev` |
| 最近可見 commit | `bdc72d2 feat: refine SynaiQ P1/P2 UI experience` |
| Working tree | 22 筆未提交變更（包含本文件）；接收者應先執行 `git status --short`，確認哪些變更要保留、提交或另行整理 |
| 公開主要路由 | 9 個：首頁加 8 個獨立頁面 |
| 資料庫／物件儲存 | `.openai/hosting.json` 目前為 `d1: null`、`r2: null`；目前頁面不依賴 D1 或 R2 |
| 部署 | 本次沒有 commit、push 或部署；正式發布需另行授權 |

## 3. 技術架構

```text
React 19
  └─ vinext / Next App Router API
       └─ Vite 8
            └─ Cloudflare Vite plugin
                 └─ Cloudflare Worker-compatible ESM output
```

- Node.js：`>=22.13.0`。
- 頁面使用 TypeScript、React JSX 與 App Router 檔案式路由。
- 網站文字不是由 CMS 或 API 提供；頁面在 build 時以 `?raw` import 讀取 `content/pages/*.md`。
- `worker/index.ts` 處理 vinext app-router request，以及 `/_vinext/image` 的 Cloudflare Images 影像最佳化入口。
- `db/index.ts`、`db/schema.ts`、`drizzle.config.ts` 是預留的 Drizzle／D1 骨架；目前 schema 為空，網站頁面沒有使用資料庫查詢。

## 4. 路由與檔案對照

| URL | React entry | 執行時內容來源 | 目前頁面構成 |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | `content/pages/home.md`、`content/pages/site.md` | 首頁六幕滾動故事、產品入口、產品證據、行動呼籲與聯絡區 |
| `/about` | `app/about/page.tsx` | `content/pages/about.md` | 公司介紹、方法、經營團隊、技術團隊、願景 |
| `/products` | `app/products/page.tsx` | `content/pages/products.md` | 四個產品入口：企業知識庫、生成式 AI、AGI、Wally 系列 |
| `/wally` | `app/wally/page.tsx` | `content/pages/wally.md` | 系列 Hero、場域選擇、五型號快速比較、五張型號卡、核心能力與 CTA |
| `/knowledge-base` | `app/knowledge-base/page.tsx` | `content/pages/knowledge-base.md` | 企業知識庫定位、能力、使用情境與介面截圖 |
| `/generative-ai` | `app/generative-ai/page.tsx` | `content/pages/generative-ai.md` | 生成式 AI 服務範圍、導入流程與成果圖 |
| `/agi` | `app/agi/page.tsx` | `content/pages/agi.md` | AGI 能力、RAG／推理／MCP／Agent 流程與部署方式 |
| `/media` | `app/media/page.tsx` | `content/pages/media.md` | 新聞空狀態、部分確認的活動卡、Instagram 入口；不渲染影音區塊 |
| `/contact` | `app/contact/page.tsx` | `content/pages/contact.md` | 電話、Email、公司地址與三步驟諮詢流程 |

`app/layout.tsx` 是全站 root layout，負責載入 `app/globals.css`、`zh-Hant`、metadata、viewport 與 favicon。檔案中目前仍有本機視覺檢視用的 live bridge；正式部署前要確認它不會依賴本機服務或把本機 review 設定帶入 production。

## 5. 內容載入方式

```text
content/pages/*.md
        │  ?raw
        ▼
parsePageMarkdown()  ── text(key) / lines(key) / table(key)
        ▼
各 route page.tsx 與共用元件
        ▼
React server-rendered HTML + globals.css
```

### `app/_content/markdown.tsx`

- `parsePageMarkdown(source)` 以 `## section.key` 作為內容識別碼。
- `text(key)` 讀取單一文字；找不到 key 會直接丟出 `Missing Markdown content section`，讓 build／測試暴露內容結構錯誤。
- `lines(key)` 解析 Markdown bullet 或 numbered list。
- `table(key)` 解析 Markdown table，第一列欄位名稱會成為資料物件的 key。
- `MarkdownText` 保留 Markdown 內容中的換行，將換行輸出為 `<br />`。

### 修改網站文字時

1. 修改 `content/pages/` 中對應頁面的 section 內容。
2. 不要任意改名或刪除 `##` 識別碼。
3. 表格第一列的英文欄位名稱要保留；資料列內容可依已確認資料修改。
4. 圖片路徑、連結行為、互動與版型由 `app/*.tsx` 管理，不要在 Markdown 自行發明新的程式行為。
5. 修改後重新執行 build、test、lint。

`website_content_editable.md` 與 `website_subpages_content_editable.md` 是歷史彙整／確認紀錄；目前網站的執行時文字以 `content/pages/` 為準。

## 6. 共用元件

### `app/_components/SiteHeader.tsx`

- client component，使用 `usePathname()` 判斷目前頁面。
- 導覽資料來自 `content/pages/site.md` 的 `header.navigation` table。
- 桌機顯示全站導覽；行動版用 menu button 開關導覽。
- 支援 `aria-expanded`、`aria-controls`、`aria-current="page"`、Escape 關閉與關閉後將 focus 還給 menu button。
- 提供全站 skip link。

### `app/_components/SubpageShell.tsx`

- 子頁共用 SiteHeader、`main#main-content`、Hero、內容容器、選用 CTA 與 footer。
- `pageClassName` 讓 `/products`、`/wally`、evidence pages、`/media`、`/contact` 套用 route-specific CSS。
- `heroVisual` 用於 Wally、企業知識庫與生成式 AI 的 Hero 圖像。
- CTA 的預設文字來自 `site.md`，各頁可傳入自己的 label、eyebrow、title、description。

### `ContentStatus.tsx` 與 `EmptyState.tsx`

- `ContentStatus` 顯示 `pending` 或 `draft` 狀態 badge。
- `EmptyState` 用於沒有可公開新聞時的空狀態，保留真實的聯絡 CTA，不製造假新聞連結。

## 7. 首頁互動與版型

首頁主要程式集中在 `app/page.tsx`：

- `sceneIds` 目前為 `brand`、`services`、`products`、`technology`、`experience`、`action` 六幕；`contact` 是故事段落外的最後聯絡區。
- 桌機（`min-width: 901px`）使用 GSAP `ScrollTrigger`、sticky stage、progress bar、scene fade／scale／clip-path 轉場與 directional snap。
- 行動版（`max-width: 900px`）改為自然直向閱讀，提供 sticky 的水平 scene navigation，不依賴桌機的整頁滾動故事高度。
- 非目前桌機 scene 會套用 `aria-hidden` 與 `inert`，避免鍵盤 focus 進入不可見內容。
- `prefers-reduced-motion: reduce` 時停用主要動畫、使用非平滑捲動並維持內容可讀性。
- 內嵌 `DocumentIcon` 依 `pdf`、`word`、`excel`、`image`、`scan` 顯示文件資料雲圖示。

### 首頁目前素材

- Hero 主視覺：`/brand/synaiq-logo-s.webp`。
- 產品入口：企業知識庫、生成式 AI、AGI、Wally 系列，分別連到對應獨立頁面。
- 產品畫面區：`/brand/knowledge-base.png`、`/brand/media-factory.png`、`/brand/wally-1.png`、`/brand/wally-mini.png`。

### 本機畫布編輯模式

- 以首頁 URL `/?edit=1` 開啟。
- 支援點選元件、拖曳位移、雙擊文字 `contentEditable` 編輯、面板內的 X／Y／文字大小調整，以及單項／全部重設。
- 儲存 key：`synaiq-home-canvas-overrides`。
- 設定只存於目前瀏覽器的 `localStorage`，不會回寫 `content/pages/home.md`，也不會自動形成正式網站版本。
- 若要交付正式網站，不應把瀏覽器 localStorage 的編輯結果誤認為已同步到程式碼。

## 8. 子頁版型與 responsive

### 主要版型

- 一般子頁：`SubpageShell` + `subpage-section` + `subpage-two-column`。
- 證據頁：Hero 右側 `subpage-hero-evidence`，產品介面以 `media-frame-evidence` 與中性 `paper` 背景呈現。
- `/products`：四張完整可點擊的產品 card，桌機 2×2、手機單欄。
- `/wally`：型號錨點、快速比較表與五張型號卡；情境照片資料為空時不渲染 gallery 占位卡。
- `/about`：經營團隊與技術團隊分組，每人一張人物 card。
- `/media`：新聞 `EmptyState`、活動暫存 card、Instagram social card。
- `/contact`：電話／Email 可點擊，地址為非連結 card，另有三步驟 consultation flow。

### `app/globals.css`

- 全站 CSS、品牌 tokens、字型、scene 動畫、card、media frame、focus、skip link 與 responsive 規則集中在此檔案。
- 主要色彩 tokens：`--ink`、`--purple`、`--violet`、`--lavender`、`--gold`、`--paper`、`--white`。
- `public/fonts/NotoSansCJKtc-Medium.otf` 以 `SynaiQ Noto Sans CJK TC`、weight 500、`font-display: swap` 載入。
- 主要 responsive 斷點：`1200px`、`900px`、`767px`、`560px`。
- 可互動元件保留 visible `focus-visible` outline；按鈕與主要連結以至少 44px 的互動高度為基準。
- `media-frame-evidence` 使用 `contain`，產品圖與截圖避免被裁切；`media-frame-portrait` 使用 `cover` 並將人物照片對齊上方。

## 9. 公開素材 mapping

### Logo 與品牌

| 路徑 | 目前用途 |
| --- | --- |
| `public/brand/synaiq-logo-light.svg` | Header、footer、favicon metadata |
| `public/brand/synaiq-logo-s.webp` | 首頁 Hero 主視覺 |
| `public/brand/synaiq-logo-dark.svg` | 已存在的品牌素材；目前主要 route 未引用 |
| `public/fonts/NotoSansCJKtc-Medium.otf` | 全站品牌 Medium 字型 |

### 產品與證據

| 路徑 | 目前用途 |
| --- | --- |
| `public/brand/knowledge-base.png` | 首頁產品畫面、企業知識庫 Hero |
| `public/brand/knowledge-workflow.jpg` | 企業知識庫 screenshot section |
| `public/brand/media-factory.png` | 首頁產品畫面、生成式 AI Hero |
| `public/brand/wally/wally-series.png` | `/wally` 系列 Hero；不是單一型號圖片 |
| `public/brand/wally-1.png` | 首頁輔助產品圖、Wally 1 型號卡 |
| `public/brand/wally/wally-1-plus.png` | Wally 1 Plus 型號卡 |
| `public/brand/wally/wally-2.png` | Wally 2 型號卡 |
| `public/brand/wally-2-plus.png` | Wally 2 Plus 型號卡 |
| `public/brand/wally-mini.png` | 首頁輔助產品圖、Wally Mini 型號卡 |

### 團隊照片

`app/about/page.tsx` 以 table 的 `id` 對應以下固定路徑：

| Member id | 路徑 |
| --- | --- |
| `wilson` | `public/brand/team/wilson-web-1.jpg` |
| `sunny` | `public/brand/team/sunny-web-1.1.jpg` |
| `leef` | `public/brand/team/leff-web-1.jpg` |
| `lou` | `public/brand/team/lou-web-1.jpg` |
| `dale` | `public/brand/team/dale-web-1.jpg` |
| `daniel` | `public/brand/team/daniel-web-1.jpg` |

> `public/brand/duoduo-cutout.png`、`public/brand/wally-2-cutout.png`、`public/brand/wally/wally-2-hero.png` 等檔案目前存在，但不屬於目前主要 route 的 active image mapping；使用前要重新確認用途與畫面身份，不要只因檔案存在就接入頁面。

## 10. 測試與本機操作

### 初始化與啟動

接收者在已取得依賴安裝授權、且使用 Node.js `>=22.13.0` 的環境中，可依 `package-lock.json` 安裝依賴：

```powershell
npm.cmd ci
npm.cmd run dev
```

本機開發預覽預設為 `http://127.0.0.1:3000/`。Windows PowerShell 優先使用 `npm.cmd`，可避免 `npm.ps1` execution policy 問題。

### package scripts

| 指令 | 用途 |
| --- | --- |
| `npm.cmd run dev` | 啟動 vinext dev server |
| `npm.cmd run build` | 產生 vinext／Cloudflare 相容 build |
| `npm.cmd start` | 啟動 build 後的 server |
| `npm.cmd test` | 先 build，再執行 `tests/rendered-html.test.mjs` |
| `npm.cmd run lint` | 執行 ESLint、React、Next 與 JSX accessibility checks |
| `npm.cmd run status` | 唯讀盤點 Git、路由、待補標記與歷史驗證紀錄 |
| `npm.cmd run status:update` | 將盤點寫入 dashboard；只有明確要更新看板時才使用 |
| `npm.cmd run db:generate` | 產生 Drizzle migration；目前沒有網站資料表需求 |

### 目前測試涵蓋

`tests/rendered-html.test.mjs` 會檢查：

- 首頁 server rendering 與核准首頁文字。
- 9 個 route 各自是否 import 對應 Markdown、是否使用 parser。
- 首頁六幕結構、GSAP／ScrollTrigger、reduced-motion、產品入口與畫布編輯器契約。
- 品牌 Medium 字型檔存在、大小與 CSS `@font-face` 契約。
- 全站導覽、主要 route HTTP render、產品 card、Wally 五型號、團隊照片、產品證據與媒體狀態。
- 重要圖片檔存在，以及不應出現的舊 placeholder／未公開影音連結不被渲染。

## 11. 接收者驗收清單

### 程式與內容

- [ ] `git status --short` 已確認目前 22 筆未提交變更（包含本文件）的處理方式。
- [ ] `content/pages/` 所有 10 個 Markdown 檔案可被 route 讀取；section key 與 table header 未被破壞。
- [ ] 9 個主要 route 均可 build 與 server render。
- [ ] `/wally` 維持單頁，且五型號順序為 Wally 1、Wally 1 Plus、Wally 2、Wally 2 Plus、Wally Mini。
- [ ] Wally 1 Plus 使用 `public/brand/wally/wally-1-plus.png`，沒有借用其他型號圖片。
- [ ] 電話、Email、Instagram 與產品路由仍是實際可用連結；未提供的社群或活動網址沒有被猜測補上。
- [ ] `/?edit=1` 的 localStorage 編輯結果沒有被誤當作正式內容提交。

### 品質與視覺

- [ ] `npm.cmd test` 通過。
- [ ] `npm.cmd run lint` 通過。
- [ ] `git diff --check` 通過；若出現換行提示，要確認是否為既有檔案格式差異。
- [ ] 人工瀏覽至少檢查 `1440×900` 與 `390×844`：無水平溢出、導覽可開合、圖片不錯置、產品卡可點擊。
- [ ] 人工以鍵盤檢查 skip link、menu button、導覽、產品 card、Wally anchor、社群連結與 focus indicator。
- [ ] 開啟 `prefers-reduced-motion` 後，頁面內容仍可讀取與操作。

### 發布邊界

- [ ] 確認是否要移除或停用 `app/layout.tsx` 中的本機 live review bridge。
- [ ] 確認正式環境的 hosting、domain、Cloudflare binding 與圖片服務設定；目前 repository 沒有完成部署。
- [ ] 未取得明確授權前，不執行 commit、push、部署、發布或外部資料同步。

## 12. 本次交接結果

角色：PM → UI/UX → Frontend → PM acceptance<br>
狀態：已驗證（文件、build、test、lint 與 diff check 已完成；瀏覽器像素級與實體鍵盤走查不在本次文件盤點內）

已完成：

- 建立本份只涵蓋網站程式碼的交接說明。
- 整理 route、內容來源、共用元件、首頁互動、responsive、素材 mapping、測試與接收流程。
- 明確排除聊天紀錄、session export、憑證與本機生成物。

證據：

- 本次執行 `npm.cmd run status`：branch `codex/dev`、22 筆未提交變更（包含本文件）、9 個主要路由。
- 本次已讀取目前 `app/`、`content/pages/`、`public/brand/`、`package.json`、`tests/` 與相關 build 設定後撰寫。
- 本次執行 `npm.cmd test`：build 完成，8/8 tests 通過。
- 本次執行 `npm.cmd run lint`：exit code 0。
- 本次執行 `git diff --check`：exit code 0；Git 另提示既有檔案可能發生 LF／CRLF 轉換。

阻塞／未驗證：

- 本文件建立當下尚未以瀏覽器重新做桌機／手機像素級 QA，也未重新做實體鍵盤走查。
- 既有 working tree 不是乾淨狀態；交接前仍需由負責人決定未提交變更的版本管理方式。
- Wally 情境 gallery 目前沒有照片資料；媒體新聞仍為空狀態、活動資料部分待補，這些是目前程式的預期狀態，不是聊天紀錄遺失。

下一位負責人：接收網站程式碼的人員，先依第 10 節建立環境，再依第 11 節完成 build、測試與瀏覽器驗收。

需要使用者確認：是否將整個 repository 交接，或只打包「必要交接內容」列出的檔案；以及是否授權後續 commit、push 或部署。
