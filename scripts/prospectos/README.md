# Prospección con Apify

Busca negocios en Google Maps por ciudad y rubro, saca duplicados, cadenas y cerrados, puntúa cada lead y deja un CSV para importar en Google Sheets. Los locales sin teléfono quedan al final de la lista, para visitar en persona.

## Una sola vez
1. Creá la cuenta en [apify.com](https://apify.com) (trae USD 5 gratis, que alcanzan para ~1.250 lugares).
2. Copiá el token: Settings → API & Integrations → Personal API token.

## Cada vez (PowerShell, desde esta carpeta)
```powershell
cd scripts\prospectos
$env:APIFY_TOKEN = "apify_api_..."        # dura lo que dura la terminal; nunca lo pegues en el repo ni en el chat
.\buscar.ps1 -Zona cordoba -Max 10        # primera prueba: ~USD 1
.\buscar.ps1 -Zona cordoba                # 40 lugares por rubro y ciudad (por defecto)
.\buscar.ps1 -Zona sierras
.\buscar.ps1 -Zona turisticas
```
Si Windows no deja correr scripts: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` (una vez).

Antes de gastar, muestra el costo máximo y pide confirmación (`-Si` la saltea).

| Opción | Para qué |
|---|---|
| `-Zona` | `cordoba`, `sierras` o `turisticas` (se editan en `config.json`). |
| `-Max` | Tope de lugares por rubro y ciudad. Más alto = más leads y más costo. |
| `-DesdeArchivo .\salida\crudo\*.json` | Reprocesa lo ya bajado sin pagar (por ejemplo, después de cambiar el puntaje o la lista de cadenas). |
| `-IncluirVistos` | No descarta los lugares ya exportados en corridas anteriores. Usalo con `-DesdeArchivo` para regenerar un CSV que ya habías sacado. |

## Qué deja en `salida/` (no se sube a git)
- `prospectos-<zona>-<fecha_hora>.csv`: los leads nuevos, ordenados por puntaje.
- `crudo/`: lo que devolvió Apify, por ciudad. Sirve para reprocesar sin pagar.
- `vistos.txt`: los lugares ya exportados. La próxima corrida los saltea para que no los contactes dos veces. Si lo borrás, vuelven a salir todos.

## Puntaje (0 a 100)
- **Rubro** (hasta 40): parrilla, restaurante y hotel puntúan más que almacén. Se ajusta en `puntos_rubro`.
- **Reseñas** (hasta 35): sirven como pista del tamaño. 500 a 2.000 reseñas es el punto ideal; más de 2.000 baja, porque suele ser un local grande con RR. HH. propio.
- **Teléfono**: +15 si es celular, +5 si es fijo.
- **Web o Instagram**: +10.

`tipo_tel`: `movil` (el link de WhatsApp debería andar), `fijo` (probá el link; si WhatsApp dice que no existe, llamá o visitá), `dudoso` (número raro, sin link) o `sin_tel` (solo para visitar).

## Armar el Google Sheet
1. Sheets → Archivo → Importar → Subir el CSV → "Insertar nuevas hojas" → separador **punto y coma**.
2. Columna `estado`: Datos → Validación de datos → Desplegable con `nuevo, contactado, respondió, demo, piloto, descartado`.
3. Datos → Crear un filtro. Filtrá por `ciudad` para armar los recorridos de visita y por `estado = nuevo` para la tanda de WhatsApp del día.
4. Para sumar una corrida nueva, importala con "Agregar a la hoja actual": no trae repetidos gracias a `vistos.txt`.

## WhatsApp y la ley
El link `whatsapp_link` abre el chat con el mensaje de `config.json` (`mensaje_whatsapp`) ya cargado con el nombre del local. Plantillas y guion de visita: `mensajes.md`.
La Ley 26.951 (Registro No Llame) también alcanza a WhatsApp comercial. Mandá uno a uno y en pocas cantidades. Antes de escalar, pedí el acceso al registro en la AAIP ([nollame.aaip.gob.ar](https://nollame.aaip.gob.ar)), chequeá los números y marcá `no_llame_ok`. La visita en persona no tiene esta restricción.
