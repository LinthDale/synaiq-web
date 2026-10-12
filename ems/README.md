# EMS 公開入口（synaiq-ai.com/ems）

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

發布包在 EMS 專案的 `output/ems-public-local` 用 `build.mjs <release-id>` 建置，那裡也保留所有歷史版本與 QA 腳本。

1. 把新的 `releases/<release-id>/` 複製到這裡的 `releases/`。
2. 依 `manifest.json` 核對 SHA256。
3. 修改 `server-config.json` 的 `release`。
4. 執行 stop，再執行 start。

回退時把舊版本的資料夾複製過來，改回 `release` 後重新啟動。上線中的版本資料夾不要直接修改。

## 安全邊界

- 只監聽 `127.0.0.1` 與 Tailscale 位址，並且只接受 DGX-01 `100.64.84.58` 和本機的連線。
- API 白名單：session、登入／登出、設備清單／單筆、量測／歷史／紀錄讀取，以及 `GET/POST /api/alarms/demo`。其餘一律回 404，寫入設備的 API 不在白名單中。
- 每個 IP 每分鐘最多 120 次 API、5 次登入。同時最多 4 個請求，BFF 逾時 15 秒。
- Cookie 限定在 `/ems/` 路徑，並設定 Secure、HttpOnly、SameSite=Strict。
- DGX 的路由設定在 `/home/nick/projects/YIYI-Global-Gateway/config/nginx/conf.d/synaiq-ai.com.conf` 的 `# BEGIN EMS LOCAL 20260923` 區塊。

完整的上線與驗收紀錄見 EMS 專案的 `doc/operations/ems-public-local-20260923.md`。
