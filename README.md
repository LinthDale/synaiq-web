# SynaiQ Website

SynaiQ 官方網站。Astro 7 純靜態站，內容走 Content Collections，部署到 Hostinger。

## 需求與啟動

Node ≥ 22.12.0（Astro 7 下限；開發機為 v24.11）。

```bash
npm ci
npm run dev      # http://localhost:4321
npm run build    # 產出 dist/
npm test         # 會先 build，再對 dist/ 的 HTML 斷言
```

## 目錄

| 路徑 | 內容 |
|---|---|
| `src/content/site/<locale>.md` | 全站共用文字（導覽、頁尾、CTA 預設值） |
| `src/content/pages/<locale>/<slug>.md` | 9 條路由的內容，全部寫在 YAML frontmatter |
| `src/content.config.ts` | zod schema；缺必填欄位時 `npm run build` 會失敗並指出檔名與欄位 |
| `src/components/blocks/` | 每種內容區塊型別一個 `.astro` |
| `src/styles/tokens.css` | 全站唯一的 CSS custom property 來源 |
| `src/config/site.ts` | 語系與路由的單一事實來源 |

## 改內容

編輯 `src/content/pages/<locale>/<slug>.md` 的 frontmatter 欄位，重新 build 才會生效。
欄位名稱與 `blocks[].type` 的定義在 `src/content.config.ts`；每種區塊長什麼樣子可在
`/styleguide` 看到真實範例。

## 改樣式

只改 `src/styles/tokens.css`。規則與操作步驟見
[`docs/guidelines/CSS-Handbook.md`](docs/guidelines/CSS-Handbook.md)。

> 目前的 token 是**中性佔位值**，不是品牌色票。正式視覺由 PRD-003／PRD-005 定案後整批置換；
> 頁面現階段只輸出語意 HTML，不做視覺。

## 語系

`zh-Hant` 無前綴、`en` 走 `/en/` 前綴。`/en/**` 目前是 zh-Hant 佔位內容並標
`draft: true`：不進 sitemap、不出現在語言切換器、標記 `noindex`，標題加 `[EN] ` 前綴
以維持全站 title 唯一。英文文案屬 PRD-002 M2。

## 部署

Azure DevOps 建置後以 FTP 上傳 `dist/`；密鑰放 ADO 變數群組 `synaiq-web-hostinger`，不進 repo。
管線在 [`azure-pipelines.yml`](azure-pipelines.yml)，步驟在
[`docs/operations/deploy-hostinger.md`](docs/operations/deploy-hostinger.md)。

## 文件

- 規格：[`docs/prd/PRD-001-architecture-refactor.md`](docs/prd/PRD-001-architecture-refactor.md)、
  [`docs/adr/ADR-001-astro-react-islands-hostinger.md`](docs/adr/ADR-001-astro-react-islands-hostinger.md)
- 換底過程與偏離紀錄：[`docs/migration/phaseA-log.md`](docs/migration/phaseA-log.md)
- 舊 `## key` → frontmatter 對照表：[`docs/migration/content-key-map.md`](docs/migration/content-key-map.md)
- 舊樹現況：[`HANDOVER.md`](HANDOVER.md)
