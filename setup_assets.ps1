# Create destination directories
$publicDir = "c:\Users\UDYO FF\Downloads\digital-product--main\storefront\public"
$imagesDir = Join-Path $publicDir "images"
$ytDir = Join-Path $imagesDir "yt-showcase"
$catDir = Join-Path $imagesDir "category-circles"
$adminPublic = "c:\Users\UDYO FF\Downloads\digital-product--main\admin\public"

New-Item -ItemType Directory -Force -Path $publicDir | Out-Null
New-Item -ItemType Directory -Force -Path $imagesDir | Out-Null
New-Item -ItemType Directory -Force -Path $ytDir | Out-Null
New-Item -ItemType Directory -Force -Path $catDir | Out-Null
New-Item -ItemType Directory -Force -Path $adminPublic | Out-Null

$brainUploads = "C:\Users\UDYO FF\.gemini\antigravity\brain\1b015287-f2fe-41d9-89c9-4fff8f9141e1\.user_uploaded"

Add-Type -AssemblyName System.Drawing

# 1. Process Logo
$logoSrc = Join-Path $brainUploads "media_1793542276861_a647bc9a.jpg"
if (Test-Path $logoSrc) {
    Copy-Item $logoSrc (Join-Path $publicDir "logo.png") -Force
    Copy-Item $logoSrc (Join-Path $publicDir "logo-tight.png") -Force
    Copy-Item $logoSrc (Join-Path $adminPublic "logo.png") -Force
    Copy-Item $logoSrc (Join-Path $adminPublic "logo-tight.png") -Force
    Write-Output "Logo copied successfully"
}

# 2. Before/After Banner
$bannerSrc = Join-Path $brainUploads "media_1793545253666_dab84f69.png"
if (-not (Test-Path $bannerSrc)) {
    $bannerSrc = Join-Path $brainUploads "media_1793545782638_8f742ec8.png"
}
if (Test-Path $bannerSrc) {
    Copy-Item $bannerSrc (Join-Path $imagesDir "before-after-banner.png") -Force
    Copy-Item $bannerSrc (Join-Path $publicDir "before-after-banner.png") -Force
    Write-Output "Before-after banner copied successfully"
}

# 3. Copy authentic YouTube creator thumbnails
$thumbMap = @{
    "media_1793547427011_f513d676.jpg" = "yt-preeti-live.jpg"
    "media_1793547427020_cba34424.jpg" = "yt-satvik-face-reveal.jpg"
    "media_1793547427085_42ce5f61.jpg" = "yt-creator-custom.jpg"
    "media_1793547427091_a5747fe4.jpg" = "yt-krish-gaming.jpg"
    "media_1793546581361_15726675.jpg" = "yt-priti-samurai.jpg"
    "media_1793546581366_b33ac749.jpg" = "yt-puja-pink.jpg"
    "media_1793546581647_f6f9e190.jpg" = "yt-priya-headphones.jpg"
    "media_1793546581670_38257c2f.jpg" = "yt-sejal-vintage.jpg"
    "media_1793546581676_7d078dc9.jpg" = "yt-ayush-jordy.jpg"
    "media_1793547024544_ae7f0d35.jpg" = "yt-habibi-1m.jpg"
    "media_1793547024666_086276de.jpg" = "yt-syco-thriller.jpg"
}

foreach ($key in $thumbMap.Keys) {
    $src = Join-Path $brainUploads $key
    $dest = Join-Path $ytDir $thumbMap[$key]
    if (Test-Path $src) {
        Copy-Item $src $dest -Force
        Write-Output "Copied $key -> $($thumbMap[$key])"
    }
}

# 4. Circular Category Bar Image
$catStripSrc = Join-Path $brainUploads "media_1793547973782_ce7834ab.png"
if (Test-Path $catStripSrc) {
    Copy-Item $catStripSrc (Join-Path $imagesDir "category-circle-strip.png") -Force
    Copy-Item $catStripSrc (Join-Path $publicDir "category-circle-strip.png") -Force
    
    # Let's also crop each of the 7 circular categories into individual PNGs
    try {
        $bmp = [System.Drawing.Bitmap]::FromFile($catStripSrc)
        $w = $bmp.Width
        $h = $bmp.Height
        $catWidth = [int]($w / 7)
        
        $catNames = @("psd", "cc-enhancer", "manga", "character-pack", "vfx-box", "anime-pfp", "text")
        for ($i = 0; $i -lt 7; $i++) {
            $cropRect = New-Object System.Drawing.Rectangle ($i * $catWidth), 0, $catWidth, $h
            $subBmp = $bmp.Clone($cropRect, $bmp.PixelFormat)
            $subPath = Join-Path $catDir "$($catNames[$i]).png"
            $subBmp.Save($subPath, [System.Drawing.Imaging.ImageFormat]::Png)
            $subBmp.Dispose()
        }
        $bmp.Dispose()
        Write-Output "Successfully cropped 7 circular category icons"
    } catch {
        Write-Output "Error cropping categories: $_"
    }
}
