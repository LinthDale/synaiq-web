# 語言、翻譯檔與品牌素材維護

最後更新：2026-10-28。本次三語改造為本機待審閱版本，未發布。

## 一套版型，三份語言資料

正式網站來源是 `docs/design/live-prototype/`。六個主要頁面及所有公開案例共用版型；不建立德文專用 HTML，也不使用 Astro dist 發布。

翻譯唯一來源為 `locales/zh-Hant/`、`locales/en/`、`locales/de/` 下的 JSON：

| 檔案 | 內容 |
|---|---|
| common.json | 導覽、搜尋摘要、優勢、聯絡、頁尾、預覽列 |
| home.json、kip.json | 首頁與 KIP 敘事 |
| ems.json、pvsim.json | 產品、流程、圖說及 3D 操作提示 |
| cases.json | 實績總覽、案例故事、照片說明與報導標題 |
| about.json | 團隊、理念、姓名與經歷 |
| demo.json | 動畫與 KIP 示意圖共用文案 |
| screens.json | 靜態示意圖專用圖說及標籤 |
| startup.json | 載入、失敗與重試提示 |

每個語言的 `_meta.json` 管理名稱、瀏覽器別名、SEO 語系與選用排版設定。`locale-config.js` 讀取自動生成的登錄表，推導示意圖路徑與公開白名單；`locale-schema.js` 管理固定團隊識別碼及分類。`cases-data.js` 管理案例識別碼、日期、排序、照片與報導網址。上述識別碼不是翻譯內容。JSON 的語意鍵與必要陣列結構必須一致；只放純文字，不放 HTML。原有刻意留空的 nativeName 可維持空字串。

## 新增語言：只維護 JSON

例如新增日文，從 repo 根目錄執行：

```powershell
npm run i18n:add -- ja
```

指令會建立 `locales/ja/`、自動填入 `_meta.json` 的日文名稱與語系設定，並建立十份保留原有鍵值／陣列結構的空白翻譯 JSON。既有語言不會被覆寫。請以繁中為主、英文交叉核對完成翻譯；指令本身不提供機器翻譯，不會把英文內容冒充日文。

翻譯完成後執行：

```powershell
npm run i18n:sync
```

一次自動完成：掃描語言資料夾、驗證完整性、生成語言登錄與載入器、語言模組、KIP 示意圖、sitemap 及靜態 Open Graph 語言標籤。導覽選單、瀏覽器語言匹配、公開白名單與發布快取規則自動涵蓋新語言，不需修改 JavaScript 或測試中的語言數量。既有 `npm run build:locales` 也會執行完整同步。

`npm run dev:design` 啟動前會自動執行同步；預覽已開啟時，修改後需執行同步，新增語言還需重新啟動該預覽程序。這不是檔案監看服務。未翻譯的必要文字會阻擋同步、預覽啟動與 CI，不能直接發布空白模板。

也可自行建立語言資料夾與十份完整 JSON。最小 `_meta.json` 範例：

```json
{ "label": "日本語", "shortLabel": "JA", "og": "ja_JP" }
```

資料夾使用標準 BCP 47 大小寫，例如 `ja`、`fr`、`pt-BR`。選用欄位：

- `browserLanguages`：額外匹配別名，例如繁中使用 `["zh"]`。代碼本身自動加入，瀏覽器區域標籤會逐層縮短匹配。`fr` 自動匹配 `fr-CA`；若只提供 `pt-BR` 並希望所有葡語使用它，可加 `["pt"]`。不同語言不可重複宣告同一別名。
- `dir`：預設 `ltr`，可指定 `rtl`；右至左語言仍需實際版面審閱。
- `order`：選單排序，預設 100；同值按語言代碼排序，繁中預設版本置前。
- `descriptionLimit`：搜尋摘要檢查長度，預設 160。
- `screen`：需要時用 `labelWidth`、`answerLineLength`、`answerUnderlineOffset`、`answerNoteY` 調整 KIP SVG 文字空間。新語言有預設值；超長文字及非拉丁文字仍要查看產物。

語言登錄、載入器與白名單只由驗證過的資料產生，JSON 原檔不會公開。沒有自動上架；翻譯品質與新語言版面仍需預覽驗收。

## 選語言的優先順序

1. 網址明確帶 `lang=zh-Hant`、`lang=en` 或 `lang=de` 時，以網址為準（大小寫不敏感）。
2. 沒有 lang 參數時，依瀏覽器 `navigator.languages` 的偏好順序，選第一個支援的語言。德語區域標籤如 de-DE、de-AT、de-CH 對應 de；en-US、en-GB 對應 en；zh 系列對應目前唯一的中文版本 zh-Hant。
3. 全部不支援時使用繁中。網址明確帶無效或空白 lang 時也回到繁中，不把參數當成資源路徑。

選定語言以 replaceState 寫回網址；切換語言保留頁面、案例與段落，站內連結沿用當前語言。不使用帳號、Cookie 或 localStorage 保存偏好。以不同瀏覽器語言再次造訪沒有 lang 的入口，會重新判斷。

例：`page.html?page=home&lang=de`、`page.html?page=cases&case=tokyo-foodex-2026&lang=de#fieldnotes`。本機預覽列遵守同一規則。

## 修改、生成與驗證

修正既有翻譯只需修改對應語言資料夾中的 JSON，例如德文首頁改 `locales/de/home.json`、英文 PVsim 操作提示改 `locales/en/pvsim.json` 的 `screens.viewer`。修改語言名稱、縮寫或瀏覽器別名才改 `_meta.json`。上方表格列出十份翻譯檔的內容範圍。

原文變更後，其他語言也需由 AI 或譯者同步更新；生成器不會自動翻譯，也不能判斷既有譯文是否已過時。鍵值與型別檢查通過，不代表語意翻譯正確。

以下指令從 repo 根目錄執行：

```powershell
npm run i18n:sync
npm run test:design
npm run test:deploy
npm run test:i18n:browser
```

生成器把每個語言合併為 `locales/generated/<語言>.js`，另產生很小的 startup.js，讓完整語言檔載入失敗時仍可顯示三語錯誤提示。瀏覽器只下載當前語言的完整資料模組。生成的模組、示意圖與 sitemap 都納入 Git，禁止手改。

只讀檢查：`npm run check:locales`，一次驗證登錄表、載入器、語言模組、示意圖、sitemap 與靜態語系標籤。缺鍵、型別或陣列項目不符、必要文字空白、替換參數不符、生成檔過期，都會令檢查失敗。CI 與發布工具會再次檢查，檢查模式不修改檔案。

`locale-store.js` 是唯一快取來源；即使 i18n.js 帶不同版本 query，也共用同一份資料。先 `await loadMessages(locale)` 再呼叫同步 `getMessages(locale)`。頁面由 locale-bootstrap.js 完成載入；Node 測試明確透過 test-i18n-setup.mjs 預載，不在瀏覽器載入其他語言。

沒有逐句回退，避免混語。語言檔載入失敗時顯示重試與切換語言；重試使用完整重新載入，清除瀏覽器對失敗模組的快取。

## 德文與圖片

德文以繁中為主、英文交叉核對，使用標準德語與 Sie。品牌、人名、地址及實績事實保持一致。待審閱詞彙見 [德文審閱表](locales/GERMAN-REVIEW.md)。

KIP 動畫與靜態示意圖共用 demo.json；搜尋示意圖支援德文回答換行。EMS／PVsim 真實截圖、現場照片和新聞截圖保留原圖，只翻譯圖說、替代文字及網站操作介面。

共用品牌分為公司 tAistro 與產品 Synaiq KIP；Logo 路徑在 brand.js。更改 Logo 或示意圖文案後，重跑 sync-brand-screens.mjs，確認六張中英德示意圖一致。照片像素中已有的 Logo 不會自動改變。

## 預覽與發布

本機以 `npm run dev:design` 開啟 4318。新增語言的生成模組與示意圖自動加入白名單；其他種類的公開資源仍需登錄 share-preview.mjs，並重啟自己啟動的預覽程序。JSON 原檔、翻譯審閱表、生成腳本不公開。

測試會依登錄表自動涵蓋所有語言的六頁及案例，包含 320／390／835／1440px、語言偵測與手動切換、單一語言檔載入、失敗重試和發布目錄路徑。PVsim 真實 3D 操作另以 `npm run test:pvsim-viewer` 驗證所有已登錄語言。新增語言整合測試在隔離目錄產生第四語言，確認只加 JSON 即可串通整個流程，不向實際網站加入測試語言。

首頁 canonical 現在明確帶 page 與 lang，避免依瀏覽器選語言的根網址混淆版本；hreflang、OG locale 與 sitemap 都包含 de。x-default 對應繁中預設版本。

僅預覽或修改翻譯不代表已上架。取得發布授權後，依 [官網更新 README](../../operations/WEBSITE-UPDATE-README.md) 提交所有來源與生成檔並走既有 GitHub CI；不得直接覆蓋主機檔案。本機版本的瀏覽器報告不等於正式網址驗收。
