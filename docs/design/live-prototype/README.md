# 官網維護入口

最後更新：2026-09-11。

已上線的 Home／KIP／實績展示／關於我們中英版都在這個目錄。工作目錄為 `C:\Users\User\synaiq\synaiq-web`；這是客戶端渲染的靜態網站，不是 `src/` 的 Astro Phase A。正式站使用另外封裝的版本，本機修改不會自動上架；現行版本與還原方式見 [Hostinger 操作索引](../../operations/deploy-hostinger.md)。

只改團隊文字時，編輯這裡的 `locale-about.js`，同步中英文；備份主機同名檔後，覆蓋 `public_html/synaiq-release-20260914-cases-mobile/locale-about.js`，再重新整理官網即可。檔名是 **locale-about.js**；文案檔已設定每次重新驗證快取。Hostinger 根目錄的 `00-SYNAIQ-START-HERE.txt` 尚待另行授權更新，仍列舊目錄；請以上述路徑為準，其他版本資料夾留作還原。版面、CSS、圖片或新增頁面仍依樣式指引的發布流程處理。

## 要改什麼，去哪裡

| 工作 | 入口 |
|---|---|
| 字型、字級、行高、文字顏色、常用留白 | [tokens.css](tokens.css)；[樣式維護指引](STYLE-GUIDE.md) |
| 排版、RWD 幾何、撕紙邊界 | [site.css](site.css)；搜尋對應 BEGIN 區段 |
| 首頁文字、CEO quote | [locale-home.js](locale-home.js)；搜尋 `ceo:`，中英文分別修改 |
| KIP 文字／共用導覽、優勢、聯絡、頁尾 | [locale-kip.js](locale-kip.js)／[locale-common.js](locale-common.js) |
| 實績展示文字、東京食品展故事與圖說 | [locale-cases.js](locale-cases.js)；圖片與報導連結在 [cases-design.js](cases-design.js) |
| 關於我們理念、團隊姓名、職稱、學經歷 | [locale-about.js](locale-about.js)；人物素材與取景在 [about-design.js](about-design.js) |
| 人物照片、手繪與小貓輪廓 | `assets/team/`；使用中的素材配對只在 `about-design.js` 定義 |
| 實績場域照片與手繪 | `assets/cases/`；素材配對只在 `cases-design.js` 定義 |
| 新頁面的紙感版面、人物／場域顯影 | [樣式指引：實績與團隊頁](STYLE-GUIDE.md#實績與團隊頁)；字型、留白與顯影秒數在 `tokens.css`「13 實績展示／關於我們」 |
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
- 繁中實績展示：`page.html?page=cases&lang=zh-Hant`；段落為 `#story`、`#fieldnotes`。
- 繁中關於我們：`page.html?page=about&lang=zh-Hant`；段落為 `#approach`、`#leadership`、`#technical`。
- 四頁都可切換 `lang=en`；加上 `#contact` 等錨點可定位共用段落。
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
- 團隊名單以 `locale-about.js` 為準；Daniel 已依使用者提供的資料換成李昱儒 Celestine，列於經營團隊。手繪版本與真照分開維護，顯影不改寫原始人像。
- Dale、Steve 的人像來自使用者提供的 `20260624公司簡介_不含影片.pptx` 第 4 頁；Steve 新增於技術團隊，Lou 保留。Dale 的學經歷依使用者最新更正覆蓋簡報舊內容，中英同步。照片取景、配對手繪及 Dale 右下角同步顯影／暫停的小貓見 [樣式指引](STYLE-GUIDE.md#實績與團隊頁)；簡報與抽取原始檔只留在本機 `out/team-deck-20260911/`。
- 小貓的手繪與照片風格是不同素材，以原透明輪廓遮罩去掉背景；保留正常合成，讓白色毛髮仍完整覆蓋後方衣服。不要改回 multiply。
- 產品示意圖保留品牌配色與示例標示；Wally 照片保留原色。Demo 是模擬滑鼠／內容動畫，沒有連接真實產品。
- 聯絡按鈕目前是 mailto，不是已完成的表單 API；沒有 Logo 上傳後台。
- 日常更新直接修改這份入口、樣式指引或語言／Logo 指引，不再新增 `*-notes.md`、日期驗證報告、製作流水帳或完成清單。
- 原始簡報、未採用的素材、早期核對稿與測試輸出只放 repo 根目錄的 `out/`，不放入網站素材目錄，也不提交版控。
