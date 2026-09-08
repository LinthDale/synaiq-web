param([string]$Only = "*")
$ErrorActionPreference = 'Stop'
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
Add-Type -AssemblyName System.Drawing

# page width per file suffix -> render width = page + 320 annotation column
$files = Get-ChildItem "$dir\$Only.dc.html" | Sort-Object Name
foreach ($f in $files) {
  $name = $f.Name -replace '\.dc\.html$',''
  $w = 1760
  if ($name -match '-768$') { $w = 1088 }
  if ($name -match '-390$') { $w = 710 }
  # total height comes from the sum of --h declarations in the file
  $txt = Get-Content $f.FullName -Raw -Encoding UTF8
  $h = 0
  [regex]::Matches($txt, '--h:(\d+)px') | ForEach-Object { $h += [int]$_.Groups[1].Value }
  $h = [int]($h / 2) + 40   # each --h appears twice (page cell + note cell)
  if ($h -lt 400) { $h = 2000 }
  $out = "$dir\$name.png"
  $uri = "file:///" + ($f.FullName -replace '\\','/' -replace ' ','%20')
  & $chrome --headless=new --disable-gpu --hide-scrollbars --window-size="$w,$h" --virtual-time-budget=6000 --screenshot="$out" $uri | Out-Null
  if (Test-Path $out) {
    $im = [System.Drawing.Image]::FromFile($out); $dim = "$($im.Width)x$($im.Height)"; $im.Dispose()
    "{0}`t{1}`t{2} KB" -f $name, $dim, [Math]::Round((Get-Item $out).Length/1KB,1)
  } else { "FAIL $name" }
}
