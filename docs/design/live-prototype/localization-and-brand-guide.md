# 語言與 Logo 統一管理

適用範圍：`docs/design/live-prototype` 核准網站來源。它沒有 CMS、Logo 上傳後台或產品連線；本機修改後仍須依上架指引發布，正式站才會更新。

## 使用英文版

- 網站右上角 `ZH / EN` 選單可切換語言，保留目前的 Home / KIP 頁面與網址中的段落錨點；單純捲動位置不會記錄。
- 中文：`page.html?page=home&lang=zh-Hant`
- 英文：`page.html?page=home&lang=en`
- 英文 KIP：`page.html?page=kip&lang=en`
- 可連續縮放的預覽列也有語言選單；網址可帶 `?page=kip&lang=en#proof`，直接開啟指定頁面、語言及段落。
- 未提供或不支援的 `lang` 使用繁體中文。不會依瀏覽器語言自動切換，也不會把上一位使用者的偏好寫進共用資料。

## 擴充其他語言

版型只有一份；文字不是散落在 HTML 的分支判斷裡。

| 檔案 | 職責 |
| --- | --- |
| `i18n.js` | 語言登錄、預設語言、連結、文字跳脫 |
| `locale-common.js` | 導覽、八項優勢、聯絡、頁尾、預覽列、各語言示意圖路徑 |
| `locale-home.js` | 首頁文案 |
| `locale-kip.js` | KIP 文案 |
| `locale-demo.js` | 動畫內文案和播放狀態 |
| `locale-screens.js` | 將 `locale-demo.js` 映射為靜態圖文字，另維護圖說及輸出檔名後綴；只在本機生成時使用 |

新增語言（例如日文）的方式：

1. 為上述四份 runtime 詞典各新增完整的 `ja` 匯出，沿用相同語意 key 及陣列結構。只放純文字，HTML 由共用 renderer 處理。
2. 在 `i18n.js` 匯入四份 `ja` 詞典，於 `catalog` 登錄 `ja`：`label: '日本語'`、`shortLabel: 'JA'`、`dir: 'ltr'`，組成 `{home, kip, demo, common}`。兩個語言選單會從登錄表自動建立，不用另外加按鈕。
3. 在 `locale-screens.js` 匯入 demo 的 `ja` 並加入產生 `screenMessages` 的語言對照表，在 `captions` 補齊 `ja` 圖說，在 `screenLocaleSuffixes` 加 `ja: '-ja'`；對應 common 詞典的 `assets` 指向 `assets/kip-search-demo-ja.svg` 與 `assets/kip-library-demo-ja.svg`。不另抄一份採購問答。
4. 執行下方生成指令、完整測試，並人工檢查新語言的長字詞及 RWD。語意 key / 陣列項目不一致會令測試失敗；目前不做逐字串回退，避免同一頁中英混雜。
5. 若有新增公開檔案，先把確切檔名加進 `share-preview.mjs` allowlist，同步 `share-preview.test.mjs` 的核准數量。先備妥尚未被線上入口引用的檔案、測試通過，重載 **4318 的設計伺服器** 並確認新增檔案能取得後，才切換線上入口的引用；不可先讓線上入口引用尚未允許公開的模組。不要重啟 Cloudflared，也不要公開整個 docs 目錄。

本次只驗證繁中／英文。未驗證的 RTL 或其他文字系統仍需要相應版面測試；有 `dir` 登錄不代表已完成 RTL 設計。

## Logo 要怎麼換一次、同步各處？

目前沒有「選檔上傳」畫面。原型的做法是：**更換共用原檔 → 執行示意圖同步指令 → 重新整理**。

中央設定是 `brand.js` 的 `BRAND`。目前有兩個正式配色版本，而不是在不同頁面各放一份 Logo：

| 原檔（相對於 repository） | 顯示位置 |
| --- | --- |
| `docs/design/live-prototype/assets/synaiq-logo-ink.svg` | 淺底頁首、動態產品介面，以及生成後的中英靜態產品示意圖 |
| `public/brand/synaiq-logo-light.svg` | 深底頁尾 |

操作步驟：

1. 準備透明背景、已核准的 SVG。保留正確外觀和 `viewBox`，不要上傳整張 CIS 排版 JPG 或含黑底的圖片。
2. 先保留舊版備份／Git 差異，再以同檔名替換上述原檔。若整體識別有改版，淺底／深底兩版都要更新；單純更新其中一個配色只改對應檔。
3. 在 repository 根目錄執行：

   ```powershell
   node docs/design/live-prototype/scripts/sync-brand-screens.mjs
   node docs/design/live-prototype/scripts/sync-brand-screens.mjs --check
   node --test docs/design/live-prototype/*.test.mjs
   ```

4. 重新整理原網址，檢查中英文頁首、頁尾、動畫、產品示意圖。公開預覽使用 `no-store`；同一路徑換檔不用重啟伺服器。

同步指令讀取同一個 `BRAND.ink`，更新中英共四張產品示意 SVG 的內嵌 Logo。沒有逐張重做設計，也不需要把原始 Logo 交給 AI 生圖。可先用 `--check` 唯讀檢查是否過期。

若要改原檔名稱或路徑，修改 `brand.js`，確認生成器仍指向 `assets/` 內本機 SVG，更新公開 allowlist 及靜態 `page.html` 的預設 fallback 路徑後，再生成與驗證。一般換圖建議保留固定檔名，避免額外路徑變動。

既有 `brand-logo.test.mjs` 鎖定使用者核准的黑／白／金配色及幾何；若刻意採用新的品牌幾何，須在核准後同步更新測試基線，不應直接略過失敗。

### 不會自動改的地方

- **設備照片、人物照片內已印好的 Logo** 是圖片像素的一部分，需要替換或另行修圖。
- **正式站不會即時同步本機檔案**。需發布更新後的 `brand.js`、Logo 原檔及已同步的示意圖；正式站使用的是封裝後的核准靜態版本，不是 Astro `dist/`。步驟見 [上架／還原操作索引](../../operations/deploy-hostinger.md)。
- 不提供 SVG 安全清洗／任意使用者上傳功能。只接受由團隊審查的品牌原檔；不要把來路不明、含 script／事件／外部引用的 SVG 直接當公開素材。

若日後要由非工程人員「上傳一次即全站更新」，需要另做有權限控管、檔案驗證、淺／深底變體、版本回復及發布流程的品牌素材後台；目前尚未建置。
