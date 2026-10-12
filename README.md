# SynaiQ Website

唯一日常工作目錄：`C:\Users\User\synaiq\synaiq-web`。正式站：[synaiq.com](https://synaiq.com)。版本庫：Azure DevOps `SynaiqDev/_git/synaiq-web`。

**工程師與新的 AI session 要更新官網，先讀 [官網更新與部署 README](docs/operations/WEBSITE-UPDATE-README.md)**：授權界線、主機存取、新版本發布指令、驗證與回退。

## 日常只需這三個入口

| 工作 | 入口 |
|---|---|
| 頁面、圖片、中英文與本機預覽 | [網站維護](docs/design/live-prototype/README.md) |
| 字型、配色、排版與動畫 | [樣式指南](docs/design/live-prototype/STYLE-GUIDE.md) |
| 官網發布、目前主機目錄、備份與回退 | [部署指南](docs/operations/deploy-hostinger.md) |

官網原始碼在 **`docs/design/live-prototype/`**，有 Home／KIP／Our Work／About 四頁中英雙語。`locale-*.js` 管文案，`tokens.css` 管文字與色彩，`site.css` 管排版與動畫。正式站另行封裝發布；Git push 不會自動更新 Hostinger。

## 啟動與驗證

Node 版本依 [package.json](package.json) 的 `engines`。

```powershell
npm ci
npm run dev:design
```

預覽：[http://127.0.0.1:4318/live-prototype/](http://127.0.0.1:4318/live-prototype/)。儲存後重新整理；可用 `npm run dev:design -- 4319` 改埠。

```powershell
npm run test:design # 正式設計的測試
npm run check       # 保留的 Astro／TypeScript 檢查
npm run test:all    # Astro 建置／測試，再執行設計測試
```

## 目錄用途

| 路徑 | 用途 |
|---|---|
| `docs/design/live-prototype/` | 官網程式、素材、測試及維護指引；目前保留路徑以維持發布工具相容 |
| `public/brand/` | 官網與 Astro 共用、仍被引用的素材 |
| `src/`、`astro.config.mjs` | 保留的 Astro Phase A；有獨立建置與測試，尚未套入正式設計 |
| `scripts/`、`tests/` | 素材生成、檢查、內容遷移及 Astro 測試 |
| `docs/` | [現行文件索引](docs/README.md)、PRD／ADR 與參考資料 |
| `docs/archive/` | [歷史交接與發布紀錄](docs/archive/README.md)，不用作現行待辦 |
| `ems/` | [EMS 公開入口](ems/README.md) synaiq-ai.com/ems 的本機轉送服務與上線頁面；不屬於 Hostinger 官網，重開機後需手動啟動 |
| `out/` | 本機發布包、回退證據、影片及新圖片，忽略於 Git；[保留規則](docs/operations/repository-hygiene.md) |
| `dist/`、`.astro/`、`.tmp/`、`node_modules/` | 建置、快取、臨時檔與依賴，不進 Git |

Astro 以 `npm run dev` 啟動；`npm run build` 產生的 `dist/` **不能取代官網發布包**。它的英文內容仍含 draft 佔位，與正式站是不同來源。詳見 [Phase A 紀錄](docs/migration/phaseA-log.md)。

`azure-pipelines.yml` 僅供人工建置、測試與產物保存，沒有正式站部署工作。[Repo 保留與清理規則](docs/operations/repository-hygiene.md) 說明哪些檔案可以再生、哪些需保留。
