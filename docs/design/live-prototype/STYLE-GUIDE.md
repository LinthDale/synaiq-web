# 官網樣式維護指南

最後更新：2026-09-11。

改字的外觀先開 `tokens.css`，改文案先找 `locale-*.js`，改版面才開 `site.css`。本指引涵蓋已上線的 Home／KIP／實績展示／關於我們中英版，供日常維護使用。

唯一工作目錄：`C:\Users\User\synaiq\synaiq-web`。核准網站來源在 `docs/design/live-prototype/`，**不是** Astro Phase A 的 `src/styles/`。儲存後重新整理本機預覽；Git push 不會自動更新 Hostinger。

## 先分清楚：改內容，還是改外觀

下表檔名皆相對於本指引所在的 `docs/design/live-prototype/`。

| 想修改 | 開哪個檔案、搜尋什麼 |
|---|---|
| 首頁 Banner、敘事、產業觀察、Wally 文案 | `locale-home.js` 的 `hero`／`narrative`／`outlook`／`wally` |
| KIP 頁的標題、流程、四層架構與說明 | `locale-kip.js` |
| 實績展示的故事、場域筆記、照片圖說與報導標題 | `locale-cases.js`；報導 URL 與素材路徑在 `cases-design.js` |
| 關於我們的理念、團隊名單、職稱及學經歷 | `locale-about.js` 的 `hero`／`approach`／`leadership`／`technical`；照片路徑在 `about-design.js` |
| 導覽、本頁目錄、八項優勢、聯絡區、公司地址 | `locale-common.js` 的 `navigation`／`advantages`／`contact`／`footer` |
| CEO quote、姓名與職稱 | `locale-home.js` 搜尋 `ceo:`；中英文各一份 |
| 第一段動畫的採購流程問答與引用 | `locale-demo.js` 搜尋 `question:`、`answer:`、`citationFilename:`；不是 `booth` 裡的圖片查詢文案 |
| 另外兩段動畫的查詢、片名與步驟 | `locale-demo.js` 的 `booth`，詳見下方「模擬滑鼠 Demo 與其他效果」 |
| 靜態產品示意圖裡的文字 | 問答與介面文字共用 `locale-demo.js`；`locale-screens.js` 負責映射與圖說，改完需重新生成 SVG |
| 字型、字級、文字顏色 | `tokens.css`；不會修改文字內容或電話號碼 |
| 動畫秒數、延遲、次數 | `tokens.css` 對應區段；不必改 JavaScript |
| 間距、寬度、並排、撕紙與手機排列 | `site.css`；已有常用留白、剪報寬度等變數時，先改 `tokens.css` |
| Logo、其他語言 | `brand.js`／`i18n.js`，操作見「Logo 與靜態產品示意圖」及語言指引 |
| 電話號碼、Email 與點擊連結 | `page.html`；聯絡區的 Email 另在 `shared-design.js`，詳見「共用聯絡資料」 |
| 頁尾電話、Email、連結的字級 | `tokens.css` 搜尋 `--footer-link-size`；整組頁尾連結共用 |

文案分別匯出 `zhHant` 和 `en`，兩份都要修改，不會自動翻譯。保留原有 key、陣列長度與純文字格式，不要在語言檔塞 HTML。

### 容易漏掉的文案位置

- 首頁標題在 `locale-home.js` 的 `hero.title`，依序是「散落的企業文件，」「變成隨問隨答的」「知識中樞」三個字串；第三個字串才是中文底線區塊。英文不套這條底線。
- 首頁 K／I／P 的首字母效果由 `home-design.js` 的 `renderHeroEyebrow` 套用，僅針對完整的 `KNOWLEDGE INTELLIGENCE PLATFORM`；更換整句後不會自動替任意新文案的首字母加色。
- 八項優勢在 `locale-common.js` 的 `advantages.items`。每項依序為「名稱、右側簡述、展開首段、展開補充、情境示例」，不是只改列表上的標題。
- 「首頁／KIP 平台／實績展示／關於我們」是換頁，段落目錄依當前頁改變。文字在 `locale-common.js` 的 `navigation`；增刪目錄項目或改目標 ID 要同步 `prototype.js` 的 `initPageNavigation` 與對應頁面區塊。所在頁只保留底線，無障礙用的 `aria-current` 不要刪掉。700px 以上主導覽排在 Logo 與語言選單之間；更窄的手機版可換行，保持連結可讀。
- 語言切換顯示的 `ZH／EN` 在 `i18n.js` 的 `catalog.shortLabel`；選單字級在 `tokens.css` 的 `--language-size`。新增語言需完整詞典與靜態圖，不能只新增一個選項，步驟見 [語言與 Logo 指南](localization-and-brand-guide.md)。
- 產業觀察的標題、兩段文章補充、年份、圖表朗讀說明與展開出處都在 `locale-home.js` 的 `outlook`；**圖表的 5 與 14.5 數值目前直接在 `home-design.js` 的 `budget-comparison`**，不是 CSS。若改數據，這些位置與原始來源必須一起核對。

## 平常先改這一個檔案

**網站 DOM 文字的字型、字級、行高、字距與文字顏色，都在 `tokens.css`；圖片內的字不受它控制。**
官網只保留兩份 CSS：`tokens.css` 改文字、常用視覺與動畫播放設定；`site.css` 改排版並套用動畫樣式，不再另填秒數。
`tokens.css` 上半部是按畫面順序編排的常用變數；下半部「完整文字細項」包含文字 CSS，也包含語言選單、手機選單、Demo 小字與圖片旁註記。不是每個細項都有專屬變數，但不用再跨 CSS 找文字。

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
| 動畫影院的片名／說明／選片按鈕 | 「06 Demo」的 `--demo-booth-title-size`／`--demo-booth-body-size`／`--demo-booth-choice-size`；只有片名有獨立 `--demo-booth-title-font`，其餘字型沿用 `--body`，選片狀態色見下半部 `.demo-booth-choices button` |
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
| 實績／關於我們的大標、段落標題、內文與留白 | 「13 實績展示／關於我們」的 `--editorial-title-size`／`--editorial-about-title-size`／`--editorial-section-title-size`／`--editorial-body-size`／`--editorial-space` |
| 手繪逐漸顯影為真照的時間／點擊水紋 | 「13 實績展示／關於我們」的 `--ink-reveal-duration`／`--ink-ripple-duration` |
| KIP 資料接入、自動解析、搜尋可用 | `--kip-step-title-size`、`--kip-step-body-size` |
| KIP 四層架構卡片 | `--kip-layer-title-size`、`--kip-layer-body-size` |
| KIP 問完，順手看原文 | `--kip-proof-title-size`、`--kip-proof-body-size` |
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
| `BEGIN EDITORIAL` | 實績展示、關於我們、人物／場域水墨顯影與 RWD |

`home-design.js`／`kip-design.js` 組合各頁 HTML、指定圖片並啟動互動；`shared-design.js` 組合八項優勢與聯絡區；`demo-animation.js` 同時產生三片共用的聊天介面、設定示例圖片，並執行出場、切片與五段播放。這些檔案不是日常字級或秒數的設定入口。
`cases-design.js`／`about-design.js` 組合兩個新增頁面，共用 `ink-photo.js` 的 `renderInkPhoto`／`initInkPhotos`。頁面登錄在 `prototype.js`，詞典登錄與合法頁名在 `i18n.js`；預覽外框由 `index.html`／`preview.js` 控制。
手繪註記 `handwritten-note`、信紙 `source-paper`、圖片標籤 `slot-caption`、Demo 介面 `film-*` 的**文字樣式**在 `tokens.css` 下半部；文字內容仍在語言檔。版型尺寸與座標在 `site.css`。

`--persona-body-size` 不控制其下方 `.note` 的素材註記；要改該註記，在 `tokens.css` 搜尋「共用素材註記」。小按鈕另用 `--button-small-size`。保留你在 `.outlook-caveat` 加上的 `!important`，其字級亦由 `--outlook-note-size` 控制。
圖片本身的字（Logo、產品照片、素材內文字）不屬於網頁文字，需改原素材；預覽工具外框 `index.html` 也不是正式網站的一部分。

中英文文案仍在 `locale-*.js`；Logo 更換方式見 [語言與 Logo 指南](localization-and-brand-guide.md)。
不要把文案寫進 CSS，也不要直接修改圖片中的字來替代語言檔。

## 實績與團隊頁

兩頁沿用首頁的暖紙色、襯線大字、橄欖綠與手繪筆觸，並使用共用頁首、聯絡區及頁尾。Home／KIP 的既有頁面內容維持原基準；新增頁面仍在本機審閱。

| 頁面 | 內容與段落 ID | 渲染入口 |
|---|---|---|
| `page=cases` | 東京食品展故事 `story`、現場筆記 `fieldnotes`；報導來源接在筆記後 | `cases-design.js`／`locale-cases.js` |
| `page=about` | 理念 `approach`、經營團隊 `leadership`、技術團隊 `technical` | `about-design.js`／`locale-about.js` |

兩頁都支援 `lang=zh-Hant`／`lang=en`。實績目前是一則東京食品展案例，四語導覽與裝置整合是故事內容；不要把展會整體業績寫成 AI 帶來的績效。團隊名單的唯一文字來源是 `locale-about.js`；Daniel 已依使用者提供的人像與履歷換成李昱儒 Celestine，職稱為業務總監，放在 `leadership.members`。新增或改動學經歷時同步中英，不在這份文件另抄一份名單。

### 手繪與真照互動

`ink-photo.js` 先顯示手繪，滑鼠移入後用水墨遮罩逐漸顯出真照；`tokens.css`「13 實績展示／關於我們」的 `--ink-reveal-duration` 目前為 `2600ms`。**點擊會保留點擊當下的顯影比例，再點一次才繼續**；不是第一次點擊就直接跳成完整真照。未暫停時離開圖片會逐漸回到手繪。鍵盤焦點也可顯影，Enter／Space 操作按鈕，Escape 返回手繪。觸控第一次輕點啟動顯影，過程中再次輕點可暫停／繼續；停在完整手繪或真照時，輕點開始反向轉場。reduced-motion 直接切換狀態，保留操作能力。

圖片不顯示「移入顯影：點擊暫停」或其他操作提示；保留按鈕語意、無障礙名稱與焦點外框。`--ink-ripple-duration` 控制點擊水紋，`--editorial-hover-duration` 控制新頁面連結的小幅動作。所有時間都從 `tokens.css` 讀取。

SVG 的噪聲、位移與模糊只作用於顯影遮罩，真照人物保持清晰；永久柔邊在 `site.css` 的 `.ink-photo__canvas`，場域另用 `.ink-photo--scene`。不要用整張真照模糊或調色濾鏡替代柔邊，也不要用照片濾鏡冒充手繪素材。

昱儒的 `assets/team/celestine-photo.webp` 保留使用者提供的完整 `864×1184` 構圖，僅轉成網頁格式。`about-design.js` 的 `photoCrop` 以 SVG 視窗取景，目前為 `x: 265, y: 58, width: 310, height: 310`，由 `ink-photo.js` 套用；不需破壞原圖。調整時比較手繪／真照的臉部大小與位置，維持一比一比例，並一起檢查 `#portrait-celestine .ink-photo__canvas` 的柔邊。

Dale、Steve 的真照改用使用者提供的 `20260624公司簡介_不含影片.pptx` 第 4 頁素材，分別為簡報內的 `ppt/media/image11.png`（1045×1567）與 `image12.png`（1004×1236）；本機來源保留於 `out/team-deck-20260911/`，不加入公開白名單。兩張完整原照轉為 `assets/team/{dale,steve}-20260624-photo.webp`，並配對同名前綴的 `-sketch.webp`。`about-design.js` 明確列出每個人的真照、手繪與 `photoCrop`：Dale 為 `310,76,435,435`，Steve 為 `0,0,1004,1004`；取景順序為 x、y、width、height，不修改原始人物比例。

Steve 是新增的技術成員，放在 Lou 與 Dale 之間；Lou 仍保留。Steve 的「博士班」英文使用 `Doctoral Program`，不能改成已取得博士學位。Dale 的學經歷以使用者最新更正為準，覆蓋簡報中的舊資料；修改 `locale-about.js` 時須同步中英。

Dale 右下角的小貓由 `about-design.js` 的 `companion` 配對 `assets/team/dale-tuxedo-kitten-ink.webp`（簡潔線條手繪）與 `dale-tuxedo-kitten-photo.webp`（照片風格）。兩者都是 AI 生成素材，並非使用者提供的寵物實拍。`companion.silhouette` 指向原本含透明輪廓的 `dale-tuxedo-kitten.webp`；`ink-photo.js` 以獨立的 SVG `mask-type:alpha` 形狀遮罩包住小貓的兩個顯影圖層，去掉白底方塊並保留白胸。小貓 canvas 與手繪層使用正常合成，不能使用 multiply，否則白色毛髮會被後方深色衣服染暗。

`renderInkPhoto` 把小貓的 SVG 放在 Dale 的同一個按鈕內，沒有新增焦點或獨立按鈕；移入人物或小貓時兩者同步顯影，點擊共同暫停／繼續，移出後一起回到手繪。各自的顯影與擦除遮罩共用進度及按比例換算的起點，由同一組動畫更新；不要另外啟動小貓的計時器。位置和尺寸在 `.ink-photo__canvas--companion`，維持在人物圖層上方，小貓不套用人物的大範圍永久柔邊，以保留耳朵和尾巴。

## 共用聯絡資料

公司名稱與地址改 `locale-common.js` 的 `footer.company`／`footer.address`，中英文各一份；`page.html` 中對應 `data-i18n` 的預設文字也應同步。聯絡區標題、說明與按鈕文字改 `contact.heading`／`description`／`cta`。

Email 的顯示文字與 `mailto:` 在 `page.html` 的頁尾；「洽談導入」寄信目標另在 `shared-design.js` 的 `renderContact`。更換信箱時兩處一起改。目前按鈕開啟郵件程式，沒有連接表單 API。

### 電話號碼

**開 `page.html`，按 Ctrl+F 搜尋 `tel:` 或 `2393`。** 電話在 `<footer id="footer">` 中，目前是：

```html
<a href="tel:+886423931368">+886 4 2393 1368</a>
```

- `href="tel:+886423931368"` 是點擊後交給電話程式的撥號號碼；沿用 `+`、國碼與數字、不加排版空格的寫法。
- `>+886 4 2393 1368<` 是網站顯示文字，可以保留空格方便閱讀。
- 更換號碼時兩處一起改；只改顯示文字，點擊仍會撥舊號碼。
- 這一個共用頁尾供四頁、中英文使用；電話目前不在 `locale-common.js`，也不是 CSS 設定。`src/content/` 裡搜尋到的同號電話屬於尚未用於正式站的 Astro 基礎，不是目前這個頁尾的來源。
- 調整字級，開 `tokens.css` 搜尋 `--footer-link-size`；會一起影響同組 Email 與導覽連結，並要檢查 639px 以下的覆寫。`--footer-body-color` 控制頁尾段落文字，不是電話連結的獨立色彩設定。

修改後重新整理本機預覽，確認顯示文字，再用 DevTools 檢查該連結的 `href`，不必真的撥出電話；四頁與中英文都要確認。

若手動修改主機上的共用 HTML，需同步版本目錄的 `index.html`、`page.html`，並保留封裝後路徑；詳見「Hostinger 手動更新與發布界線」，不要用本機預覽外框覆蓋官網。

<a id="動畫只改-tokenscss"></a>

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

搜尋「06 Demo」，以下五段停留時間相加就是一輪總長。第一片使用 `:root` 設定；另兩片的覆寫緊接在同段下方，以 `data-demo-scene="text-image"`／`data-demo-scene="image-image"` 區分。只改 `:root` 不會蓋過另兩片的設定。

| 設定 | 第一片：知識問答 | 第二／三片：圖片搜尋 |
|---|---|---|
| `--demo-question-hold` | 顯示提問、打字 | 輸入描述／選入參考圖 |
| `--demo-click-hold` | 點擊寄出、查找資料 | 點擊寄出、比對圖片 |
| `--demo-answer-hold` | 顯示採購流程回答 | 顯示三張結果 |
| `--demo-source-hold` | 打開引用原文 | 選中第一張結果 |
| `--demo-library-hold` | 顯示知識中心文件列表 | 打開原始素材面板 |

`--demo-play-count`：`0` 持續循環、`1` 一輪、`2` 兩輪，結束停在最後一幕；「重播」重新計數。`--demo-view-threshold` 決定可見多少才播放，不是秒數。`--demo-typing-duration`、`--demo-pointer-duration`、`--demo-source-duration` 控制動作速度，不會加長該幕停留時間；動作時間應小於所屬幕的停留時間。文案變長時，需實看回答與原文是否有足夠閱讀時間。

**三段動畫共用同一個 KIP 對話介面**：知識問答、以自然語言找圖、以圖搜圖。使用左右箭頭或片名切換，不會自動換片。切片重設時間與次數，但保留手動暫停狀態；可按「播放動畫」繼續，或按「重新播放」從頭播放。同一時間只渲染一段、只使用一個播放時鐘。鍵盤可在片名按鈕上用左右鍵切換。

網站實際播放的是 HTML／CSS／JavaScript 動畫，不是 MP4、GIF 或影片播放器。另行錄製匯出的 MP4 是獨立檔案；修改網站文案或秒數不會更新既有 MP4，需要重新錄製。

兩段圖片動畫只更換聊天內容、輸入框內的文字／圖片附件與回傳結果，不能再另造一套搜尋頁。動畫不是實際上傳、搜尋或連線產品；使用 `public/brand/` 中既有的公開 Wally 素材，沒有私有帳戶畫面。

- 步驟「01 用自然語言提問」的文字字型／大小用 `--demo-step-font`／`--demo-step-size`；前方數字用 `--demo-step-number-font`／`--demo-step-number-size`，都在同一段。目前桌機文字與數字各為 22px；899px 以下文字覆寫為 12px，639px 以下數字為 18px。改桌機字級不會自動取消這些窄版覆寫。
- 三段共用播放次數、滑鼠與介面效果。兩個新片的五段停留時間，在同一「06 Demo」內搜尋 `data-demo-scene="text-image"`／`data-demo-scene="image-image"`，各自修改，不要在檔尾再覆寫。
- 圖片回覆的進場／逐張延遲／原圖展開時間用 `--demo-image-results-duration`／`--demo-image-results-stagger`／`--demo-image-preview-duration`。
- 問答、提示與步驟文案在 `locale-demo.js`，但第一段與圖片查詢不在同一層；請依下表修改 `zhHant`／`en` 兩份。新增場景、改動作順序、介面結構或示例圖片時才需要改 `demo-animation.js`；排版在 `site.css` 的 `BEGIN DEMO`，文字外觀與播放設定仍只在 `tokens.css`。

| 要改的動畫文字 | `locale-demo.js` 的位置 |
|---|---|
| 第一段提問、回答、底線重點、補充說明 | 最外層 `question`、`answer`、`answerHighlight`、`answerNote` |
| 第一段側欄最近問題、上方路徑、搜尋中提示 | 最外層 `warrantyTopic`、`breadcrumb`、`thinking`；`warrantyTopic` 是保留的舊欄位名，目前內容是採購筆電申請，不是保固問題 |
| 第一段引用檔名與「查看原文」 | 最外層 `citationFilename`、`citationPage`；`citationPage` 是保留的舊欄位名，目前顯示查看原文，不是頁碼 |
| 展開的引用原文 | 最外層 `sourceLabel`、`sourceTitle`、`sourceHeading`、`sourceNote`、`sourceScribble`（手繪圈註）；原文的標記段落共用 `answerHighlight` |
| 寄出／Send、右上智慧知識搜尋、對話紀錄／收合 | 最外層 `send`、`productLabel`、`history`、`collapse`、`close`；中英皆在 `locale-demo.js`，不要把圖示字元加回 `send` |
| 最後一幕知識中心的文件列表 | 最外層 `tableRows`；第一筆檔名需與 `citationFilename` 相同 |
| 第一段下方 01／02／03 的步驟文字 | 最外層 `chapters`；不是 `booth` 裡的章節 |
| 三段片名、說明 | `booth.titles`、`booth.descriptions`，依知識問答／自然語言找圖／以圖搜圖排序 |
| 自然語言找圖的提問、提示與步驟 | `booth.textImage.query`／`loading`／`matching`／`chapters` |
| 以圖搜圖的提問、提示與步驟 | `booth.imageImage.query`／`loading`／`matching`／`chapters` |
| 圖片結果數、素材位置與示意說明 | `booth.resultCount`／`folder`／`example` 等共用欄位；改圖片數量時要同步結果數文字 |
| 暫停、播放、重播與示例聲明 | 最外層 `pause`／`play`／`replay`／`note`／`groupLabel` |

第一段目前以「為新進同仁採購筆電，該如何申請」示範查找制度流程：填寫用途、規格與預算，主管核准後由採購詢價、下單，到貨後驗收。這是虛構示例，不是企業實際制度；保留示例標示，不要改回目前未支援的「指定第 12 頁寫了什麼」問答。修改時一起核對問題、回答、引用原文、側欄與文件列表，不能只換一句提問。

**動畫已換成採購流程，不代表全站所有示例已換。** `locale-screens.js` 的靜態搜尋畫面，以及 `locale-kip.js` 的 `sampleQuestion`／`sampleAnswer`／`sampleHighlight`／`sampleCitation` 仍有原本的第 12 頁／保固示例。這些不是新動畫的來源；若要統一文案，需另行同步修改並重新生成靜態圖，不能只換動畫詞典就視為全站完成。

### 動畫介面內的字型與圖片

動畫下方三個步驟、上方選片文字、介面內問答是不同區域。介面內字型直接在 `tokens.css` 搜尋下表 selector，全部在 `BEGIN TEXT DEMO`，不必改另一份 CSS。

| 畫面上的字 | 在 `tokens.css` 搜尋 |
|---|---|
| 上排右側智慧知識搜尋 | `.film-wordmark-label`；左側仍使用品牌原版 SynaiQ，KIP 為獨立字標 |
| 左側最近問題／知識中心 | `.film-sidebar`／`.film-sidebar > button` |
| 手機對話紀錄／收合 | `.film-mobilebar button`／`.film-sidebar-heading button` |
| 寄出文字／手繪筆 | `.film-input`／`.film-send`；筆寬 `--demo-send-pen-width` |
| 提問／回答／回答補充 | `.film-question`／`.film-answer p`／`.film-answer small` |
| 引用檔名／查看原文 | `.film-citation > span`／`.film-citation b` |
| 原文筆記標題／小標／內文／圈註 | `.film-note h4`／`.film-note-body .film-source-label`／`.film-note-body p`／`.film-note-scribble` |
| 知識中心標題／文件清單 | `.film-library h4`／`.film-table > div` |
| 圖片搜尋輸入文字／結果名稱／小標 | `--demo-image-query-size`／`--demo-image-result-size`／`--demo-image-label-size` |
| 圖片原始素材面板標題 | `--demo-image-heading-size` |

`tokens.css` 的 `BEGIN TEXT DEMO` 集中這組介面的文字與配色；下半部有 639px／359px 以下的文字覆寫。`site.css` 的 `BEGIN DEMO` 集中版型，未新增第三份 CSS。播放仍由同一 `demo-animation.js` 時鐘控制，秒數與次數不從樣稿複製另一份。

### 紙質 Demo 的維護位置

2026-09-11 核准樣稿：黑金外部框架不變；原版 SynaiQ 在左上，KIP 字標與智慧知識搜尋在右上。標題下緣是手撕紙；側欄採暖灰紙質，左下放小幅對話線稿。對話維持簡潔，只在查看原文時展開帶淡格線、圈註與撕邊的筆記紙。三組動畫共用「寄出／Send＋手繪筆」。

| 調整項目 | 位置 |
|---|---|
| 紙面／文字／側欄／對話框／筆記紙顏色 | `tokens.css` 的 `.animated-product`：`--film-paper`／`--film-ink`／`--film-side`／`--film-question-paper`／`--film-note-paper` |
| 撕痕深度／側欄纖維濃度 | 同段的 `--demo-tear-depth`／`--demo-sidebar-grain` |
| 頂部與筆記紙的撕邊素材 | `assets/demo-paper-edge.webp`；以遮罩套用紙面顏色，不另疊米色圖片 |
| KIP 字標／側欄線稿／寄出筆 | `assets/kip-wordmark.png`／`assets/demo-sidebar-dialogues.webp`／`assets/demo-send-pen.webp` |
| 圖像顯示、裁切與排列 | `site.css` 的 `.film-kip`／`.film-sidebar-art`／`.film-send-pen`；改大小需一起核對完整圖案，不只改裁切框 |
| 頂部分隔、側欄、原文面板結構 | `demo-animation.js` 的 `renderChatFilm`／`renderKnowledgeFilm` |

桌機及平板 700px 以上顯示側欄；699px 以下使用「對話紀錄」抽屜，保留同一份內容。可用 Escape 關閉，鍵盤焦點回到入口。英文平板預留額外高度，避免原文註記超出紙面。手動查看原文／文件會暫停動畫，不會送出實際搜尋或寄送請求；按播放／重播可回到原本時鐘，系統減少動態時仍可手動開關筆記。

素材只加入公開白名單中的四個核准檔案；樣稿 HTML、私人原始截圖、生成紀錄不隨網站發布。獨立 MP4 尚未因此重新錄製，不能把既有 MP4 當成本次紙質介面的影片。

示例圖片清單在 `demo-animation.js` 的 `imageAssets`：`src` 是實際圖檔路徑，`name` 是產品名稱，`file` 是畫面顯示的示例檔名。三者不在 `locale-demo.js`。目前使用 `public/brand/wally-2-plus.png`、`public/brand/wally/wally-2.png`、`public/brand/wally-mini.png`；自然語言找圖先選 Wally 2 PLUS，以圖搜圖先選 Wally Mini。改清單順序也會改首張選取結果；改名或路徑時需核對輸入縮圖、三張結果、原始素材面板及公開白名單。

### 其他動態與暫停規則

- 首屏散字：「02 首頁 Banner」的 `--hero-letters-duration`／`stagger`／`count`。這個 CSS 次數用 `infinite` 表示循環，不用 `0`。
- KIP 四層卡片移入效果：「10 KIP 平台」的 `--kip-layer-hover-duration`。
- 全站按鈕移入效果：「12 全站共用」的 `--button-hover-duration`。
- 系統開啟「減少動態」時，組圖直接展示，Demo 停在 `source` 靜態幕：知識問答顯示原文，圖片搜尋顯示已選取的結果，不自動展開下一幕。一般播放時離開 Demo 可見範圍或切換分頁會自動暫停。
- 組圖／Demo 播放次數填非負整數，時間填 `s`／`ms`；Demo 各段停留需大於 0。JavaScript 讀取的播放設定缺漏或格式錯誤時顯示靜態內容，不讓介面消失。

### 匯出 MP4 的維護界線

已匯出的三個 MP4 是另外錄製的 H.264、1920×1080、30fps、無聲影片，不是網站載入的素材，也不會隨 CSS／詞典或 Git push 更新。目前三片已依 commit `1af91b7` 重新錄製為中文版；第一片使用「新進同仁採購筆電」問答、設備採購流程引用與虛構示範標示，不再是詢問第 12 頁內容。

最新輸出與錄製腳本位於本機 `out/kip-demo-mp4-20260909-purchasing/`，不進 Git。交付檔為 `01-knowledge-qa.mp4`、`02-text-to-image.mp4`、`03-image-to-image.mp4`，合併下載包為 `KIP-3-demo-animations-updated.zip`；舊的 `out/kip-demo-mp4-20260909/` 保留，但不再作為最新影片交付。

`record.mjs`／`recording.html` 是該次錄製工具，不是 npm 通用匯出指令。再次使用前先確認本機 Chromium、FFmpeg 路徑，將工具與新輸出放到獨立目錄並核對引用，避免覆蓋原影片。錄製共用網站的 `renderDemoFilm` 與 `tokens.css`／`site.css`，不要另寫一套可能失真的動畫。

錄製時每片選定語言、完整播放一輪並保留末幕，再檢查滑鼠點擊位置、字型、原文面板、邊界與片長。不要用 CSS `transform: scale()` 放大整個錄製舞台，否則滑鼠定位可能偏移；需轉成 1080p 時在影片編碼階段縮放。錄製頁、原始影格及驗證工具都不放進公開網站包。

## 修改 CEO quote 的文字

**開 `locale-home.js`，搜尋 `ceo:`。** 有兩段：`zhHant.ceo.quote` 是中文、`en.ceo.quote` 是英文；姓名 `name` 與職稱 `role` 就在各自下方。中英文分開修改，不會自動翻譯。

```js
quote: [
  ['第一段前半句', '第一段收尾'],
  ['第二段前半句', '第二段強調文字'],
],
```

一個內層陣列是一段，兩個字串會直接接起來。第一段收尾保持在一起；第二段的第二個字串會畫強調底線。保留引號、逗號和括號；英文兩段字串交界要留需要的空格。`home-design.js` 目前固定渲染兩段，直接多加第三個陣列不會顯示；要增加段落須同步 renderer 與測試。
字級、行高、顏色不在這個 JS 檔：在 `tokens.css` 搜尋「09 CEO 引言」。

## 維護規則

- 在對應段落修改既有規則，不要持續在檔尾追加同名 selector 補丁。
- 新增文字規則放 `tokens.css`；不要把字型或文字顏色寫回 `site.css`、HTML inline style 或 JavaScript。
- 新增動畫時間、延遲、次數、觸發條件放 `tokens.css` 對應段落；`site.css` 的 animation／transition 不可硬寫秒數，JS 也不可另外保留一份時間設定。`motion.test.mjs` 會檢查這項界線。
- 各個 BEGIN 區段保留原樣式套用順序；不要把所有同名 selector 或 media 擅自搬到一起。
- 保留區塊內既有 media 順序；少數 desktop 宣告原本就晚於 mobile 宣告，不能把所有 media 一次搬到底。
- `body[data-page] section.advantages` 的權重，以及 `.hero .wrap` 的層級有現行用途；不要只看最後一條宣告判斷結果。
- 首屏背景是整個 section 的背景層；不要將手繪圖移回文字下方的普通圖片區塊。
- 撕紙的高度、overlap、前段 padding 和向下提示位置必須一起檢查，否則會遮字或產生空白。
- 保留 `clamp()`、`minmax(0, 1fr)`、`height: auto`、中英文換行規則與 reduced-motion 分支。
- 新 CSS／素材要加入 `share-preview.mjs` 的公開白名單；不要放寬成整個 repo 可公開。

## 修改後怎麼檢查

### 先看本機，不用先 build 或上架

在 repo 根目錄開終端 A：

```powershell
Set-Location 'C:\Users\User\synaiq\synaiq-web'
npm run dev:design
```

第一次安裝或 lockfile 更新時，先執行 `npm ci`；日常改字不需要反覆安裝。預覽服務會持續占用終端 A，檢查指令請在另一個終端執行。4318 已有這個預覽服務時沿用即可，不必重開；不要雙擊 HTML 用 `file://` 開網頁。

- [連續縮放預覽](http://127.0.0.1:4318/live-prototype/?page=home&lang=zh-Hant)：選四頁、中英與寬度；外框可縮小整張頁面以配合視窗。
- [獨立網站頁面](http://127.0.0.1:4318/live-prototype/page.html?page=home&lang=zh-Hant)：看真實字級及用 DevTools 找 CSS 時優先使用，不受預覽外框縮放影響。
- [實績展示](http://127.0.0.1:4318/live-prototype/page.html?page=cases&lang=zh-Hant)／[關於我們](http://127.0.0.1:4318/live-prototype/page.html?page=about&lang=zh-Hant)：新增頁面；可附上前述段落 ID，語言改為 `en` 可檢查英文版。
- 存檔後重新整理；這個伺服器沒有自動熱更新。DevTools 裡直接調整只作用於當次瀏覽器，必須寫回來源檔才會保留。
- 字沒變：先確認改的是目前 repo、正確語言與生效的 media 規則，再確認選到的是網站 iframe 而非預覽外框。圖片裡的字則依靜態圖生成流程處理。
- 修改同名 CSS／JS／圖片不必重啟服務；新增公開檔名須更新 `share-preview.mjs` 白名單，確認程序身分後僅重載這個預覽服務。不可停止所有 Node 程序或把整個 repo 公開。

### 文字、樣式與動畫的基本檢查

終端 B 也先切到 repo 根目錄，再執行：

```powershell
npm run test:design
node docs/design/live-prototype/scripts/sync-brand-screens.mjs --check
git diff --check
```

`test:design` 包含中英詞典結構、內容、CSS 所屬檔案、動畫時序與靜態圖一致性檢查。第一段採購流程的回歸測試在 `demo-animation.test.mjs`、`locale-kip-demo.test.mjs`；前者防止重新出現頁碼／保固問答，並核對引用檔名與文件列表。刻意換內容時要同步相關預期值，不要整段刪掉測試；原文與回答的語意仍需人工核對。

瀏覽器互動測試需要另設定執行檔。首次安裝 Chromium，並在同一個終端 B 指定路徑：

```powershell
npx playwright install chromium
$env:PLAYWRIGHT_EXECUTABLE_PATH = node --input-type=module -e "import { chromium } from 'playwright'; console.log(chromium.executablePath())"
npm run test:design
```

也可把 `PLAYWRIGHT_EXECUTABLE_PATH` 設為已安裝相容 Chromium 的完整路徑。只安裝瀏覽器但未設定此變數，`motion-browser.test.mjs`、`demo-booth-browser.test.mjs` 仍會跳過；看到 skipped 不能當作互動已通過。這些測試使用獨立 headless 瀏覽器及 loopback 服務，不操作使用者登入中的 Chrome，也不開公開隧道。

人工檢查四頁 × 中英 × 390／768／1440px，並拖曳經過斷點，而不只看三張截圖；頁首另檢查 700px 斷點兩側與 835px 中型視窗：

1. 導覽所在頁底線、語言切換保留頁面／錨點、手機目錄與 Escape 關閉正常。
2. Banner 中文底線只在第三段，英文換行正常；大字、小字與按鈕沒有被撕紙遮住。
3. 金色箭頭、左右獨立百分比與剪報傾斜不溢出；左下補充與展開來源都能閱讀。
4. 產品組圖捲入／捲出、次數用盡、短視窗與 reduced-motion 都正常。
5. 三片全部切換，逐幕看提問、回覆、引用／素材面板與末幕；檢查滑鼠點擊位置、暫停、重播、切片保持暫停及分頁切走後恢復。
6. 長回答與檔名不壓住輸入框、不被裁切；八項優勢展開後不產生水平捲動。
7. 實績與團隊圖片的移入／移出、顯影中途點擊暫停、再次點擊繼續、鍵盤與 reduced-motion 都正常；暫停後離開圖片仍保留比例，人物清晰且柔邊，頁面沒有圖片操作提示文字。
8. 昱儒姓名、職稱、學經歷與所供資料一致；手繪／真照切換時臉部比例接近，取景不拉伸、不突然跳成較大的臉。

### 改 CSS 時的進階比較

修改尚未 commit 時，`HEAD` 可作為本次修改前的 CSS 基準；若已 commit，請替換成真正修改前的本機 commit。輸出目錄名稱自行更換，保留上一輪結果：

```powershell
npm run test:design:visual -- --before=HEAD --output=out/style-check-current
node scripts/check-typography.mjs --output=out/typography-check-current
```

視覺比較工具目前仍有舊版預設基準與輸出目錄，請每次明確傳 `--before`、`--output`，不要不帶參數就當成當次比較。

- `--before-dir=<本機快照目錄>`：改用修改前的 HTML／CSS 快照；當時 `page.html` 與它載入、import 的 CSS 必須齊全。現行兩檔結構就是 `page.html`、`site.css`、`tokens.css`，缺檔會停止。
- `--mode=visual` 只做前後外觀比對；`--mode=interactions` 只做操作檢查；預設兩者都跑。程式仍會讀取基準檔，所以 interactions 模式也要指定有效基準。
- `--widths=390,768,1440` 可縮小外觀比較範圍；預設包含 320–1920px 的 17 個寬度與斷點兩側，逐頁、逐語言比較 details 開／關。390／768／1440px 另有整頁截圖。
- `report.json`、截圖與差異 JSON 留在指定的 `out/`，不要加到公開白名單或再整理成日期報告。

**這是 HTML／CSS 基準比較，不是整個舊網站的回放。** 基準與目前頁面都使用工作目錄裡的 JS、詞典及圖片，因此不能用它證明文案、動畫程式或圖片前後沒有改變。這些改動需另看 Git 差異、對應測試與人工畫面。

`check-typography.mjs` 盤點每頁 DOM 文字的實際樣式，檢查文字 CSS 來自 `tokens.css`；暫時在瀏覽器裡改具名設定，確認生效後還原，亦檢查繁中底線、英文及多寬度溢出，不修改來源檔或正式站。這不涵蓋圖片內文字，也不取代三片動畫各狀態的人工檢查。

真正字型與線上人物素材仍需網路；載入失敗、以替代字型渲染時不能接受視覺比較。結果只涵蓋指定 Chromium、寬度與狀態，不等於 Safari／Firefox 或每一種實機都已驗收。

外觀調整若本來就有意改變，先確認差異是預期的，再選新的基準；不要用關掉測試來通過。

若同時修改 Astro 基礎或要驗整個 repo，再執行 `npm run test:all`、`npm run check`。`test:all` 會先建置 Astro；它產生的 `dist/` 不是這份核准設計的上架包。

## Logo 與靜態產品示意圖

頁首與動畫的淺底 Logo 使用 `assets/synaiq-logo-ink.svg`；深底頁尾使用 repo 的 `public/brand/synaiq-logo-light.svg`。`brand.js` 統一指向這兩個版本，沒有 Logo 上傳後台。換固定原檔後仍需同步四張靜態產品 SVG：

```powershell
node docs/design/live-prototype/scripts/sync-brand-screens.mjs
node docs/design/live-prototype/scripts/sync-brand-screens.mjs --check
```

以上在 repo 根目錄執行；第一行會更新生成圖，第二行只檢查是否一致。詳細品牌審查與其他語言登錄方式見 [語言與 Logo 指南](localization-and-brand-guide.md)。

首頁「KIP 畫面＋信紙＋Wally」與 KIP 頁首使用的是生成 SVG，不是下方的動畫 DOM。兩者的採購問答、引用檔名、側欄與「寄出」文字現在都讀 `locale-demo.js`；`locale-screens.js` 只負責映射及靜態圖說。KIP 頁首的引文紙條也共用同一份採購示例，不再保留舊的指定頁碼問答。

靜態圖共用的標頭撕邊、KIP 字標、紙質側欄與小對話線稿在 `screen-templates/chrome.svg`；聊天／知識中心內容的座標及圖內字級在 `search.svg`／`library.svg`。使用與動畫相同的四個核准素材，由生成器內嵌至圖片，不依賴圖片外的 CSS。這是固定比例的產品插圖，維持 1440×900；外層組圖仍由 `site.css`／`tokens.css` 控制。

生成器輸出 `assets/kip-search-demo.svg`、`kip-search-demo-en.svg`、`kip-library-demo.svg`、`kip-library-demo-en.svg`；頁面透過 `locale-common.js` 的 `assets.searchScreen`／`libraryScreen` 選用語言版本。修改問答或共用紙質素材後，除了檢查動畫，也要執行上述生成指令並查看首頁組圖／KIP 頁首的中英文版本。

不要直接改生成 SVG 作為長期來源，下次生成會被覆蓋；也不要以為修改 `tokens.css` 會改到 `<img>` 裡的 SVG 字級。照片中已印好的 Logo 不會跟著更新。公開發布要包含改過的原檔與重新生成的四圖，不能只上傳 `brand.js`。

## 素材與引用維護

以下素材相對於本目錄的 `assets/`。換圖保留原檔備份與長寬比例；新增檔名要同步 renderer／CSS 與 `share-preview.mjs` 白名單。不要只刪紀錄時順便刪掉網站正在使用的圖片。

| 用途 | 素材與維護要點 |
|---|---|
| 首屏打字機、手與抽象大腦 | `knowledge-threads-v2.png`；整個首屏的背景層，不要放回標題下方普通圖片 |
| 傳遞知識的雙手 | `shared-knowledge-hands-v1.png`；敘事插畫，不重複用作 CEO 肖像 |
| CEO 演講素描 | `ceo-speaking-sketch-v1.webp`；依提供的 Wilson 照片生成，白底以 multiply 融合紙色，不是實際演講紀錄 |
| 團隊手繪肖像 | `team/{wilson,sunny,leef,celestine,lou}-sketch.webp`、`team/{dale,steve}-20260624-sketch.webp`；各人物獨立素材，與原照配對，姓名映射在 `about-design.js` |
| 昱儒真照 | `team/celestine-photo.webp`；完整原構圖，SVG 取景見「實績與團隊頁」 |
| Dale、Steve 真照 | `team/{dale,steve}-20260624-photo.webp`；保留公司簡報原始人物素材與透明背景，SVG 取景見「實績與團隊頁」 |
| Dale 旁的黑白小貓 | `team/dale-tuxedo-kitten-ink.webp`／`dale-tuxedo-kitten-photo.webp`；手繪與寫實生成素材，以 `dale-tuxedo-kitten.webp` 的 alpha 作形狀遮罩；位置在 `.ink-photo__canvas--companion`，與 Dale 同步顯影及暫停 |
| 東京食品展原照與手繪 | `cases/tokyo-2-scaled.jpg`／`tokyo-2-sketch.webp`、`cases/tokyo-5.jpg`／`tokyo-5-sketch.webp`；來源為舊官網回收的活動照片，配對用於顯影 |
| KIP 系統介接插畫 | `kip-connected-work-v1.webp`；白底以 multiply 融合，保留手與文件完整外形 |
| 聯絡區黑白貓 | `contact-cat-yarn-v1.webp`；深底已寫入圖片，並非透明；改聯絡區背景時需一起確認 |
| 手撕信紙邊界 | `torn-paper-cotton-v2.webp`；真實 alpha 邊緣，窄版採裁切寬紙帶，不把整條纖維壓縮到手機寬度 |
| 新聞原截圖 | `investing-cio-20240629.png`；保留標題、日期、照片與 Reuters 署名，不經 AI 重繪或 cover 裁切 |
| 新聞手繪外框 | `news-sketch-frame-v2.webp`；獨立透明簡線外框，紙墊避免筆觸遮住原圖文字 |

上述手繪素材是 AI 生成插畫，不是產品現場照或委製作品證明。Wally 原色設備圖在 repo 的 `public/brand/`；設備照片中印好的 Logo 不會隨 `brand.js` 自動更換。線上角色圖 `https://synaiq.com/wp-content/uploads/2026/03/toutou-2.png` 仍是網站依賴，下架舊素材時不能誤刪它。

新增團隊／場域手繪使用內建 `imagegen`：每張原照分別作為人物或構圖參考，再以首頁 `ceo-speaking-sketch-v1.webp` 作筆觸參考，生成白底、淡褐色疏線與少量排線的獨立插畫。保留人物辨識特徵與場域配置，不能把 CEO 參考圖的麥克風或其他人物帶入新圖。生成後只作網頁尺寸與格式最佳化；人物與場域 hover 顯示的是原照，不是 AI 重建的真照。裝飾小貓的寫實版本另由手繪素材生成，不能視為實拍來源。

Wilson、Sunny、Leef、Lou 的真照分別在 repo 的 `public/brand/team/`，網址前綴為 `/brand/team/`；檔名以 `about-design.js` 的 `portraits` 映射為準，例如 Leef 對應舊檔 `leff-web-1.jpg`。Dale、Steve 與昱儒使用上述 `assets/team/` 素材。保留舊圖不代表仍在現行團隊頁使用，Daniel 的舊檔與舊 Dale 照片／手繪未列入公開白名單。新增公開素材須逐一加入 `share-preview.mjs`，不得整包公開舊素材回收目錄或公司簡報。

新聞小圖在 `home-design.js` 搜尋 `outlook-clipping`；中英無障礙說明在 `locale-home.js` 的 `outlook.clippingLabel`／`clippingAlt`。寬度改 `--outlook-clipping-width`，傾斜改 `--outlook-clipping-tilt`（建議 -6deg 至 6deg，放大角度需重驗手機邊界）。外面不顯示圖說、調查人數或提醒字，調查背景與限制保留在 `outlook-details` 展開區；原截圖內標題與署名不刪。原圖與外框分開維護，不必每次修改文字都重新生圖。

### 引用與私人資料

新聞圖左側的兩段摘要由 `locale-home.js` 的 `outlook.reading` 維護，中英同步。保留 2024 年調查時間，以及 33% 刪減／62% 不刪減其他專案的兩面，不改寫成所有企業都在挪用預算。桌機在 `.outlook-context` 與剪報並排，899px 以下自動堆疊，不加固定高度。

產業觀察使用 [Investing.com 2024-06-29 的 J.P. Morgan CIO 調查報導](https://www.investing.com/news/stock-market-news/cio-survey-a-massive-boon-for-microsoft--jp-morgan-3502358)，屬媒體轉述，未取得原始調查全文。166 位 CIO／每年 1,230 億美元支出、2024 年 5% 與三年後 14.5% 預期、約 45% 年複合增幅、33% 刪減與 62% 不刪減其他專案，均須保留原日期及語境，不當作已實現結果、每年保證增幅或 KIP 的成效數據。

CEO quote 只改語言檔，不從歷史筆記還原舊句，也不因改插畫或版面擅改文案。企業知識敘事不構成已支援所有 connector／格式／客製訓練的產品承諾。

私有產品畫面不得含帳密、公司識別、帳號、對話、文件名或內部時間。若另有授權需截圖，先人工確認，再使用本機不可逆實色遮罩；`sanitize-capture.mjs` 的既有遮罩只適用原先 1280×720 的空白入口，不是通用去識別化工具。網站目前使用品牌化示例介面，不使用私有原始截圖。

## Hostinger 手動更新與發布界線

**儲存本機檔案、測試通過、commit／push，都不等於正式站已更新。** `npm run build` 產生的 Astro `dist/` 也不是目前核准設計的上架包。沒有可直接重跑來發布任意改動的通用 npm 指令。

### 先確認主機正在使用哪一版

在 Hostinger 的 `synaiq.com` 檔案管理員確認 `domains/synaiq.com/public_html/`。依 [上架／還原操作索引](../../operations/deploy-hostinger.md)，最近一次記錄的正式版本是 `public_html/synaiq-release-20260911-team-pages/`；`synaiq-release-20260911-paper-products/` 已是保留的上一版，勿再當作現行網站修改。**實際操作仍要先檢查根目錄 `.htaccess` 的 `/` 轉交目標與首頁載入的資源版本**，不能只認目錄名稱。有人手動改過檔案後，舊 manifest 也不能當成現況證明。

檔案管理員根目錄的 `00-SYNAIQ-START-HERE.txt` 是目前維護入口。這份說明不經官網公開；歷史版本資料夾保留，不必逐個尋找同名檔。

| 本機來源 | 正式包對應位置／限制 |
|---|---|
| `docs/design/live-prototype/page.html` | 封裝成版本目錄中的 `page.html` 與 `index.html`；根網址讀後者 |
| `docs/design/live-prototype/index.html`、`preview.js` | 本機連續縮放預覽外框，不上傳成正式首頁 |
| `site.css`、`tokens.css` | 正式版本目錄內的兩份 CSS；不帶回舊 `prototype.css` 或已刪的分頁 CSS |
| renderer、詞典、`brand.js`、圖片 | 僅封裝需要的公開檔案；HTML、CSS、JS 及素材引用需對齊版本前綴 |
| `STYLE-GUIDE.md`、測試、生成／錄製／部署工具、`.env.hostinger.local` | 留在本機，不上傳到公開網站 |

本機 `page.html` 使用的相對資源路徑，在根網址 `/` 下不一定成立。不能把原始 `page.html` 改名為 `index.html` 就直接蓋上線；也不能把任意原始 JS 都當成免封裝檔案上傳。

### 日常團隊文案更新

`locale-about.js` 的團隊純文案可直接更新到目前目錄：

1. 編輯本機 `locale-about.js` 的姓名、職稱與學經歷，同步中英文。
2. 在檔案管理員先下載**目前正式目錄中的同名檔案**作備份，不覆蓋正在編輯的本機來源。
3. 將修改後的 `locale-about.js` 上傳到 `public_html/synaiq-release-20260911-team-pages/` 並確認覆蓋；檔名是 `locale-about.js`，不是 `local-about.js`。
4. 一般重新整理官網，檢查中英內容。若仍異常，先比對實際載入網址、主機內容與回應標頭，不要再到其他歷史資料夾嘗試覆蓋。

六份文案目前回傳 `Cache-Control: no-cache, must-revalidate`；已開著的頁面不會自動換字。關於我們的既存快取已透過 `20260911-team-content` 載入鏈切換；日後只改這份團隊文案，不必再改版本參數，一般重新整理即可。上架時保留這項主機快取政策。

其他文案仍要確認素材路徑與相依關係：`locale-common.js` 含需要版本前綴的圖片 URL，`locale-demo.js` 的內容也用於 KIP 與生成 SVG。不能由快取設定推定任意本機 `locale-*.js` 都可直接上傳。

### HTML、其他 JavaScript、CSS 與素材

這些檔案仍須檢查封裝路徑與快取，不能套用上述文案的單檔更新方式。原地修改其他 JS 時，要完整核對 `index.html`／`page.html` 到被修改模組的引用與版本參數；只在首頁網址加參數，不會更新所有 import。CSS 也需處理 `site.css` 到 `tokens.css` 的載入鏈。涉及新增素材、版型或多檔關係時，使用完整新版本流程。

HTML 小修需同步封裝後的 `index.html`、`page.html`，保留版本化資源 URL；不拿本機預覽外框覆蓋。操作前備份實際主機檔案，完成後驗證公開頁面與快取；Ctrl+Shift+R 只影響自己的瀏覽器。

### 完整新版本發布

依 [上架／還原操作索引](../../operations/deploy-hostinger.md) 另建版本目錄，封裝核准公開檔案並重寫資源 URL，核對清單與 hash，再上傳。先讓新版本的直接網址通過經審核的 `.htaccess` 白名單與頁面驗證，備妥精確還原路由，最後才切換根網址 `/`；不能先切入口再補素材。

既有 `out/synaiq-release-*/release.mjs` 固定了當次版本名與主機預期 hash，是一次發布的工具，不是日常通用部署器。已完成的 `package`／`stage`／`activate` 不要重跑，也不要覆寫既有 `out/synaiq-deploy-*`、`out/synaiq-address-*`、`out/synaiq-release-*` 的封存與還原資料。

發布後驗證根網址、當次核准發布的所有頁面／語言組合、素材與動畫；同時確認 `/home.html` 仍導向根網址，舊 WordPress 路徑仍下架。每次發布需完整驗證四頁 × 中英共八組，不能只驗首頁／KIP。不能為了發布恢復 `index.php` fallback，不能刪掉新版仍使用的 Wally 角色圖，也不觸碰 `synaiq-ai.com` 的產品服務。還原使用當次已核對的備份；不要把更早的 WordPress 路由當成新版回退。

日常更新直接維護本指引，不再新增日期驗證報告或製作紀錄；不要在指引中累加每輪測試通過數、歷史 PID、過期網址或舊 quote。
