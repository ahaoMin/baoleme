Add-Type -AssemblyName System.Drawing
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -ErrorAction SilentlyContinue
if (-not $root) { $root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path }
# script lives in <project>/scripts
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location -LiteralPath $root
$outDir = Join-Path $root 'public'
if (-not (Test-Path -LiteralPath $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

function New-BaolemeBmp([int]$s) {
  $bmp = New-Object System.Drawing.Bitmap $s, $s
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.Clear([System.Drawing.Color]::Transparent)
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (
    [System.Drawing.Rectangle]::new(0, 0, $s, $s),
    [System.Drawing.Color]::FromArgb(255, 0, 166, 255),
    [System.Drawing.Color]::FromArgb(255, 0, 132, 255),
    45.0
  )
  $radius = [Math]::Max(2, [int]($s * 0.22))
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $s - 1
  $path.AddArc(0, 0, $radius * 2, $radius * 2, 180, 90)
  $path.AddArc($d - $radius * 2, 0, $radius * 2, $radius * 2, 270, 90)
  $path.AddArc($d - $radius * 2, $d - $radius * 2, $radius * 2, $radius * 2, 0, 90)
  $path.AddArc(0, $d - $radius * 2, $radius * 2, $radius * 2, 90, 90)
  $path.CloseFigure()
  $g.FillPath($brush, $path)
  $fontSize = [Math]::Max(8, [int]($s * 0.52))
  $font = New-Object System.Drawing.Font('Microsoft YaHei UI', $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
  $text = [string]([char]0x9971)
  $g.DrawString($text, $font, [System.Drawing.Brushes]::White, [System.Drawing.RectangleF]::new(0, 0, $s, $s), $sf)
  $g.Dispose(); $brush.Dispose(); $font.Dispose(); $path.Dispose()
  return $bmp
}

$b16 = New-BaolemeBmp 16
$b32 = New-BaolemeBmp 32
$b48 = New-BaolemeBmp 48
$b180 = New-BaolemeBmp 180

$b16.Save((Join-Path $outDir 'favicon-16.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$b32.Save((Join-Path $outDir 'favicon-32.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$b180.Save((Join-Path $outDir 'apple-touch-icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)

$icons = @($b16, $b32, $b48)
$icoPath = Join-Path $outDir 'favicon.ico'
$fs = [System.IO.File]::Create($icoPath)
$bw = New-Object System.IO.BinaryWriter $fs
$bw.Write([UInt16]0)
$bw.Write([UInt16]1)
$bw.Write([UInt16]$icons.Count)
$offset = 6 + (16 * $icons.Count)
$pngs = New-Object System.Collections.Generic.List[byte[]]
foreach ($bmp in $icons) {
  $ms = New-Object System.IO.MemoryStream
  $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
  [void]$pngs.Add($ms.ToArray())
  $ms.Dispose()
}
for ($i = 0; $i -lt $icons.Count; $i++) {
  $s = $icons[$i].Width
  $bw.Write([Byte]$(if ($s -ge 256) { 0 } else { $s }))
  $bw.Write([Byte]$(if ($s -ge 256) { 0 } else { $s }))
  $bw.Write([Byte]0)
  $bw.Write([Byte]0)
  $bw.Write([UInt16]1)
  $bw.Write([UInt16]32)
  $bw.Write([UInt32]$pngs[$i].Length)
  $bw.Write([UInt32]$offset)
  $offset += $pngs[$i].Length
}
foreach ($p in $pngs) { $bw.Write($p) }
$bw.Flush()
$fs.Close()

$b16.Dispose(); $b32.Dispose(); $b48.Dispose(); $b180.Dispose()
Write-Host "Generated favicons in $outDir"
Get-ChildItem -LiteralPath $outDir -Filter 'favicon*'
Get-ChildItem -LiteralPath $outDir -Filter 'apple-touch-icon.png'
