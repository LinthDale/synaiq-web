# One click for everything behind https://synaiq-ai.com/ems/: brings the EMS backend in WSL up when it is not answering,
# then starts this publication proxy - always as a restart on the configured port - and follows the log live.
# Chain: DGX-01 Nginx -> Tailscale <tailscaleAddress>:<port> -> this Node process -> BFF 127.0.0.1:8003 (Docker in WSL)
# Compatible with the built-in Windows PowerShell 5.1. Keep this file ASCII-only.
# Works the same from start-public.cmd, Run with PowerShell, powershell -File, or typed in an open terminal; after a
# successful start it follows the log until Ctrl+C or the window is closed, which never stops the relay or the backend.
# -NoPause: no log tail, no live view and no wait (tests, automation).
param([switch]$NoPause)
$ErrorActionPreference='Stop'
$serverFile=Join-Path $PSScriptRoot 'server.mjs'
$logDir=Join-Path $PSScriptRoot 'logs'
# node writes logs\server-NNNNNN.log itself; this catch-all only receives what node prints outside its logger.
$catchAll=Join-Path $logDir 'node-output.log'
$failure=$null; $launched=[datetime]::MaxValue
# Names of the running WSL distros (wsl.exe -l only lists, it starts nothing). EAP=Continue: PS 5.1 turns native stderr into errors.
function Get-RunningDistros([string]$wslExe){$ErrorActionPreference='Continue'; $env:WSL_UTF8='1'; @(& $wslExe -l --running -q 2>$null | ForEach-Object {("$_" -replace "`0",'').Trim()} | Where-Object {$_})}
function Find-KeepAlive([string]$wslExe,[string]$keepArgs){Get-CimInstance Win32_Process | Where-Object {$_.CommandLine -and $_.CommandLine.Contains($keepArgs) -and $_.CommandLine.Contains((Split-Path -Leaf $wslExe))} | Select-Object -First 1}
function Get-BffStatus([string]$uri){try{[int](Invoke-WebRequest -Uri $uri -UseBasicParsing -TimeoutSec 5).StatusCode}catch [System.Net.WebException]{if($_.Exception.Response){[int]$_.Exception.Response.StatusCode}else{0}}}
# Hidden process created through WMI: neither a child of this shell nor inside its job object, so closing the app,
# terminal or window that ran this script cannot take it down.
function New-DetachedProcess([string]$commandLine){
    $startup=New-CimInstance -ClassName Win32_ProcessStartup -ClientOnly -Property @{ShowWindow=[uint16]0}
    $created=Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{CommandLine=$commandLine;CurrentDirectory=$PSScriptRoot;ProcessStartupInformation=$startup}
    if($created.ReturnValue -ne 0){throw "Win32_Process.Create failed with code $($created.ReturnValue): $commandLine"}
    try{[Diagnostics.Process]::GetProcessById([int]$created.ProcessId)}catch{$null}
}
try{
    $config=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'server-config.json') -Raw | ConvertFrom-Json
    # The Windows Firewall inbound allow rule is bound to this exact executable.
    $nodeRuntime=Join-Path $env:ProgramFiles 'nodejs\node.exe'
    if(!(Test-Path -LiteralPath $nodeRuntime)){throw "Node.js not found at $nodeRuntime"}

    # A port owner other than this folder's server.mjs is never stopped; ours is restarted after the checks below.
    $running=@(Get-NetTCPConnection -LocalPort $config.port -State Listen -ErrorAction SilentlyContinue | ForEach-Object OwningProcess | Select-Object -Unique)
    foreach($id in $running){
        $owner=Get-CimInstance Win32_Process -Filter ('ProcessId='+$id)
        if(!$owner -or !$owner.CommandLine -or !$owner.CommandLine.Contains($serverFile)){
            throw "Port $($config.port) is used by another program, PID ${id}: $(if($owner.CommandLine){$owner.CommandLine.Trim()}else{'(command line not visible)'}). Stop that program yourself; this script never stops other programs."
        }
    }

    # EMS backend (Docker in a WSL distro): WSL stops a distro when its last session ends, so one hidden keep-alive
    # session (wsl.exe -d <distro> --exec sleep infinity), created through WMI, keeps it up whatever terminals, apps or
    # windows close. It is started even when the distro already runs (that session may close later) and reused when
    # present. stop-public.ps1 never touches it; to really stop the backend: wsl --terminate <distro>.
    # wslExe and backendTimeoutSeconds exist for tests only.
    $distro=if($config.wslDistro){$config.wslDistro}else{'Ubuntu'}
    $wslExe=if($config.wslExe){$config.wslExe}else{Join-Path $env:SystemRoot 'System32\wsl.exe'}
    $installed=@(Get-ChildItem -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Lxss' -ErrorAction SilentlyContinue | ForEach-Object {(Get-ItemProperty -LiteralPath $_.PSPath).DistributionName})
    if($installed -notcontains $distro){throw "WSL distro '$distro' is not installed (installed: $($installed -join ', ')); set wslDistro in server-config.json"}
    $state=if((Get-RunningDistros $wslExe) -contains $distro){'running'}else{'not running'}
    $keepArgs="-d $distro --exec sleep infinity"
    $keep=Find-KeepAlive $wslExe $keepArgs; $newKeepAlive=!$keep
    if($keep){Write-Host "WSL $distro is $state; keep-alive session already present (PID $($keep.ProcessId))"}
    else{Write-Host "WSL $distro is $state; starting a hidden keep-alive session"; [void](New-DetachedProcess ('"'+$wslExe+'" '+$keepArgs))}
    $healthUri=$config.bffTarget+'/api/auth/session'
    $status=Get-BffStatus $healthUri
    if($status -notin @(200,401)){
        $timeout=if($config.backendTimeoutSeconds){[int]$config.backendTimeoutSeconds}else{180}
        Write-Host -NoNewline "Waiting for the EMS backend at $healthUri (up to $timeout s) "
        $clock=[Diagnostics.Stopwatch]::StartNew()
        while($status -notin @(200,401)){
            if($newKeepAlive -and !(Find-KeepAlive $wslExe $keepArgs)){Write-Host ''; throw "The WSL keep-alive for $distro stopped right away; check that 'wsl -d $distro' works"}
            if($clock.Elapsed.TotalSeconds -ge $timeout){Write-Host ''; throw "WSL is up but the EMS backend did not answer within $timeout s - open $distro and check 'docker ps'. A running relay was left untouched."}
            Start-Sleep -Seconds 2; Write-Host -NoNewline '.'
            $status=Get-BffStatus $healthUri
        }
        Write-Host ''; Write-Host "EMS backend is up after $([int]$clock.Elapsed.TotalSeconds) s"
    }
    elseif($newKeepAlive){Start-Sleep -Milliseconds 1500; if(!(Find-KeepAlive $wslExe $keepArgs)){Write-Warning "The WSL keep-alive for $distro stopped right away; the backend may stop when the last WSL window closes"}}

    if(!(Get-NetIPAddress -IPAddress $config.tailscaleAddress -ErrorAction SilentlyContinue)){
        throw "Tailscale is not connected at the expected address $($config.tailscaleAddress)"
    }

    foreach($id in $running){
        Write-Output "Restarting: stopping EMS publication PID $id on port $($config.port)"
        $global:LASTEXITCODE=0
        & (Join-Path $PSScriptRoot 'stop-public.ps1') -ProcessId $id -Reason "restarted by start-public.ps1 (old PID $id)" -NoPause
        if($LASTEXITCODE){throw "Could not stop PID $id; nothing was started"}
    }
    for($i=0;$i -lt 40 -and @(Get-NetTCPConnection -LocalPort $config.port -State Listen -ErrorAction SilentlyContinue).Count;$i++){Start-Sleep -Milliseconds 250}
    if(@(Get-NetTCPConnection -LocalPort $config.port -State Listen -ErrorAction SilentlyContinue).Count){throw "Port $($config.port) is still in use after stopping the old relay"}

    # The catch-all is held open by the launcher while the relay runs, so it is only rotated here (above 5 MB).
    New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    try{if((Test-Path -LiteralPath $catchAll) -and (Get-Item -LiteralPath $catchAll).Length -gt 5MB){Move-Item -LiteralPath $catchAll -Destination (Join-Path $logDir 'node-output.1.log') -Force}}
    catch{Write-Warning "Rotation of node-output.log skipped: $($_.Exception.Message)"}
    $launched=Get-Date
    $launcher=New-DetachedProcess ('"'+(Join-Path $env:SystemRoot 'System32\cmd.exe')+'" /d /s /c ""'+$nodeRuntime+'" "'+$serverFile+'" 1>>"'+$catchAll+'" 2>&1"')
    $started=$false
    for($i=0;$i -lt 40 -and !$started;$i++){
        Start-Sleep -Milliseconds 250
        if(!$launcher -or $launcher.HasExited){throw 'EMS publication did not start; see the log below'}
        $listeners=@(Get-NetTCPConnection -LocalPort $config.port -State Listen -ErrorAction SilentlyContinue)
        $listener=$listeners | Where-Object LocalAddress -eq $config.tailscaleAddress | Select-Object -First 1
        if($listener -and $listeners.Count -ge 2){
            $node=Get-CimInstance Win32_Process -Filter ('ProcessId='+$listener.OwningProcess)
            if(!$node.CommandLine -or !$node.CommandLine.Contains($serverFile)){throw "Port $($config.port) was taken by another program (PID $($listener.OwningProcess))"}
            $node.ProcessId | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'server.pid')
            Write-Output ('EMS publication running, PID '+$node.ProcessId+': https://synaiq-ai.com/ems/#Monitor')
            $started=$true
        }
    }
    if(!$started){throw "EMS publication is not listening on port $($config.port) after 10s; see the log below"}
}
catch{$failure=$_}
if($failure){Write-Host "ERROR: $failure" -ForegroundColor Red}
if(!$NoPause){
    $viewer=Join-Path $PSScriptRoot 'view-log.ps1'
    if(!$failure){Write-Host ''; & $viewer -Tail 10}
    else{
        Write-Host ''; Write-Host '---- last 10 lines of the log ----'
        & $viewer -Tail 10 -NoFollow
        if((Test-Path -LiteralPath $catchAll) -and (Get-Item -LiteralPath $catchAll).LastWriteTime -ge $launched){Write-Host '---- logs\node-output.log ----'; Get-Content -LiteralPath $catchAll -Tail 10 | ForEach-Object {Write-Host $_}}
        # Keep a window that was opened just for this script (.cmd, Run with PowerShell, powershell -File) readable.
        if([Environment]::GetCommandLineArgs() | Where-Object {$_.IndexOf($PSCommandPath,[StringComparison]::OrdinalIgnoreCase) -ge 0}){[void](Read-Host 'Press Enter to close this window')}
    }
}
if($failure){exit 1}
