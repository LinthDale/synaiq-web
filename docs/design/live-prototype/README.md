# 官網維護入口

2026-11-05 Demo 時序與接播修正：五組功能依序經過輸入、移至寄出、按下寄出、送出等待與回答；寄出完成前保留輸入框草稿，不先顯示已送訊息。每組播放一輪，末幕停留 1.2 秒後自動接續下一組，最後回到第一組；暫停、離開畫面及切換分頁會一起停止換片倒數。核心優勢紙條本體與撕邊共用 `--advantage-note-paper`，材質圖片只提供透明輪廓，避免展開與收合時出現異色接縫。正式發布結果見部署紀錄與 Actions。

2026-11-05 首次捲動修正：直式首輪已上線但使用者實測「第一次還是卡卡」。以內容出現後立即捲動的受控測試重現：首次約 1.3 秒未進入動畫，下載完成時目標已到第 47 幀，仍在解碼第 0／1 幀；相鄰包預取又等第一張顯示、逐幀排 idle 工作才啟動。現在 HTML 載入時就下載第一包並由動畫接手同一請求，旋轉不匹配時取消；離線不產生未處理錯誤，減少動態／省流量／2G 不提前下載。包內 32 幀一次標記壓縮資料就緒、預載以包為單位，鄰近包不再等待瀏覽器閒置；仍只預備前方 48／後方 12 幀涉及的包，不閒置整段下載。畫面取最接近捲動位置的已解碼幀，受限裝置只解目前及鄰近位置，避免同時追另一個持續移動的目標；直接跳轉仍立即請求目的地。另增小於 480px 的手機直式 360×640 層（243 幀共 1,453,000 bytes），每幀像素量接近原先實測順暢的 576×384 橫式輕量版；480–899px 保留 432×768，900px 起保留 864×1536，橫向寬度未滿 900px 或視窗短邊未滿 480px 時維持 576×384，避免大尺寸 iPhone 橫放超過 900px 誤載桌面大圖；其餘橫向保留 1152×768。三套直式構圖與 243 幀內容相同，僅縮圖解析度不同。受控 Chrome、CPU 4 倍降速、120ms 延遲／1.5MB/s、7 秒捲動量測，首次不同顯示幀由 114 增為 169，接近同輪重複的 177；P95 目標落後由 19 降為 8 幀，重複為 7。這是影格追隨比較，不是 FPS 或 iPhone 實機保證。新手機影格與來源雜湊見 `scripts/decision-phone-manifest.json`，`sync-decision-phone.mjs --check` 可驗證。

2026-11-05 首輪背景 RWD（後續手機分級以上段為準）：直向視窗（含平板及桌面直向視窗）使用本機 ComfyUI 直式 243 幀，橫向視窗沿用 V5 橫式；構圖依 `(orientation: portrait)` 判斷，素材尺寸獨立以 CSS 寬度 900px 分界。899px 以下為 432×768 直式縮小版或 576×384 橫式縮小版；900px 起為 864×1536 直式原生尺寸或 1152×768 橫式。觸控只影響解碼預算，不決定構圖或尺寸。直式縮小版約 2.04 MB，兩套直式均封為各八包，只有首幀另供封面，不上傳原始 PNG 或重複的個別影格。`decision-responsive.js` 管理四種配置，封面預載、picture 備援與動畫使用相同選擇；旋轉或越過斷點會取消舊請求、釋放舊解碼圖後切換。直式大圖限制 3 幀快取、1 個同時解碼，其餘小圖最多 6／2；解碼窗與保守 UTF-16 壓縮字串估算，小直式低於 16 MiB、大直式低於 64 MiB，均不是瀏覽器總記憶體保證。直式畫面靠底置中，保留打字機、指尖及燈泡。來源 prompt ID、逐幀 hash 與縮圖設定見 `scripts/decision-portrait-manifest.json`；`sync-decision-portrait.mjs --check` 驗證全部來源／衍生影格。實際發布結果見部署紀錄。以下 11/04 的手機分級記錄為歷史狀態。

2026-11-04 首次捲動預取：使用者實測縮小版已不空白，但首次卡住、多滑幾次才正常。手機改將既有 243 張 WebP 原樣包成 8 個固定版本 JSON（每包最多 32 張，共 3,060,929 bytes），僅首幀另作封面公開；未更換構圖或動畫節奏。先取得目前／附近包，顯示時才解碼需要的影格，仍最多 6 張快取、2 張同時解碼。壓縮預取窗為前方 48／後方 12 幀，不閒置抓取全部 8 包；離線失敗的同包不密集重試，恢復連線才允許重試。保守計入全部壓縮字串與影格的估算低於 16 MiB，並非瀏覽器總記憶體保證。`sync-decision-mobile-bundles.mjs --check` 驗證包內每張圖片與衍生來源一致；`decision-mobile-source.js` 處理包快取。受控 120ms 回應延遲測試中，首次 7 秒捲動的不同顯示幀由 13 增至 191，重複後 207；這不是實體 iPhone 的流暢保證。正式上線與後續實機回饋另記部署紀錄。

2026-11-04 手機輕量動畫：依使用者選擇保留完整 243 幀捲動背景。899px 以下或粗略指標的觸控裝置使用 `kip-d-scroll-mobile-v1` 的 576×384 橫式影格（共 2,290,506 bytes），最多 6 幀解碼快取、2 個同時解碼，只預載鄰近幀，不閒置預載整段；桌面保留原解析度。視窗或指標分級改變時釋放舊圖片並切換。手機只替畫面附近的背景區塊設定影格。原先停用手機動畫的臨時方案已由此替代；空白是否為裝置記憶體／繪製壓力造成，尚無實機診斷證據，不能當成已確診。CI 三語手機首頁採正常動態設定、DPR 3、反覆捲動並驗證背景存在及無桌面影格請求；另有 WebKit 26.0／Chrome 直橫向回歸。直式構圖另外製作，不包含在這組橫式素材。實際上線狀態與實機驗收以部署紀錄為準。

Demo 排版與操作統一：五個功能都使用畫面下方的共用三段按鈕，桌機文字與數字皆為 16px、平板與手機 14px，字級、間距、目前段落提示及手機排列一致。點選後從該段開始播放，重點同一段可重新播放，暫停或播完後也能直接點播；每組播放一輪後停留 1.2 秒，再自動接續下一組。經營決策／損益分析從所選輪次輸入問題開始，知識問答／圖片搜尋則從對應提問、結果或來源畫面開始。側邊欄與引用依據仍可暫停閱讀，減少動態效果時直接顯示所選段落的靜態內容。

2026-11-02 圖片預載與 Demo 切換修正：首頁封面優先載入；背景幀先準備目前位置與鄰近幀，再以低優先序預載其餘壓縮圖片，解碼快取維持最多 32 幀，省流量／慢速網路及背景分頁不做全段預載。Demo 接近畫面時先準備圖片搜尋素材，切換五個功能分頁或前後段會清除舊暫停狀態、從頭自動播放，仍尊重減少動態效果及離開畫面暫停。預覽圖片已啟用 HTTP 快取，版本固定的背景幀使用長期快取，其他圖片以內容 ETag 驗證。正式發布依下方 GitHub CI/CD 流程，結果記錄於 Actions 與部署紀錄。

核心優勢使用手撕便利貼：首頁與 KIP 共用，桌面五欄兩排、平板三欄、手機兩欄。滑鼠移入時膠帶掀起、原紙條放大，移出時紙條縮回原位置、膠帶重新貼上。十項優勢的說明與工作情境直接在紙內展開，不產生另一個矩形框，也不增加頁面高度。保留鍵盤焦點、Esc 關閉、手機點按與減少動態效果。產業觀察使用無襯線數字呈現預算占比推算年複合成長約 +42.6%，已移除裝飾箭頭；保留 2024 年調查／2027 年預期及原占比，計算方法與來源差異置於展開出處。中英德同步。

最後更新：2026-11-02。使用者已要求發布目前確認的改版。首頁大標為「企業經營決策與推理平台」，KIP 產品頁保留「看懂經營變化，算清決策影響。」，聚焦自有演算法、檢索、推理、運算與決策；同步中英德三語，公開名稱統一為 KIP。核心優勢加入「不按 Token 計費」與「機敏資料不需送往外部線上模型處理」，保留原八項能力。Demo 保留「經營決策」，新增「損益分析」三輪動畫（兩期比較、交叉分析、改善情境試算），與知識問答、兩種圖片搜尋共五段，沿用原本對話介面。移除 Wally 展示、產品圖片、角色與導覽入口；圖片搜尋 Demo 改用既有 KIP 介面示意圖。首頁接入 V5 連續背景動畫，保留自然頁面捲動，不固定首屏、不增加播放用捲動距離。正式版本與驗證結果以 [部署紀錄](../../operations/deploy-hostinger.md) 及 Actions 為準。

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
| Demo 七階段秒數、循環次數、滑鼠動作速度 | [tokens.css](tokens.css) 搜尋「06 Demo」；依序輸入、移至寄出、點擊、送出等待、回答、原文、知識庫。每組播完後依 `--demo-next-hold` 停留，再自動接續下一組，最後回到第一組；動畫文字在 [locales/zh-Hant/demo.json](locales/zh-Hant/demo.json) |
| 修改動畫程式機制（不是調秒數） | [demo-animation.js](demo-animation.js)；操作方式見 [樣式維護指引](STYLE-GUIDE.md#動畫只改-tokenscss) |
| KIP-D 決策示例 | `decision-demo.js` 產生三輪對話：確認資料、比較方案、追問建議與條件。`demo-animation.js` 沿用五組共用聊天介面與可見時播放的時鐘，每輪演示輸入、移至寄出、點擊、送出等待與回答；保留前輪訊息，可暫停、重播或選章，操作對話捲軸時暫停以便閱讀。`tokens.css` 的 decision 設定控制每輪節奏；背景仍單獨隨整頁捲動。三語內容來源是 `locales/<語言>/demo.json` 的 `decision`，靜態圖由 `screen-templates/decision.svg` 生成；範例數值不是即時試算。 |
| KIP-D 首頁背景滾動幀 | `decision-scroll.js` 依所有黑色區域的可視高度積分，依畫面階段分配捲動距離；產品組圖、文字與前景 demo 不作為停格依據，只有完全被不透明紙面／產業觀察遮住時暫停。撕紙邊緣漸進銜接，連續幀預載與短暫緩動平滑滾輪跳動；依最新回饋，大腦至點亮燈泡增加約六成有效捲動距離，響指與變形核心段約兩倍，以平滑權重漸進銜接。倒捲可逆，視窗改變或區段展開時重算。`decision-frames.js` 管理 V5 的 243 幀清單；`site.css` 的 `DECISION SCROLL` 管理撕紙背景。沒有固定首屏或額外播放高度。靜態備援是使用者確認的首幀；完整動畫仍待使用者驗收。來源見 [素材紀錄](product-screen-provenance.md#2026-10-30-kip-d-背景動畫預覽)。 |
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
- 圖片快取由 `share-preview.mjs` 管理：HTML／CSS／JS 維持 `no-store`，一般圖片使用 `no-cache` 與內容 ETag，未變更時回傳 304；`decision-frames.js` 列出的版本化幀及 `kip-d-opening-v5.webp` 使用一年 `immutable` 快取。重新生成背景時必須換素材版本目錄／封面檔名並同步引用及白名單，不可覆寫已快取的同名版本。更改快取設定須重新載入預覽服務。

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
