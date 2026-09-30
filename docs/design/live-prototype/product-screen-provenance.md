# EMS / PVsim 產品畫面

2026-09-30 擷取使用者指定、架於 DGX 的示範網站。截圖為實際產品介面；不是客戶上線實績或量測驗收。只切換既有畫面與查看既有成果，未修改案件、送算或操作設備。

- EMS：公開示範頁 /ems/boards/Main.dc.html、Demand.dc.html、Storage.dc.html。頁面數值為示意資料，保留原有標示。
- PVsim：https://synaiq-ai.com/solar/，由使用者提供示範登入。擷取同一既有完成案件的模型、遮陰、月發電量比較與串並配置圖，沒有把案例類型當成平台範圍。所有圖片皆採功能區域截圖，排除客戶／案場名稱、專案標頭、登入資訊、案件清單及地理座標欄位。遮陰與發電圖重新擷取無案名區域；串接畫面依使用者指定改為 u-20，選用無案名的板位與串號索引，並選取一組 16 片的 U 字型往返串接以顯示逐板順序。三維模型、遮陰、月發電與串接四張圖取自同一案件；月發電圖比較 column-21 與 u-20。沒有重繪、替換或改造計算結果。
- 圖片內為原始中文介面；英文頁的說明與圖說為英文。
- 發電圖是模型估算；串並圖是設計候選，保留原介面工程限制。
- EMS 原始 PNG 與擷取紀錄留在忽略目錄 out/product-screen-anonymous/；PVsim 最終 U 型成果位於 out/product-screen-u-anonymous/。發布圖片為無損 WebP；不儲存帳密或登入狀態。

| 檔案 | 尺寸 | SHA-256 |
|---|---|---|
| assets/ems-main-demo.webp | 1440 × 976 | b76085b9ac2fbd130d5b7316546eb978bc884886799177e39dd87ca598c97df8 |
| assets/ems-demand-demo.webp | 1440 × 976 | 3bac35cafe8a335c3c8b54539989e5a14b94d0a6382d62e781a59b28cd71bce9 |
| assets/ems-storage-demo.webp | 1440 × 976 | dae42108c83da39636b2e6d1a7bca32c9dc712fcc9fdace354f4ddbd66611ec3 |
| assets/pvsim-model-demo.webp | 986 × 827 | bd1bd216cd0e06f1709a5e09d2d0fc3a13338bd2a61940a0f11e08af85b5a30d |
| assets/pvsim-shading-demo.webp | 1600 × 896 | 640a64e6770f29e3ca746d074599a1099169835aefcc3e632b8297ef00cd9379 |
| assets/pvsim-generation-demo.webp | 1600 × 574 | 7321e83833587b6fa61f584a2499bd96a3fbbe67e36f044b425a51ec5a6fbb91 |
| assets/pvsim-wiring-demo.webp | 1438 × 944 | 7ce9a79f1546135a72d6e8cb2c31874a3a634033d5ff5525a235926a01b6d309 |

## 2026-09-30 可操作的三維示範模型

「01 三維場域與配置」採用上述同一示範案件中，原生檢視器已載入的 `preview.glb` 與 `panels.glb`，保留場域、周邊環境與模組的真實幾何關係。只讀取既有成果，未保存案件或送算。

發布前移除所有節點／網格名稱、extras、generator 與其他中繼資料；兩份幾何以同一模組中心平移至局部原點，座標取毫米精度，不保留原座標原點。檔案不含外部 URI、影像紋理、帳密、案件 ID、案名或地理參考欄位。此處是示範模型的唯讀空間檢視，不執行工程計算。

| 檔案 | 大小 | SHA-256 |
|---|---|---|
| assets/pvsim-site-demo.glb | 9,029,388 bytes | 91d1c82992070528f20b4bfb5169e56245ec272582351a0b419cdcd699e33e85 |
| assets/pvsim-panels-demo.glb | 16,220 bytes | 1a2e345279f02af5b46eb09d58810bb56e43675b5d5e55b5975b01e6a84c0b5b |

私人原始模型與來源紀錄留在忽略目錄 `out/pvsim-3d-source/`。重製指令為 `node scripts/prepare-pvsim-demo-model.mjs <原始模型目錄>`；腳本只接受本次無材質、無節點變換的三角網格格式，其他模型需重新檢查。原始模型不可直接加入公開白名單。

檢視器沿用原生示範模型的表面與模組配色，使用固定的 Three.js 0.186.1；`vendor/pvsim-three.js` 由 `npm run build:pvsim-viewer` 產生，MIT 授權位於 `vendor/three-LICENSE.txt`。模組與模型均隨站發布，不依賴第三方 CDN、登入工作區或公開示範密碼。訪客點擊「啟用 3D 模型」才載入約 9 MB 幾何，失敗時保留原始截圖並允許重試。
