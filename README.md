# SynaiQ Website

SynaiQ 官方網站建置專案。

## 目前進度

- [x] 首頁主要架構
- [x] 首頁文案套用與 7 個內容區塊
- [x] AGI／企業知識中樞內容
- [x] 品牌產品與產品畫面展示
- [x] 全站導覽與 8 個獨立頁面入口
- [x] 基本響應式版面
- [x] 手機版全站導覽選單與頁面導覽
- [ ] 子頁面與全站內容最終確認
- [x] Build、自動測試與 lint 基礎驗證
- [ ] 上線前完整測試

## 專案狀態看板

請先查看 [PROJECT_DASHBOARD.md](PROJECT_DASHBOARD.md)。需要 Agent 盤點目前工作區時，在 PowerShell 執行：

```powershell
npm.cmd run status
```

確認要將最新唯讀盤點寫入看板時執行：

```powershell
npm.cmd run status:update
```

## 技術架構

- React 19
- vinext
- Vite
- Cloudflare

## 本機啟動

需要 Node.js 22.13.0 以上版本。

```powershell
npm install
npm run dev
