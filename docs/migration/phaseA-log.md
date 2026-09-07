# Phase A 執行紀錄（PRD-001 FR-101 ～ FR-109）

> 本檔為執行過程的逐步紀錄，供中斷後接手用。每個步驟標 `done` / `blocked` / `偏離`。
> 權威規格：[`../prd/PRD-001-architecture-refactor.md`](../prd/PRD-001-architecture-refactor.md)、
> [`../adr/ADR-001-astro-react-islands-hostinger.md`](../adr/ADR-001-astro-react-islands-hostinger.md)。

## 版本查證（2026-09-07）

| 套件 | 採用版本 | 查證方式 |
|---|---|---|
| `astro` | 7.3.1 | npm registry；`node_modules` 實測一致 |
| `@astrojs/react` | 6.0.5 | 同上 |
| `@astrojs/sitemap` | 3.7.4 | 同上 |
| 本機 Node | v24.11.0 | `engines.node >= 22.12.0`（Astro 7 下限） |

API 於 `docs.astro.build` 覆核：Content Layer `glob()` loader（`astro/loaders`）、
`getCollection` / `getEntry` / `render()`（`astro:content`）、i18n 設定與 `astro:i18n` 輔助函式、
`@astrojs/sitemap` 的 `i18n` / `filter` 選項。

## 步驟

### S0 讀規格與舊解析器語意 — done

- 已讀 ADR-001、PRD-001 v1.0、PRD-Guideline-Web §4、HANDOVER §2。
- 舊解析器 `app/_content/markdown.tsx` 語意逐字移植到 `scripts/lib/legacy-markdown.mjs`
  （`cleanCell` / `parsePageMarkdown` / `text` / `lines` / `table` 的正則與流程與原檔一致，
  以 `git show HEAD:app/_content/markdown.tsx` 逐行比對確認）。唯一新增是 `keys()`，用於零遺漏檢查。
- 舊圖片路徑散在 `.tsx`（`about` 的 `teamPhotos`、`wally` 的 `modelImages`、首頁 hero／evidence 圖），
  抄錄到 `scripts/lib/assets.mjs` 後併入新 frontmatter。

### S1 骨架與舊樹移除（FR-101 基礎） — done

- 刪除 `app/`、`worker/`、`build/`、`db/`、`drizzle/`、`.openai/`、`next*.ts`、`postcss.config.mjs`、
  `eslint.config.mjs`、`vite.config.ts`、`types/`、`scripts/status-reporter.mjs`、
  `tests/rendered-html.test.mjs`、`WEBSITE_CODE_HANDOFF.md`。
- `package.json` 只留 `astro`、`@astrojs/react`、`@astrojs/sitemap`、`react`、`react-dom`
  與 `typescript` / `@types/react*`；`engines.node >= 22.12.0`。
- `astro.config.mjs`：`output:'static'`、`trailingSlash:'always'`、i18n
  （`defaultLocale:'zh-Hant'`、`locales:['zh-Hant','en']`、`prefixDefaultLocale:false`）、
  `react()`、`sitemap()`（`i18n` 與 `filter` 排除 `/styleguide/` 與所有 draft）。
- `.gitignore` 補 `dist/`、`.astro/`。
- 驗收：`npm run build` 綠燈（此時 0 頁）。

### S2 內容 schema（FR-103） — done

- `src/content.config.ts`：`glob()` loader，兩個 collection（`site`、`pages`），
  `blocks[]` 為 `z.discriminatedUnion('type', …)`，共 21 種 block 型別，欄位依 PRD-001 §2。
- `src/config/site.ts` 為語系／路由單一事實來源；新增語系＝加一行 `LOCALES` 加一個內容目錄。
- 偏離（小幅擴充，已記於本檔）：schema 比 PRD §2 多三個欄位——
  `hero.imageSrc`（舊樹寫死在 `.tsx`，改由內容管理）、`pageNav`（首頁章節導覽，舊 `navigation.labels`）、
  `site.titleTemplate` / `localeName` / `languageSwitcherLabel`（`%s｜SynaiQ` 屬全站設定，
  舊樹誤放 `home.md`）。皆為必要欄位，未刪 PRD 既有欄位。

### S3 內容遷移（FR-104） — done

- `npm run migrate:content` 以舊解析器讀 `content/pages/*.md`，輸出
  `src/content/site/{zh-hant,en}.md` 與 `src/content/pages/{zh-hant,en}/*.md`，
  並產生 `docs/migration/content-key-map.md`（舊 key → 新欄位路徑 → 驗證路由）。
- 零遺漏保證：腳本比對「解析器解出的 key 集合」與「recorder 記錄過的 key 集合」，
  差集非空即以非零離開碼失敗。實測 10 檔共 191 個舊 key，未對應 0 個。
- `/en/` 為 zh-Hant 佔位並標 `draft: true`；`metadata.title` / `description` 加 `[EN] ` 前綴，
  理由見下方「偏離與決策」。

### S4 版面與區塊（FR-101 / FR-105 結構層） — done

- `src/layouts/BaseLayout.astro`：`<html lang>` 依語系、載入 `tokens.css` + `base.css`、
  header／footer 取自 `site` collection、canonical、`hreflang` 成對含 `x-default`、
  draft 與 `/styleguide` 加 `robots noindex`。
- `src/components/blocks/*.astro`：每種 block 型別一個檔，全部零 client JS。
- 路由：`src/pages/{index,[slug]}.astro` 與 `src/pages/en/{index,[slug]}.astro`，
  9 條路由 × 2 語系 = 18 頁，加 `/styleguide/` 共 19 頁。
- FR-105 的「視覺重建」本階段不做（PRD 明定閘門）：頁面只出語意 HTML。

### S5 CSS 手冊機制（FR-102） — done

- `src/styles/tokens.css` 為唯一 custom property 宣告處（中性佔位組，PRD-005 定案後整批置換）。
- `/styleguide`：列出全部 44 個 token 的變數名與實際值（建置期解析 tokens.css，不手抄）、
  21 種 block 型別各一個真實內容範例、
  `<meta name="robots" content="noindex">`，且不入 sitemap。
- `docs/guidelines/CSS-Handbook.md`：三條規則與「怎麼改 token」的操作說明。

### S6 語系與 SEO（FR-106） — done

- `sitemap-index.xml` + `sitemap-0.xml` 涵蓋 zh-Hant 9 條路由，排除 draft（`/en/**`）與 `/styleguide/`。
- 每頁 canonical 指向自身；`hreflang` 對 `zh-Hant-TW` / `en` 成對並含 `x-default`（指向 zh-Hant）。
- 語言切換器只連非 draft 目標：zh-Hant 頁面因對應 `/en/` 為 draft 而不顯示切換器，
  `/en/` 頁面則顯示回 zh-Hant 的連結。

### S7 測試（FR-107） — done

- `tests/`（4 個測試檔、25 個測試），`node --test`，`pretest` 會先 build，全部斷言只讀 `dist/`。
- 遷移零遺漏由 397 個字串逐一比對 dist HTML 驗證。
- 舊內容目錄 `content/pages/` 於測試通過後移除；對照表留在 docs/migration/。
- 涵蓋：路由 × 語系的關鍵區塊存在、`<html lang>`、`<title>` 全站唯一、
  sitemap 內容、hreflang 成對、`dist/` 無 `localhost`／`8400`／`http://`、
  內容頁零 `<script type="module">`、`src/` 除 `tokens.css` 外零硬編碼色值、
  以及「每個舊 key 的文字都出現在對應路由的 HTML」。

### S8 部署基線（FR-109） — todo

- `azure-pipelines.yml`：trigger `main`、Node 22、`npm ci` → `npm run build` → `npm test` →
  `FtpUpload@2` 上傳 `dist/`，`clean: true`，參數 `target: staging|production`，
  變數群組 `synaiq-web-hostinger`。**未執行**（需業主先建立變數群組）。
- `docs/operations/deploy-hostinger.md`：前置作業、首次 staging 部署、`synaiq.com` 切換
  （含 WordPress 備份與 `public_html` 覆蓋）、18 個 URL 驗證、回滾。

## 偏離與決策

| # | 項目 | 決策 | 理由 |
|---|---|---|---|
| D1 | schema 比 PRD §2 多 `hero.imageSrc` / `pageNav` / `site.titleTemplate`＋`localeName`＋`languageSwitcherLabel` | 擴充 | 舊樹把這些寫死在 `.tsx` 或誤放 `home.md`；不擴充就無法達成「零遺漏」與「新增語系不改 `.astro`」 |
| D2 | `/en/` 頁面的 `metadata.title` / `description` 加 `[EN] ` 前綴 | 加前綴 | FR-106 要求「title 全站無重複」，但 FR-104 要求 `/en/` 用 zh-Hant 佔位；不加前綴兩者直接衝突。前綴同時讓佔位狀態一眼可辨，PRD-002 M2 寫英文文案時整批移除 |
| D3 | draft 頁面同時加 `robots noindex` | 加 | FR-104 只要求「不入 sitemap」，但未翻譯的佔位頁被索引對業主是實害；hreflang 仍成對輸出以符合 FR-106 驗收 |
| D4 | `deployment` block 無標題 | 輸出無標題的 `<section>` | `agi.md` 該區塊在舊樹是接在 flow 段落後的標籤列，內容本身沒有標題文字；不虛構標題，改為不加 `<h2>`、不加 `aria-label`（未命名 section 不算 landmark，不破壞標題階層） |
| D5 | `header.navigation` 的 `style` 欄與 `services.documents` 的 `kind` 欄 | 輸出成 `class="nav-item nav-<style>"` 與 `data-kind` | 這兩欄是樣式提示不是文字；保留在輸出裡才能通過「舊 key 零遺漏」檢查，同時是 PRD-003 需要的樣式掛鉤 |
| D6 | `@astrojs/sitemap` 的 `i18n` 選項 | 保留設定但實際只輸出 zh-Hant | draft 的 `/en/**` 被 `filter` 排除後，sitemap 內只剩預設語系；待 PRD-002 M2 移除 draft 後即自動成對 |

## 業主待辦

1. 在 ADO 建立變數群組 `synaiq-web-hostinger`，填入 `HOSTINGER_FTP_HOST`、`HOSTINGER_FTP_USER`、
   `HOSTINGER_FTP_PASSWORD`、`HOSTINGER_REMOTE_DIR`（值不得進 repo）。
2. 於 hPanel 建立／確認 FTP 帳號，並提供暫時網域 `*.hostingersite.com` 的實際名稱。
3. 確認「暫時網域上的空白 WordPress 會被 `dist/` 覆蓋」。
4. 決定 `synaiq.com` 切換窗口（切換前需備份現行 WordPress）。
