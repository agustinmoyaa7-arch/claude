<#
.SYNOPSIS
  Busca prospectos en Google Maps con Apify y deja un CSV listo para Google Sheets.

.EXAMPLE
  $env:APIFY_TOKEN = "apify_api_..."      # una vez por terminal; nunca en el repo
  .\buscar.ps1 -Zona cordoba -Max 10      # primera prueba barata
  .\buscar.ps1 -Zona sierras              # 40 lugares por rubro y ciudad
  .\buscar.ps1 -DesdeArchivo .\salida\crudo\*.json   # reprocesa sin gastar

  Funciona en Windows PowerShell 5.1 y en PowerShell 7.
#>
param(
  [string]$Zona,
  [ValidateRange(1, 500)][int]$Max = 40,
  [string[]]$DesdeArchivo,
  [switch]$IncluirVistos,  # no filtra los lugares ya exportados en corridas anteriores
  [switch]$Si              # no pide confirmación del costo
)

$ErrorActionPreference = "Stop"
$aqui = $PSScriptRoot
$cfg = Get-Content -Raw -Encoding UTF8 (Join-Path $aqui "config.json") | ConvertFrom-Json
$salida = Join-Path $aqui "salida"
$crudo = Join-Path $salida "crudo"
New-Item -ItemType Directory -Force -Path $crudo | Out-Null
$fecha = Get-Date -Format "yyyy-MM-dd"
$marca = Get-Date -Format "yyyy-MM-dd_HHmm"   # en los nombres de archivo: dos corridas el mismo día no se pisan
$utf8Bom = New-Object System.Text.UTF8Encoding($true)

# ---------------------------------------------------------------- Apify

# APIFY_API_URL solo existe para probar el script contra un servidor falso.
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12  # PowerShell 5.1
$apiApify = if ($env:APIFY_API_URL) { $env:APIFY_API_URL } else { "https://api.apify.com/v2" }

function Invoke-Apify([string]$Metodo, [string]$Ruta, $Cuerpo) {
  $pedido = @{
    Method  = $Metodo
    Uri     = "$apiApify$Ruta"
    Headers = @{ Authorization = "Bearer $env:APIFY_TOKEN" }
  }
  if ($Cuerpo) {
    $pedido.ContentType = "application/json; charset=utf-8"
    $pedido.Body = [System.Text.Encoding]::UTF8.GetBytes(($Cuerpo | ConvertTo-Json -Depth 5))
  }
  # Se decodifica a mano en UTF-8: PowerShell 5.1 puede leer las tildes mal si la respuesta no declara charset.
  $r = Invoke-WebRequest @pedido -UseBasicParsing
  [System.Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray()) | ConvertFrom-Json
}

function Buscar-Ciudad([string]$Ciudad) {
  # Sin reseñas, fotos ni detalle extra: cada uno de esos agregados se cobra aparte.
  $entrada = @{
    searchStringsArray        = @($cfg.rubros)
    locationQuery             = $Ciudad
    maxCrawledPlacesPerSearch = $Max
    language                  = "es"
    maxReviews                = 0
    maxImages                 = 0
    scrapePlaceDetailPage     = $false
  }
  $run = (Invoke-Apify POST "/acts/$($cfg.actor)/runs" $entrada).data
  Write-Host "  corrida $($run.id) lanzada" -ForegroundColor DarkGray
  $limite = (Get-Date).AddMinutes(30)
  do {
    Start-Sleep -Seconds 15
    $run = (Invoke-Apify GET "/actor-runs/$($run.id)").data
    Write-Host "  $($run.status)..." -ForegroundColor DarkGray
  } while ($run.status -in @("READY", "RUNNING") -and (Get-Date) -lt $limite)
  if ($run.status -ne "SUCCEEDED") { throw "La corrida de $Ciudad terminó en $($run.status). Revisala en console.apify.com." }
  $campos = "title,categoryName,searchString,address,city,phone,phoneUnformatted,website,totalScore,reviewsCount,placeId,url,location,permanentlyClosed,temporarilyClosed"
  $items = Invoke-Apify GET "/datasets/$($run.defaultDatasetId)/items?clean=true&format=json&fields=$campos"
  if (-not @($items).Count) { Write-Host "  sin resultados"; return @() }
  # Se guarda lo bajado: si algo falla después, se reprocesa con -DesdeArchivo sin volver a pagar.
  $nombre = ($Ciudad.Split(",")[0] -replace "[^\w]+", "-").ToLower()
  $archivo = Join-Path $crudo "$marca-$nombre.json"
  [System.IO.File]::WriteAllText($archivo, (ConvertTo-Json -InputObject @($items) -Depth 8), $utf8Bom)
  Write-Host "  $(@($items).Count) lugares -> $archivo"
  return $items
}

# ---------------------------------------------------------------- Teléfono

# Devuelve número nacional de 10 dígitos (área + abonado), tipo y link de WhatsApp.
function Normalizar-Telefono([string]$Crudo, [string]$Formateado) {
  $d = ($Crudo -replace "\D", "")
  if (-not $d) { $d = ($Formateado -replace "\D", "") }
  if (-not $d) { return $null }
  $movil = $false
  if ($d.StartsWith("00")) { $d = $d.Substring(2) }
  if ($d.StartsWith("54")) {
    $d = $d.Substring(2)
    if ($d.StartsWith("9")) { $movil = $true; $d = $d.Substring(1) }
  }
  elseif ($d.StartsWith("0")) { $d = $d.Substring(1) }
  # "0351 15-555-1234": el 15 va después del código de área (2 a 4 dígitos).
  if ($d.Length -eq 12) {
    foreach ($k in 2, 3, 4) {
      if ($d.Substring($k, 2) -eq "15") { $d = $d.Remove($k, 2); $movil = $true; break }
    }
  }
  if ($d.Length -ne 10) { return @{ tipo = "dudoso"; link = "" } }
  # Un fijo no tiene WhatsApp salvo que sea Business; si el link falla, es fijo.
  $tipo = if ($movil) { "movil" } else { "fijo" }
  return @{ tipo = $tipo; numero = $d; link = "https://wa.me/549$d" }
}

# ---------------------------------------------------------------- Puntaje

function Puntos-Rubro([string]$Texto) {
  $t = "$Texto".ToLower()
  $max = 0
  foreach ($p in $cfg.puntos_rubro.PSObject.Properties) {
    if ($t.Contains($p.Name) -and $p.Value -gt $max) { $max = $p.Value }
  }
  return $max
}

# Las reseñas son la mejor pista del tamaño: más movimiento, más empleados.
function Puntos-Resenas([int]$N) {
  if ($N -ge 2000) { return 20 }   # muy grande: suele tener RR.HH. o sistema propio
  if ($N -ge 500) { return 35 }
  if ($N -ge 100) { return 30 }
  if ($N -ge 20) { return 15 }
  return 5
}

$cadenas = @($cfg.excluir_cadenas | ForEach-Object { "(^|[^\p{L}])" + [regex]::Escape($_.ToLower()) + "($|[^\p{L}])" })
function Es-Cadena([string]$Nombre) {
  $n = $Nombre.ToLower()
  foreach ($c in $cadenas) { if ($n -match $c) { return $true } }
  return $false
}

# ---------------------------------------------------------------- CSV

# Evita que Sheets/Excel tomen texto como fórmula y escapa ';' y comillas.
function Celda($v) {
  if ($null -eq $v) { return "" }
  $s = [string]$v
  if ($s -match '^[=+\-@]' -and $s -notmatch '^-?\d+(,\d+)?$') { $s = "'" + $s }
  if ($s -match '[;"\r\n]') { $s = '"' + $s.Replace('"', '""') + '"' }
  return $s
}
# Sheets en es-AR usa coma decimal.
function Decimal($v) { if ($null -eq $v) { return "" }; return ([double]$v).ToString([System.Globalization.CultureInfo]::InvariantCulture).Replace(".", ",") }

# ================================================================ Inicio

if ($DesdeArchivo) {
  $items = @()
  $archivos = @(Get-Item $DesdeArchivo)
  if (-not $archivos.Count) { throw "No encontré archivos en: $DesdeArchivo" }
  foreach ($a in $archivos) {
    $texto = Get-Content -Raw -Encoding UTF8 $a.FullName
    if ($texto) { $items += ($texto | ConvertFrom-Json) }
  }
  if (-not $Zona) { $Zona = "archivo" }
}
else {
  if (-not $env:APIFY_TOKEN) { throw 'Falta el token. Corré primero: $env:APIFY_TOKEN = "apify_api_..." (console.apify.com > Settings > API & Integrations).' }
  $zonas = @($cfg.zonas.PSObject.Properties.Name)
  if (-not $Zona -or $Zona -notin $zonas) { throw "Elegí una zona con -Zona: $($zonas -join ', ')" }
  $ciudades = @($cfg.zonas.$Zona)
  $tope = $ciudades.Count * @($cfg.rubros).Count * $Max
  $usd = [math]::Round($tope * $cfg.usd_por_mil_lugares / 1000, 2)
  Write-Host "Zona $Zona : $($ciudades.Count) ciudades x $(@($cfg.rubros).Count) rubros x $Max lugares = hasta $tope lugares."
  Write-Host "Costo máximo estimado: USD $usd (suele ser menos: hay rubros con pocos resultados)." -ForegroundColor Yellow
  if (-not $Si) {
    $ok = Read-Host "¿Seguir? (s/n)"
    if ($ok -notin @("s", "si", "sí")) { Write-Host "Cancelado."; exit 0 }
  }
  $items = @()
  foreach ($c in $ciudades) {
    Write-Host "Buscando en $c"
    $items += Buscar-Ciudad $c
  }
}

$archivoVistos = Join-Path $salida "vistos.txt"
$vistos = New-Object "System.Collections.Generic.HashSet[string]"
if ((Test-Path $archivoVistos) -and -not $IncluirVistos) {
  foreach ($l in (Get-Content -Encoding UTF8 $archivoVistos)) { if ($l) { [void]$vistos.Add($l.Trim()) } }
}

$cuenta = @{ total = 0; repetidos = 0; ya_vistos = 0; cerrados = 0; cadenas = 0; sin_telefono = 0 }
$enEsta = New-Object "System.Collections.Generic.HashSet[string]"
$filas = @()
foreach ($it in $items) {
  $cuenta.total++
  $id = if ($it.placeId) { [string]$it.placeId } else { "$($it.title)|$($it.address)" }
  if (-not $enEsta.Add($id)) { $cuenta.repetidos++; continue }
  if ($vistos.Contains($id)) { $cuenta.ya_vistos++; continue }
  if ($it.permanentlyClosed -or $it.temporarilyClosed) { $cuenta.cerrados++; continue }
  if (Es-Cadena $it.title) { $cuenta.cadenas++; continue }
  $tel = Normalizar-Telefono $it.phoneUnformatted $it.phone
  if (-not $tel) { $cuenta.sin_telefono++; continue }

  $web = [string]$it.website
  $instagram = ""
  if ($web -match "instagram\.com") { $instagram = $web; $web = "" }

  $rubro = if ($it.categoryName) { $it.categoryName } else { $it.searchString }
  $puntos = [math]::Max((Puntos-Rubro $it.categoryName), (Puntos-Rubro $it.searchString))
  $puntos += Puntos-Resenas ([int]$it.reviewsCount)
  if ($tel.tipo -eq "movil") { $puntos += 15 } elseif ($tel.tipo -eq "fijo") { $puntos += 5 }
  if ($web -or $instagram) { $puntos += 10 }

  $link = ""
  if ($tel.link) {
    $texto = $cfg.mensaje_whatsapp.Replace("{nombre}", [string]$it.title)
    $link = $tel.link + "?text=" + [uri]::EscapeDataString($texto)
  }

  $filas += [pscustomobject]@{
    puntaje = [math]::Min($puntos, 100); nombre = $it.title; rubro = $rubro; ciudad = $it.city
    direccion = $it.address; telefono = ([string]$it.phone).TrimStart("+"); tipo_tel = $tel.tipo; whatsapp_link = $link
    web = $web; instagram = $instagram; rating = (Decimal $it.totalScore); resenas = $it.reviewsCount
    maps_url = $it.url; lat = (Decimal $it.location.lat); lng = (Decimal $it.location.lng)
    place_id = $id; fecha_scrap = $fecha
  }
}

$filas = @($filas | Sort-Object -Property @{ Expression = "puntaje"; Descending = $true }, @{ Expression = "nombre" })
$columnas = "puntaje", "nombre", "rubro", "ciudad", "direccion", "telefono", "tipo_tel", "whatsapp_link", "web", "instagram", "rating", "resenas", "maps_url", "lat", "lng", "place_id", "fecha_scrap"
$seguimiento = "estado", "fecha_contacto", "proximo_paso", "notas", "no_llame_ok"
$lineas = New-Object System.Collections.Generic.List[string]
$lineas.Add((($columnas + $seguimiento) -join ";"))
foreach ($f in $filas) {
  $valores = foreach ($c in $columnas) { Celda $f.$c }
  $lineas.Add(((@($valores) + @("nuevo", "", "", "", "")) -join ";"))
}
$resumen = "Descartados: {0} repetidos, {1} ya exportados antes, {2} cerrados, {3} cadenas, {4} sin teléfono (de {5} lugares)." -f `
  $cuenta.repetidos, $cuenta.ya_vistos, $cuenta.cerrados, $cuenta.cadenas, $cuenta.sin_telefono, $cuenta.total
if (-not $filas.Count) {
  Write-Host "No hay prospectos nuevos. $resumen" -ForegroundColor Yellow
  exit 0
}
$csv = Join-Path $salida "prospectos-$Zona-$marca.csv"
[System.IO.File]::WriteAllText($csv, ($lineas -join "`r`n"), $utf8Bom)

# Se marcan como vistos solo al exportar, para no contactarlos dos veces en la próxima corrida.
if (-not $DesdeArchivo) {
  [System.IO.File]::AppendAllText($archivoVistos, (($filas | ForEach-Object { $_.place_id }) -join "`r`n") + "`r`n", (New-Object System.Text.UTF8Encoding($false)))
}

Write-Host ""
Write-Host "Listo: $($filas.Count) prospectos -> $csv" -ForegroundColor Green
Write-Host $resumen
