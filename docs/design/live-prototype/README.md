# 官網維護入口

最後更新：2026-10-28。本機三語改造已加入；本次尚未發布。

新增語言：`npm run i18n:add -- ja` 建立空白翻譯與語言設定，完成 JSON 後 `npm run i18n:sync` 自動更新登錄、載入器、示意圖、SEO 與白名單。`npm run dev:design` 啟動前也會自動同步。完整流程見 [語言維護指南](localization-and-brand-guide.md#新增語言只維護-json)。

已上線的 Home／KIP／EMS／PVsim／實績展示／關於我們中英版都在這個目錄。工作目錄為 `C:\Users\User\synaiq\synaiq-web`；這是客戶端渲染的靜態網站，不是 `src/` 的 Astro Phase A。本機存檔不會上架；推送到 GitHub `main` 後，由 GitHub Actions 自動測試、封裝、部署、清 CDN 快取並加密備份（[官網更新 README](../../operations/WEBSITE-UPDATE-README.md)、[CI/CD 說明](../../operations/hostinger-cicd.md)）。現行版本與歷史紀錄見 [Hostinger 操作索引](../../operations/deploy-hostinger.md)。

僅在已獲授權上架時，所有修改（含只改團隊文字的 `locales/<語言>/about.json`，以及版面、CSS、圖片或新增頁面）都走同一流程：本機預覽與測試通過後，明確 `git add` 本次檔案、commit，再 `git push github main`。只推 Azure（`origin`）不會上架；不要再手動覆蓋主機上的版本目錄。

翻譯只維護 `locales/<語言>/` 的 JSON，目前有 `zh-Hant`、`en`、`de`；生成的 JavaScript 不手改。修正德文首頁就改 `locales/de/home.json`，語言名稱與縮寫改 `_meta.json`，完成後執行 `npm run i18n:sync` 與 `npm run test:design`。建立範本與同步指令都不會自動翻譯，原文修改後仍需更新其他語言譯文。完整步驟及瀏覽器語言優先序見 [語言維護指引](localization-and-brand-guide.md)。

## 要改什麼，去哪裡

| 工作 | 入口 |
|---|---|
| 字型、字級、行高、文字顏色、常用留白 | [tokens.css](tokens.css)；[樣式維護指引](STYLE-GUIDE.md) |
| 排版、RWD 幾何、撕紙邊界 | [site.css](site.css)；搜尋對應 BEGIN 區段 |
| 首頁文字、CEO quote | [locales/zh-Hant/home.json](locales/zh-Hant/home.json)；搜尋 `ceo:`，繁中、英文、德文分別修改 |
| KIP 文字／共用導覽、優勢、聯絡、頁尾 | [locales/zh-Hant/kip.json](locales/zh-Hant/kip.json)／[locales/zh-Hant/common.json](locales/zh-Hant/common.json) |
| EMS／PVsim 敘事頁 | `energy-design.js` 共用版型與六步互動示意；`locales/<語言>/ems.json`／`locales/<語言>/pvsim.json` 維護中英文產品故事、流程、核心能力、示範說明與聯絡文案；外部示範入口位於頁面後段，均需帳號 |
| EMS／PVsim 實際介面截圖 | `energy-screens.js` 維護畫面清單、鍵盤可操作的切換及原圖連結；各 locale 的 `screens` 維護中英圖說。素材來源及 hash 見 [產品畫面紀錄](product-screen-provenance.md)。截圖是示範環境，不是客戶上線實績；PVsim 以場域設計為主軸，屋頂只是本次示範案例。 |
| PVsim「01 三維場域與配置」互動 | `pvsim-viewer.js` 維護啟用、旋轉／縮放／平移、俯視、配置復位、全場景與截圖備援；中英操作文字在 `locales/<語言>/pvsim.json` 的 `screens.viewer`。模型只在點擊啟用後從官網載入，不連 DGX；素材來源見 [產品畫面紀錄](product-screen-provenance.md)。`npm run build:pvsim-viewer` 重建固定版本 Three.js 靜態模組，`npm run test:pvsim-viewer` 驗證真實渲染與觸控。新增模組及 GLB 都須保留在發布白名單。 |
| 智慧方案／Solutions 產品選單 | `locales/<語言>/common.json` 的 `navigation.products` 改標籤；`page.html` 維護導覽及頁尾的 Synaiq KIP／EMS／PVsim 連結，`prototype.js` 處理收合與鍵盤操作；三個產品皆連至站內介紹頁。選單圖樣沿用 `assets/taistro-logo-ink.svg` 的兩筆 A 路徑，尺寸由 `site.css` 的 `.product-navigation-chevron` 控制為 11 × 10px，開啟時旋轉 180 度；保留手繪底線。 |
| 實績總覽文字、各案例故事與圖說 | [locales/zh-Hant/cases.json](locales/zh-Hant/cases.json) 的 `overview`／`tags`／`cases.<識別碼>`，中英同步 |
| 案例日期、排序、精選、照片路徑、封面取景與報導網址 | [cases-data.js](cases-data.js)；版型在 [cases-design.js](cases-design.js)，不為單一案例改版型 |
| 新增一筆實績 | 本檔「新增一筆實績」小節；步驟固定，不需改共用版型 |
| 關於我們理念、團隊姓名、職稱、學經歷 | [locales/zh-Hant/about.json](locales/zh-Hant/about.json)；人物素材與取景在 [about-design.js](about-design.js) |
| 人物照片、手繪與小貓輪廓 | `assets/team/`；使用中的素材配對只在 `about-design.js` 定義 |
| 實績場域照片與手繪 | `assets/cases/`；素材配對只在 `cases-data.js` 定義 |
| 新頁面的紙感版面、人物／場域顯影 | [樣式指引：實績與團隊頁](STYLE-GUIDE.md#實績與團隊頁)；字型、留白與顯影秒數在 `tokens.css`「13 實績展示／關於我們」 |
| KIP 畫面＋信紙＋Wally 的秒數、延遲、出場次數 | [tokens.css](tokens.css) 搜尋「04 產品展示」；所有設定同一段 |
| Demo 五段秒數、循環次數、滑鼠動作速度 | [tokens.css](tokens.css) 搜尋「06 Demo」；動畫文字在 [locales/zh-Hant/demo.json](locales/zh-Hant/demo.json) |
| 修改動畫程式機制（不是調秒數） | [demo-animation.js](demo-animation.js)；操作方式見 [樣式維護指引](STYLE-GUIDE.md#動畫只改-tokenscss) |
| 搜尋結果摘要、正規網址、hreflang、robots／sitemap | [locales/zh-Hant/common.json](locales/zh-Hant/common.json) 的 `description`、[page-metadata.js](page-metadata.js) 的 `crawlUrls`、`robots.txt`／`sitemap.xml`；規則見 [樣式指引：搜尋引擎中繼資料](STYLE-GUIDE.md#搜尋引擎中繼資料) |
| 中英文、其他語言、統一更換 Logo | [語言與 Logo 指引](localization-and-brand-guide.md) |
| 插畫、新聞小圖與引用來源 | [樣式指引：素材與引用維護](STYLE-GUIDE.md#素材與引用維護) |
| 正式站上架、快取與還原 | [官網更新 README](../../operations/WEBSITE-UPDATE-README.md)、[CI/CD 說明](../../operations/hostinger-cicd.md)；歷次紀錄在 [Hostinger 操作索引](../../operations/deploy-hostinger.md) |

## 本機預覽

在 repo 根目錄執行：

```powershell
npm run dev:design
```

開啟 [本機預覽](http://127.0.0.1:4318/live-prototype/)，存檔後重新整理。預覽列可選頁面、語言並連續調整實際 iframe 寬度；「獨立開啟」可不經預覽外框檢視網站。

- 繁中首頁：`page.html?page=home&lang=zh-Hant`
- 繁中 EMS：`page.html?page=ems&lang=zh-Hant`；PVsim：`page.html?page=pvsim&lang=zh-Hant`。
- 英文 KIP：`page.html?page=kip&lang=en`
- 繁中實績總覽：`page.html?page=cases&lang=zh-Hant`；段落為 `#cases-list`。
- 東京食品展案例：`page.html?page=cases&case=tokyo-foodex-2026&lang=zh-Hant`；段落為 `#story`、`#fieldnotes`、`#press`。
- 臺南市科技產業論壇案例：`page.html?page=cases&case=tainan-tech-forum-2026&lang=zh-Hant`；段落為 `#story`、`#fieldnotes`、`#press`（三則報導）。
- 預覽列有「案例」選單；切換語言保留案例，切換頁面回到總覽。
- 舊連結 `page.html?page=cases&lang=zh-Hant#story` 會自動換成東京案例的同一段落（replaceState，不會卡住上一頁）。無效識別碼顯示「找不到此案例」並設為 noindex。
- 繁中關於我們：`page.html?page=about&lang=zh-Hant`；段落為 `#approach`、`#leadership`、`#technical`。
- 六頁都可切換 `lang=en` 或 `lang=de`；網址未指定 `lang` 時依瀏覽器偏好選語言；加上 `#contact` 等錨點可定位共用段落。
- 4318 已被此預覽使用時不必再開；需要另一個埠可用 `npm run dev:design -- 4319`。
- 同名檔案修改不必重啟。新增素材或模組時，先更新 `share-preview.mjs` 的明確白名單，確認程序身分後僅重新載入該預覽服務，再驗證新檔可取得。

## 新增一筆實績

共用版型不跟著每案重寫；固定七步，順序不要跳：

1. **核對內容**：名稱、日期、場域、合作單位可否公開、SynaiQ 實際提供的內容、照片使用依據。未確認的活動訊息或產品介紹不能直接當成實績。
2. **取固定識別碼**：小寫英數與連字號，例如 `tainan-tech-forum-2026`；一旦發布就不再更動，它是公開網址的一部分。
3. **加三語文字**：`locales/<語言>/cases.json` 的 `cases.<識別碼>`，繁中、英文、德文都要，欄位與既有案例一致。沒有現場紀錄或報導就整段不寫，不放「待補」。
4. **加一筆案例設定**：在 `cases-data.js` 新增一個用 `Object.freeze` 凍結的常數，並把它加進 `CASES` 陣列。填 `id`、`published`、`featured`（兩者都是布林；公開案例最多一筆 `featured: true`，目前是東京）、`date`（只寫實際已知精度）、`tags`、`cover`、`hero`，選填 `field`／`media`。`published: false` 的案例不會顯示，也不會進 sitemap。
5. **放照片並更新白名單**：素材放 `assets/cases/`，再把每個檔名逐一加進 `share-preview.mjs` 的 `runtimeFiles`（匯出為 `PUBLIC_FILES`）；沒加進白名單的檔案預覽與正式站都取不到。手繪選填；有宣告的手繪必須存在並與照片同比例。
6. **更新 sitemap**：執行 `node scripts/build-sitemap.mjs`（本目錄下），為每個公開案例產生三語網址與 hreflang，網址與 `page-metadata.js` 的 `crawlUrls()` 必須一致。
7. **生成、驗證與授權發布**：先 `npm run build:locales` 與 `node docs/design/live-prototype/scripts/sync-brand-screens.mjs`，再 `npm run test:design`，再開本機預覽看總覽卡片、案例詳情、語言切換與 390／835／1440px。新增案例會讓測試裡寫死的預期值失敗，依本次實際值更新：`seo-metadata.test.mjs` 的網址清單、`share-preview.test.mjs` 的公開檔數，以及 `cases-render.test.mjs`／`cases-extensibility.test.mjs` 的總覽列數、左右與直橫。通過後明確 `git add` 本次檔案、commit，再 `git push github main`；`docs/design/live-prototype/` 的變更會由 [GitHub Actions](../../operations/hostinger-cicd.md) 自動測試、部署、清 CDN 快取並加密備份，只推 Azure（`origin`）不會上架。到 [Actions 執行紀錄](https://github.com/LinthDale/synaiq-web/actions/workflows/hostinger.yml) 確認 test 與 deploy 都成功；deploy 的 summary 列出本次正式目錄、來源 commit 與瀏覽器檢查數，檢查範圍包含每個公開案例的中英內頁。deploy 日誌出現 `CDN compression warning`，表示 CDN 重新壓縮後的圖片畫素差異介於 3 至未滿 12，部署照常完成；達 12 會在切換正式首頁前停止並恢復原路由，須人工目視確認內容相同，才把該圖來源與 CDN 回應的精確 hash 配對加入 `scripts/hostinger/cdn-approved-images.json`。`out/` 的 `release.mjs` 手動流程只供緊急處理與歷史查閱，不再重算 `EXPECTED_FILES`／`SITEMAP_URLS`。

實際範例：`tainan-tech-forum-2026` 就是照這七步加進來的——`cases-data.js` 一筆設定（橫式封面、一張現場照片及各自配對手繪、三個報導網址）、`locales/<語言>/cases.json` 一組雙語文字、顯影按鈕標籤與對應的三則報導標題、`assets/cases/` 四個檔案、白名單四筆、sitemap 兩筆。報導網址放 `cases-data.js` 的 `media`、標題放 `locales/<語言>/cases.json` 的 `press.links`，兩邊依序一一對應。總覽封面及案例內兩張圖均使用手繪顯影、暫停／繼續與鍵盤操作；總覽圖片是獨立互動按鈕，文字區與「翻開這個故事」連結負責進入內頁。

不要為新增案例更動 `?v=` 版本參數：CI 每次部署都建立新的版本目錄，資源網址本來就會換；`address-cache.test.mjs` 也把 `prototype.js`、`page-metadata.js`、`i18n.js` 的匯入參數釘在同一個值，只改一部分會讓測試失敗。

封面直式或橫式都可以：`hero.aspect` 寫顯示比例。總覽與案例頁在 900px 以上都以圖片欄 60%、文字欄 40% 分配扣除間距後的欄寬；直圖置中且高度上限 480px，套用總覽、主照與現場照片，橫圖仍填滿圖片欄。總覽保留左右交替，案例頁統一文字左、圖片右。899px 以下改單欄、圖片在上，橫圖最大寬 440px、直圖最大高 360px，均不超過容器。配對顯影沿用主照置中取景；沒有配對手繪時，靜態封面用 `cover.focus` 指定取景。排序由 `featured` 與日期決定：目前東京 `featured: true` 置頂，其餘依日期由新到舊。

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
- Quote 以 `locales/<語言>/home.json` 為唯一文字來源，不在維護文件複製一份容易過期的文案。
- 團隊名單以 `locales/<語言>/about.json` 為準；Daniel 已依使用者提供的資料換成李昱儒 Celestine，列於經營團隊。手繪版本與真照分開維護，顯影不改寫原始人像。
- Dale、Steve 的人像來自使用者提供的 `20260624公司簡介_不含影片.pptx` 第 4 頁；Steve 新增於技術團隊，Lou 保留。Dale 的學經歷依使用者最新更正覆蓋簡報舊內容，中英同步。照片取景、配對手繪及 Dale 右下角同步顯影／暫停的小貓見 [樣式指引](STYLE-GUIDE.md#實績與團隊頁)；簡報與抽取原始檔只留在本機 `out/team-deck-20260911/`。
- 小貓的手繪與照片風格是不同素材，以原透明輪廓遮罩去掉背景；保留正常合成，讓白色毛髮仍完整覆蓋後方衣服。不要改回 multiply。
- 產品示意圖保留品牌配色與示例標示；Wally 照片保留原色。Demo 是模擬滑鼠／內容動畫，沒有連接真實產品。
- 聯絡按鈕目前是 mailto，不是已完成的表單 API；沒有 Logo 上傳後台。
- 日常更新直接修改這份入口、樣式指引或語言／Logo 指引，不再新增 `*-notes.md`、日期驗證報告、製作流水帳或完成清單。
- 原始簡報、未採用的素材、早期核對稿與測試輸出只放 repo 根目錄的 `out/`，不放入網站素材目錄，也不提交版控。
