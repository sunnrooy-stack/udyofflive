Add-Type -AssemblyName System.Drawing
$dir = "c:\Users\UDYO FF\Downloads\digital-product--main\storefront\public\images\category-circles"
$files = Get-ChildItem -Path $dir -Filter "*.png"

foreach ($f in $files) {
  try {
    $bmp = [System.Drawing.Bitmap]::FromFile($f.FullName)
    $bmp.MakeTransparent([System.Drawing.Color]::White)
    $tmpPath = $f.FullName + ".tmp.png"
    $bmp.Save($tmpPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Move-Item $tmpPath $f.FullName -Force
    Write-Output "Made white transparent in $($f.Name)"
  } catch {
    Write-Output "Error in $($f.Name): $_"
  }
}
