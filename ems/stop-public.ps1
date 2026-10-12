# Stops only the EMS publication proxy started by start-public.ps1 (start-public.ps1 also calls this to restart).
# It never touches WSL, Docker, the EMS containers or the WSL keep-alive (to stop those: wsl --terminate <distro>).
# Works the same from stop-public.cmd, Run with PowerShell, powershell -File, or typed in an open terminal.
# Keep this file ASCII-only.
# -ProcessId/-Reason: used by start-public.ps1. -NoPause: no log tail and no wait (tests, automation).
param([int]$ProcessId,[string]$Reason,[switch]$NoPause)
$ErrorActionPreference='Stop'
$serverFile=Join-Path $PSScriptRoot 'server.mjs'
$logDir=Join-Path $PSScriptRoot 'logs'
$failure=$null
try{
    $pidFile=Join-Path $PSScriptRoot 'server.pid'
    if(!$ProcessId -and (Test-Path -LiteralPath $pidFile)){$ProcessId=[int](Get-Content -LiteralPath $pidFile -Raw)}
    $process=if($ProcessId){Get-CimInstance Win32_Process -Filter ('ProcessId='+$ProcessId)}
    if(!$ProcessId){Write-Output 'No publication PID file'}
    elseif(!$process){Write-Output 'Publication process is not running'}
    elseif(!$process.CommandLine -or !$process.CommandLine.Contains($serverFile)){throw 'PID was reused by another process; nothing stopped'}
    else{
        if(!$Reason){$Reason="stopped by stop-public.ps1 (PID $ProcessId)"}
        $launcher=Get-CimInstance Win32_Process -Filter ('ProcessId='+$process.ParentProcessId)
        Stop-Process -Id $ProcessId
        # Stop-Process is TerminateProcess, so node cannot log its own end. Record it here once node and its hidden
        # cmd.exe launcher are gone; nothing else writes the newest log file then.
        Wait-Process -Id $ProcessId -Timeout 10 -ErrorAction SilentlyContinue
        if($launcher -and $launcher.Name -eq 'cmd.exe' -and $launcher.CommandLine -and $launcher.CommandLine.Contains($serverFile)){Wait-Process -Id $launcher.ProcessId -Timeout 5 -ErrorAction SilentlyContinue}
        try{
            New-Item -ItemType Directory -Force -Path $logDir | Out-Null
            $newest=Get-ChildItem -LiteralPath $logDir -File | Where-Object {$_.Name -match '^server-\d{6}\.log$'} | Sort-Object Name | Select-Object -Last 1
            $target=if($newest){$newest.FullName}else{Join-Path $logDir 'server-000001.log'}
            $stamp=(Get-Date).ToString("yyyy-MM-dd'T'HH:mm:ss.fffzzz",[Globalization.CultureInfo]::InvariantCulture)
            Add-Content -LiteralPath $target -Value "$stamp INFO $Reason" -Encoding Ascii
        }
        catch{Write-Warning "Could not append to the log: $($_.Exception.Message)"}
        Write-Output "EMS publication stopped (PID $ProcessId). The EMS backend is unchanged."
    }
}
catch{$failure=$_}
if($failure){Write-Host "ERROR: $failure" -ForegroundColor Red}
if(!$NoPause){
    Write-Host ''; Write-Host '---- last 10 lines of the log ----'
    & (Join-Path $PSScriptRoot 'view-log.ps1') -Tail 10 -NoFollow
    # Wait only when PowerShell was started for this script (.cmd, Run with PowerShell), not when typed in a terminal.
    if([Environment]::GetCommandLineArgs() | Where-Object {$_.IndexOf($PSCommandPath,[StringComparison]::OrdinalIgnoreCase) -ge 0}){[void](Read-Host 'Press Enter to close this window')}
}
if($failure){exit 1}
