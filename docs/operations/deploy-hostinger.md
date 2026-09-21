# Hostinger 官網更新指引

最後更新：2026-09-21（Asia/Taipei）。

工程師及新的 AI session 請先讀 [官網更新與部署 README](WEBSITE-UPDATE-README.md)。本文件保留現行目錄與歷次發布、驗證及回退紀錄。

## 平常更新團隊文字，只看這裡

**目前官網唯一使用的目錄是 `public_html/synaiq-release-20260921-site-update/`。**

| 要做的事 | 唯一位置 |
|---|---|
| 本機修改「關於我們」中英文內容 | `docs/design/live-prototype/locale-about.js` |
| Hostinger 覆蓋更新 | `public_html/synaiq-release-20260921-site-update/locale-about.js` |
| 在 Hostinger 查維護入口 | `public_html/00-SYNAIQ-START-HERE.txt`，只供檔案管理員閱讀，已同步目前正式目錄，不對官網公開 |
| 檢查結果 | [中文關於我們](https://synaiq.com/?page=about&lang=zh-Hant)、[英文關於我們](https://synaiq.com/?page=about&lang=en) |

修改 `locale-about.js` 中英文內容後 commit／push，先下載主機原檔備份，再覆蓋上述現行目錄的同名檔案。一般重新整理即可重新驗證文案。**Git push 不會自動部署 Hostinger。** 單檔覆蓋只適用於 About 純文字；其他 locale、HTML、JS、CSS、圖片或新頁面仍須封裝完整發布包、驗證直接網址，再切換路由。本機預覽外框 `index.html` 不可直接覆蓋正式入口。

以 `public_html/.htaccess` 的 `RewriteRule ^$` 指向判定現行目錄；其他 release 是歷史版本，勿覆寫或刪除。正式網站來源仍是 `docs/design/live-prototype/`，不是 Astro `dist/`。

## 2026-09-21 官網更新

發布來源：`d6a1df4094efc50002ef31b11fd9c8dcf251f38a`。更新公開標題、團隊彩色照片與方形比例、最新團隊名單，以及中英文 KIP Knowledge Platform 標籤與四張介面 SVG。文件整理與未引用素材清理一併提交；私人素材及開發工具沒有上傳。

新版本：`public_html/synaiq-release-20260921-site-update/`，共 62 個公開檔案。發布前核對舊版 64 檔 hash，完整保留歷史版本、LiteSpeed、locale 快取、舊站 410 與 Wally 圖片規則。

證據與回退：`out/synaiq-release-20260921-site-update/`，包含 manifest、原始發布包、路由前後副本、逐檔驗證、三階段瀏覽器報告與維護入口備份。本機設計測試 133 項通過、5 項略過；Astro 建置與 32 項測試通過。各階段瀏覽器驗證涵蓋四頁中英文 390／1440px，加 835px 導覽，共 17 組；檢查圖片、七張方形照片、導覽、水平溢出與 JavaScript 錯誤。

回退時先核對主機仍為本次 manifest 的路由 hash，再執行 `node out/synaiq-release-20260921-site-update/release.mjs rollback`，恢復 `synaiq-release-20260914-cases-mobile`。維護入口應依 `guide-before.txt` 恢復，先核對現值以免覆蓋後續編輯。保留新舊 release；本次未演練正式回退。

| 路由 | SHA-256 |
|---|---|
| 發布前 | `2f41fc04fd3127427876c60a4a45c23045aa9574710bf6109b2d912741fcfade` |
| 測試網址開放 | `03d41b8b5f57808a44521266e13584a1cd497bb5c2ccdf6951618f1f760016e1` |
| 正式入口 | `b7979dcac12fd03ec549e8af2269c32215098b3970dee1877594ca18ee6d0f79` |

## 2026-09-14 手機版排版修正

英文 Our Work 的 SETTING／INTERACTION／INTEGRATION 原本共用 60px 標籤欄，長標籤壓到標題。`33f01f3` 將 639px 以下改為標籤、標題、說明依序分行；桌面三欄維持。`3ad2d55` 同步前次已部署、但尚未提交的文案與快取修補。

本次發布前逐一核對官網 64 檔與本機來源一致（CSS 以修正前版本核對），封裝 64 個核准公開檔案到全新目錄。完整保留主機後來新增的 LiteSpeed 區塊、locale 重新驗證規則、舊站 410、Wally 原圖及歷史 release。獨立資源網址使瀏覽器載入新 CSS。

證據與回退資料：`out/synaiq-release-20260914-cases-mobile/`。包含 `baseline-verified.json`、`manifest.json`、`artifact/`、`preflight.json`、`routing-before.htaccess`、`routing-preview.htaccess`、`routing-live.htaccess`、`browser-local.json`、`browser-staged.json`、`browser-live.json`、`staged.json`、`activated.json` 及維護入口前後副本。使用者另行授權後，私有維護檔已更新；`guide-clarified.json` 記錄主機 SHA-256 核對通過，公開網址仍回傳 410。

本機中英文 320／390／588／639／640／899／1440px 共 14 組排版檢查，以及 17 個 CSS／快取測試通過。發布包、主機直接網址及正式站另驗證四頁中英文與手機／桌面資源、導覽、無水平溢出；主機與正式站加入三列標籤不重疊檢查。

### 本次回退

1. 先核對主機路由仍符合本次 manifest；若已有後續修改，停止並重新備份比對。
2. 在還原授權範圍內執行 `node out/synaiq-release-20260914-cases-mobile/release.mjs rollback`，將入口恢復為 `synaiq-release-20260911-team-pages`。腳本只接受已知路由 hash，保留舊站與 LiteSpeed 現況；本次未人工演練正式回退。
3. 將管理員維護入口依 `guide-before.txt` 恢復，先核對其現值仍符合 `guide-clarified.json`，避免覆蓋後續維護。
4. 重新確認 root、中英文及快取。不刪除新舊 release，也不重跑 9/11 的舊部署或 patch 腳本。

| 路由 | SHA-256 |
|---|---|
| 發布前 | `0241b3feb5e0825c7f418f19af4ab6e150237ef4c03b4ab95328e8ff28e5d6c2` |
| 直接網址開放 | `2e924800fc80f340433e95c231b3fed864b3d9fb982599e93d6b550ee54d66de` |
| 正式入口 | `2f41fc04fd3127427876c60a4a45c23045aa9574710bf6109b2d912741fcfade` |

## 後續完整發布

1. 比對主機最新文案與本機來源，提交核准修改。發布來源為 live-prototype，不能使用 Astro dist 或本機預覽外框。
2. 依公開檔案白名單封裝到新的 release，保留 manifest、逐檔 hash 與路由原文。
3. 本機驗證後上傳新目錄，核對直接網址的 hash、圖片、語言與手機／桌面畫面；此時 root 仍維持上一版。
4. 再次核對路由未被其他人修改，切換 root，驗證正式入口並同步本指南及管理員維護入口。

不得上傳整個 repo、測試、私人參考素材、工具或憑證。保留舊 release、LiteSpeed 與 locale 快取設定、舊站 410 及既有 Wally 圖片白名單；不改 DNS、資料庫或其他產品網域。遇到不確定的上傳／路由回應先讀取實際狀態，不盲目重試。Hostinger 本機憑證由忽略的環境檔提供，不列印或提交。

## 歷史與還原依據

- [9/11 四頁發布、文案與快取修補](../archive/operations/deployment-history-2026-09-11.md)
- [9/8 初次上架](../archive/operations/deployment-synaiq-com-2026-09-08.md)
- [地址修補](../archive/operations/address-update-2026-09-08.md)
- [舊站下架界線](../archive/operations/legacy-retirement-2026-09-09.md)

上述舊腳本與 hash 僅供追溯，不可直接對目前版本重跑。
