# SynaiQ Website

本專案維護 **tAistro 星洋智能科技**的企業官網，介紹公司理念、智慧方案、實際應用案例與團隊。網站以知識管理、AI 系統整合及能源應用為主要內容，提供產品介紹、互動示範與聯絡入口。

官網網址：[taistro.com.tw](https://taistro.com.tw)。網站程式與素材位於 [`docs/design/live-prototype/`](docs/design/live-prototype/)。

## 網站內容

| 頁面 | 主要內容 |
|---|---|
| 首頁 | 品牌介紹、知識管理理念、產品示範與聯絡資訊 |
| Synaiq KIP | 企業文件整合、知識搜尋、來源追溯與平台架構 |
| EMS | 能源監控、需量管理、儲能調度的流程介紹與示範情境 |
| PVsim | 光電場域建模、模組配置、遮陰與發電評估、串接檢核，以及可操作的 3D 示範模型 |
| 實績展示 | 公開案例總覽、案例故事、活動現場紀錄與相關報導 |
| 關於我們 | 公司理念、經營團隊與技術團隊 |

專案採共用版型與獨立 JSON 翻譯檔，目前工作版本包含繁體中文、英文與德文。未指定語言時依瀏覽器偏好選擇，也可手動切換；新增語言與翻譯維護方式見下方指南。

## 維護入口

官網維護請先閱讀 [官網更新與部署入口](docs/operations/WEBSITE-UPDATE-README.md)。

| 維護項目 | 文件入口 |
|---|---|
| 網站內容、圖片與本機預覽 | [網站維護指南](docs/design/live-prototype/README.md) |
| 新增語言與修正翻譯 | [語言維護指南](docs/design/live-prototype/localization-and-brand-guide.md) |
| 字型、配色、排版與動畫 | [樣式指南](docs/design/live-prototype/STYLE-GUIDE.md) |
| 發布、驗證與回退 | [官網更新與部署入口](docs/operations/WEBSITE-UPDATE-README.md) |
| 自動部署流程 | [GitHub CI/CD 說明](docs/operations/hostinger-cicd.md) |
| 主機操作與部署紀錄 | [Hostinger 部署指南](docs/operations/deploy-hostinger.md) |
| 檔案保留與清理 | [Repo 維護規則](docs/operations/repository-hygiene.md) |
| EMS 公開入口服務 | [EMS 維護文件](ems/README.md) |

其他文件：[現行文件索引](docs/README.md) · [歷史文件索引](docs/archive/README.md) · [Astro Phase A 紀錄](docs/migration/phaseA-log.md)。
