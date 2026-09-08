# 文案與素材缺口清單（依 [`wireframes-v1.md`](wireframes-v1.md) 的新頁面結構）

圖例：**沿用** = 現有 `content/pages/*.md` 可直接搬；**改寫** = 有底稿但需依 KIP 主軸重寫；
**新寫** = 無底稿。`S1`–`S6` 對應 [`kip-deck-extract.md`](kip-deck-extract.md)。英文文案一律
屬 PRD-002 M2，本表不逐頁重列，只在有額外工作時標註。

## 各頁文案

| 頁面 | 沿用 | 改寫 | 新寫（zh-Hant） | 負責 |
|---|---|---|---|---|
| `/` 首頁 | `home.md` `action.*`、`contact.cards` | `home.md` `hero.*`（改用 `S1` 副標兩句）、`products.items` 改為兩條路徑 | 問答演示 3 組問答含出處引用、實績橫幅一段、資料主權導言 | 行銷部 |
| `/kip` | `S1`／`S2`／`S4`／`S6` 全部文字、`knowledge-base.md` `capabilities.items` | `products.md` `hero.*`、`agi.md` `capabilities.items` 併入 `#ika` | IKA 的定義段（簡報僅出現名稱，無說明） | 行銷部 |
| `/kip/security` | `S3` 十項全文、`S2` 資料主權段、`S3` SCOPE | — | Hero 導語一句、CTA 文案 | 行銷部 |
| `/wally` | `wally.md` `hero.*`／`selection.*`／`models`／`features.items` | `hero.title` 需反映與 KIP 的關係（待裁定 §8-2） | 5 型號實際尺寸數據、場域實績引言 | 行銷部 + 開發 |
| `/generative-ai` | `generative-ai.md` 全部 | 導覽降級後需補一句「與 KIP 的關係」 | — | 行銷部 |
| `/cases` | `media.md` `event.*`（部分） | `media.md` `news.*` 空狀態改為不設新聞區 | 主案例全文（人／地／日期／角色）、媒體露出清單、其他場域 3–4 則 | 行銷部 |
| `/about` | `about.md` 全部（`team` 6 人齊全） | — | 公司統一編號、成立年份 | 行銷部 |
| `/contact` | `contact.md` `hero.*`／`consultation.steps`／`contact.cards` | `consultation.steps` 改寫為表單欄位標籤與提示 | 個資蒐集告知全文、回覆時限承諾、送出成功／失敗訊息 | 行銷部 + 開發 |
| 全站 | `site.md` `footer.*` | `site.md` `header.navigation` 改為 5 項（§2.3） | 隱私權政策頁全文 | 待定 |

## 圖片與素材

| 素材 | 現況 | 需求 | 負責 |
|---|---|---|---|
| KIP 架構剖面 | 僅存在於簡報 slide 1 的點陣／SVG 拼版 | 需重繪為網頁用內嵌 SVG（四層、可縮放、文字可選取） | 開發 |
| IKS 介面截圖 ×2 | 簡報 `S4`／`S5` 內嵌為 `.tmp`，解析度未知 | 需行銷部提供原始截圖（去識別化，不得含真實客戶文件） | 行銷部 |
| KC 後台截圖 ×1 | 簡報 `S6` 內嵌為 `.tmp` | 同上 | 行銷部 |
| 資安防護路徑圖 | 無 | 依 `S3` 十項新繪內嵌 SVG | 開發 |
| Wally 尺度比較圖 | 無 | 需 5 型號實際高／寬數據後新繪 | 行銷部（數據）+ 開發（繪製） |
| Wally 產品去背圖 | `public/brand/wally-*.png` 5 張齊全，但 1.7–3.5 MB／張 | 轉 WebP 並壓到 500 KB 以下（PRD-005 FR-504） | 開發 |
| `wally-series.png` | 13.0 MB，零路由引用 | 確認去留；留則重製，不留則刪 | 開發 |
| 台南市長 AI 分身現場照 | 無檔案 | 至少 1 張高解析現場照或影片截幀，**需市府具名授權** | 行銷部 |
| 東京食品展現場照 | 無檔案 | 1–2 張 | 行銷部 |
| **淨零展展位現場照（Wally 實機）** | **已有可用檔**：`\\192.168.0.97\行銷部\99.進行中專案\260723_凈零展覽\260722 展位-左.jpg`（業主 2026-09-08 提供，畫面中間機器為 Wally）；授權為**公司內部素材**，無第三方限制 | 複製進 repo 前壓縮並轉 WebP（≤ 500 KB）；用於 `/wally` Hero 與 `/cases` 場域實績；需確認畫面內無他人可辨識肖像與客戶文件 | 開發 |
| 淨零展活動圖 | `media.md` 標「活動圖片待補」 | 活動主視覺 1 張 | 行銷部 |
| 媒體露出連結 | 現行 synaiq.com 有清單 | 逐則核對連結是否仍有效、是否可轉載 | 行銷部 |
| 靜態地圖圖片（`/contact`） | 無 | 公司位置靜態圖 1 張（避免嵌入第三方地圖 iframe 的追蹤與 JS 成本） | 開發 |
| 團隊照 ×6 | `public/brand/team/*.jpg` 齊全，34–38 KB | 可直接用 | — |
| **Logo（缺口，2026-09-08 Phase A 發現）** | 兩個檔案皆不可用：`synaiq-logo-light.svg` 4 KB 為**純白**（淺底看不見）、`synaiq-logo-dark.svg` 7.3 MB 是**內嵌 PNG 非向量**；`synaiq-logo-s.webp` 139 KB 僅適合小尺寸。Phase A 的 header 因此暫用文字「SynaiQ」 | 需業主提供向量原稿，或授權重製深／淺底兩版真 SVG（各 ≤ 50 KB）。缺此檔則 PRD-003 FR-304 無法收尾 | 業主（PRD-005 OQ-7） |
| `duoduo-cutout.png` | 2.1 MB，新結構中無位置 | 確認是否保留（PRD-005 OQ-6 角色授權） | 待定 |
| `knowledge-base.png`／`media-factory.png` | 各 283 KB／2.1 MB | `media-factory.png` 移至 `/generative-ai`，需壓縮 | 開發 |
| OG 圖 | 無 | 每頁一張（中英各一，PRD-004 OQ-4） | 待定 |

## 阻塞與先後

| # | 項目 | 阻塞於 |
|---|---|---|
| 1 | `/cases` 主案例全文與照片 | 市府具名授權（§8-4）。授權不下來則改以淨零展展位現場照當替代主視覺（該照已可用，見上表） |
| 2 | Wally Hero 定位句 | 已決（2026-09-08）：Wally 是 KIP 的現場化身；定位句可定稿 |
| 3 | 個資蒐集告知全文 | **不再阻塞**：端點已定為自架 PHP（§8-3、[ADR-002](../adr/ADR-002-contact-form-php-endpoint.md)），無第三方服務商需揭露；行銷部可逕行撰寫中英兩版 |
| 4 | IKA 定義段 | 行銷部補寫，簡報無素材 |
| 5 | 淨零展年份、地點、報名連結 | 行銷部（PRD-002 OQ-5，期限 2026-09-21） |
| 6 | 英文全站文案 | zh-Hant 定稿 + 簡報 final（PRD-002 M2）。切換器已決定提前顯示，缺頁退到上層區段頁（wireframes §6） |
| 7 | header 的 logo | 可用向量 logo 原稿（PRD-005 OQ-7）；未到位前維持文字「SynaiQ」 |

**不阻塞、可立即動工**：`/kip` 與 `/kip/security` 的主體文案（`S1`–`S3` 已可直接上站）、
`/about`（`about.md` 完整）、`/wally` 型號表（`wally.md` 5 列齊全）。
