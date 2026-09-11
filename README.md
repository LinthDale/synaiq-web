# SynaiQ Website

最後更新：2026-09-11。

唯一日常工作目錄：`C:\Users\User\synaiq\synaiq-web`。Azure DevOps 遠端為 `SynaiqDev/_git/synaiq-web`。

本 repo 同時保留已上線的核准設計，以及合併進來的 Astro Phase A 基礎。**合併分支不等於把線上設計轉成 Astro，也不會更新 Hostinger。**

| 範圍 | 來源 | 狀態與用途 |
|---|---|---|
| 已核准、已上線的 Home／KIP／實績展示／關於我們中英雙語設計 | `docs/design/live-prototype/`；上架來源 commit `5aba844` | 客戶端渲染的靜態 HTML／CSS／JavaScript，含兩份 CSS、集中設定、三段共用 KIP 介面動畫及手繪顯影互動 |
| Astro Phase A | `src/`、`astro.config.mjs` | Content Collections、schema、18 個語系內容頁及語意 HTML 基礎；尚未套入核准設計 |
| 當次上架包 | `out/synaiq-release-20260911-team-pages/`（本機保留、不進 Git） | 正式網站的 artifact、manifest、切換前路由與驗證結果；上一版保留供還原 |

現行版本與還原步驟見 [Hostinger 操作索引](docs/operations/deploy-hostinger.md)。初次上架事實見 [2026-09-08 部署紀錄](docs/operations/deployment-synaiq-com-2026-09-08.md)，地址與快取修補見 [地址更新紀錄](docs/operations/address-update-2026-09-08.md)。正式站是 `synaiq.com`，不是 `synaiq-ai.com`；歷史文件中的 `synaiq-web-astro` 是當時的本機資料夾名稱，不代表其上架產物是 Astro build。

舊三案風格、首頁 A／B、wireframe、字型比較及候選稿已清理。目前唯一採用的設計為 `docs/design/live-prototype/`；保留範圍與復原方式見 [設計維護入口](docs/design/README.md)。

## 啟動與驗證

Node 版本需求依 [`package.json`](package.json) 的 `engines`。在上述工作目錄執行：

```powershell
npm ci
npm run dev:design
```

核准設計預覽：<http://127.0.0.1:4318/live-prototype/>。這是只讀、明確檔案白名單的預覽伺服器；儲存後手動重新整理。可用 `npm run dev:design -- 4319` 改埠。它不會自動建立對外隧道；舊 Cloudflared 臨時網址不是常駐服務。

```powershell
npm run dev         # Astro 基礎：http://localhost:4321
npm run build       # Astro 輸出至 dist/，不是目前線上設計的部署包
npm run check       # Astro / TypeScript 檢查
npm test            # pretest 先建置 Astro，再驗證產出
npm run test:design # 核准設計的獨立測試
npm run test:all    # 依序執行 Astro 與設計測試
```

目前未配置 lint 指令。執行成功的測試與建置不代表 Hostinger 已部署，也不等於所有裝置的視覺驗收。

## 修改核准設計、語言與 Logo

- 官網只有兩份 CSS：所有文字的字型、字級、行高、字距與文字顏色（含 ZH/EN、圖片旁註記和 Demo 小字）都改 `docs/design/live-prototype/tokens.css`；排版、RWD 幾何與動畫樣式改同目錄 `site.css`。區塊索引、quote 修改位置與前後比對指令見 [官網樣式維護指南](docs/design/live-prototype/STYLE-GUIDE.md)。
- 目前網站的中英文文案在 `docs/design/live-prototype/locale-*.js`，共用語言機制在 `i18n.js`。
- Logo 的共用設定在 `docs/design/live-prototype/brand.js`；依 [語言擴充與 Logo 維護指南](docs/design/live-prototype/localization-and-brand-guide.md) 更換公開衍生素材，並檢查明暗底與四個頁面。沒有 Logo 上傳 CMS。
- 元件、配色與動畫仍以 [核准設計 README](docs/design/live-prototype/README.md) 為準；不要用 Phase A 的中性 token 或英文佔位內容覆蓋它。
- 修改本機或推送 Git，不會自動改變目前線上網站。日後發布需重新封裝並核對素材路徑。

## Astro Phase A 結構

| 路徑 | 內容 |
|---|---|
| `src/content/site/<locale>.md` | 全站共用文字 |
| `src/content/pages/<locale>/<slug>.md` | 9 條內容路由 × 2 語系，YAML frontmatter |
| `src/content.config.ts` | Content Collections schema |
| `src/components/blocks/` | 語意內容區塊 |
| `src/styles/tokens.css` | Phase A 中性樣式 token，尚非核准品牌視覺 |
| `src/config/site.ts` | Astro 的路由及語系設定 |

Astro 的 `zh-Hant` 無 URL 前綴，`en` 走 `/en/`。其英文內容仍為 `draft: true` 的中文佔位，不進 sitemap／語言切換器，並標 `noindex`；這與已完成中英雙語的核准設計是兩套不同內容來源。Astro `<locale>` 內容目錄名採小寫，例如 `zh-hant`。

## 建置與部署界線

[`azure-pipelines.yml`](azure-pipelines.yml) 是**人工觸發的建置、測試與 artifact 發布管線**，沒有 FTP、正式站部署或自動 main push 觸發。`dist/` 是 Astro 檢驗產物，不可直接拿來替換已核准的官網。

目前人工上架方式、路由備份與還原入口見 [Hostinger 操作索引](docs/operations/deploy-hostinger.md)。舊的清空 `public_html`／覆蓋 WordPress 部署計畫已失效，不應執行。repo 整併不修改正式站、DNS、資料庫或產品服務。

## 文件

- [Repo 整併範圍與保留項目](docs/operations/repository-consolidation-2026-09-08.md)
- [2026-09-08 初次上架紀錄](docs/operations/deployment-synaiq-com-2026-09-08.md)
- [Astro Phase A 換底紀錄](docs/migration/phaseA-log.md) 與 [內容 key 對照](docs/migration/content-key-map.md)
- [PRD-001](docs/prd/PRD-001-architecture-refactor.md) 與 [ADR-001](docs/adr/ADR-001-astro-react-islands-hostinger.md)
- [CSS Handbook](docs/guidelines/CSS-Handbook.md)
- [HANDOVER](HANDOVER.md) 保留早期接手快照；目前執行方式以本 README 為準。
