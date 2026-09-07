# 專案接手說明（HANDOVER）

> **本專案為接手案，非本團隊原始開發。**
> 本 repo 的第一個 commit 是接手當下的原始狀態快照，除 `.gitignore` 外未做任何修改。
> 之後的所有 commit 才是本團隊的變更。

- 接手日期：2026-09-07
- 接手來源：本機目錄 `C:\Users\User\synaiq\synaiq web`
- **移交時不含 `.git`**，因此上游的 commit 歷史、分支、作者資訊皆未一併移交。
- 移交時不含 `node_modules`、`dist`，尚未在本機完成過一次建置驗證。

---

## 1. 技術現況（已閱讀原始碼確認）

### 這不是 Next.js 專案

雖然目錄結構與程式碼是 Next.js App Router 的寫法，但：

- `package.json` **沒有安裝 `next`**，只有 devDependency `@next/eslint-plugin-next`（供 lint 用）。
- `next-env.d.ts` 匯入的是 `vinext/types`。`next/image`、`next/navigation`、`Metadata`
  等全部由 `vinext@1.0.0-beta.2` 的相容層提供。
- 所有 npm script 走的都是 `vinext dev / vinext build / vinext start`，沒有 `next` 指令。
- `next.config.ts` 從未安裝的 `"next"` 匯入型別，且 `vite.config.ts` 並未讀取它，
  很可能是無效的死檔。**（待確認）**

### 實際技術堆疊

| 層 | 實際使用 |
|---|---|
| 框架 | `vinext` 1.0.0-beta.2（Vite 生態的 Next App Router 相容層） |
| 建置 | `vite` 8.0.13，外掛依序為 `vinext()` → `sites()` → `cloudflare()` |
| UI | React 19.2.6（RSC）、GSAP 3.15 僅用於首頁捲動敘事 |
| 執行環境 | Cloudflare Worker，進入點 `worker/index.ts`，產物 `dist/server/index.js` |
| 託管 | OpenAI Sites，宣告檔 `.openai/hosting.json`（目前 `d1: null`、`r2: null`） |
| 樣式 | 手寫 CSS（`app/globals.css`）。Tailwind v4 有引入但**全站零 utility class** |

### `build/sites-vite-plugin.ts` 做什麼

它**不做任何程式碼轉換**。只是一個 `apply: "build"` 的 `closeBundle` hook，
把 `.openai/hosting.json` 與 `drizzle/` 目錄複製進 `dist/.openai/`。
路由是 `vinext` 掃描 `app/` 目錄推導的，與此外掛無關。

### 請求流程

1. Cloudflare 邊緣執行 `dist/server/index.js`。
2. `worker/index.ts` 攔截 `/_vinext/image` 做圖片最佳化，其餘交給 vinext app-router entry。
3. vinext 依 `app/` 檔案結構比對路由，做 RSC 渲染回傳 HTML。
4. 首頁與 `SiteHeader` 為 client component，SSR 後在瀏覽器 hydrate。

---

## 2. 內容管線

全站 9 條路由的文案都來自 `content/pages/*.md`，**不是 CMS，也不是 YAML frontmatter**。

- 解析器在 `app/_content/markdown.tsx`，只認 `## key` 這種二階標題當區塊名。
  第一個 `##` 之前的內容（`# 標題`、`>` 註記）全部被忽略，等同註解。
- `text(key)` 找不到 key 會直接 throw，讓內容錯誤在**建置期**就失敗，這是好設計。
- markdown 透過 Vite 的 `?raw` 在建置時內嵌進 bundle（型別宣告在 `types/raw-markdown.d.ts`）。
  **所以改文案必須重新 build 才會生效。**
- `site.md` 提供全站共用的導覽列、footer、CTA 預設值。
- `home.md` 同時提供首頁內容與全站 metadata。

### 路由表

| 路由 | 檔案 | 內容來源 |
|---|---|---|
| `/` | `app/page.tsx` | `home.md` + `site.md` |
| `/about` | `app/about/page.tsx` | `about.md` |
| `/products` | `app/products/page.tsx` | `products.md` |
| `/wally` | `app/wally/page.tsx` | `wally.md` |
| `/knowledge-base` | `app/knowledge-base/page.tsx` | `knowledge-base.md` |
| `/generative-ai` | `app/generative-ai/page.tsx` | `generative-ai.md` |
| `/agi` | `app/agi/page.tsx` | `agi.md` |
| `/media` | `app/media/page.tsx` | `media.md` |
| `/contact` | `app/contact/page.tsx` | `contact.md` |

---

## 3. 上線前必須處理（接手時即存在，尚未修）

| # | 嚴重度 | 問題 | 位置 |
|---|---|---|---|
| 1 | 高 | root layout 內含指向 `http://localhost:8400` 的開發用 live script，**且 URL 帶有 token**。每一頁都會載入，對外站台必然 404，HTTPS 下屬 mixed content 會被瀏覽器擋掉。**該 token 應視為已外洩，需輪替。** | `app/layout.tsx:26` |
| 2 | 高 | `SkeletonPreview.tsx` 匯入 `react-loading-skeleton`，但該套件**不在 `package.json` 也不在 lock 檔**。目前無人引用才沒爆，一旦有人 import 就會建置失敗。建議整個 `app/_sites-preview/` 刪除。 | `app/_sites-preview/SkeletonPreview.tsx` |
| 3 | 中 | 首頁的「畫布編輯」浮動按鈕**無條件渲染**，CSS 也沒有隱藏規則。任何訪客都會在左下角看到這顆內部工具按鈕。被 `?edit=1` 控制的只有展開後的面板，按鈕本身沒有。 | `app/page.tsx:551` |
| 4 | 低 | 對外內容仍有佔位文字（「年份待補」「地點待補」「活動圖片待補」）。 | `content/pages/media.md` |
| 5 | 低 | `/wally` 的系列情境展示區塊只有標題、下方空白，因為資料表沒有任何資料列。 | `content/pages/wally.md` |
| 6 | 低 | 字型檔 16.5 MB 全量載入未 subset；`synaiq-logo-dark.svg` 7.5 MB 且無任何路由引用；`wally-series.png` 13.3 MB。 | `public/` |

---

## 4. 未使用的樣板殘留（可評估移除）

以下皆為 starter 樣板留下、**全專案零引用**的骨架：

- `db/schema.ts`：整檔只有 `export {}`。
- `db/index.ts`：`getDb()` 零呼叫。且因 hosting 宣告 `d1: null`，真呼叫必定拋錯。
- `drizzle/`：**零筆 migration，無任何 `.sql` 檔**。
- `drizzle.config.ts`：**不存在**，所以 `npm run db:generate` 現在跑一定失敗。
  （注意：`WEBSITE_CODE_HANDOFF.md` 聲稱此檔存在，與事實不符。）
- `app/chatgpt-auth.ts`：無人 import，且它導向的 `/signin-with-chatgpt` 等三條路由都不存在。
- `app/_sites-preview/`：無路由引用，且依賴未安裝套件（見上表 #2）。
- Tailwind v4：有裝、有引入，但零 utility class，只用到 preflight 與幾個 CSS 變數。

---

## 5. 測試現況（可信度偏低）

`tests/rendered-html.test.mjs` 的多數斷言是讀 `.tsx` **原始碼**做 regex 比對，
而非驗證輸出的 HTML，其中甚至寫死了字型檔的 byte 數。

後果：任何合法重構（改 class 名、抽元件、換字型檔）都會誤報失敗，
而真正的渲染或行為破壞未必抓得到。**重構前需先重寫測試。**

---

## 6. 隨案文件的可信度警告

`WEBSITE_CODE_HANDOFF.md` 與 `README.md` 是上游留下的，**未經驗證且已知有誤**：

- `WEBSITE_CODE_HANDOFF.md` 標示的專案路徑為 `D:\codex\synaiqweb`，非本目錄。
- 其中引用的 `PROJECT_DASHBOARD.md`、`PROJECT_HANDOFF.md`、`DESIGN.md`、`PRODUCT.md`、
  `website_subpages_content_editable.md` 在本目錄**全部不存在**。
- 它聲稱 `drizzle.config.ts` 存在，但實際沒有。
- `scripts/status-reporter.mjs` 依賴上述不存在的 dashboard 檔案，目前無法正常運作。

**閱讀那兩份文件時請以本檔為準。**

---

## 7. 待釐清（無法從程式碼判定）

1. OpenAI Sites 的實際部署動作為何？repo 內**沒有任何部署設定或 CI**，
   `npm run build` 產出 `dist/` 之後怎麼上線，程式碼裡看不出來。
2. `vinext` 是否會讀取 `next.config.ts`？未安裝依賴無法驗證。若不讀，該檔應刪。
3. 上游是否還有含 `.git` 的原始工作樹？若有，兩邊內容是否已分歧。
4. `app/chatgpt-auth.ts` 是刻意保留供日後做會員區，還是純殘留可刪？
5. Cloudflare D1 / R2 是否有上線計畫？若確定不用，`db/`、`drizzle/`、
   `drizzle-orm`、`drizzle-kit` 可整組移除。
6. `localhost:8400` 那組 live bridge 屬於哪套開發工具？token 需要向誰申請輪替？

---

## 8. 常用指令

```bash
npm install
npm run dev      # vinext dev --hostname 0.0.0.0
npm run build    # vinext build，產出 dist/
npm test         # node --test tests/
npm run lint
```
