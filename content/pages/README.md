# 網站文字編輯指南

網站目前顯示的文字直接由本資料夾的 Markdown 載入。修改檔案並儲存後，開發環境會重新整理；正式輸出需重新執行 build。

## 頁面對照

| 網站頁面 | 編輯檔案 |
| --- | --- |
| 全站導覽、共用 CTA、頁尾 | `site.md` |
| 首頁 `/` | `home.md` |
| 關於公司 `/about` | `about.md` |
| 產品總覽 `/products` | `products.md` |
| Wally 系列 `/wally` | `wally.md` |
| 企業知識庫 `/knowledge-base` | `knowledge-base.md` |
| 生成式 AI `/generative-ai` | `generative-ai.md` |
| AGI `/agi` | `agi.md` |
| 媒體中心 `/media` | `media.md` |
| 聯絡我們 `/contact` | `contact.md` |

## 編輯規則

- 修改 `##` 標題下方的文字即可；`## hero.title` 這類識別碼不可改名或刪除，缺少識別碼時 build 會明確失敗。
- 一般文字區塊中的實際換行會渲染為網站換行。瀏覽器仍會依螢幕寬度增加自然折行。
- 清單使用 Markdown 的 `-` 或數字清單格式。
- 重複資料使用 Markdown 表格；表格第一列的英文欄位名稱不可修改，但儲存格內容可以改。
- 圖片檔案路徑、版型、連結行為與動畫仍由程式管理。不要在文字檔中自行新增未確認的產品規格、案例、成果數字或外部網址。
- 修改後至少執行 `npm.cmd test` 與 `npm.cmd run lint`，確認所有頁面仍可輸出。

`website_content_editable.md` 與 `website_subpages_content_editable.md` 保留作為早期彙整與核准紀錄；實際網站文字以本資料夾為準。
