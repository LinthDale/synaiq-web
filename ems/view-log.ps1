# Shows the end of the EMS publication log and follows it live: logs\server-NNNNNN.log, highest number = newest.
# It moves on to the next file after a rotation or restart, and it only reads (files opened with full sharing,
# never held open), so it can never block the relay or its rotation. Ctrl+C or closing the window ends the view only.
# Works the same from view-log.cmd, Run with PowerShell, powershell -File, or typed in an open terminal.
# -Tail N: lines shown first. -NoFollow: show them and return (used by start-public.ps1 and stop-public.ps1).
# Compatible with the built-in Windows PowerShell 5.1. Keep this file ASCII-only.
param([int]$Tail=30,[switch]$NoFollow)
$ErrorActionPreference='Stop'
$logDir=Join-Path $PSScriptRoot 'logs'
function Get-LogFiles{@(Get-ChildItem -LiteralPath $logDir -File -ErrorAction SilentlyContinue | Where-Object {$_.Name -match '^server-\d{6}\.log$'} | Sort-Object Name)}
function Read-Bytes([string]$path,[long]$from){
    $stream=[IO.File]::Open($path,'Open','Read','ReadWrite, Delete')
    try{if($from -gt $stream.Length){$from=0}; $stream.Position=$from; $bytes=New-Object byte[] ($stream.Length-$from); [void]$stream.Read($bytes,0,$bytes.Length); ,$bytes}finally{$stream.Close()}
}
# Prints the complete lines after byte $offset and returns the offset just after the last printed line.
function Show-Lines([string]$path,[long]$offset){
    try{$bytes=Read-Bytes $path $offset}catch{return $offset}
    $end=if($bytes.Length){[Array]::LastIndexOf($bytes,[byte]10)}else{-1}
    if($end -lt 0){return $offset}
    foreach($line in [Text.Encoding]::UTF8.GetString($bytes,0,$end).Split("`n")){Write-Host $line.TrimEnd("`r")}
    $offset+$end+1
}
# Offset of the last $count complete lines (looks at most 256 KB back).
function Get-TailOffset([string]$path,[int]$count){
    $size=(Get-Item -LiteralPath $path).Length; $from=[Math]::Max(0,$size-262144)
    $bytes=Read-Bytes $path $from; $end=[Array]::LastIndexOf($bytes,[byte]10)
    if($end -lt 0){return $from}
    if($count -le 0){return $from+$end+1}
    for($i=$end-1;$i -ge 0;$i--){if($bytes[$i] -eq 10){$count--; if($count -eq 0){return $from+$i+1}}}
    $from
}
try{
    if(!$NoFollow){Write-Host 'Live log - Ctrl+C or closing this window does NOT stop the relay' -ForegroundColor Cyan}
    $files=Get-LogFiles
    if(!$files.Count){Write-Host "No log in $logDir yet (a relay started by an older version still writes server.log)."}
    $current=if($files.Count){$files[-1].FullName}else{$null}
    $pos=0
    if($current){$pos=Show-Lines $current (Get-TailOffset $current $Tail)}
    while(!$NoFollow){
        Start-Sleep -Milliseconds 250
        if($current){$pos=Show-Lines $current $pos}
        $newer=@(Get-LogFiles | Where-Object {!$current -or $_.Name -gt (Split-Path -Leaf $current)})
        if($newer.Count){
            # Node never writes an older file again once a newer one exists, so drain it once more before moving on.
            if($current){$pos=Show-Lines $current $pos}
            foreach($file in $newer){$current=$file.FullName; $pos=Show-Lines $current 0}
        }
    }
}
catch{
    Write-Host "ERROR: $_" -ForegroundColor Red
    # Keep a window that was opened just for this script readable.
    if([Environment]::GetCommandLineArgs() | Where-Object {$_.IndexOf($PSCommandPath,[StringComparison]::OrdinalIgnoreCase) -ge 0}){[void](Read-Host 'Press Enter to close this window')}
    exit 1
}
