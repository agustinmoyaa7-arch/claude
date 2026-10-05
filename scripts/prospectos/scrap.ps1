<#
.SYNOPSIS
  Menú para buscar comercios: pregunta dónde, qué rubros y cuántos lugares, y corre buscar.ps1.
  La primera vez pide el token de Apify y lo guarda cifrado para tu usuario de Windows.

.EXAMPLE
  Doble clic en scrap.cmd
  .\scrap.ps1
  .\scrap.ps1 -CambiarToken     # para cargar otro token
#>
param([switch]$CambiarToken)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"   # sin barra de descarga (en PowerShell 5.1 además la hace lenta)
$aqui = $PSScriptRoot
$cfg = Get-Content -Raw -Encoding UTF8 (Join-Path $aqui "config.json") | ConvertFrom-Json
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
$apiApify = if ($env:APIFY_API_URL) { $env:APIFY_API_URL } else { "https://api.apify.com/v2" }

# ---------------------------------------------------------------- Token

# Se guarda con DPAPI de Windows: solo tu usuario, en esta PC, lo puede descifrar. Nunca va al repo.
$carpetaToken = Join-Path $(if ($env:APPDATA) { $env:APPDATA } else { Join-Path $HOME ".config" }) "MiTeam"
$archivoToken = Join-Path $carpetaToken "apify-token.txt"

function Texto-Plano([securestring]$Seguro) {
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Seguro)
  try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

function Token-Valido([string]$Token) {
  try {
    Invoke-WebRequest -UseBasicParsing -Uri "$apiApify/users/me" -Headers @{ Authorization = "Bearer $Token" } | Out-Null
    return $true
  }
  catch { return $false }
}

function Pedir-Token {
  Write-Host ""
  Write-Host "Necesito tu token de Apify (console.apify.com > Settings > API & Integrations)."
  Write-Host "Pegalo con clic derecho y Enter. No se ve en pantalla y queda guardado cifrado."
  while ($true) {
    $seguro = Read-Host "Token" -AsSecureString
    $plano = (Texto-Plano $seguro).Trim()
    if (-not $plano) { continue }
    if (Token-Valido $plano) {
      New-Item -ItemType Directory -Force -Path $carpetaToken | Out-Null
      ConvertTo-SecureString $plano -AsPlainText -Force | ConvertFrom-SecureString | Set-Content -Encoding ASCII $archivoToken
      Write-Host "Token guardado." -ForegroundColor Green
      return $plano
    }
    Write-Host "Apify no aceptó ese token. Copialo de nuevo y probá otra vez." -ForegroundColor Yellow
  }
}

function Cargar-Token {
  if ($CambiarToken -or -not (Test-Path $archivoToken)) { return Pedir-Token }
  try { $plano = Texto-Plano (Get-Content $archivoToken | ConvertTo-SecureString) }
  catch { return Pedir-Token }   # guardado en otra PC u otro usuario
  if (Token-Valido $plano) { return $plano }
  Write-Host "El token guardado ya no funciona (¿lo cambiaste en Apify?)." -ForegroundColor Yellow
  return Pedir-Token
}

# ---------------------------------------------------------------- Menú

function Elegir-Numeros([string]$Pregunta, [int]$Hasta) {
  while ($true) {
    $r = Read-Host $Pregunta
    $nums = @($r -split "[,;\s]+" | Where-Object { $_ } | ForEach-Object { $_ -as [int] })
    $malos = @($nums | Where-Object { $null -eq $_ -or $_ -lt 0 -or $_ -gt $Hasta })
    if ($nums.Count -and -not $malos.Count) { return $nums }
    Write-Host "Escribí números de la lista, separados por coma (ej: 1,3)." -ForegroundColor Yellow
  }
}

function Con-Pais([string]$Ciudad) {
  $c = $Ciudad.Trim()
  if ($c -notmatch "Argentina") { $c = "$c, Argentina" }
  return $c
}

Write-Host ""
Write-Host "=== MiTeam · Buscar comercios ===" -ForegroundColor Cyan
$token = Cargar-Token

# Dónde
$zonas = @($cfg.zonas.PSObject.Properties.Name)
Write-Host ""
Write-Host "¿Dónde querés buscar?"
for ($i = 0; $i -lt $zonas.Count; $i++) {
  $lista = ($cfg.zonas.($zonas[$i]) | ForEach-Object { $_.Split(",")[0] }) -join ", "
  Write-Host ("  {0}) {1}: {2}" -f ($i + 1), $zonas[$i], $lista)
}
$otra = $zonas.Count + 1
Write-Host "  $otra) Otra ciudad (la escribís vos)"
do { $donde = (Elegir-Numeros "Elegí un número" $otra)[0] } while ($donde -lt 1)

$parametros = @{}
if ($donde -eq $otra) {
  $texto = ""
  while (-not $texto.Trim()) { $texto = Read-Host "Ciudad (ej: Río Cuarto, Córdoba). Para varias, separalas con ;" }
  $ciudades = @($texto -split ";" | Where-Object { $_.Trim() } | ForEach-Object { Con-Pais $_ })
  $parametros.Ciudades = $ciudades
  $parametros.Nombre = $ciudades[0].Split(",")[0].Trim()
}
else {
  $parametros.Zona = $zonas[$donde - 1]
}

# Qué rubros
Write-Host ""
Write-Host "¿Qué rubros?"
Write-Host "  0) Todos los de la lista"
$rubrosCfg = @($cfg.rubros)
for ($i = 0; $i -lt $rubrosCfg.Count; $i++) { Write-Host ("  {0}) {1}" -f ($i + 1), $rubrosCfg[$i]) }
$otroRubro = $rubrosCfg.Count + 1
Write-Host "  $otroRubro) Otro (lo escribís vos)"
$elegidos = Elegir-Numeros "Números separados por coma (ej: 1,2,8)" $otroRubro
if ($elegidos -notcontains 0) {
  $rubros = @($elegidos | Where-Object { $_ -ne $otroRubro } | ForEach-Object { $rubrosCfg[$_ - 1] })
  if ($elegidos -contains $otroRubro) {
    $extra = Read-Host "Rubros (ej: gimnasio; farmacia)"
    $rubros += @($extra -split ";" | ForEach-Object { $_.Trim() } | Where-Object { $_ })
  }
  if (-not $rubros.Count) { throw "No elegiste ningún rubro." }
  $parametros.Rubros = $rubros
}

# Cuántos
Write-Host ""
$max = Read-Host "¿Cuántos lugares por rubro y ciudad? (Enter = 20; más = más resultados y más costo)"
$parametros.Max = if (($max -as [int]) -ge 1) { [math]::Min([int]$max, 500) } else { 20 }

# A buscar: el token vive solo mientras corre esta ventana.
Write-Host ""
$env:APIFY_TOKEN = $token
$inicio = Get-Date
try { & (Join-Path $aqui "buscar.ps1") @parametros }
finally { Remove-Item Env:\APIFY_TOKEN -ErrorAction SilentlyContinue }

$nuevo = Get-ChildItem (Join-Path $aqui "salida") -Filter "prospectos-*.csv" -ErrorAction SilentlyContinue |
  Where-Object { $_.LastWriteTime -ge $inicio } | Sort-Object LastWriteTime | Select-Object -Last 1
if ($nuevo) {
  Write-Host ""
  Write-Host "Subí este archivo a Google Sheets: $($nuevo.Name)" -ForegroundColor Green
  if ($env:OS -eq "Windows_NT") { Invoke-Item (Split-Path $nuevo.FullName) }   # abre la carpeta
}
