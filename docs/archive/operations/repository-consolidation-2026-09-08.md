# Repository consolidation — 2026-09-08

最後更新：2026-09-08。

> 2026-09-09 後續清理：業主要求移除舊風格與 wireframe。下方整併時保留的線框 render，以及 `out/repo-consolidation-20260908/bootstrap-local/` 的 4 張差異 PNG，已移至回收筒；正式部署／還原包未動。現行保留範圍見 [設計維護入口](../../design/README.md)。其餘內容保留當時整併紀錄。

## 唯一工作入口

日後開發、預覽、測試與 Git 操作統一使用：

```text
C:\Users\User\synaiq\synaiq-web
```

遠端維持 Azure DevOps `https://dev.azure.com/synaiq/SynaiqDev/_git/synaiq-web`。整併將原本分開的核准設計與 `feat/astro-rebuild` 基礎放進同一條整合歷史；原始來源 commit 不重寫。

| 來源 | 保留內容 |
|---|---|
| `752008b`／`codex/prd-wireframes-finish` | 已核准的 Home／KIP 視覺、中英雙語、品牌素材、設計測試與文件 |
| `9642a235`／`feat/astro-rebuild` | Astro Phase A、Content Collections、schema、語意 HTML、遷移對照與測試 |
| 原始 `docs/prd-bootstrap`／`main` | 可由 Git 歷史追溯的 PRD、ADR 與前身網站內容 |
| 同日獨立上架工作 | 原始部署紀錄及本機 release 包，保留而非重新封裝 |

## 一個 repo，兩個明確的執行入口

- `npm run dev:design`：核准設計，預設 `http://127.0.0.1:4318/live-prototype/`；只讀白名單伺服器，儲存後手動刷新。
- `npm run dev`：Astro Phase A，預設 `http://localhost:4321`。
- `npm run test:all`：依序驗證 Astro 與核准設計；`npm run check` 執行 Astro／TypeScript 檢查。

合併保留兩者，不表示已把核准設計搬進 Astro。`src/` 的中性 token、英文 draft 與 18 個語系內容頁不能取代現行 Home／KIP 的品牌配色、英文文案及 query routes。後續若要真正轉換網站執行層，需要另外驗收。

## 本機檔案保留界線

- 發布 ZIP、manifest、解壓版與操作手冊：`out/synaiq-deploy-20260908/`，沿用原始部署產物，不進 Git。
- 上架紀錄：[deployment-synaiq-com-2026-09-08.md](deployment-synaiq-com-2026-09-08.md)，保留原始操作內容。
- 私人參考素材 `kb-entry-redacted.png`、`synaiq-logo-cis-5.jpg`、`synaiq-logo-cis-6.jpg` 留在本機並保持忽略，不加入 Git 或公開發布。
- 設計畫板的本機 render、工具輸出與舊版差異，先確認保存／可重建性，再清理來源目錄；不可因為 ignored 就視為沒有價值。
- `C:\Users\User\Documents\synaiq-web\` 內的手冊是使用者文件，不是重複 repo，不刪除。

歷史文件記錄的 `synaiq web` 與 `synaiq-web-astro` 是當時路徑；後續操作請使用新的唯一入口，不再從舊目錄啟動服務。

本次本機整理結果：

- `synaiq web` 已移除，原有子內容移入 Windows 回收筒，可復原。
- `synaiq-web-astro` 的內容與 `.git` 指標已回收，舊 worktree 註冊已清除；精確核對 PID、名稱、建立時間、cwd 與祖先鏈後，關閉只占用舊路徑的閒置 REPL／CUA 輔助程序，最後非遞迴刪除空目錄。Codex 主 host、視窗與瀏覽器未關閉。
- `C:\Users\User\synaiq` 下的三個網站資料夾，現在只保留 `synaiq-web`，沒有 junction 或舊路徑別名。
- Git worktree 清單只剩 `C:\Users\User\synaiq\synaiq-web`。
- 舊 4317 Vite 預覽已關閉；需預覽時在新 repo 使用 `npm run dev:design`。
- 部署 ZIP SHA-256 保持 `FEC769C9654371E45AF44A9B4D965697509A96D31DE0D3146C99D92BFA0C4545`；65 個本機檔案在回收前逐檔核對一致。4 張同名不同版本的 PNG 另存於 `out/repo-consolidation-20260908/bootstrap-local/`。

## 正式站與 CI 的保護界線

`synaiq.com` 仍使用 `752008b` 的手動封裝版本，詳見 [部署紀錄](deployment-synaiq-com-2026-09-08.md)。此次僅做 repo／分支整併，不修改 Hostinger、DNS、WordPress、資料庫或 `synaiq-ai.com` 產品服務。

ADO YAML 改為人工觸發、建置／測試／artifact only。舊 FTP 部署與遠端目錄清空步驟不適用；`main` 合併及 Git push 不是正式站更新。參見 [Hostinger 操作索引](../../operations/deploy-hostinger.md)。

## 最終驗證項目

2026-09-08 的乾淨安裝驗證：`npm ci` 成功；`npm run check` 檢查 60 個檔案，0 errors／warnings／hints；`npm run test:all` 的 Astro／repo 測試 27 項通過，設計測試 69 項通過、1 項因 Windows 檔案 symlink 權限略過。Astro 建置產出 19 個頁面。`npm audit` 為 0 vulnerabilities，`git diff --check` 通過。未配置 lint 或 coverage 門檻，不宣稱已完成這兩項。

新增的 `.gitattributes` 固定 SVG 為 LF，避免 Windows checkout 改變 Logo 的原始 bytes，導致四張內嵌 Logo 的畫面與生成器不一致。Astro schema 改從 `astro/zod` 匯入，並修正兩處動態元件型別；核准設計的執行檔與品牌圖片未改。

Git 合併 commit 為 `ce0eb35026e1ffce74d47de7e9db67a54406c5b3`，已推送 Azure `main` 並以 `git ls-remote` 核對一致。`feat/astro-rebuild`、`codex/prd-wireframes-finish` 與 `docs/prd-bootstrap` 均驗證為 `main` 祖先；沒有重寫歷史。ADO #1302 已補入合併／驗證證據，保留 Sprint 22 與 Committed 狀態，因核准設計尚未轉入 Astro 執行層，不能把這次整併標成整站改版完成。

後續複查方式：

1. 主 repo 的 refs、物件完整性與 branch ancestry 能驗證兩個來源已保留；`main` 與遠端 commit 一致。
2. Astro 檢查／測試及核准設計測試，記錄實際結果與任何略過原因。
3. 本機部署 ZIP 與保留檔案的 hash 符合搬移前資料；不得遺漏並行上架工作的輸出。
4. 舊目錄不再承擔 `.git` 共用資料或其他 worktree 的相依，並確認無活躍寫入後才回收。
5. 最終列出仍保留的 repo 目錄、worktree／分支，以及若有的尚未解除占用；不把「已複製」誤稱為「已完成刪除」。
