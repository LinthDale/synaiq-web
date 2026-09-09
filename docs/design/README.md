# 官網設計維護入口

核准設計位於 `live-prototype/`，包含 Home／KIP 中英雙語版。風格以實際載入的樣式與素材為準，不再維護三案、首頁 A／B、線框或字型候選稿。

| 工作 | 維護入口 |
|---|---|
| 開本機預覽、定位檔案、播放動畫 | [官網維護入口](live-prototype/README.md) |
| 字型、內文大小、配色、排版、素材與引用 | [樣式維護指引](live-prototype/STYLE-GUIDE.md) |
| 中英文、其他語言、共用 Logo | [語言與 Logo 指引](live-prototype/localization-and-brand-guide.md) |
| 上架、快取、還原 | [Hostinger 操作索引](../operations/deploy-hostinger.md) |

[KIP 簡報摘錄](kip-deck-extract.md) 是產品資料參考，不是待選設計或現行功能承諾。PRD／ADR 與上架還原資料各自保留，不用 Astro Phase A 的中性樣式覆蓋核准版型。

設計原型目錄只保留上述三份維護文件。日常更新直接修訂對應指引，不新增一次性的驗證紀錄、完成報告或素材製作筆記；測試結果保留在忽略的 `out/`，歷史差異由 Git 查閱。
