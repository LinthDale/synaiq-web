# TaistroEMS 公開入口

[TaistroEMS 首頁](https://ems.taistro.com.tw/) 會開啟 [3D 廠區總覽](https://ems.taistro.com.tw/ems/#plant)。分頁標題與頁首皆為 `TaistroEMS`。舊的 `#Monitor` 網址仍可用於設備監看。

## 2026-11-17 EMS 字標

公開 Demo 現行靜態版本為 `20261117-taistroems-logo-v1`。3D 廠區、設備監看、灑水控制及舊版監看畫面使用使用者提供的黑色 EMS 字標。分頁名稱為 TaistroEMS。本次更新公開版的 `index.html`、`brand-header.css` 與 `assets/ems-wordmark-03.svg`。本機 4783 示範的頁首來源位於 WSL 的 `services/dajia-twin/ui/shell.html` 及 `operations.css`。舊版監看共用的兩個品牌檔案由 `services/dajia-twin/package-release.mjs` 從 `output/ems-design-preview-20260923/public/` 納入新發布包。

公開版 45 個檔案已由外網 HTTPS 逐一核對，manifest SHA-256 為 `272f3b5b63f02f1916140c418e0d0b7ac02987187ef637c128690c0e774a6b92`。閘道版本收據與前後配置位於 `~/ems-release-ops/20261117-taistroems-logo-v1/`；前版為 `20261117-taistroems-3d-v1`。回退時先核對現行配置雜湊與收據，恢復 `previous.conf` 後執行 Nginx 配置檢查與平滑重載。

## 2026-11-17 獨立網域

DGX 的 `ems.taistro.com.tw.conf` 提供 HTTPS，靜態首頁使用 `config/nginx/static/taistroems/20261117-taistroems-3d-v1/ems/`；`/ems/api/` 透過原有的受限發布服務存取資料。只有來自新網域的瀏覽器 Origin 會轉為既有服務認得的內部 Origin。登入與操作權限由原服務驗證。更新 3D 廠區時，需將新發布包的公開檔案與 manifest 放在新的閘道版本目錄，再修改此虛擬主機的版本路徑、執行 `nginx -t` 並平滑重載。

這次 45 個公開檔案均已自 HTTPS 逐檔驗證，manifest SHA-256 為 `d48d3f96e4e6be43b718ffa4671e289d843aaa70e6e663d05c8a72df257ef6a4`。TLS 使用閘道既有的 Certbot webroot 續期，憑證更新後由 `taistroems-cert-reload.path` 觸發 Nginx 配置檢查及平滑重載。Let’s Encrypt 的續期演練與重載測試均通過。日本和美國外網節點通過憑證驗證，確認根網址導向同一新網域，首頁回傳 HTTP 200 與 TaistroEMS 標題。閘道的 `~/ems-release-ops/20261117-taistroems-3d-v1/` 保留本次封裝、配置與續期載入檔，本機驗收資料在 `out/ems-domain-20261117/`。

## 2026-11-17 EMS 登入頁與 twin 工作階段轉送（已上線）

4179 於 2026-11-17 15:17 以 `20261117-ems-login-v1` 重啟（共 49 個檔案，manifest SHA-256 開頭 `7278cd9ea25bd062`）。`synaiq-ai.com/ems/` 改為先登入：除 `#login` 外的路由都要先確認工作階段，不再提供訪客入口（EMS ADR-060）。轉送器同時新增 `.webp`／`.jpg` 的 MIME，供登入場景素材使用；CSP 的 `connect-src` 只多允許 `https://api.open-meteo.com`，供登入頁取得天氣。同日 `ems.taistro.com.tw/ems/` 的 DGX 閘道也切到 `20261117-ems-login-v1`：以 logo-v1 為基底，換掉 `index.html`、`twin.mjs`，並新增 4 個登入場景素材，49 個檔案依 manifest 驗證。閘道 conf 由 `26eda5ec…` 改為 `d83abd10…`，同時補上 `image/webp`、`image/jpeg` types 與 Open-Meteo `connect-src`。收據、`previous.conf`、`active.conf` 與啟用腳本保存在閘道的 `~/ems-release-ops/20261117-ems-login-v1/`。回退時先核對現行 conf 雜湊，恢復 `previous.conf` 後執行 `nginx -t` 再平滑重載。twin 自 15:26 起開啟 `TWIN_REQUIRE_SESSION=1`，匿名讀取 `/ems/api/twin/*` 一律回 401。回退時，把 `rollback-20261117-ems-login/` 的 `server-config.json` 與 `server.mjs` 複製回本資料夾，再執行 `start-public.cmd`。

同版 `server.mjs` 轉送 `/api/twin/*` 時改為只帶 `ems_bff_session`，提示 cookie 和其他 cookie 都不送。twin 開啟 `TWIN_REQUIRE_SESSION=1` 後，會自行向 BFF 確認身分（EMS ADR-060）。twin 沒開這個開關時會忽略這個 cookie，所以已先上線。選用設定 `twinTarget` 預設為 `http://127.0.0.1:4783`，只接受 loopback，用於在隔離埠驗證。回歸測試為 `tests/ems-relay.test.mjs`。

## 本機轉送與舊入口

2026-11-17 主站下一次啟動使用 `20261117-meter-label-v1`。進線總表的顯示名稱改為「實際用電」，累計值顯示為「累計實際用電」。此版承接 `20261116-account-hints-v1`，需要回復時可將 `server-config.json` 的 `release` 指回該版本。

2026-11-16 主站下一次啟動使用 `20261116-dajia-ems-v10`。開啟 `/ems/` 進入 3D 廠區首頁，點設備標籤看即時讀值，再點「放大查看」移動鏡頭。右側呈現即時營運並可展開設備清單，下方當日趨勢可勾選個別曲線、拖曳區間、放大圖表或回到全日。`#overview` 開啟營運總覽與斷復電模擬，`#Alarms` 進入告警與事件，`#Monitor` 進入設備監看並可開啟既有實測。`#dispatch` 從當下 SOC 試算停電期間的供電缺口與期末電量。電力模擬與自動告警使用本機 `ems-dajia-twin` 及 SQLite，水控保護由水控模擬器回報。要還原上一版前端，將 `server-config.json` 的 `release` 設為 `releases/20261116-dajia-ems-v9`，再雙擊 `start-public.cmd`。

- 即時監控與歷史：https://synaiq-ai.com/ems/#Monitor
- 本機檢查：http://127.0.0.1:4179/ems/#Monitor

這個資料夾是 EMS 公開網址的本機轉送服務與目前上線的靜態頁面。它**不是** Hostinger 官網（synaiq.com）的一部分，不經 Astro 建置，Git push 也不會部署它。

```
瀏覽器 HTTPS /ems/ → DGX-01 Nginx → Tailscale 100.114.126.85:4179 → 本資料夾 server.mjs（Windows Node）→ 127.0.0.1:8003 BFF（WSL Docker）
```

EMS 資料庫、帳號與密碼都留在 WSL 的 EMS 專案（`\\wsl.localhost\Ubuntu\home\dalelin\synaiq\EMS`）。這裡只有轉送程式與公開檔案。

## 檔案

| 檔案 | 用途 |
|---|---|
| `server.mjs` | 轉送服務：提供 `releases/<版本>/public` 靜態檔，並把白名單 API 轉給 BFF |
| `server-config.json` | port、Tailscale 位址、BFF 位址、目前上線版本、EMS 後端所在的 WSL distro（`wslDistro`，預設 `Ubuntu`） |
| `releases/<版本>/` | 發布包，附 `manifest.json`（每個檔案的 SHA256） |
| `start-public.cmd` / `stop-public.cmd` | 雙擊啟動（一律是在 4179 重新啟動）／停止。啟動成功後視窗會持續即時顯示日誌，關閉視窗不會停止轉送程序；失敗或停止時顯示最後 10 行，按 Enter 關閉 |
| `start-public.ps1` / `stop-public.ps1` | 實際執行的腳本（Windows 內建 PowerShell 5.1） |
| `view-log.cmd` / `view-log.ps1` | 雙擊即時追蹤日誌 |
| `logs/server-NNNNNN.log` | 日誌（見下方「日誌」），執行時產生，不進 Git |
| `logs/node-output.log` | node 在日誌機制以外印出的內容（例如原生錯誤），平常是空的 |
| `server.pid` | 執行時產生，不進 Git |
| `server.log` | 舊版的日誌（換成這一版並重新啟動之前仍會寫入），之後只當歷史紀錄 |
| `rollback-<日期>/` | 更新轉送程式前的備份（回退用） |

## 啟動／停止

**正式轉送程序只由使用者手動啟動**（雙擊 `start-public.cmd`）。AI 工作階段（Claude、Codex）不得啟動、停止或重啟它。**電腦重開機後不會自動啟動**，沒有啟動時公開網址會回 **504**。

**重開機後只要雙擊 `start-public.cmd`，全部都會回來**：

1. EMS 後端：檢查 WSL Ubuntu 是否在跑，並確保有一個隱藏的 WSL 常駐工作階段（`wsl.exe -d Ubuntu --exec sleep infinity`；Ubuntu 沒在跑時會順便把它開起來）。Docker 與 EMS 容器（`unless-stopped`）隨 Ubuntu 起來後，等 BFF（`/api/auth/session` 回 200 或 401）回應，視窗會印進度點，最多等 3 分鐘。
2. 檢查 Tailscale 已連線。
3. 在 4179 重新啟動轉送程序，接著即時顯示日誌。

常駐工作階段只會有一個（已存在就沿用），而且不屬於任何視窗或程式，所以**關閉視窗、終端機或 Claude 都不會再讓後端停掉**。`stop-public` 只停轉送程序，不會停 WSL、Docker 或容器；真的要停後端時執行 `wsl --terminate Ubuntu`。

`start-public` 一律代表**在同一個 port 4179 重新啟動**：4179 若已由本資料夾的 `server.mjs` 使用，會先停止它（日誌記一行 `restarted by start-public.ps1 (old PID n)`），再重新啟動；若是其他程式占用，則拒絕並顯示它的 PID 與命令列，不會停止別的程式。後端或 Tailscale 檢查沒通過時，原本在跑的轉送程序不會被動到。Windows 防火牆的 inbound 允許規則綁定 `C:\Program Files\nodejs\node.exe`，所以不要換成其他 Node 路徑。

直接執行 `.ps1` 的效果和 `.cmd` 相同（右鍵「用 PowerShell 執行」、`powershell -File …`，或在已開啟的 PowerShell 視窗輸入路徑；後者會在該視窗即時顯示日誌，按 Ctrl+C 結束顯示）。注意：在「執行」對話框或檔案總管直接開啟 `.ps1` 路徑，Windows 預設是用記事本打開，不會執行；這種情況請改用 `.cmd`。

轉送程序由 WMI 在背景建立，不是呼叫端的子程序，也不在呼叫端的 Job Object 裡。這是第二道保護：即使從某個終端機或應用程式啟動，關閉或重啟該程式也不會連帶終止轉送程序（2026-10-12 曾因此被終止）。

停止請用 `stop-public.cmd`。它只會停止這個轉送程序，不影響 EMS 後端。腳本會先核對 PID 的命令列，避免誤停其他程式。

**Tailscale 斷線（例如電腦睡眠後喚醒）時程序不會結束**：127.0.0.1 繼續服務，Tailscale 監聽會被關閉並每 5 秒重新綁定，Tailscale 恢復後自動接回，不需要重新啟動。啟動時如果 Tailscale 位址不存在或 port 被占用，則仍然直接失敗並回報。

## 日誌

日誌在 `logs/server-NNNNNN.log`，由 node 自己寫入，**編號最大的是最新的檔案**。每一行開頭是本機時間（含時區）與等級，例如 `2026-10-12T09:30:00.123+08:00 INFO ...`。

每個檔案寫到 5 MB 就換下一個編號，只保留最新 20 個（最多約 100 MB），檔案不會被改名，所以開著日誌視窗也不會擋住換檔。`server-config.json` 可用 `logMaxBytes`、`logKeep` 調整。

**操作紀錄**（每個請求在回應結束後寫一行）：所有 `/api/` 請求（含被拒絕的）、頁面（`.html` 與 `/ems/` 本身），以及任何路徑上的拒絕或錯誤（400、403、404、405、413、429、500、502、503）。成功的靜態檔（.css .js .mjs .png .svg .json .txt）不記錄。

```
2026-10-12T10:42:32.734+08:00 INFO 203.0.113.7 POST /ems/api/auth/login 401 35ms 190B login user=demo -> 401
```

欄位依序是：來源 IP（DGX 轉來的請求用 `X-Real-IP`）、方法、路徑（含查詢字串，最多 200 字）、狀態碼、耗時、送出位元組數，最後是登入／登出（`login user=帳號 -> 狀態`、`logout -> 狀態`）與拒絕原因（例如 `too many requests`、`origin check failed`、`EMS backend unavailable`）。狀態 500 以上記為 WARN；連線中途斷掉的請求最後會標 `aborted`。**不會記錄密碼、Cookie、請求內容或其他標頭**；登入只取帳號名稱（最多 64 字，去掉控制字元）。

**事件紀錄**：

- 啟動：`start pid … release … listen …`，以及兩個監聽位址各一行 `EMS publication listener …`。
- Tailscale 斷線：`ERROR listener 100.114.126.85:4179 lost: …`；恢復後 `INFO listener … recovered after Ns (N retries)`。持續斷線時，只有錯誤碼改變或每約 10 分鐘（120 次重試）才再寫一行 `WARN … still down`。
- 致命錯誤：`ERROR fatal uncaughtException` 或 `unhandledRejection`（含 stack），接著 `exit code N`。
- 用 stop 腳本停止：`INFO stopped by stop-public.ps1 (PID n)`；用 start 腳本重新啟動：`INFO restarted by start-public.ps1 (old PID n)`。
- 兩次 `start pid` 之間如果沒有 `exit code` 或 `stopped by`，代表程序被外部終止（重開機、工作管理員等）。

雙擊 `view-log.cmd` 可即時追蹤（先顯示最後 30 行）。它和啟動視窗一樣會自動跟到下一個檔案（換檔或重新啟動後都會），關閉視窗不影響轉送程序。node 在日誌機制以外印出的內容會寫在 `logs/node-output.log`（超過 5 MB 時於下次啟動改名為 `node-output.1.log`）。2026-10-12 以前的 `server.stdout.log` / `server.stderr.log` 已移到 `rollback-20261012/`。

## 故障排除

| 症狀 | 原因 |
|---|---|
| 公開網址 504 | 轉送程序沒有在跑（最常見的原因是重開機），或 Tailscale 斷線 |
| 公開網址 502／504，但日誌最後是 `listener 100.114.126.85:4179 lost` | Tailscale 目前斷線；程序每 5 秒自動重試，恢復後會出現 `recovered`，不需要重新啟動 |
| API 502 `EMS backend unavailable` | BFF（WSL Docker）沒有啟動；雙擊 `start-public.cmd` 會把它帶起來 |
| 啟動時出現 `WSL is up but the EMS backend did not answer within 180 s` | Ubuntu 已開，但 Docker 或 EMS 容器沒有起來；打開 Ubuntu 執行 `docker ps` 查看 |
| 啟動時出現 `Port 4179 is used by another program, PID …` | 4179 被其他程式占用（例如從舊位置 EMS `output/ems-public-local` 啟動的程序），請自行停止它，腳本不會停止別的程式 |
| 未登入時 API 回 401 | 這是正常行為 |

啟動失敗時，視窗會顯示錯誤與日誌最後 10 行（必要時也會顯示 `logs/node-output.log`）。

## 更新版本與回退

### 2026-10-29：跨遠端版本回退與修復紀錄

2026-10-28 15:59:56，本機從 `feat/ems-booth-qr-release` 切回尚未包含該功能的 `main`，發布設定回到 `20260929-sampling-lines-v1`；17:24:06 手動啟動後，公開警報中心只剩舊版示範面板。這次回退發生於前端發布檔案與設定，後端仍為 10/13 的版本。

已恢復 `20261013-booth-qr-v1`：41 個公開檔案通過 manifest SHA256 驗證，含 manifest 的 42 個檔案與原功能分支逐位元組一致。修復與維護紀錄以 `7f7b6fd` 提交至 GitHub `main`；2026-10-29 唯讀檢查公開警報程式為 HTTP 200 且包含新版綁定功能，沒有重送通知。

Azure `main` 已由 PR #734 合併新版發布包及設定；本補充只記錄回退原因與跨遠端同步注意事項，保留既有上線驗收及回退說明。GitHub 與 Azure 的分支狀態須分別確認；發布包和 `server-config.json` 要一起納入預計啟動的分支。切換至歷史分支仍可能改變下次啟動版本，啟動前應核對設定與對應 release 目錄。

發布包在 EMS 專案的 `output/ems-public-local` 用 `build.mjs <release-id>` 建置，那裡也保留所有歷史版本與 QA 腳本。

1. 把新的 `releases/<release-id>/` 複製到這裡的 `releases/`。
2. 依 `manifest.json` 核對 SHA256。
3. 修改 `server-config.json` 的 `release`。
4. 執行 stop，再執行 start。
5. 在 EMS 專案執行 `node output/ems-public-local/qa/verify-release.mjs <config> https://synaiq-ai.com/ems/`，核對正式網址上每個檔案的 SHA256（`<config>` 是 `output/ems-public-local` 裡 `release` 指向新版本的設定檔；不加參數時讀那裡的 `server-config.json`）。

回退時把舊版本的資料夾複製過來，改回 `release` 後重新啟動。上線中的版本資料夾不要直接修改。

### 版本紀錄

上一版的資料夾保留在 `releases/`，回退只要改回 `release` 再由使用者重新啟動。

| 上線日 | 版本 | 內容 | 回退 |
|---|---|---|---|
| 2026-10-13 | `20261013-booth-qr-v1`（目前） | 警報頁 Telegram 示範面板加入攤位 QR 綁定（EMS PRD-0024）：QR Code（BFF 每 60 秒換碼）、目前綁定（只顯示遮罩名稱與剩餘時間）、今日已觸發人數、Bot 狀態提示；最近示範警報預設 5 筆，可展開到 10 筆。新增 `live/qr-svg.mjs` 與 `assets/uqr-0.1.3.mjs`（MIT，授權見 `assets/UQR-LICENSE.txt`），共 41 個公開檔案。API 白名單不變。 | `release` 改回 `releases/20260929-sampling-lines-v1`，重新啟動 |
| 2026-09-29 | `20260929-sampling-lines-v1` | 建立本資料夾時的上線版本（歷史圖表依取樣間隔連線） | — |

- `20261013-booth-qr-v1` 已於 2026-10-13 上線完成：使用者重新啟動轉送程序後，正式網址 41 個檔案的 SHA256 與 manifest 一致（`verify-release.mjs`），使用者也以手機在正式站實測掃碼綁定與示範警報，結果通過。
- 攤位頁面開著且在前景時，每 4 秒 GET 一次 `/ems/api/alarms/demo`（每分鐘 15 次，在每 IP 120 次的限制內），日誌每分鐘因此多約 15 行；頁面切到背景就暫停。
- 只回退前端版本時 QR 區塊會消失，「觸發警報」照常可用。QR 綁定的後端設定（kill switch）與回退見 EMS 專案的 PRD-0024 與操作手冊。

## 安全邊界

- 只監聽 `127.0.0.1` 與 Tailscale 位址，並且只接受 DGX-01 `100.64.84.58` 和本機的連線。
- API 白名單：session、登入／登出、設備清單／單筆、量測／歷史／紀錄讀取，以及 `GET/POST /api/alarms/demo`。其餘一律回 404，寫入設備的 API 不在白名單中。
- 每個 IP 每分鐘最多 120 次 API、5 次登入。同時最多 4 個請求，BFF 逾時 15 秒。
- Cookie 限定在 `/ems/` 路徑，並設定 Secure、HttpOnly、SameSite=Strict。
- DGX 的路由設定在 `/home/nick/projects/YIYI-Global-Gateway/config/nginx/conf.d/synaiq-ai.com.conf` 的 `# BEGIN EMS LOCAL 20260923` 區塊。

完整的上線與驗收紀錄見 EMS 專案的 `doc/operations/ems-public-local-20260923.md`。
