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

## 公司與產品 Logo 分開管理

`brand.js` 的 `BRAND` 是網站公司品牌 **tAistro**；`PRODUCT_BRAND` 是產品 **Synaiq KIP** 的 Synaiq Logo。公司品牌更換不會覆蓋產品識別。

| 原檔 | 用途 |
| --- | --- |
| `assets/taistro-logo-ink.svg` | 網站淺底頁首、Demo 與靜態示意圖左上角 |
| `assets/taistro-logo-light.svg` | 網站深底頁尾 |
| `assets/synaiq-logo-ink.svg` | Synaiq KIP 標題、Demo 與四張示意圖右上角的產品識別 |

新版 tAistro 圖形擷取自使用者提供的 `20260922_星洋taistro_LOGO.pdf` 第一頁，保留向量路徑與黑／白配色，去除版面背景。公司中文名為「星洋智能科技股份有限公司」，Email 為 `service@taistro.com.tw`。正式網站網域另行確認，不依 Email 自動變更 DNS 或 SEO 網址。

更換同一品牌素材時，保留 `viewBox` 與透明背景，使用已審查、無腳本或外部引用的 SVG。新檔名必須同步 `brand.js`、`page.html` fallback、公開白名單及相關測試。

若修改產品 Logo 或示意圖文字，執行：

```powershell
node docs/design/live-prototype/scripts/sync-brand-screens.mjs
node docs/design/live-prototype/scripts/sync-brand-screens.mjs --check
npm run test:design
```

生成器同時讀取 `BRAND.ink`（左上公司 Logo）及 `PRODUCT_BRAND.ink`（右上產品 Logo，搭配 KIP 文字）。任一 Logo 變更都需重新產生四張示意圖。檢查中英文頁首、頁尾、產品標題、動畫及產品示意圖，並確認手機與桌面排版。正式上架依官網更新 README 辦理。

### 不會自動改的地方

- **設備照片、人物照片內已印好的 Logo** 是圖片像素的一部分，需要替換或另行修圖。
- **正式站不會即時同步本機檔案**。需發布更新後的 `brand.js`、Logo 原檔及已同步的示意圖；正式站使用的是封裝後的核准靜態版本，不是 Astro `dist/`。步驟見 [上架／還原操作索引](../../operations/deploy-hostinger.md)。
- 不提供 SVG 安全清洗／任意使用者上傳功能。只接受由團隊審查的品牌原檔；不要把來路不明、含 script／事件／外部引用的 SVG 直接當公開素材。

若日後要由非工程人員「上傳一次即全站更新」，需要另做有權限控管、檔案驗證、淺／深底變體、版本回復及發布流程的品牌素材後台；目前尚未建置。
