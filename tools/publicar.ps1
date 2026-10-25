# Arma la carpeta dist/ lista para subir a Netlify (o a cualquier hosting).
# Copia solo lo que la página necesita y limpia los datos internos de data/*.json:
# precio comercio, notas, comentarios y aclaraciones de los "pendiente" nunca salen a la web.
# Uso: powershell -ExecutionPolicy Bypass -File tools\publicar.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$dist = Join-Path $root "dist"

# Campos internos (CLAUDE.md, sección 3) y datos de uso interno que la página no usa.
$internos = @(
  "_leeme", "_validar_regulatorio", "notas", "regla", "fuente", "estado", "comercio_sin_iva",
  "denominacion_estado", "pendientes_de_alta", "certificaciones_a_confirmar", "regla_firma_concepto",
  "frases_retiradas", "frase_alternativa_en_evaluacion", "color_impresion"
)

function Limpiar($o) {
  if ($null -eq $o) { return $null }
  if ($o -is [string]) {
    # Un "pendiente — aclaración" se publica como "pendiente" a secas: la página lo oculta igual.
    if ($o.Trim().ToLower().StartsWith("pendiente")) { return "pendiente" }
    return $o
  }
  if ($o -is [System.Array]) {
    $lista = New-Object System.Collections.ArrayList
    foreach ($x in $o) { [void]$lista.Add((Limpiar $x)) }
    return , $lista.ToArray()
  }
  if ($o -is [System.Management.Automation.PSCustomObject]) {
    $n = [ordered]@{}
    $sinVerificar = $o.PSObject.Properties.Name -contains "denominacion_estado"
    foreach ($p in $o.PSObject.Properties) {
      if ($internos -contains $p.Name) { continue }
      # Una denominación sin verificar contra el rótulo no se publica.
      if ($sinVerificar -and $p.Name -eq "denominacion_rotulo") { continue }
      # Un precio marcado para no publicar (por ejemplo, el Whey) no viaja en el JSON.
      if ($p.Name -eq "pvp_sugerido" -and $o.publicar -eq $false) { continue }
      $n[$p.Name] = Limpiar $p.Value
    }
    return [PSCustomObject]$n
  }
  return $o
}

if (Test-Path $dist) { Get-ChildItem $dist -Force | Remove-Item -Recurse -Force }
New-Item -ItemType Directory -Force (Join-Path $dist "data"), (Join-Path $dist "public\packshots") | Out-Null

Copy-Item (Join-Path $root "index.html"), (Join-Path $root "robots.txt"), (Join-Path $root ".htaccess") $dist
Copy-Item -Recurse (Join-Path $root "assets") $dist
Copy-Item -Recurse (Join-Path $root "public\brand"), (Join-Path $root "public\og") (Join-Path $dist "public")
Copy-Item -Recurse (Join-Path $root "public\packshots\web") (Join-Path $dist "public\packshots")

$utf8 = New-Object System.Text.UTF8Encoding $false
Get-ChildItem (Join-Path $root "data\*.json") | ForEach-Object {
  $json = Get-Content $_.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
  $limpio = Limpiar $json | ConvertTo-Json -Depth 50 -Compress
  [IO.File]::WriteAllText((Join-Path $dist "data\$($_.Name)"), $limpio, $utf8)
}

# Netlify no lee .htaccess: estas reglas hacen lo mismo (código siempre fresco, imágenes en caché).
$headers = @"
/
  Cache-Control: no-cache, must-revalidate
/index.html
  Cache-Control: no-cache, must-revalidate
/assets/*
  Cache-Control: no-cache, must-revalidate
/data/*
  Cache-Control: no-cache, must-revalidate
/public/*
  Cache-Control: public, max-age=2592000
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
"@
[IO.File]::WriteAllText((Join-Path $dist "_headers"), $headers, $utf8)

$archivos = Get-ChildItem -Recurse -File $dist
Write-Host ("Listo: {0} archivos, {1:N1} MB en {2}" -f $archivos.Count, (($archivos | Measure-Object Length -Sum).Sum / 1MB), $dist)
