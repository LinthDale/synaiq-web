# 官網維護入口

網站的核准 Home／KIP 中英版在這個目錄。工作目錄為 `C:\Users\User\synaiq\synaiq-web`；這是客戶端渲染的靜態網站，不是 `src/` 的 Astro Phase A。正式站使用另外封裝的版本，本機修改不會自動上架。

## 要改什麼，去哪裡

| 工作 | 入口 |
|---|---|
| 字型、字級、行高、文字顏色、常用留白 | [tokens.css](tokens.css)；[樣式維護指引](STYLE-GUIDE.md) |
| 排版、RWD 幾何、撕紙邊界 | [site.css](site.css)；搜尋對應 BEGIN 區段 |
| 首頁文字、CEO quote | [locale-home.js](locale-home.js)；搜尋 `ceo:`，中英文分別修改 |
| KIP 文字／共用導覽、優勢、聯絡、頁尾 | [locale-kip.js](locale-kip.js)／[locale-common.js](locale-common.js) |
| KIP 畫面＋信紙＋Wally 的秒數、延遲、出場次數 | [tokens.css](tokens.css) 搜尋「04 產品展示」；所有設定同一段 |
| Demo 五段秒數、循環次數、滑鼠動作速度 | [tokens.css](tokens.css) 搜尋「06 Demo」；動畫文字在 [locale-demo.js](locale-demo.js) |
| 修改動畫程式機制（不是調秒數） | [demo-animation.js](demo-animation.js)；操作方式見 [樣式維護指引](STYLE-GUIDE.md#動畫只改-tokenscss) |
| 中英文、其他語言、統一更換 Logo | [語言與 Logo 指引](localization-and-brand-guide.md) |
| 插畫、新聞小圖與引用來源 | [樣式指引：素材與引用維護](STYLE-GUIDE.md#素材與引用維護) |
| 正式站上架、快取與還原 | [Hostinger 操作索引](../../operations/deploy-hostinger.md) |

## 本機預覽

在 repo 根目錄執行：

```powershell
npm run dev:design
```

開啟 [本機預覽](http://127.0.0.1:4318/live-prototype/)，存檔後重新整理。預覽列可選頁面、語言並連續調整實際 iframe 寬度；「獨立開啟」可不經預覽外框檢視網站。

- 繁中首頁：`page.html?page=home&lang=zh-Hant`
- 英文 KIP：`page.html?page=kip&lang=en`
- 加上 `#proof`、`#contact` 等錨點可定位段落。
- 4318 已被此預覽使用時不必再開；需要另一個埠可用 `npm run dev:design -- 4319`。
- 同名檔案修改不必重啟。新增素材或模組時，先更新 `share-preview.mjs` 的明確白名單，確認程序身分後僅重新載入該預覽服務，再驗證新檔可取得。

## 安全預覽與分享

預覽只綁定 loopback，支援 GET／HEAD，沒有上傳、目錄瀏覽或產品後端連線。文件、測試、私人參考素材、`.git` 及 `.env.hostinger.local` 不得加入公開白名單。

若另有核准的對外分享需求，先確認本機預覽正常，再使用官方 Cloudflared：

```powershell
cloudflared tunnel --no-autoupdate --url http://127.0.0.1:4318 --protocol http2
```

使用當次輸出的網址，不沿用舊 quick-tunnel 網址。持有網址的人都可存取，`noindex` 不是登入保護；電腦、預覽服務與隧道需持續運作。結束分享時先驗證該程序的命令與目標，再停止它，不能一次關閉所有 Node／Cloudflared，也不能公開整個 repo 或 Vite docs 根目錄。

## 檢查與維護原則

```powershell
npm run test:all
npm run check
node scripts/check-typography.mjs
```

前後畫面、RWD 與操作驗證方式見 [樣式維護指引](STYLE-GUIDE.md#修改後怎麼檢查)。測試輸出留在忽略的 `out/`，不另寫一份完成報告。

- 新聞數字保留調查日期與預期／實績區分；不能改寫成 KIP 的績效或客戶背書。
- Quote 以 `locale-home.js` 為唯一文字來源，不在維護文件複製一份容易過期的文案。
- 產品示意圖保留品牌配色與示例標示；Wally 照片保留原色。Demo 是模擬滑鼠／內容動畫，沒有連接真實產品。
- 聯絡按鈕目前是 mailto，不是已完成的表單 API；沒有 Logo 上傳後台。
- 日常更新直接修改這份入口、樣式指引或語言／Logo 指引，不再新增 `*-notes.md`、日期驗證報告、製作流水帳或完成清單。
