param(
  [string]$Only = "*",
  [switch]$ContactSheet
)
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

if ($ContactSheet) {
  $sheet = Join-Path $dir "_contactsheet.html"
  $sheetOut = Join-Path $dir "contact-sheet.png"
  $sheetHtml = Get-Content $sheet -Raw -Encoding UTF8
  $sheetHeight = 150

  [regex]::Matches($sheetHtml, '(?s)<section>.*?</section>') | ForEach-Object {
    $rowHeight = 0
    [regex]::Matches($_.Value, 'src="([^"]+\.png)"') | ForEach-Object {
      $imagePath = Join-Path $dir $_.Groups[1].Value
      if (Test-Path $imagePath) {
        $displayWidth = 520
        if ($_.Groups[1].Value -match '-768\.png$') { $displayWidth = 322 }
        if ($_.Groups[1].Value -match '-390\.png$') { $displayWidth = 210 }
        $image = [System.Drawing.Image]::FromFile($imagePath)
        $scaledHeight = [Math]::Ceiling($image.Height * $displayWidth / $image.Width)
        $image.Dispose()
        if ($scaledHeight -gt $rowHeight) { $rowHeight = $scaledHeight }
      }
    }
    $sheetHeight += $rowHeight + 90
  }
  $sheetHeight += 40

  $sheetUri = "file:///" + ($sheet -replace '\\','/' -replace ' ','%20')
  & $chrome --headless=new --disable-gpu --hide-scrollbars --window-size="1200,$sheetHeight" --virtual-time-budget=6000 --screenshot="$sheetOut" $sheetUri | Out-Null
  if (Test-Path $sheetOut) {
    $image = [System.Drawing.Image]::FromFile($sheetOut)
    $dimensions = "$($image.Width)x$($image.Height)"
    $image.Dispose()
    "{0}`t{1}`t{2} KB" -f "contact-sheet", $dimensions, [Math]::Round((Get-Item $sheetOut).Length / 1KB, 1)
  } else {
    "FAIL contact-sheet"
  }
}
