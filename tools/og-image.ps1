# Genera la imagen de vista previa para redes (1200x630) con el packshot del producto inicial.
# Uso: powershell -ExecutionPolicy Bypass -File tools\og-image.ps1
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root "public\og\og-profit.jpg"
New-Item -ItemType Directory -Force (Split-Path $out) | Out-Null

$ink = [System.Drawing.ColorTranslator]::FromHtml("#0B0B0C")
$acento = [System.Drawing.ColorTranslator]::FromHtml("#FF5A66")   # Fuerza, sobre fondo oscuro
$bmp = New-Object System.Drawing.Bitmap 1200, 630
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = "HighQuality"; $g.InterpolationMode = "HighQualityBicubic"; $g.TextRenderingHint = "AntiAliasGridFit"
$g.Clear($ink)

# Panel blanco con el packshot, a la derecha
$g.FillRectangle([System.Drawing.Brushes]::White, 760, 0, 440, 630)
$pack = [System.Drawing.Image]::FromFile((Join-Path $root "public\packshots\creatina-monohidrato-300g.png"))
$h = 560; $w = [int]($pack.Width * $h / $pack.Height)
$g.DrawImage($pack, 760 + [int]((440 - $w) / 2), 35, $w, $h)
$pack.Dispose()

# Logo blanco
$logo = [System.Drawing.Image]::FromFile((Join-Path $root "public\brand\profit-logo-blanco.png"))
$lw = 210; $lh = [int]($logo.Height * $lw / $logo.Width)
$g.DrawImage($logo, 64, 64, $lw, $lh)
$logo.Dispose()

$family = if ((New-Object System.Drawing.Text.InstalledFontCollection).Families.Name -contains "Montserrat Black") { "Montserrat Black" } elseif ((New-Object System.Drawing.Text.InstalledFontCollection).Families.Name -contains "Montserrat") { "Montserrat" } else { "Arial Black" }
$titulo = New-Object System.Drawing.Font($family, 58, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$label = New-Object System.Drawing.Font("Arial", 18, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$gris = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(170, 255, 255, 255))

$g.FillEllipse((New-Object System.Drawing.SolidBrush($acento)), 64, 258, 10, 10)
$g.DrawString("SUSCRIPCIÓN PROFIT®", $label, $gris, 84, 252)
$g.DrawString("ACÁ SE VIENE`nA MEJORAR.", $titulo, $white, (New-Object System.Drawing.RectangleF(58, 290, 680, 200)))
$g.DrawString("Cada 30 o 60 días · Pagás con Mercado Pago", $label, $gris, 64, 540)

$enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$p = New-Object System.Drawing.Imaging.EncoderParameters 1
$p.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]85)
$bmp.Save($out, $enc, $p)
$g.Dispose(); $bmp.Dispose()
Write-Host "OK $out ($family)"
