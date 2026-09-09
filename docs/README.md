# synaiq-web 文件索引

最後更新：2026-09-09。

目前網站已採用核准的 Home／KIP 中英雙語設計。唯一工作目錄是 `C:\Users\User\synaiq\synaiq-web`；指令及執行層界線見 [專案 README](../README.md)。

## 日常維護入口

| 工作 | 文件／來源 |
|---|---|
| 修改版型、配色、動畫 | [核准設計](design/live-prototype/README.md) |
| 中英文、其他語言與統一更新 Logo | [語言與 Logo 維護指南](design/live-prototype/localization-and-brand-guide.md) |
| 設計檔保留範圍與舊稿清理 | [設計維護入口](design/README.md) |
| 正式站上架與還原 | [Hostinger 操作索引](operations/deploy-hostinger.md) |
| 公司地址與快取更新 | [2026-09-09 更新紀錄](operations/address-update-2026-09-08.md) |
| 初次上架事實 | [2026-09-08 部署紀錄](operations/deployment-synaiq-com-2026-09-08.md) |
| Repo 整併、Astro 與正式設計的差異 | [整併紀錄](operations/repository-consolidation-2026-09-08.md) |
| 產品資料與文案出處 | [KIP 簡報摘錄](design/kip-deck-extract.md)、[素材與引用維護](design/live-prototype/STYLE-GUIDE.md#素材與引用維護) |

舊三案風格、首頁 A／B、wireframe、字型比較與候選文案已依業主要求移除，不再列為待選方向或實作閘門。目前風格以 `docs/design/live-prototype/` 為唯一依據。

## 規格與決策

保留 PRD／ADR 的需求編號與決策脈絡，不因清理設計草稿而宣稱所有需求都已完成。PRD-001／002／004 的早期架構、路由及待辦記錄不是正式站現況；Astro Phase A 尚未套用核准設計。ADO 連結供追蹤使用，下表不宣稱已重新核對遠端狀態。

| 文件 | 定位 | ADO Feature |
|---|---|---|
| [PRD-001](prd/PRD-001-architecture-refactor.md) | Astro 換底需求；Phase A 已合併，正式設計移植另需驗收 | [#1296](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1296) |
| [PRD-002](prd/PRD-002-kip-content.md) | 產品內容需求沿革；對外文案以核准版語系檔為準 | [#1297](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1297) |
| [PRD-003](prd/PRD-003-visual-design.md) | 核准視覺基線與後續維護；舊擇案閘門已移除 | [#1298](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1298) |
| [PRD-004](prd/PRD-004-uiux.md) | 早期 UIUX／路由需求；非目前 query routes 的說明 | [#1299](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1299) |
| [PRD-005](prd/PRD-005-brand-guide.md) | 核准字型、品牌素材與維護界線 | [#1300](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1300) |
| [ADR-001](adr/ADR-001-astro-react-islands-hostinger.md) | Astro＋React islands／Hostinger 架構決策，不等同已切換正式站 | — |
| [ADR-002](adr/ADR-002-contact-form-php-endpoint.md) | PHP 聯絡表單端點決策；目前正式站仍為 mailto | — |

Epic：[公司網頁前端畫面 — SYNAIQ 官網重整 #1295](https://dev.azure.com/synaiq/SynaiqDev/_workitems/edit/1295)。

## 文件規則

- 保留 [PRD Guideline](guidelines/PRD-Guideline-Web.md)、[PRD 模板](prd/_TEMPLATE.md) 與 [ADR 索引](adr/README.md)。
- [HANDOVER](../HANDOVER.md) 是 2026-09-07 接手快照，不是目前技術現況或待修清單。
- 保留 [Phase A 遷移紀錄](migration/phaseA-log.md)、[內容 key 對照](migration/content-key-map.md) 與測試 fixture。
