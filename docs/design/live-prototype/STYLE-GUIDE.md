# 官網樣式維護指南

本文件對應已核准的 Home／KIP 中英文網站：`docs/design/live-prototype/`。
**不是** Astro Phase A 的 `src/styles/`。修改這裡後需重新整理預覽；Git push 不會自動更新 Hostinger。

## 先分清楚：改內容，還是改外觀

下表檔名皆相對於本指引所在的 `docs/design/live-prototype/`。

| 想修改 | 開哪個檔案、搜尋什麼 |
|---|---|
| 電話號碼與點擊撥號 | `page.html` 搜尋 `tel:`；顯示文字與 `href` 要一起改，詳見下方「修改電話號碼」 |
| 頁尾電話、Email、連結的字級 | `tokens.css` 搜尋 `--footer-link-size`；這是整組頁尾連結的共用設定 |
| CEO quote、姓名與職稱 | `locale-home.js` 搜尋 `ceo:`；中英文各一份 |
| 第一段動畫的採購流程問答與引用 | `locale-demo.js` 搜尋 `question:`、`answer:`、`citationFilename:`；不是 `booth` 裡的圖片查詢文案 |
| 另外兩段動畫的查詢、片名與步驟 | `locale-demo.js` 的 `booth`，詳見下方「模擬滑鼠 Demo 與其他效果」 |
| 字型、字級、文字顏色 | `tokens.css`；不會修改文字內容或電話號碼 |
| 動畫秒數、延遲、次數 | `tokens.css` 對應區段；不必改 JavaScript |

## 平常先改這一個檔案

**所有網站文字的字型、字級、行高、字距與文字顏色，都在 `tokens.css`。**
官網只保留兩份 CSS：`tokens.css` 改文字、常用視覺與動畫播放設定；`site.css` 改排版並套用動畫樣式，不再另填秒數。
本檔上半部是按畫面順序編排的常用變數；下半部「完整文字細項」包含所有文字 CSS，也包含語言選單、手機選單、Demo 小字與圖片旁註記。不是每個細項都有專屬變數，但不用再跨 CSS 找文字。

**調外觀時，在 `tokens.css` 按 Ctrl+F，搜尋對應區塊的中文提示或下表變數。** 例如搜尋 `KNOWLEDGE INTELLIGENCE PLATFORM`，就會找到：

```css
--hero-eyebrow-font: var(--body);      /* 字型；改 var(--display) 就用已載入的襯線字 */
--hero-eyebrow-size: 13px;             /* 大小；以下數字僅示範，實際以檔案為準 */
--hero-eyebrow-color: var(--inverse);  /* 顏色；可直接填 #ffffff */
--hero-eyebrow-weight: 400;            /* 粗細 */
--hero-eyebrow-tracking: 0.06em;       /* 字距 */
```

同段下面就是手機設定；例如手機小標原本是 `9px`。桌機與手機需要一起調整時，兩處都要改。
產業觀察的 `--outlook-current-size`（左 5%）與 `--outlook-future-size`（右 14.5%）彼此獨立；兩者各有桌機、899px 以下平板、639px 以下手機設定，都排在「05 產業觀察」同一段。百分比符號維持數字的 0.38 倍，不會連動另一側數字或箭頭。
K、I、P 首字母用 `--hero-eyebrow-initial-increase`，自動比當下的小標增加指定大小，手機亦沿用；目前保留你調整的 `4px`。顏色用 `--hero-eyebrow-initial-color: #cca858`，與 Logo 金色一致。兩個設定不會改其他字母。
首頁英文小標與 KIP 頁的 `SYNAIQ KIP` 已分開，調首頁不會連動 KIP。
大標題搜尋 `散落的企業文件`，下方說明搜尋 `從一個問題開始`，不需要先猜英文變數名稱。

| 想修改的地方 | `tokens.css` 變數 |
|---|---|
| KNOWLEDGE INTELLIGENCE PLATFORM | `--hero-eyebrow-font`／`size`／`color`／`weight`／`tracking`（共用前綴） |
| 首頁 Banner 大標題 | `--hero-title-font`／`size`／`color`／`weight`／`leading`（共用前綴） |
| Banner 下方說明 | `--hero-intro-font`／`size`／`color`／`weight`（共用前綴） |
| 給每一份／組織知識…／企業獨有的知識…／電子郵件… | `--narrative-pretitle-size`／`--narrative-title-size`／`--narrative-lead-size`／`--narrative-body-size` |
| 然後，散落的知識有了一個入口 | `--product-title-size`、`--product-title-color` |
| 問一個問題，看見答案從哪裡來 | `--showcase-title-size`、`--showcase-body-size`，各有對應 `color` |
| 動畫下方「01 用自然語言提問」等三步文字 | 「06 Demo」的 `--demo-step-font`／`--demo-step-size`／`--demo-step-color`；數字獨立用 `--demo-step-number-font`／`--demo-step-number-size`，手機覆寫緊接在同段下方 |
| 動畫影院的片名／說明／選片按鈕 | 「06 Demo」的 `--demo-booth-title-size`／`--demo-booth-body-size`／`--demo-booth-choice-size`，各自字型與顏色亦在同段 |
| 同一套知識，走到現場／Wally 是 KIP 的現場化身 | `--wally-title-size`、`--wally-body-size`，各有對應 `color` |
| 讓知識，有個見面的方式／從螢幕裡的問答… | `--persona-title-size`、`--persona-body-size` |
| 展示字型／內文字型 | `--display`／`--body` |
| 一般內文字級／行高 | `--body-text-size`／`--body-line-height` |
| 一般文字／次要文字顏色 | `--ink`／`--muted` |
| 深色底上的次要文字 | `--inverse` |
| 首頁、KIP 上方主導覽文字 | `--nav-text-size` |
| 本頁目錄連結 | `--nav-context-size` |
| 目錄前的「首頁內容／KIP 平台內容」標籤 | `--nav-context-label-size`，各寬度共用；與連結字級分開 |
| 右上角中英切換 ZH／EN | `--language-size`；一般 12px，359px 以下 11px，兩處都在「01 導覽列」 |
| 產業觀察區「AI 正在改變…」標題 | `--outlook-title-size` |
| 產業觀察區說明內文 | `--outlook-body-size` |
| 左下文章補充「2024 年的調查中…」兩段文字 | `--outlook-reading-size`／`--outlook-reading-color`／`--outlook-reading-leading`；文案在 `locale-home.js` 的 `outlook.reading` |
| 展開的調查背景與出處 | `--outlook-detail-size` |
| 資料註記 | `--outlook-note-size` |
| 左邊 5% 的大小 | `--outlook-current-size`；% 隨數字等比例縮放 |
| 右邊 14.5% 的大小／強調色 | `--outlook-future-size`／`--outlook-number-color`；% 隨數字等比例縮放 |
| 5% → 14.5% 中間金色手繪箭頭 | `--outlook-arrow-color`／`--outlook-arrow-width`／`--outlook-arrow-stroke`；曲線在 `home-design.js` 搜尋 `budget-arrow`，不使用字型符號或額外圖片檔 |
| 產業觀察區淡綠底色 | `--outlook-surface` |
| 產業觀察右下角新聞剪報寬度／傾斜角度 | `--outlook-clipping-width`／`--outlook-clipping-tilt`；原截圖內文字需改素材，不受 CSS 控制 |
| 全站側邊留白 | `--gutter` |
| 全站內容最大寬度／一般區段留白 | `--content-width`／`--section-padding` |
| CEO 引言字級／行高／姓名字級 | `--ceo-quote-size`／`--ceo-quote-leading`／`--ceo-name-size` |
| 八項優勢標題／展開內文字級與行高 | `--advantages-title-size`／`--advantages-detail-size`／`--advantages-detail-leading` |
| KIP 首屏標題／行高／說明文字 | `--kip-title-size`／`--kip-title-leading`／`--kip-intro-size` |
| KIP 紙色／深底色／手繪強調色 | `--kip-paper`／`--kip-slate`／`--kip-olive` |
| KIP 區段留白 | `--kip-spacing` |
| KIP 資料接入、自動解析、搜尋可用 | `--kip-step-title-size`、`--kip-step-body-size` |
| KIP 四層架構卡片 | `--kip-layer-title-size`、`--kip-layer-body-size` |
| KIP 問完，順手看原文 | `--kip-proof-title-size`、`--kip-proof-body-size` |
| KIP 文件各有位置 | `--kip-library-title-size`／`--kip-library-label-size`／`--kip-library-body-size` |
| KIP 把日常工作，一起接上 | `--kip-capabilities-title-size`／`--kip-capability-title-size`／`--kip-capability-body-size` |
| 先講一個場景，我們回一個做法 | `--contact-title-size`、`--contact-body-size`，各有對應 `color` |
| 洽談導入等按鈕／頁尾公司資訊及地址 | `--button-text-size`／`--footer-body-size`／`--footer-note-size` |
| 頁尾電話、Email 與導覽連結 | `--footer-link-size`；639px 以下的手機覆寫緊接在同段下方 |

`--muted` 等共用色會同時影響多個區域；只想改某段時，在該段樣式使用專屬變數，不要改全站色。
各段已有自己的展示字級，一般內文字級不會強制蓋過這些局部設定。

例如 `clamp(36px, 5.1vw, 74px)` 代表「最小 36px、隨視窗連續縮放、最大 74px」。
手機與平板覆寫緊接在各自段落下方；修改桌機值時也要檢查手機值。
目前已載入 Newsreader／Noto Serif TC 的 300、400，Manrope／Noto Sans TC 的 400、500 字重。
切換已載入字型不用改 HTML；新增其他字型或字重才需同步 `page.html` 的 Google Fonts 網址，並檢查中英文換行。
中文首頁只在「知識中樞」加底線，搜尋 `--hero-underline-` 可調顏色、粗細與距離；不改另外一段或英文文案。

## 改排版時去哪裡

**排版只找 `site.css`。** `page.html` 載入它，它只 import 一份 `tokens.css`。
DevTools 的 `font-size`、`color` 等文字規則應顯示 `tokens.css`；`grid`、寬度、間距等排版規則才在 `site.css`。如果仍看到舊 `prototype.css`，先確認開的是目前的本機預覽，再重新整理。
字級若是 `var(--hero-title-size)`，在 `tokens.css` 上半部搜尋該變數；若是 `12px` 等直接值，就改 DevTools 指向的同檔規則。繼承的字型會顯示在 DevTools 的 Inherited 區域。

| 在 `site.css` 搜尋 | 區塊內容 |
|---|---|
| `BEGIN BASE` | 文件預設、標題間距、焦點、容器與減少動態 |
| `BEGIN COMPONENTS` | 導覽、Logo、按鈕、優勢列表、聯絡與頁尾 |
| `BEGIN HOME /` | 首頁，內含 00–07 小節：手稿、首屏、敘事、產品、產業觀察、展示、Wally、CEO |
| `BEGIN DEMO` | 模擬滑鼠與內容動畫的外觀 |
| `BEGIN HOME PAPER` | 首頁手撕紙邊界與防遮字留白 |
| `BEGIN KIP` | KIP 平台的區塊與 RWD |

動畫播放設定見下節；`demo-animation.js` 只執行捲動觸發、五段播放、暫停與重播，日常不用修改它。`home-design.js` 只負責組合首頁與啟動動畫。
手繪註記 `handwritten-note`、信紙 `source-paper`、圖片標籤 `slot-caption`、Demo 介面 `film-*` 的文字已全部放在 `tokens.css` 下半部，旁邊有中文提示。版型尺寸與座標在 `site.css`。

`--persona-body-size` 不控制其下方 `.note` 的素材註記；要改該註記，在 `tokens.css` 搜尋「共用素材註記」。小按鈕另用 `--button-small-size`。保留你在 `.outlook-caveat` 加上的 `!important`，其字級亦由 `--outlook-note-size` 控制。
圖片本身的字（Logo、產品照片、素材內文字）不屬於網頁文字，需改原素材；預覽工具外框 `index.html` 也不是正式網站的一部分。

中英文文案仍在 `locale-*.js`；Logo 更換方式見 [語言與 Logo 指南](localization-and-brand-guide.md)。
不要把文案寫進 CSS，也不要直接修改圖片中的字來替代語言檔。

## 修改電話號碼

**開 `page.html`，按 Ctrl+F 搜尋 `tel:` 或 `2393`。** 電話在 `<footer id="footer">` 中，目前是：

```html
<a href="tel:+886423931368">+886 4 2393 1368</a>
```

- `href="tel:+886423931368"` 是點擊後交給電話程式的撥號號碼；沿用 `+`、國碼與數字、不加排版空格的寫法。
- `>+886 4 2393 1368<` 是網站顯示文字，可以保留空格方便閱讀。
- 更換號碼時兩處一起改；只改顯示文字，點擊仍會撥舊號碼。
- 這一個共用頁尾供首頁／KIP、中英文使用；電話目前不在 `locale-common.js`，也不是 CSS 設定。`src/content/` 裡搜尋到的同號電話屬於尚未用於正式站的 Astro 基礎，不是目前這個頁尾的來源。
- 調整字級，開 `tokens.css` 搜尋 `--footer-link-size`；會一起影響同組 Email 與導覽連結，並要檢查 639px 以下的覆寫。`--footer-body-color` 控制頁尾段落文字，不是電話連結的獨立色彩設定。

修改後重新整理本機預覽，確認顯示文字，再用 DevTools 檢查該連結的 `href`，不必真的撥出電話；首頁／KIP 與中英文都要確認。

**手動上架要分清楚兩個 HTML 入口：** 本機 `index.html` 是預覽外框，不要上傳它替代官網。正式封裝將 `page.html` 另存成版本目錄中的 `index.html`，根網址 `/` 讀的是後者。如果只在 Hostinger 手動更改電話，需先下載備份，再於目前版本目錄的 `index.html`、`page.html` 同步修改上述電話連結，保留兩檔既有的 CSS、JS、圖片路徑。不要直接拿本機未封裝的 `page.html` 蓋掉線上 `index.html`。正式版本位置以 [Hostinger 操作索引](../../operations/deploy-hostinger.md) 及實際入口為準。

## 動畫：播放設定改 tokens.css，文案改 locale-demo.js

所有可調秒數、延遲、次數與觸發比例只在 `tokens.css` 對應段落定義。儲存後重新整理本機預覽；JavaScript 在載入時讀取 CSS 設定，不會在背景即時重讀編輯器內容。

### KIP 畫面＋信紙＋Wally 的出場

搜尋 **`KIP 畫面＋信紙＋Wally`**，就在「04 產品展示」。不必再去 CSS selector 或 `home-design.js` 找時間。

| 想調整 | 設定 |
|---|---|
| KIP 畫面移動幾秒 | `--product-screen-duration` |
| 信紙移動幾秒 | `--product-paper-duration` |
| Wally 移動幾秒 | `--product-wally-duration` |
| 各自晚幾秒開始 | 同組的 `-delay` |
| 各自淡入時間／淡入延遲 | 同組的 `-fade`／`-fade-delay` |
| 出場方向、旋轉、縮放 | 同組的 `-from`；最終位置與版型仍由 `site.css` 管理 |
| 出現次數 | `--product-reveal-count`：`1` 只出場一次、`2` 兩次、`0` 每次捲入都播放 |
| 何時出場 | `--product-reveal-threshold`：`0.5` 是整段進入視窗 50%；越小越早，範圍 0～1 |

這是**捲入出場**，不是原地循環：整段完全離開視窗後，再捲回才算下一次。用完次數後保持展示，不消失。重新整理會重算次數。手機橫向等短視窗若裝不下設定比例，會限制在視窗實際可達範圍，避免組圖永遠隱藏；縮放視窗不會多算一次。

`1.2s` 是 1.2 秒、`200ms` 是 0.2 秒。移動與淡入是兩條同時進行的效果；要整張一起慢下來，可同時調 `-duration` 和 `-fade`。延遲都是從本次觸發出場起算，不是前一張播完才開始。

### 模擬滑鼠 Demo 與其他效果

搜尋「06 Demo」：`--demo-question-hold`／`click-hold`／`answer-hold`／`source-hold`／`library-hold` 是五段各自停留時間，相加是一輪總長，不用另算 JavaScript 累積毫秒。`--demo-play-count`：`0` 持續循環、`1` 一輪、`2` 兩輪，結束停在最後一幕（知識問答的知識庫，或圖片搜尋的原始素材）；「重播」重新計數。下面同段可改滑鼠移動、打字、側欄滑入等細節時間。

**三段影片共用同一個 KIP 對話介面**：知識問答、以自然語言找圖、以圖搜圖。使用左右箭頭或片名切換；不會自動換片。切片會從頭播放，但保留手動暫停狀態；按重播才恢復播放。同一時間只渲染一段、只使用一個播放時鐘。鍵盤可在片名按鈕上用左右鍵切換。

網站實際播放的是 HTML／CSS／JavaScript 動畫，不是 MP4、GIF 或影片播放器。另行錄製匯出的 MP4 是獨立檔案；修改網站文案或秒數不會更新既有 MP4，需要重新錄製。

兩段圖片動畫只更換聊天內容、輸入框內的文字／圖片附件與回傳結果，不能再另造一套搜尋頁。動畫不是實際上傳、搜尋或連線產品；使用 `public/brand/` 中既有的公開 Wally 素材，沒有私有帳戶畫面。

- 步驟「01 用自然語言提問」的文字字型／大小用 `--demo-step-font`／`--demo-step-size`；前方數字用 `--demo-step-number-font`／`--demo-step-number-size`，都在同一段。
- 三段共用播放次數、滑鼠與介面效果。兩個新片的五段停留時間，在同一「06 Demo」內搜尋 `data-demo-scene="text-image"`／`data-demo-scene="image-image"`，各自修改，不要在檔尾再覆寫。
- 圖片回覆的進場／逐張延遲／原圖展開時間用 `--demo-image-results-duration`／`--demo-image-results-stagger`／`--demo-image-preview-duration`。
- 文案都在 `locale-demo.js`，但第一段問答與圖片查詢不在同一層；請依下表修改 `zhHant`／`en` 兩份。只有新增場景或改動作順序才需要改 `demo-animation.js`；排版在 `site.css` 的 `BEGIN DEMO`，文字外觀與播放設定仍只在 `tokens.css`。

| 要改的動畫文字 | `locale-demo.js` 的位置 |
|---|---|
| 第一段提問、回答、底線重點、補充說明 | 最外層 `question`、`answer`、`answerHighlight`、`answerNote` |
| 第一段側欄最近問題、上方路徑、搜尋中提示 | 最外層 `warrantyTopic`、`breadcrumb`、`thinking`；`warrantyTopic` 是保留的舊欄位名，目前內容是採購筆電申請，不是保固問題 |
| 第一段引用檔名與「查看原文」 | 最外層 `citationFilename`、`citationPage`；`citationPage` 是保留的舊欄位名，目前顯示查看原文，不是頁碼 |
| 展開的引用原文 | 最外層 `sourceLabel`、`sourceTitle`、`sourceHeading`、`sourceNote`；原文的標記段落共用 `answerHighlight`，改它也會同步改回答的底線重點 |
| 最後一幕知識中心的文件列表 | 最外層 `tableRows`；第一筆檔名需與 `citationFilename` 相同 |
| 第一段下方 01／02／03 的步驟文字 | 最外層 `chapters`；不是 `booth` 裡的章節 |
| 三段片名、說明 | `booth.titles`、`booth.descriptions`，依知識問答／自然語言找圖／以圖搜圖排序 |
| 自然語言找圖的提問、提示與步驟 | `booth.textImage.query`／`loading`／`matching`／`chapters` |
| 以圖搜圖的提問、提示與步驟 | `booth.imageImage.query`／`loading`／`matching`／`chapters` |

第一段目前以「為新進同仁採購筆電，該如何申請」示範查找制度流程：填寫用途、規格與預算，主管核准後由採購詢價、下單，到貨後驗收。這是虛構示例，不是企業實際制度；保留示例標示，不要改回目前未支援的「指定第 12 頁寫了什麼」問答。修改時一起核對問題、回答、引用原文、側欄與文件列表，不能只換一句提問。

這裡只控制動畫；首頁組圖中的靜態介面另由 `locale-screens.js` 與生成素材維護，KIP 頁的紙條問答在 `locale-kip.js`。改 `locale-demo.js` 不會同步替換它們，也不代表其他示例已校正。

- 首屏散字：「02 首頁 Banner」的 `--hero-letters-duration`／`stagger`／`count`。這個 CSS 次數用 `infinite` 表示循環，不用 `0`。
- KIP 四層卡片移入效果：「10 KIP 平台」的 `--kip-layer-hover-duration`。
- 全站按鈕移入效果：「12 全站共用」的 `--button-hover-duration`。
- 系統開啟「減少動態」時，組圖直接展示、Demo 停在原文，不播放；離開 Demo 可見範圍或切換分頁時自動暫停。
- 播放次數填非負整數，時間填 `s`／`ms`；Demo 各段停留需大於 0。JavaScript 設定缺漏或格式錯誤時顯示靜態內容，不讓介面消失。

## 修改 CEO quote 的文字

**開 `locale-home.js`，搜尋 `ceo:`。** 有兩段：`zhHant.ceo.quote` 是中文、`en.ceo.quote` 是英文；姓名 `name` 與職稱 `role` 就在各自下方。中英文分開修改，不會自動翻譯。

```js
quote: [
  ['第一段前半句', '第一段收尾'],
  ['第二段前半句', '第二段強調文字'],
],
```

一個內層陣列是一段，兩個字串會直接接起來。第一段收尾保持在一起；第二段的第二個字串會畫強調底線。保留引號、逗號和括號；英文兩段字串交界要留需要的空格。
字級、行高、顏色不在這個 JS 檔：在 `tokens.css` 搜尋「09 CEO 引言」。

### 維護規則

- 在對應段落修改既有規則，不要持續在檔尾追加同名 selector 補丁。
- 新增文字規則放 `tokens.css`；不要把字型或文字顏色寫回 `site.css`、HTML inline style 或 JavaScript。
- 新增動畫時間、延遲、次數、觸發條件放 `tokens.css` 對應段落；`site.css` 的 animation／transition 不可硬寫秒數，JS 也不可另外保留一份時間設定。`motion.test.mjs` 會檢查這項界線。
- 六個 BEGIN 區段保留原樣式套用順序；不要把所有同名 selector 或 media 擅自搬到一起。
- 保留區塊內既有 media 順序；少數 desktop 宣告原本就晚於 mobile 宣告，不能把所有 media 一次搬到底。
- `body[data-page] section.advantages` 的權重，以及 `.hero .wrap` 的層級有現行用途；不要只看最後一條宣告判斷結果。
- 首屏背景是整個 section 的背景層；不要將手繪圖移回文字下方的普通圖片區塊。
- 撕紙的高度、overlap、前段 padding 和向下提示位置必須一起檢查，否則會遮字或產生空白。
- 保留 `clamp()`、`minmax(0, 1fr)`、`height: auto`、中英文換行規則與 reduced-motion 分支。
- 新 CSS／素材要加入 `share-preview.mjs` 的公開白名單；不要放寬成整個 repo 可公開。

## 修改後怎麼檢查

```powershell
npm ci
npm run dev:design
npm run test:all
npm run check
```

另開終端，首次安裝測試瀏覽器：

```powershell
npx playwright install chromium
npm run test:design:visual -- --before=cfe62f6
```

此工具只啟動獨立 headless Chromium 與 loopback 預覽，不操作使用者登入中的 Chrome，也不建立公開隧道。
若要用已安裝的相容 Chromium，可設定 `PLAYWRIGHT_EXECUTABLE_PATH` 為它的完整執行檔路徑。
設定後執行 `npm run test:design` 也會執行 `motion-browser.test.mjs` 的組圖／Demo 互動測試，以及 `demo-booth-browser.test.mjs` 的三片切換、手機版、暫停與鍵盤測試；未設定時瀏覽器測試會明確標記 skipped，不能當作已驗證互動。
真正字型與既有線上人物素材仍需網路；載入失敗時不應接受比較結果。

- `--before=<本機 Git revision>`：整理前的基準。之後改為你當次修改前的 commit。
- `--before-dir=<本機快照目錄>`：若要保留尚未 commit 的調整，先複製當時的 `page.html`、`site.css`、`tokens.css` 到獨立目錄，再用這個參數比對；缺檔會停止，不會偷用目前 CSS 作為基準。
- `--mode=visual`：只做前後外觀比對；`--mode=interactions`：只跑操作檢查；預設兩者都跑。
- `--widths=390,768,1440`：快速檢查；預設包含 17 個寬度及斷點兩側，320–1920px。
- 預設輸出：`out/css-refactor-20260909/`，包含 `report.json`、前後截圖與差異 JSON；可用 `--output=out/<新名稱>` 保存另一輪結果。
- 首頁／KIP × 中英 × 17 寬度 × 全部 details 關閉／打開，共 136 組幾何與 computed-style 比對。
- 390／768／1440 的 12 組整頁截圖逐像素比對；動態另檢查實際揭示、五個 Demo 階段、暫停／重播與 reduced-motion。

結果只涵蓋指定 Chromium、寬度與狀態，不等於 Safari／Firefox 或每一種真實裝置已驗收。
外觀調整若本來就有意改變，先確認差異是預期的，再選新的基準；不要用關掉測試來通過。

文字設定的生效檢查：`node scripts/check-typography.mjs`。它先盤點每頁全部 DOM 文字的實際樣式、檢查已載入的文字 CSS 都來自 `tokens.css`，再暫改每個具名設定並逐一確認生效，最後還原；同時檢查繁中底線、英文不變及 17 寬度溢出。不修改來源檔或正式站。圖片內文字與瀏覽器內建預設不是作者 CSS；Google Fonts 僅提供字型檔。
單元測試另禁止 `site.css` 遺留任何字型、字級、行高、字距、文字顏色宣告，以及公開頁面／腳本夾帶文字 inline style，避免只驗證已列出的設定卻漏掉其他文字。

## 素材與引用維護

以下素材相對於本目錄的 `assets/`。換圖保留原檔備份與長寬比例；新增檔名要同步 renderer／CSS 與 `share-preview.mjs` 白名單。不要只刪紀錄時順便刪掉網站正在使用的圖片。

| 用途 | 素材與維護要點 |
|---|---|
| 首屏打字機、手與抽象大腦 | `knowledge-threads-v2.png`；整個首屏的背景層，不要放回標題下方普通圖片 |
| 傳遞知識的雙手 | `shared-knowledge-hands-v1.png`；敘事插畫，不重複用作 CEO 肖像 |
| CEO 演講素描 | `ceo-speaking-sketch-v1.webp`；依提供的 Wilson 照片生成，白底以 multiply 融合紙色，不是實際演講紀錄 |
| KIP 系統介接插畫 | `kip-connected-work-v1.webp`；白底以 multiply 融合，保留手與文件完整外形 |
| 聯絡區黑白貓 | `contact-cat-yarn-v1.webp`；深底已寫入圖片，並非透明；改聯絡區背景時需一起確認 |
| 手撕信紙邊界 | `torn-paper-cotton-v2.webp`；真實 alpha 邊緣，窄版採裁切寬紙帶，不把整條纖維壓縮到手機寬度 |
| 新聞原截圖 | `investing-cio-20240629.png`；保留標題、日期、照片與 Reuters 署名，不經 AI 重繪或 cover 裁切 |
| 新聞手繪外框 | `news-sketch-frame-v2.webp`；獨立透明簡線外框，紙墊避免筆觸遮住原圖文字 |

上述手繪素材是 AI 生成插畫，不是產品現場照或委製作品證明。Wally 原色設備圖在 repo 的 `public/brand/`；設備照片中印好的 Logo 不會隨 `brand.js` 自動更換。線上角色圖 `https://synaiq.com/wp-content/uploads/2026/03/toutou-2.png` 仍是網站依賴，下架舊素材時不能誤刪它。

新聞小圖在 `home-design.js` 搜尋 `outlook-clipping`；中英無障礙說明在 `locale-home.js` 的 `outlook.clippingLabel`／`clippingAlt`。寬度改 `--outlook-clipping-width`，傾斜改 `--outlook-clipping-tilt`（建議 -6deg 至 6deg，放大角度需重驗手機邊界）。外面不顯示圖說、調查人數或提醒字，調查背景與限制保留在 `outlook-details` 展開區；原截圖內標題與署名不刪。原圖與外框分開維護，不必每次修改文字都重新生圖。

### 引用與私人資料

新聞圖左側的兩段摘要由 `locale-home.js` 的 `outlook.reading` 維護，中英同步。保留 2024 年調查時間，以及 33% 刪減／62% 不刪減其他專案的兩面，不改寫成所有企業都在挪用預算。桌機在 `.outlook-context` 與剪報並排，899px 以下自動堆疊，不加固定高度。

產業觀察使用 [Investing.com 2024-06-29 的 J.P. Morgan CIO 調查報導](https://www.investing.com/news/stock-market-news/cio-survey-a-massive-boon-for-microsoft--jp-morgan-3502358)，屬媒體轉述，未取得原始調查全文。166 位 CIO／每年 1,230 億美元支出、2024 年 5% 與三年後 14.5% 預期、約 45% 年複合增幅、33% 刪減與 62% 不刪減其他專案，均須保留原日期及語境，不當作已實現結果、每年保證增幅或 KIP 的成效數據。

CEO quote 只改語言檔，不從歷史筆記還原舊句，也不因改插畫或版面擅改文案。企業知識敘事不構成已支援所有 connector／格式／客製訓練的產品承諾。

私有產品畫面不得含帳密、公司識別、帳號、對話、文件名或內部時間。若另有授權需截圖，先人工確認，再使用本機不可逆實色遮罩；`sanitize-capture.mjs` 的既有遮罩只適用原先 1280×720 的空白入口，不是通用去識別化工具。網站目前使用品牌化示例介面，不使用私有原始截圖。

## 發布界線

修改本機指引、文案、CSS 或素材都不會自動部署，也不代表正式站已同步。
未來封裝 CSS 只需 `site.css`、`tokens.css`，與 `page.html` 保持同目錄及現有素材路徑。
原本的六份版面 CSS 已合併並刪除，不要在部署時重新帶入舊檔案。
既有 `out/synaiq-deploy-*`／`out/synaiq-address-*` 是已發布／還原紀錄，不要原地覆寫。
依 [上架／還原操作索引](../../operations/deploy-hostinger.md) 建立新版本包後才切換正式站。

日常更新直接維護本指引，不再新增日期驗證報告或製作紀錄；不要在指引中累加每輪測試通過數、歷史 PID、過期網址或舊 quote。
