Add-Type -AssemblyName System.Drawing
$dir = "c:\Users\UDYO FF\Downloads\digital-product--main\storefront\public\images\demo-sections"
if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

$base = "C:\Users\UDYO FF\.gemini\antigravity\brain\1b015287-f2fe-41d9-89c9-4fff8f9141e1\.user_uploaded"

$items = @(
  @{ file = "media_1793604899294_b470a545.png"; name = "demo-4k-backgrounds.png"; topCrop = 70 },
  @{ file = "media_1793604937672_e583e019.png"; name = "demo-thumbnail-psd.png"; topCrop = 70 },
  @{ file = "media_1793604947350_66b0dd21.png"; name = "demo-3d-character.png"; topCrop = 55 },
  @{ file = "media_1793604959664_8362776e.png"; name = "demo-glow-anime-logo.png"; topCrop = 55 }
)

foreach ($item in $items) {
  $src = Join-Path $base $item.file
  $dest = Join-Path $dir $item.name
  try {
    $bmp = [System.Drawing.Bitmap]::FromFile($src)
    $w = $bmp.Width
    $h = $bmp.Height - $item.topCrop
    $cropRect = New-Object System.Drawing.Rectangle 0, $item.topCrop, $w, $h
    $cropped = $bmp.Clone($cropRect, $bmp.PixelFormat)
    $cropped.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $cropped.Dispose()
    $bmp.Dispose()
    Write-Output "Cropped $($item.name) ($w x $h)"
  } catch {
    Copy-Item $src $dest -Force
    Write-Output "Copied direct: $($item.name)"
  }
}
