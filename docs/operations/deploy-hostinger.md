# Hostinger 官網更新指引

最後更新：2026-10-28（Asia/Taipei）。

工程師及新的 AI session 請先讀 [官網更新與部署 README](WEBSITE-UPDATE-README.md)。本文件保留現行目錄與歷次發布、驗證及回退紀錄。

## 2026-10-28 三語版本已上線，LiteSpeed 路由基準已修復

來源 `96d589a74ec1ba972ea12a902789b6fca6af14c8` 已推送 GitHub `main`，[Run 40656230546](https://github.com/LinthDale/synaiq-web/actions/runs/40656230546) 的 test／deploy 全部成功。正式網站為 <https://taistro.com.tw/>，現行目錄 `public_html/synaiq-release-ci-40656230546-1/`；繁中、英文、德文及瀏覽器語言選擇已上線。

部署只接受本次已審閱的現行版本、state 與路由雜湊組合，重驗全部保留版本後沿用主機原有 LiteSpeed 規則。沒有略過整個供應商區塊，也沒有先覆寫主機 state。驗證成功後，新 state 與正式路由已一致；一般唯讀 audit 通過，後續未知差異仍會阻擋部署。

驗證：37 項部署測試、205 項網站測試（4 項既有跳過）、32 項 repository 測試及 Astro 建置通過；local／staged／live 各 52 組瀏覽器檢查成功。92 個發布檔案已在主機逐檔核對 SHA-256，公開資源（含 CDN 圖片內容）驗證成功。獨立 Chrome 檢查確認三語首頁各只請求選定語言模組、SEO 正確，德語區域設定 `de-AT` 自動選擇德文，切換英文保留案例及錨點，390px 無水平溢出。

2026-10-28 16:42（Asia/Taipei）獨立主機重驗通過：92 檔雜湊、state／路由一致及完整保留 LiteSpeed 區塊。路由 SHA-256：`e742269f2296ef33d00677a238d65542be0b34d50f88c99d770654298b6fa18c`；state SHA-256：`fe051135d34aa950955e04522b4bcfd4166e4fcd26b157b4c57a98f334015baa`。備份草稿 Release 為 `hostinger-backup-40656230546-1`，加密備份與證據已保存並驗證。保留本次版本、`synaiq-release-ci-38330034089-1`、`synaiq-release-ci-38254033687-1`；`synaiq-release-ci-38197100197-1` 已依流程備份後移除。

證據：`out/hostinger-ci/40656230546-1/independent-host-verification.json`、`independent-public-i18n.json`、`public-assets.json`；完整 CI 日誌在 `out/i18n-migration/github-run-40656230546-complete.log`。修復前比對保留於 `out/hostinger-ci/40654021896-1/routing-investigation/` 及 `out/hostinger-ci/routing-repair-20261028/`，不覆寫原失敗紀錄。

## 2026-10-28 首次三語部署因主機差異停止（後續已修復）

三語 i18n、瀏覽器語言選擇、語言建立工具及維護文件已提交至 GitHub `main`，來源 `e9a4cc7e017af7476602ec69264479689a47241a`。[Run 40654021896](https://github.com/LinthDale/synaiq-web/actions/runs/40654021896) 的測試及正式封裝瀏覽器檢查通過，但部署在上傳前的路由基準核對停止；本次尚未上線。

唯讀核對確認正式首頁 HTTPS 200，仍指向 `synaiq-release-ci-38330034089-1`。CI state 記錄的路由 SHA-256 為 `80ac7d057e272fc80cf9e63132f30e4aa43bb41a76f91e79354be8563e8eca72`，主機目前為 `81c9ba2bf763941eb9c38af82f13aea15572ef2c06eecaf4de37892aa86503a8`。下載並解密上次成功的 `hostinger-backup-38330034089-1` 證據，比對確認差異僅在 LSCACHE 區塊：擴充 `.litespeed_conf` 保護規則，新增 REST AUTH 與 POSTPASS 不快取條件。官網入口、版本白名單及其他路由規則一致；目前無證據確認變更操作者。

未覆蓋主機規則、未修改 state 雜湊，亦未重跑部署。恢復部署前須先依這份具體差異完成基準協調，保留現有保護規則及原始證據，不能直接改 hash 掩蓋差異。比對資料在 `out/hostinger-ci/40654021896-1/routing-investigation/`；Actions 已保存加密失敗證據。GitHub `main` 是日常發布入口；Azure `origin` 的功能分支已推送，但 Azure `main` 未同步。

## 2026-10-12 GitHub CI/CD 已啟用、首次上線與清理完成

`.github/workflows/hostinger.yml` 與 `scripts/hostinger/` 已實際完成自動部署，詳見 [CI/CD 操作說明](hostinger-cicd.md) 及 [成功 Run 38197100197](https://github.com/LinthDale/synaiq-web/actions/runs/38197100197)。GitHub main 的官網更新 push／merge 會自動驗證、封裝、上架、清快取、加密備份及清理。Production environment 只允許 main，部署開關已開啟；PR 不取得部署 secrets。

本次正式目錄：`public_html/synaiq-release-ci-38197100197-1/`；來源 commit：`56ae861516927e7ae77234b0880be31730bc1ef6`，已推送 GitHub main。88 個正式檔案上傳後逐檔核對 SHA-256；公開 88 個資源驗證通過。雲端測試：16 項部署防護、201 項設計測試通過（4 項跳過）、32 項 repository 測試及 Astro 建置通過；test job／deploy job 的本機封裝各 28 組、staged 28 組、正式站 28 組瀏覽器檢查全數成功。

保留：本次 CI 版本、`synaiq-release-20260930-pvsim-3d`、`synaiq-release-20260930-solutions`。已備份並清除 `synaiq-release-20260930-kip-name`、`synaiq-release-20260929-tainan-photos`、`synaiq-release-20260923-domain`、`synaiq-release-20260923-taistro`，共 288 檔、113,684,006 bytes。未納管的 `screens-anon` 及本次圖片驗證失敗的 `synaiq-release-ci-38196226321-1` 保留供調查；WordPress 未動。

備份草稿 Release：`hostinger-backup-38197100197-1`，已重新下載、核對 SHA-256 並解密驗證後才刪除舊版。`backup.tar.gz.enc`：142,531,581 bytes，SHA-256 `5e7fa747acaee88ec18113aeaa530d3e1415af8578375f302bd95b0b1cbec18c`；`evidence.tar.gz.enc`：142,532,024 bytes，SHA-256 `3018b1e6d2f5a9d688e92dfaa1e354ef91fab4eebe7bef563b51c289bc157fda`。Actions 僅上傳這兩個加密檔。導入期間的失敗、回退及已處理產物問題另記於 CI/CD 操作說明。

2026-10-12 11:03（Asia/Taipei）獨立重驗三個保留版本逐檔 hash、四個目錄不存在、首頁與 crawl 檔案正確、私有維護檔與退役路徑 410，全部通過。正式路由 SHA-256：`3ece210ad91cb7de41080c8f298d87081b23f50827ac8143a251d9eafb75396b`；私有維護入口 SHA-256：`b7c68df60fcad60e4bdba92a23c0b5fc87534c80dd1ade148de79e39d7ca3888`。證據在 `out/hostinger-ci/38197100197-1/independent-verification.json`、`out/hostinger-ci-setup/run-38197100197.log` 與上述加密備份。

回退優先以 GitHub main revert 問題 commit 後重新發布；緊急原目錄回退須先暫停 CI，依備份核對即時路由、同步 state／維護入口並驗證。不要套用下方歷史固定目錄的單次腳本。

## 平常更新團隊文字，只看這裡

**主網址為 https://taistro.com.tw/；官網目錄由 CI 每次建立，不再手動覆寫固定目錄。**

| 要做的事 | 唯一位置 |
|---|---|
| 本機修改「關於我們」各語言內容 | `docs/design/live-prototype/locales/<語言>/about.json`；完整流程見 [翻譯維護指南](../design/live-prototype/localization-and-brand-guide.md) |
| 發布更新 | commit 後 `git push github main`，或 merge PR 到 GitHub main，等待 Actions 成功 |
| 在 Hostinger 查維護入口 | `public_html/00-SYNAIQ-START-HERE.txt`，只供檔案管理員閱讀，已同步目前正式目錄，不對官網公開 |
| 檢查結果 | [中文關於我們](https://taistro.com.tw/?page=about&lang=zh-Hant)、[英文關於我們](https://taistro.com.tw/?page=about&lang=en) |

修改 JSON 後執行 `npm run i18n:sync` 與 `npm run check:locales`，將翻譯及生成檔一起 commit，推送 GitHub main，由 CI 完整封裝與上架，再驗證各語言網址。**本機 origin 是 Azure DevOps，請使用 `git push github main` 觸發官網部署。** 不在 CI 執行期間手動覆寫 Hostinger；本機預覽外框 `index.html` 不可直接覆蓋正式入口。

以 `public_html/.htaccess` 的 `RewriteRule ^$` 指向判定現行目錄；其他 release 是歷史版本，不可覆寫，清理須遵循已核准的備份與保留規則。正式網站來源仍是 `docs/design/live-prototype/`，不是 Astro `dist/`。

## 2026-10-02 產品命名及模型提示增量更新（已上線）

使用者明確要求不建立完整發布包，直接更新 Hostinger 對應檔案。本次沿用 `public_html/synaiq-release-20260930-pvsim-3d/`，未切換 `.htaccess`、未刪除歷史版本。來源提交 `0144bac`（產品命名及提示）及 `8adde03`（快取版本）均已推送 origin/main。

中英文 EMS／PVsim 的導覽、頁尾、標題、介紹及示範區移除 Synaiq 前綴；KIP 名稱保留。PVsim 啟用模型入口加入白色手繪箭頭，文字「可以玩玩看」位於箭頭右側，英文為 Give it a try。因公開 CSS 的快取為 604800 秒，另更新 HTML→CSS→tokens 與 HTML→prototype→energy-design→energy-screens→pvsim-viewer 的版本參數 `20261002-products`。

共更新 11 個不同正式檔案：`locale-common.js`、`locale-ems.js`、`locale-pvsim.js`、`tokens.css`、`site.css`、`pvsim-viewer.js`、`energy-design.js`、`energy-screens.js`、`prototype.js`、`page.html`、`index.html`。正式 index 仍由 page.html 轉製並保留 release 素材路徑，沒有上傳本機預覽外框。每檔先下載備份、比對 Git 基準，再暫存上傳及 hash 保護替換，核對主機內容一致後清除兩網域快取。

驗證：199 項設計測試通過、5 跳過；31 項正式 HTTPS／SHA-256／快取檢查通過，包含六頁中英文入口、11 檔及版本 URL、私有維護檔公開回應 410。正式瀏覽器檢查首頁／EMS／PVsim 中英六組均無舊前綴、頁尾正確及無水平溢出；PVsim 白色文字在箭頭右側，模型啟用及返回截圖實測正常。本機另確認 320px 預覽提示無溢出。私有維護入口已同步。

精確前後 hash、備份、工具與驗證在 `out/hostinger-patch-20261002-products/`、`out/hostinger-patch-20261002-cache/`。本次原目錄更新使舊完整發布 manifest 的對應檔案不再代表現值；以兩份 audit.json 合併後，cache 記錄優先。原路由 SHA-256 仍為 `baf517aea5155e9820bb53c46751cc7397a49b5ab259ca3eb939f69cdfd1917b`。

若需還原本次更新，先重驗即時路由及 11 檔符合上述最終 hash，再從 products/before 還原 9 檔，另從 cache/before 還原 `energy-screens.js`、`prototype.js`；不得用 cache/before 覆蓋全部檔案冒充最初版本。維護入口使用 guide-before.txt。還原後清除快取並驗證正式網址，保留所有本次證據。

## 2026-09-30 PVsim 3D、去識別化產品畫面與小 A 導覽（已上線）

### 同日 17:06 緊急入口修復

手動上傳原始碼後，現行目錄的 `index.html` 被本機預覽外框覆蓋，正式首頁雖回應 200，卻顯示 Local preview 並載入不存在的 `preview.js`；`locale-common.js` 的素材路徑也回到未封裝的相對路徑。即時 `.htaccess` hash 未變，故障並非刪除舊失敗發布包造成。

已備份被覆蓋檔案，以 `d618931` 的 `page.html` 封裝成正式 `page.html`／`index.html`，並修正 `locale-common.js` 的 release 素材路徑、核對 `locale-pvsim.js`。四檔以暫存上傳、原檔 hash 保護及 rename 替換，保留 EMS／PVsim 簡稱及月發電量文案；路由不變，兩網域快取清除均回 200。現行 release 因此次修復包含增量內容，舊完整發布 manifest 不再代表這四檔；此次精確 hash、修復前備份及驗證工具在 `out/hostinger-incident-20260930/`。正式 `page.html`／`index.html` SHA-256 為 `b48cc8cd7919be93bc525af11b12c93eaf84a256b1a51d624fc21fb101ab1a4d`。

不可把 `docs/design/live-prototype/index.html` 上傳為正式入口。一般更新仍走新 release 流程；此次原目錄修復僅用於恢復被手動覆蓋的現行站。

修復後已取得正式首頁正常 HTTPS 200，並以 Node 系統信任庫取得真實公開回應交給 Chrome，成功渲染繁中首頁、核對 EMS 導覽，未見 JS 錯誤或破圖。後續六頁矩陣受本機間歇性 `ERR_CERT_AUTHORITY_INVALID`／`DEPTH_ZERO_SELF_SIGNED_CERT` 阻擋，不能宣稱全頁驗收通過；未略過 TLS 或使用本機內容替代正式站。失敗補查紀錄在同目錄 `verification.log`。

正式網址 https://taistro.com.tw/；發布目錄 `public_html/synaiq-release-20260930-pvsim-3d/`，完整封裝來源 `26a4a2d6327109b3ed664a7617934a73afac7498` 已推送 origin/main（功能提交 1b47767，後續提交為維護紀錄）。工具、manifest、逐檔 hash、路由備份與驗收證據在 `out/synaiq-release-20260930-pvsim-3d/`。

本次正式發布 EMS 三張與 PVsim 四張去識別化畫面、PVsim u-20 的 U 字型串接、場域敘事及 11 × 10px tAistro A 導覽。「01 三維場域與配置」可啟用真實示範模型，操作旋轉、縮放、平移、俯視、配置復位與全場景；觸控及鍵盤均可操作。模型名稱與中繼資料已移除，轉成局部座標，使用者啟用後才下載同站模型，不需登入或連接 DGX。模型失敗可重試，也可保留截圖閱讀。

194 項設計測試通過、5 略過；Astro 建置及 32 項 repo 測試通過；原始碼 3D 專用驗收 11 組通過。88 檔封裝（38,838,471 bytes），舊站 baseline 75 檔一致；本機封裝、staged、正式站各 28 組瀏覽器驗收全部通過，涵蓋六頁中英文、手機／桌面、圖片切換、導覽、3D 實際縮放及語言切換。staged 與正式站另各完成 4 組原生 Chrome HTTPS 驗收，包含 EMS／PVsim 的手機繁中與桌面英文及 3D 縮放／復位。啟用後 103 項公開檔案及入口核對通過；10 項快取檢查均有 no-cache；清快取後，前三次失敗發布包的 21 個網址均回應 410，未去識別化素材沒有重新開放。

舊站 baseline 與 staged 公開檔案驗證使用 Node --use-system-ca 與預設憑證／主機名稱驗證。切換前 Node 再遇間歇性信任錯誤，兩次均在改動正式入口前停止；後續啟用及正式站檢查改用原生 Chrome 正常 HTTPS 讀取真實公開回應，並先以 HTML／3D 模型雜湊及不跟隨轉址測試確認傳輸。瀏覽器矩陣渲染這些真實公開回應，另以原生 Chrome 直接導覽補查。沒有略過 TLS、安裝根憑證、改動信任庫或使用本機內容替代公開驗收。所有失敗證據保留；本次成功不代表所有環境的憑證問題已根治。

正式路由 SHA-256：`baf517aea5155e9820bb53c46751cc7397a49b5ab259ca3eb939f69cdfd1917b`；發布前路由：`460472c0bca83a297831a65bd1d023b75c13e5bcc489c6f8238f121a9a6f2bd7`。回退前確認即時路由仍為本次已知值，再執行 `node --use-system-ca out/synaiq-release-20260930-pvsim-3d/release.mjs rollback` 恢復 solutions；私有維護入口另按 guide-before.txt 還原並核對現值。主機私有維護入口已同步，公開網址仍為 410；新 SHA-256：`8c0341c35b4a15cd9422cec6b150374035933268ef66dab91711b9bedabe6cc1`。本次未刪除歷史檔案，主機保留六個正式歷史／現行版本與三個失敗發布包，共九個 release 目錄。

Chrome 取得的既有案例照片由 CDN 轉為 WebP，tokyo-5、tainan-tech-forum-2026-cover、tainan-tech-forum-2026-panel 的平均畫素差異分別為 5.2616、3.1526、4.0454，超過原門檻，導致兩次驗收在入口切換前停止。已一次比對全部 46 張公開圖片，並逐張目視確認上述三張原圖與 WebP 的內容及構圖一致。僅對已核對來源與回應的精確 SHA-256 配對放行，沒有放寬其他圖片或未來 CDN 變體的門檻；證據為 cdn-image-comparison.json 與 cdn-images-visual-reviewed.json。

原有 Wally PNG 的瀏覽器回應也由 CDN 轉成 WebP，尺寸仍為 696 × 870，與發布前封存畫素的平均差異 1.6130，通過原本一般圖片門檻 3；參見 wally-cdn-comparison.json。此格式差異亦曾在改入口前觸發停止，未改動原圖或舊站資料。

切換後發現已撤下的 screens-anon 圖片仍命中 CDN 舊快取，已依 Hostinger 官方 Hosting Cache API 清除 synaiq.com 與 taistro.com.tw 的快取，兩次均回 200；隨後原生 Chrome 直接導覽確認 21 個舊網址全部 410（withdrawn-after.json）。私有維護說明更新後，原生 Chrome 曾實際確認其網址 410，後續重驗及 Codex 內建瀏覽器又遇 ERR_CERT_AUTHORITY_INVALID。已保存成功輸出的人工補充紀錄 guide-public-native-observation.json 及後續失敗 guide-confirm-later-failures.json；最終以新的唯讀 API 再確認維護檔與正式路由雜湊未變。guide-clarified.json 明確標示此證據組合，沒有將失敗重驗標成通過。本機間歇性信任問題仍未根治。

## 2026-09-30 PVsim 三維檢視器（前次準備與阻擋紀錄，已由上節完成發布）

以下保留當時的準備與阻擋狀態；目前正式版本及驗收結果以上節為準。

當次來源 `1b4776742e9113727ea4cf0b2d0cb5f8b19e493b` 已推送 `origin/main`。PVsim「01 三維場域與配置」新增真正可操作的原始示範模型：滑鼠／觸控旋轉、縮放、平移、俯視、配置復位、全場景，以及鍵盤操作。先點啟用才載入模型，切換圖頁保留視角，可返回截圖；模型讀取或 WebGL 失敗時保留截圖並可重試。模型名稱、中繼資料及原座標原點已移除，約 9 MB 幾何與固定 Three.js 模組均從官網自身載入，不在公開頁放帳密或連接 DGX。

驗證：194 項設計測試通過、5 略過；Astro 建置及 32 項 repo 測試通過。`npm run test:pvsim-viewer` 11 組通過，包含中英文 × 320／390／835／1440px、真實畫面隨旋轉／縮放／平移改變、復位、選圖保留、延後載入，以及雙指操作、載入失敗重試與無 WebGL 備援。證據在 `out/pvsim-3d-checks/`、`out/pvsim-3d-design-tests.txt`、`out/pvsim-3d-repo-tests.txt`；模型來源與 hash 見 [產品畫面紀錄](../design/live-prototype/product-screen-provenance.md)。

新工具位於 `out/synaiq-release-20260930-pvsim-3d/`，預期發布 88 檔。2026-09-30T07:17:53Z 的 Hostinger API audit 確認仍為 solutions 及原路由 hash `460472c0bca83a297831a65bd1d023b75c13e5bcc489c6f8238f121a9a6f2bd7`；雖然一次 root HTTPS HEAD 返回 200，隨後 baseline GET 再度因 Windows curl/Schannel `SEC_E_UNTRUSTED_ROOT`（exit 60）失敗。**本次沒有上傳、切換路由或更新主機維護入口，不能把單次 200 視為信任已修復。** 待可信連線恢復，依該目錄 RESUME.md 重查基準並繼續；前述三個舊失敗包與最新工具都保留。

## 2026-09-30 智慧方案小尺寸 tAistro A（已併入本次正式版本）

當次來源 `811675f492ace998629395f9cf33039fcc44ff23` 已推送 `origin/main`。智慧方案／Solutions 旁的圖樣改用 tAistro Logo 原始 A 的兩筆 SVG 路徑，從 24 × 22px 縮為 11 × 10px；展開時旋轉 180 度，保留手繪底線與原有完整選單點擊範圍。此前去識別化產品畫面、場域敘事與 PVsim u-20 修改一併保留。

本次 192 項設計測試通過、5 略過；Chrome 實際渲染中英文 × 320／390／835／1440px 共 8 組導覽驗證通過，包括原始 A 路徑、11 × 10px 實際尺寸、至少 44px 高點擊範圍、鍵盤開合、三項產品連結與無水平溢出。證據：`out/small-a-design-tests.txt`、`out/small-a-navigation/report.json` 與同目錄桌面／手機截圖。

正常 Windows curl/Schannel 複查官網仍回報 `SEC_E_UNTRUSTED_ROOT`（exit 60）；未停用憑證驗證、未更動信任設定，本次未上傳或切換正式入口。待可信連線恢復後，以最新來源及即時路由基準建立新 release，完成封裝、staged／live、快取與私有維護入口驗收。舊 `u-screens` 發布包不含此圖樣，不可當作最新來源啟用；其 `RESUME.md`／`resume-release.mjs` 僅保留作原嘗試證據。

## 2026-09-30 去識別化產品畫面與 U 字型串接（先前未完成的發布嘗試）

當次來源 `7c690351b7e62a9a61dcb6c8e5bebaf1888179c8` 已推送 `origin/main`。新增 EMS 三張、PVsim 四張實際介面，已排除客戶／案場名稱、專案標頭、帳號及地理座標文字；PVsim 使用同一既有完成案件的模型、遮陰、月發電與 u-20 串接成果，選取一組 16 片的 U 字型往返串列顯示順序。智慧方案箭頭及底線改成雙筆觸手繪樣式（箭頭後續由上節小 A 取代），PVsim 敘事範圍擴為場域。沒有修改 DGX 案件、儲存設定或重新送算。

當次發布包 `out/synaiq-release-20260930-u-screens/`：192 項設計測試通過、5 略過；封裝本機 28 組通過，涵蓋六頁中英文、390／1440px，及兩產品 320／835px 的圖片切換、放大、流程與語言切換。83 個檔案已完整上傳，但 stage 公開 HTTPS 檢查失敗，**尚未完成 staged／live 驗收，不是正式版本**。工具已恢復 solutions 入口，API audit 確認正式路由仍為 `460472c0bca83a297831a65bd1d023b75c13e5bcc489c6f8238f121a9a6f2bd7`。

Node（含 Windows 系統 CA）及 Windows curl/Schannel 均曾間歇遇到不受信任憑證；曾成功的正常 HTTPS 請求不代表信任問題已修復。沒有忽略憑證、安裝根憑證或改動信任設定。原 `RESUME.md` 及 `resume-release.mjs` 僅對應當次來源；後續已新增小 A，須按上節建立新發布包，不能重跑原 stage 的上傳或跳過公開驗收。私有維護入口仍指向 solutions。

前兩次發布嘗試 `synaiq-release-20260930-product-screens`、`synaiq-release-20260930-screens-anon` 及最新包均保留原始失敗／復原證據，不覆寫或刪除。root 路由不開放這三包；前者含未去識別化素材，不可重新公開。當前主機共八個發布目錄，實際正式版仍以上方 solutions 路徑及即時 `.htaccess` 為準。

## 2026-09-30 智慧方案、EMS 與 PVsim 敘事頁（已上線）

來源 commit：`d73493c03c5ab738846a1dc931090c51f095aee0`，已推送 `origin/main`。發布目錄 `public_html/synaiq-release-20260930-solutions/`；證據與工具位於 `out/synaiq-release-20260930-solutions/`。

主導覽由 KIP 改為「智慧方案／Solutions」，承接 Synaiq KIP、EMS、PVsim 三個站內介紹頁。EMS 以能源監控、需量、儲能調度、事件與報表串起管理故事；PVsim 以屋面、配置、遮陰、發電與串接串起設計故事。兩頁皆有中英文敘事、三步流程、六項能力方向、六步互動示意、產品專屬聯絡文案與後段外部示範入口。依使用者確認，兩產品明確標示為示範環境；官網互動不連接設備或執行工程計算。原 KIP 名稱修正保留。

驗證：197 項設計測試中 192 通過、5 略過；來源瀏覽器 48 組通過，涵蓋六頁 × 中英文 × 320／390／835／1440px、產品選單鍵盤行為、語言切換及能源產品互動。本機封裝、staged 各 34 組通過；正式站先通過 20 組，核對入口 hash 仍屬同一發布後再續跑 14 組，合計 34 組全部通過。正式入口啟用後另完成 90 項檔案與網址核對；10 個快取檢查皆為 `no-cache, must-revalidate`。舊版 baseline 72 檔、新版上傳 75 檔已核對，sitemap 擴為 16 個 canonical URL。

瀏覽器矩陣以正常 Node HTTPS 取得真實公開回應，再交由 Chromium 檢查排版與操作；同一 run 內的版本化靜態資源首次取得後重用，HTML 每次重新取得。未關閉憑證鏈或主機名稱驗證。Codex 內建瀏覽器另以原生 HTTPS 核對 EMS／PVsim 的內容、站內跳轉與互動，詳見 native-browser-*.json。本次沒有更改系統憑證信任設定。

正式路由 SHA-256：`460472c0bca83a297831a65bd1d023b75c13e5bcc489c6f8238f121a9a6f2bd7`；發布前路由：`31ef59d9d8bc259ca556f42304ee981a42d3bf176048a30caefa897b7de31d75`。回退前須確認即時路由仍符合本次已知值，再執行 `node out/synaiq-release-20260930-solutions/release.mjs rollback`，恢復 `synaiq-release-20260930-kip-name`；私有維護入口另依 guide-before.txt 還原並核對現值。未刪除歷史目錄，主機暫保留五個版本；後續歸檔仍須先備份與驗證。

本次正式驗收第一次在 Node 自帶 CA 信任庫遇到 `DEPTH_ZERO_SELF_SIGNED_CERT`，未改動路由或忽略憑證。改以 `node --use-system-ca` 讀取 Windows 既有信任庫後，10 項快取檢查與前 20 組正式瀏覽器驗收通過，但之後仍出現間歇性信任錯誤。已保留失敗紀錄與 20 組通過結果；`smoke-resume-live.mjs` 先核對正式入口 hash，再補跑剩餘 14 組。內建瀏覽器另完成 10 組補查後也曾遇信任錯誤，未略過警告。因此不宣稱本機的憑證信任問題已根治。此設定只用於命令程序，不安裝憑證、不修改 Windows 信任設定。行為依據：[Node v24.11.0 官方說明](https://nodejs.org/download/release/v24.11.0/docs/api/cli.html#--use-system-ca)。

主機私有維護入口已同步，公開請求仍為 410；新 SHA-256：`5590c04e51fcb09cc2429b0e41a6ddb25d6096dfb4ba8bfd65827da08cc76402`。

## 2026-09-30 KIP 中文名稱修正（已上線）

來源 commit：`a10af39632abaf42a9c8710fa0780b69de20899d`，已推送 `origin/main`。正式目錄為 `public_html/synaiq-release-20260930-kip-name/`，證據與發布工具在 `out/synaiq-release-20260930-kip-name/`。

Demo、KIP 頁面標籤、兩張生成產品 SVG，以及臺南案例介紹統一使用「KIP 知識智慧平台」。英文及產品互動機制未變更。

驗證：設計測試 182 項通過、5 項略過；生成圖片 freshness check 通過。本機與 staged 各 26 組瀏覽器驗收通過。正式站已通過 18 組，含四頁中英文 × 桌面／手機、835px 導覽及中文實績總覽；Home／KIP 三種 demo 情境與两張產品 SVG 名稱已核對。其餘 8 組在英文 835px 實績總覽圖片請求遇傳輸錯誤，續跑又遇 TLS 信任錯誤，未宣稱完整 26 組正式驗收通過。通過紀錄在 `browser-live-18-passed-before-transport-failure.json`，後續失敗保留於 `browser-live.json` 及 `smoke-live-resume-*.log`。現行版本 72 檔 baseline、新版本 72 檔上傳及重新 staging 核對通過，正式切換後 83 項檔案／入口核對通過；8 個快取網址均為 `no-cache, must-revalidate`。CDN 最佳化點陣圖另驗證比例與可見內容，SVG 仍比對完整 hash。

本工作機的 Windows curl、Chrome／內建瀏覽器及 Node fetch 曾出現間歇性憑證信任錯誤。首次 activation 因正式入口 HTTPS 驗收失敗自動恢復舊路由，隨後以主機 API 確認恢復結果。`release-retry.mjs` 在核對即時 hash 與既有上傳檔案後重開直接網址，再完成正式切換；未盲目重傳或覆蓋。最終 `public-get.mjs` 使用 Node 原生 HTTPS 的獨立連線，保留預設憑證鏈與主機名稱驗證，不修改 DNS／信任設定。完整經過及限制見 `TRANSPORT-NOTES.md`、`failure-activate-*.json`、`inventory-current.json`、`restaged.json`、`activated.json`。

瀏覽器矩陣由正常 Node TLS 取得實際公開回應，將真實內容交由 Chromium 檢查排版、互動及圖片；報告明確記錄 transport，不能解讀為本機 Chromium 原生 TLS 已修復。內建瀏覽器原生 HTTPS 另成功檢查 staged KIP 頁面名稱、demo、延遲載入圖片及無水平溢出；正式入口原生瀏覽器仍曾遇憑證錯誤，未繞過警告。

主機私有維護入口已同步，公開網址維持 410；新 SHA-256：`29dd6d0b829e8be605e4d33ab9f44fc188db9677de9e2c25a7c4da0a15a177c1`。本次保留全部既有版本，主機暫有四個 release；`synaiq-release-20260923-taistro` 超出三版保留目標，待另依備份與校驗流程歸檔，本次不刪除。

正式路由 SHA-256：`31ef59d9d8bc259ca556f42304ee981a42d3bf176048a30caefa897b7de31d75`；發布前路由：`9469f4ec1e70d12f184519f52427212f6a02f6d330d5c2452b5c5304cc73ae31`。回退前須確認即時路由仍為本次 hash，再執行 `node out/synaiq-release-20260930-kip-name/release-retry.mjs rollback`，恢復 `synaiq-release-20260929-tainan-photos`；私有維護入口另依 `guide-before.txt` 還原並核對現值。所有失敗、恢復與最終驗證紀錄均保留。

## 2026-09-29 主機歷史版本清理（已完成）

使用者核准主機保留現行版與最近兩個正式版本。`public_html` 的 release 目錄從 16 個減為 3 個：

| 保留版本 | 用途 |
|---|---|
| `synaiq-release-20260929-tainan-photos` | 現行正式版 |
| `synaiq-release-20260923-domain` | 上一個正式版，可供本次發布回退 |
| `synaiq-release-20260923-taistro` | 再上一個正式版 |

更早 13 個 release 已備份後移除，共 643 檔、337,155,006 bytes（約 337 MB）。這是移除檔案的位元組合計，不是 Hostinger 帳戶總用量報表。精確目錄清單、時間及逐步刪除紀錄在 `out/hostinger-cleanup-20260929/cleanup-complete.json`、`operations.jsonl`。

本機備份 `out/hostinger-cleanup-20260929/releases-backup.zip` 含原 16 個 release 與仍使用的 Wally 圖片，共 860 檔；逐一讀取 ZIP 解壓內容核對 manifest SHA-256 全部通過。ZIP 大小 411,610,949 bytes，SHA-256 `177d1a1a95c523deb1bb577e8039c30590f121dd74347eb97c331a1bb065b565`。未壓縮副本與 `manifest.json`、`RESTORE.md` 一起保留；這是本工作機離線備份，未進 Git、尚無第二份異機備份。

刪除前逐目錄重新比對遠端樹、檔案時間／大小與完整內容 hash；確認三個保留版本未引用移除目錄。刪除後重新核對保留版本及 Wally 圖片共 217 檔，內容未變，正式路由 SHA-256 仍為 `9469f4ec1e70d12f184519f52427212f6a02f6d330d5c2452b5c5304cc73ae31`。四頁中英文、robots、sitemap、Wally 圖片及三個退休／私有路徑共 14 個正式 HTTPS 檢查通過（`public-verification.json`）；本次未變更畫面，未重跑完整瀏覽器矩陣。

主機私有 `00-SYNAIQ-START-HERE.txt` 已記錄三版保留規則、清理結果及備份位置；內容 SHA-256 `265ca94ba2c449d164bf30f54e36627869fef28a649ab4d982ac45e53a211d9f`，公開網址維持 410。

WordPress、`.private`、根目錄設定與舊站 PHP 檔保留；首頁與兩個回退版本仍引用 `wp-content/uploads/2026/03/toutou-2.png`，完整 WordPress 檔案及資料庫備份尚未確認，不在本次移除。歷史段落中的「舊版全數保留」是當次發布紀錄；現在回退至更早版本前，須依 `RESTORE.md` 還原原名目錄並核對檔案，不能直接執行指向已刪目錄的舊 rollback。

## 2026-09-29 臺南論壇照片交換（已上線）

來源 commit：`369dd0fac59dfccfcd38558c5831e8f0dc350703`，已推送 `origin/main`。正式目錄為 `public_html/synaiq-release-20260929-tainan-photos/`，證據與發布工具在 `out/synaiq-release-20260929-tainan-photos/`。

實績總覽封面及臺南案例首圖改為綜合論談照片；原本 2026.09.16 Synaiq KIP 示範照片移至內頁現場紀錄。相片與手繪配對、原始比例、中英文圖說及替代文字隨照片一起交換。

驗證：設計測試 182 項通過、5 項略過；完整本機瀏覽器 26 組通過。舊站 72 檔 baseline 核對通過，新包 72 檔上傳／直接網址核對通過，正式切換 83 項檔案及入口核對通過；CDN 最佳化圖片另比對比例及可見像素。8 個快取檢查網址皆為 `no-cache, must-revalidate`。

Chrome／Edge 的遠端自動套件遇辦公室憑證信任錯誤，失敗紀錄保留於 `browser-staged-chrome-failed.json` 與 `browser-staged-edge-failed.json`，未忽略 TLS。改用 Codex 內建瀏覽器在正常 TLS 下分別檢查 staged／正式站各 21 組（四主頁 × 中英文 × 1440／390px、臺南內頁四組、835px 實績總覽），檢查頁面內容、溢出、圖片路徑與圖說；正式手機照片完成顯影並目視確認。`browser-staged.json`／`browser-live.json` 明確記錄此替代驗收範圍，不宣稱遠端 headless 完整套件通過。

主機私有維護入口已更新，公开請求仍為 410；原文與新文分別為 `guide-before.txt`／`guide-next.txt`，新 SHA-256：`351eac59e1be071a7b2aa5dc51d1e8141a70c9933df1cd49bf6721862f3bdb33`。

正式路由 SHA-256：`9469f4ec1e70d12f184519f52427212f6a02f6d330d5c2452b5c5304cc73ae31`；發布前路由：`a2a927c95c0fc4a3d23983958e5183396c781603ac703f339ca0b31a6ce5ef01`。回退前先核對即時路由仍是本次正式 hash，再執行 `node out/synaiq-release-20260929-tainan-photos/release.mjs rollback`，恢復 `synaiq-release-20260923-domain`。私有維護入口需另依保存原文還原並核對現值 hash。舊版檔案全數保留；本次未演練正式回退。

## 2026-09-23 SEO 主網域遷移（已啟用）

### 正式切換結果

已啟用 `public_html/synaiq-release-20260923-domain/`，來源 commit `ecd081ead825879ccb8f4c041bc6f3a0531dcde7`。`synaiq.com`、`www.synaiq.com`、`www.taistro.com.tw` 的 HTTPS 請求以 301 導向 `https://taistro.com.tw`，保留路徑及 query；canonical、hreflang、Open Graph、robots 與 12 個 sitemap URL 同步新網域。Hostinger 後台兩網域 SSL 均為 Active；切換後已在 hPanel 清除兩網域 CDN 快取並看到成功通知。實際瀏覽器從 `https://www.synaiq.com/` 開啟，網址列已變為 `https://taistro.com.tw/`。

證據位於 `out/synaiq-release-20260923-domain/`：`activated.json` 驗證 83 個檔案／入口；`migration-https-live.json` 16 項通過；`cache-live.json` 8 項通過。來源 72 檔仍以完整 hash 驗證；新網域 CDN 圖片另核對尺寸、比例與可見像素，透明區先合成白底再比對，避免不可見 RGB 差異誤判。Wally 系列圖修正比較後平均差 0.879，低於原門檻 3。所有失敗、回退、候選路由與圖片檢視證據保留。

`migration-supported-live.json` 另補齊兩個舊網域 HTTP 完整跳轉鏈，共 18 項通過。正式瀏覽器矩陣 24 組已通過（四頁中英文手機／桌面、835px 導覽及案例詳頁），保留於 `browser-live-24-passed.json`；最後舊案例書籤組的額外 curl 圖片請求遇辦公室 `SEC_E_UNTRUSTED_ROOT`，補跑亦在網路層中斷。沒有將完整自動套件標示 passed。用正常 TLS 的 Codex 內建瀏覽器補查最後兩個網址：舊 `#story` 書籤正確轉為東京案例並保留錨點／新 canonical；不存在案例呈現 notFound、noindex/nofollow，無 canonical、hreflang 或 og:url，兩頁皆無水平溢出。補查證據為 `browser-live-manual-supplement.json`。正式路由保留，沒有因辦公室網路驗收限制再次回退。

`http-office-check.json` 記錄目前辦公室連線：兩個舊網域 HTTP 正常 301 升級 HTTPS；新網域 apex／www 的 HTTP 仍被 FortiGuard 回覆 403「Web Page Blocked」。這是本次 HTTP 驗證限制，不代表已驗證的 HTTPS 站點失效，亦不因此回退正常的主網域切換。未修改 DNS、網路安全設定或略過 TLS。

主機私有維護入口已同步新版本，`guide-clarified.json` 核對 SHA-256 `a46a34a4208dc0f2d1d6197fb17a00bf25c4d3ee557e4460f38c2e8614436f6a`，公開網址仍為 410。Hostinger API 帳號識別的 domain 仍用 `synaiq.com`，不是公開主網址。

回退前核對正式路由 SHA-256 為 `a2a927c95c0fc4a3d23983958e5183396c781603ac703f339ca0b31a6ce5ef01`，再使用本次工具的 rollback 階段還原 `routing-before.htaccess`，回到品牌版 `synaiq-release-20260923-taistro`（路由 hash `cbf412c4a9ff7cd11f1620274ab1599bfe1c9281dd1fffe76129756b2508a4c0`）；私有維護檔按 `guide-before.txt` 還原，並清兩網域 CDN 快取。不得覆蓋他人後續路由，候選名稱已使用時需準備新候選。下面時間紀錄為先前失敗嘗試，並非目前狀態。

### 13:54 再次接續（仍未啟用）

使用者要求繼續。`resume-stage6.mjs` 核對 72 檔通過；staged 主頁矩陣前 19 組通過後，額外圖片的 Node request 因憑證錯誤中斷。將該唯讀圖片檢查同步改用標準 Windows curl，保留前 19 組證據 `browser-staged-19-passed.json`，補跑其餘 7 組，最終 `browser-staged.json` 為 passed、26 組。每次 browser 導覽保留 TLS 檢查，暫時錯誤最多重試 3 次，沒有忽略憑證。

activate 曾切換後因 CDN 東京照片取樣誤差 3.1687 超過工具門檻而回退。原圖與 CDN 圖已並排檢視，內容一致，只有 1774×2364 → 1600×2132 的縮小；僅這張已人工確認的照片容許平均像素差小於 5（小於 8-bit 範圍 2%），其他圖片維持小於 3。接續 resume-stage7 時 Windows curl 本身亦回 `SEC_E_UNTRUSTED_ROOT`，再次停止並回退。API 的 `inventory-resume7-check.json` 確認路由為 `cbf412c4a9ff7cd11f1620274ab1599bfe1c9281dd1fffe76129756b2508a4c0`，仍是品牌版；沒有保留主網域轉址。外部網頁工具亦無法取得頁面，不能據此判定全球狀態。需先排除目前網路間歇憑證／FortiGuard 攔截，才能完成正式切換驗收。後續勿把 `browser-staged.json` 通過誤認為已上線；`activated.json` 仍不存在。

### 13:27 後接續嘗試（仍未啟用）

使用者再次明確要求切換。新網域 Node 初次 HTTPS 200，接續仍間歇解析至 FortiGuard 攔截 IP；Windows 原生 curl 正常 TLS 200。改用正常 Windows curl 公開 GET（不改 DNS／proxy／hosts、不略過 TLS）後，分離來源位元驗證與 CDN 圖片驗證：來源 72 檔 hash 全通過；CDN 會無損重編 PNG 並縮小大照片，正式驗收工具為圖片另檢查比例、尺寸及 64×64 內容平均像素誤差小於 3，非圖片仍要求完整 hash。發布包與 manifest 未重建。

`resume-stage5.mjs stage` 成功；staged Chrome 驗收前 10 組通過（首頁、KIP 中英文桌面手機與中文案例總覽），隨後英文案例頁 `page.goto` 回 `net::ERR_CERT_AUTHORITY_INVALID`。未略過瀏覽器憑證錯誤，未啟用正式新路由。已執行 `release.mjs rollback`，回傳 verified，恢復完整品牌版路由及首頁 hash。新增證據：inventory-resume2／resume4、routing-resume2／resume4-audit.htaccess、staged.json、browser-staged.json（failed）、rollback-*.json、public-get.mjs、各 resume-stage*.mjs。所有候選檔及失敗證據保留；這些已執行的階段不得直接原地重跑。


使用者授權將 SEO 與舊網域轉址移至 `https://taistro.com.tw`。來源 commit：`ecd081ead825879ccb8f4c041bc6f3a0531dcde7`，已 push；候選目錄 `public_html/synaiq-release-20260923-domain/` 已完整上傳 72 檔，但目前未公開、未啟用。原正式品牌版與網址规则仍為下節所列版本。

原始碼已改 canonical、hreflang、Open Graph、robots、12 個 sitemap URL 及 Wally 圖片來源；候選正式路由將 synaiq.com／www.synaiq.com／www.taistro.com.tw 以 301 導到新主網址，保留 path、query 與憑證驗證例外。本機設計測試 182 通過、5 略過；local 瀏覽器 26／26 通過，路由防迴圈及錯誤目的地拒絕檢查通過。

stage 與一次有核對既有檔案的 resume-stage 均因 Node 公開 HTTPS 的 `DEPTH_ZERO_SELF_SIGNED_CERT` 停止。兩次自動回退後均獨立透過 API 核對實際路由，確認為品牌版 hash `cbf412c4a9ff7cd11f1620274ab1599bfe1c9281dd1fffe76129756b2508a4c0`。不可把已上傳／已 push 視為主網域遷移完成。

根因證據：Node 系統解析 taistro.com.tw 與 www 得到 `208.91.112.55`，HTTP 回 403，可見文字為「Web Filter Violation / FortiGuard Intrusion Prevention - Access Blocked」，分類「新註冊域名」。同時 Windows Resolve-DnsName 與 curl 得到 Hostinger CDN IP 並可 HTTPS 200，表示不同解析路徑結果不一致；先前 TLS 錯誤不能直接歸因於 Hostinger 憑證。未改 DNS、hosts、防火牆、proxy，也未停用 TLS 驗證。

待網管放行 taistro.com.tw 與 www.taistro.com.tw 後再恢復：先確認 Node 的正常 HTTPS 驗證與 DNS 不再落到阻擋頁；重新 audit 主機路由，核對完整既有上傳內容，使用新的唯一候選路由檔恢復 staged，不重跑會覆寫既有內容的 stage。通過 staged → activate → live、`check-migration.mjs` 的 20 組轉址／憑證路徑檢查及 cache 後，才更新主機維護入口及現行版本文件。現有 `resume-stage.mjs` 已用過，候選檔名稱不可原地重用。

證據：`out/synaiq-release-20260923-domain/`，包含 manifest／artifact、本機驗收、失敗紀錄、兩次錯誤後 audit 及 routing-after-stage-error／routing-after-resume-error.htaccess。`guide-next.txt` 只是候選檔，尚未套用；`check-migration.mjs` 尚未在正式切換後執行。原始碼目前比正式站超前一個 SEO 發布。

## 2026-09-23 tAistro 品牌更新（現行）

已完成正式上線。來源 commit：`c8432fee4ff5fd22ad5e7224fb9f5c3d31929e71`；正式目錄：`public_html/synaiq-release-20260923-taistro/`，72 個公開檔案。網址：[tAistro](https://taistro.com.tw/)、[KIP](https://taistro.com.tw/?page=kip&lang=zh-Hant)；原 `https://synaiq.com/` 同步提供新版。

公司品牌改為 tAistro／星洋智能科技股份有限公司，聯絡連結改為 `service@taistro.com.tw`；產品保留 Synaiq Logo＋KIP 標籤。動態 Demo 與四張中英文靜態產品畫面同步更新，靜態畫面右上標示對齊 Demo，導覽標籤縮短為 KIP。

驗證：設計測試 182 通過、5 略過；local、staged、live 各 26／26 通過；staged 品牌檢查與新網域 HTTPS 品牌檢查各 24／24 通過，涵蓋四頁雙語及 390／835／1440px。實際檢視 KIP 桌面與手機截圖。stage 72 檔 hash 通過；activate 83 筆驗證通過；快取 8／8 通過。舊 Demo 選擇器造成的首次 local 失敗報告保留，更新為新版標誌斷言後重跑通過。

2026-09-23 約 12:02（Asia/Taipei）實測 taistro.com.tw 與 www 的 HTTPS 均回 200，HTTP 均以 301 導向各自 HTTPS。SSL 已較 11:32 的握手失敗恢復。本次未更動 DNS／郵件服務，email 連結驗證不代表信箱收信驗證。新網域目前仍是 synaiq.com 的停放別名；canonical、hreflang、robots 與 sitemap 保留 synaiq.com，尚未執行搜尋引擎主網域遷移或新舊網域統一轉址。

證據：`out/synaiq-release-20260923-taistro/`，含 inventory、baseline、preflight、manifest、artifact、routing-audit／before／preview／live.htaccess、browser-local／staged／live.json、brand-checks-staged／alias.json、截圖、staged.json、activated.json、cache-live.json、維護入口前後副本及 guide-clarified.json。私有 `00-SYNAIQ-START-HERE.txt` 已更新，公開仍回 410；新 hash：`fc0fce32ededd39d148879f700a9f8d615aa9e6c77a7807929c0c80976541c5e`。

回退：核對現行路由仍為下列正式 hash 後，使用 `node out/synaiq-release-20260923-taistro/release.mjs rollback` 還原完整發布前路由及 `synaiq-release-20260923-cover-hint`。私有維護入口以 `guide-before.txt` 還原，先核對目前內容仍符合本次新 hash。前一版維護入口 hash：`1b8ce06eb6ef63de31ab1b73b02c4c002eb2efc77ef4655e026352b54a66998a`。所有歷史檔案保留；cases-tainan 撤下公開存取但不刪除。

| 路由 | SHA-256 |
|---|---|
| 發布前 | `814159a24d02e1c7906c0f41c55c370499bda2acda319e357531b66746627f7d` |
| 測試網址開放 | `bcc23fa0f43dffcafcb254b00798d855b9d9bd060eabcf4d48166d1f2aec1721` |
| 正式入口 | `cbf412c4a9ff7cd11f1620274ab1599bfe1c9281dd1fffe76129756b2508a4c0` |

## 2026-09-23 實績封面顯影提示

已完成正式上線。來源 commit：`ea4ce37b88fa1892cefda3cb3e2d0dabe2d2a1f9`；正式目錄：`public_html/synaiq-release-20260923-cover-hint/`，70 個公開檔案，sitemap 保留 12 個網址。正式網址：[中文實績總覽](https://synaiq.com/?page=cases&lang=zh-Hant)、[英文實績總覽](https://synaiq.com/?page=cases&lang=en)。

總覽兩張封面各有一個右上角褐色細線箭頭提示：滑鼠模式「移入看看／Hover to peek」，觸控模式「點我看看／Tap to peek」，顯影後提示淡出；案例內頁不顯示提示。local、staged、live 最終報告各 26／26 通過，保留前版 SEO、案例、導覽、圖片、溢出與 JS／資源錯誤檢查，另驗證每張封面提示數量、輸入模式文案與顯影後 opacity 為 0，並實際檢視桌面及手機顯影前後截圖。stage 70 檔 hash 通過；activate 共 81 筆驗證通過；快取 8／8 均為 `no-cache, must-revalidate`。

驗收工具修正兩個舊假設：此 Chrome 的超出視窗截圖會重設觸控模擬，手機改為逐封面視窗截圖並核對截圖前後輸入能力，桌面保留完整截圖；staged 的正式 sitemap 改與 preflight hash 比較，不再假設現行版本沒有臺南案例。失敗報告及回退紀錄保留；曾因工具核准額度與舊 sitemap 斷言回退成功，之後使用 `resume-stage.mjs stage` 核對既有上傳與原 manifest、重新開放 staged，未重傳或覆寫發布檔案。最終 activate 後驗證全部通過。

正式路由僅公開新版與保留版 `synaiq-release-20260922-cases-tainan`，根入口、robots.txt、sitemap.xml 指向新版；staged 時上述入口仍維持 cases-tainan。`synaiq-release-20260921-seo-routing` 已退役，抽驗 index.html、page.html、locale-common.js 均為 410，主機檔案保留。既有 LiteSpeed、WordPress 舊站 410、Wally 圖片與憑證驗證規則保留。

證據目錄：`out/synaiq-release-20260923-cover-hint/`，包含 inventory、baseline、preflight、manifest、artifact、routing-audit／before／preview／live.htaccess、`browser-local.json`、`browser-staged.json`、`browser-live.json`、`screen-*-hint-*.png`、`staged.json`、`staged-resumed-1790125157933.json`、`activated.json`、`cache-live.json`，以及先前失敗與 `rollback-*.json`。私有維護入口已同步新版，`guide-clarified.json` 記錄 hash `1b8ce06eb6ef63de31ab1b73b02c4c002eb2efc77ef4655e026352b54a66998a`，公開網址仍為 410；原文與新文分別為 `guide-before.txt`、`guide-next.txt`。

回退：先確認主機仍符合下列本次正式路由 hash，再執行 `node out/synaiq-release-20260923-cover-hint/release.mjs rollback`，恢復 `synaiq-release-20260922-cases-tainan` 與發布前完整路由。私有維護入口依 `guide-before.txt` 還原前，先核對現值仍符合 `guide-clarified.json`，避免覆蓋後續修改；原維護入口 hash 為 `e5573a23aef1b977d3e1c130f4d750d9f7282454ea33c0c681e848605a769b7a`。保留全部新舊版本與證據。

| 路由 | SHA-256 |
|---|---|
| 發布前 | `bb3daa7b7fad72a5ddef38bda2bba2887cf29a9043b933ee4b6fd9503f0cddb6` |
| 測試網址開放 | `9321e91d467eb21979d510a2ddca5b54a2b40a221788b799ce04bc979a4515c6` |
| 正式入口 | `814159a24d02e1c7906c0f41c55c370499bda2acda319e357531b66746627f7d` |

## 2026-09-22 實績總覽與臺南案例發布

已完成正式上線。來源 commit：`f3a96a38bc7995ace36fa5c38774c3aa902de22c`；正式目錄：`public_html/synaiq-release-20260922-cases-tainan/`，70 個公開檔案，根目錄 sitemap 包含 12 個網址。

本次將實績展示分為總覽與獨立案例頁，整合東京食品展故事及現場紀錄，新增臺南市科技產業論壇、企業知識管理文案、三篇報導與配對素描顯影。總覽使用旅途文案與左右交替排列；圖片欄 60%、文字欄 40%，東京直圖另設高度上限，手機改為單欄。

正式網址：[實績總覽](https://synaiq.com/?page=cases&lang=zh-Hant)、[東京食品展](https://synaiq.com/?page=cases&case=tokyo-foodex-2026&lang=zh-Hant)、[臺南市科技產業論壇](https://synaiq.com/?page=cases&case=tainan-tech-forum-2026&lang=zh-Hant)。各頁均可切換 `lang=en`。

沿用本次已完成的 audit、baseline、preflight、package、local 26／26 與 capture-guide，未重新封裝或修改發布常數及檢查。接續依序完成 stage → staged smoke → 檢視桌機總覽及臺南桌機／手機截圖 → activate → live smoke → cache → update-guide，各命令退出碼皆為 0。stage 70 檔 hash 驗證通過且正式首頁未變；activate 70 檔與正式入口等共 81 筆 hash 驗證通過。staged 與 live 各 26／26 通過，涵蓋四頁中英文、390／1440px、835px 導覽與總覽、臺南雙語內頁、東京案例、舊錨點轉址、無效案例 noindex，以及圖片、報導連結、canonical、hreflang、溢出與 JS／資源錯誤。快取 8／8 通過，均為 `no-cache, must-revalidate`。

`synaiq-release-20260921-site-update` 已退役，抽驗 `index.html`、`page.html`、`locale-common.js` 均回傳 410，檔案仍保留。前一版 `synaiq-release-20260921-seo-routing` 保留作回退及公開資源相容期；既有 LiteSpeed、WordPress 舊站 410、Wally 圖片及憑證驗證規則均保留。

證據：`out/synaiq-release-20260922-cases-tainan/` 的 `inventory.json`、`baseline-verified.json`、`preflight.json`、`manifest.json`、`artifact/`、`routing-audit.htaccess`、`routing-before.htaccess`、`routing-preview.htaccess`、`routing-live.htaccess`、`browser-local.json`、`browser-staged.json`、`browser-live.json`、`screen-staged-*.png`、`screen-live-*.png`、`staged.json`、`activated.json`、`cache-live.json`、`guide-before.txt`、`guide-next.txt` 與 `guide-clarified.json`。私有維護入口 `00-SYNAIQ-START-HERE.txt` 已同步新目錄，SHA-256 為 `e5573a23aef1b977d3e1c130f4d750d9f7282454ea33c0c681e848605a769b7a`，公開網址仍為 410。

回退：先確認主機仍符合下列本次正式路由 hash，再執行 `node out/synaiq-release-20260922-cases-tainan/release.mjs rollback`，恢復 `synaiq-release-20260921-seo-routing` 與發布前完整路由。私有維護入口依 `guide-before.txt` 還原前，先核對現值仍符合 `guide-clarified.json` 的 hash；原維護入口 hash 為 `c67d9ac039984ec000b29c18dae3d1b96836a8b96e6e3dd79a231ba53b87dc67`。保留全部新舊版本與證據，本次未觸發回退。

| 路由 | SHA-256 |
|---|---|
| 發布前 | `e5bbadb7b4e28a44056646bf6ac28eb3058aeb866021c02abbf08fe000831020` |
| 測試網址開放 | `5c9f362547d23afdd0eb63bb671c3cd0789038f06ab8e032956130c63a10a599` |
| 正式入口 | `bb3daa7b7fad72a5ddef38bda2bba2887cf29a9043b933ee4b6fd9503f0cddb6` |

## 2026-09-21 SEO 與路由發布

已完成正式上線。來源 commit：`6038f886a49aa3802719142bc0093fa27fb6bf4a`；正式目錄：`public_html/synaiq-release-20260921-seo-routing/`，65 個公開檔案。四頁中英文加入各頁 description、canonical 與 hreflang；根目錄發布 `robots.txt` 及包含 8 個網址的 `sitemap.xml`。`www` 以 301 轉至 `synaiq.com` 並保留 query；HTML、locale 與爬蟲檔案使用 `no-cache, must-revalidate`。

本次接續時 stage 已完成，主機路由與 manifest 的 preview hash 相同，首頁仍為前一版；保留既有 `staged.json`，未重複上傳。先前 activate 失敗紀錄顯示尚未嘗試切換路由。重新完成 staged 17 組瀏覽器檢查後 activate 成功，65 檔與正式入口、爬蟲檔案共 76 筆 hash 驗證通過；live 17 組及快取 8 筆檢查均通過。瀏覽器涵蓋四頁 × 中英文 × 390／1440px，加 835px 導覽，檢查 SEO 中繼資料、圖片、語言切換、導覽、溢出及 JS／資源錯誤，並檢視桌面與手機 About 截圖。

撤下 8 個舊 release 的公開路由，抽驗各目錄的 `index.html`、`page.html`、`locale-common.js` 均為 410；檔案仍保留在主機。前一版 `synaiq-release-20260921-site-update` 保留公開資源相容期，既有 LiteSpeed、WordPress 舊站 410 與 Wally 圖片規則保留。

證據：`out/synaiq-release-20260921-seo-routing/` 的 manifest、artifact、路由前後副本、`inventory-resume.json`、`routing-resume-audit.htaccess`、`staged.json`、`activated.json`、`browser-local.json`、`browser-staged.json`、`browser-live.json`、截圖及 `cache-live.json`。私有維護入口先前已更新，本次在正式驗證後重新讀取並確認與 `guide-next.txt`、`guide-clarified.json` 的 hash 相同，公開網址仍為 410；接續驗證記錄為 `guide-resume-verified.json`。

回退：先核對主機仍為下列本次正式路由 hash，再執行 `node out/synaiq-release-20260921-seo-routing/release.mjs rollback`，恢復 `synaiq-release-20260921-site-update` 與發布前完整路由。私有維護入口依 `guide-before.txt` 還原前，先核對現值仍為 `guide-clarified.json` 的 hash，避免覆蓋後續修改。保留所有新舊 release；本次未演練正式回退。

| 路由 | SHA-256 |
|---|---|
| 發布前 | `b7979dcac12fd03ec549e8af2269c32215098b3970dee1877594ca18ee6d0f79` |
| 測試網址開放 | `5655354996c841299f480fc5ace319e07e9f855686d5a03c4c0e074f9e58848f` |
| 正式入口 | `e5bbadb7b4e28a44056646bf6ac28eb3058aeb866021c02abbf08fe000831020` |

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
