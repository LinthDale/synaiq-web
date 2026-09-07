# ADR（Architecture Decision Record）

PRD 鎖定（`v1.0` Locked）之後的變更不改 PRD 內文，一律開 ADR，並在對應 PRD 的
§8 變更紀錄與 ADR 本文中雙向連結。規則細節見
[`../guidelines/PRD-Guideline-Web.md`](../guidelines/PRD-Guideline-Web.md) §6。

## 何時必須開 ADR

| 情境 | 例 |
|---|---|
| Locked 後的範圍變更 | PRD 已 Locked，業主要求新增或砍掉一整條路由 |
| Locked 後的架構變更 | 內容管線改為 CMS、樣式由單一 `globals.css` 拆為多檔 |
| 框架變更 | 離開 `vinext`（換 Next.js、Astro 等），或 `vinext` 跨版本升級 |
| 託管或部署變更 | 離開 OpenAI Sites、改變 Cloudflare Worker 的角色、導入 CI |
| i18n URL 策略拍板 | 已由 ADR-001 定為 zh-Hant 無前綴加 `/en/` 前綴；事後再改需新 ADR 加 301 導向 |
| 視覺手冊範圍擴張 | PRD-005 由網站限定擴充至簡報、社群或印刷物 |
| 引入外部服務或後端 | `/contact` 導入真表單與後端、導入 analytics 或第三方追蹤 |

不需要開 ADR：PRD 尚在 Draft 階段的修改（§8 加一列、版本 +0.1 即可）、純文案調整、
不改結構的樣式微調。

## 規則

- 檔名：`ADR-NNN-<英文-slug>.md`，`NNN` 自 `001` 起連號，**不重用、不跳號**。
- 內容依 [`_TEMPLATE.md`](_TEMPLATE.md)，固定四節：Status / Context / Decision / Consequences。
- Status：`Proposed` → `Accepted` → 必要時 `Deprecated` 或 `Superseded by ADR-XXX`。
- 已 `Accepted` 的 ADR 不修改內文，要翻案就開新 ADR 並把舊的標為 `Superseded`。
- 每份 ADR 一個 commit，commit message 帶 ADR 號。
- 新增 ADR 時同步補下方索引表與對應 PRD 的 §8。

## 索引

| ADR | 標題 | Status | 相關 PRD | 日期 |
|---|---|---|---|---|
| [ADR-001](ADR-001-astro-react-islands-hostinger.md) | 改用 Astro + React islands，託管移至 Hostinger | Proposed | [PRD-001](../prd/PRD-001-architecture-refactor.md)、[PRD-004](../prd/PRD-004-uiux.md)、[PRD-005](../prd/PRD-005-brand-guide.md) | 2026-09-07 |
