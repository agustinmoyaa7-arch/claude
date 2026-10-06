# MiTeam · contexto completo para otro chat

> Pegá este archivo al inicio de un chat nuevo. Estado al **5 de octubre de 2026**.
> Moneda: ARS salvo que diga USD. Huso horario: `America/Argentina/Buenos_Aires`.
> Qué hace la app por dentro (pantallas, reglas, qué prometer y qué no): `docs/APP-MITEAM.md`.
> Detalle técnico extra en el repo: `README.md`, `docs/CONTEXTO-SESION.md`, `docs/DOMINIO-HOSTING.md`, `scripts/prospectos/README.md`.

---

## 1. Quién es y cómo trabajar con él

- **Agustín Moya**, Córdoba (Argentina). Su empresa/marca paraguas es **New Wave**; el producto se llama **MiTeam**.
- Hablarle en **español rioplatense, con voseo**. Directo, sin relleno, respuestas cortas.
- Decide mirando números. Quiere output accionable, rankeado y con próximos pasos.
- **No es programador avanzado.** Cuando hay que tocar la PC: **un paso por vez**, comandos listos para copiar y pegar, explicando qué va a ver. Si se le da todo junto, se pierde ("no entiendo").
- PC: **Windows + PowerShell** (no como administrador). Su Escritorio está en OneDrive: `C:\Users\agust\OneDrive\Desktop`. El repo clonado está en `C:\Users\agust\OneDrive\Desktop\miteam`. Scripts solo en `.ps1`.
- Primero una versión que funcione, después se expande. Lo estético lo define él: mostrarle opciones.
- **Nunca pedirle claves ni tokens por chat.** Van en archivos locales cifrados o en las variables de entorno del hosting.

---

## 2. El producto

| Tema | Decisión |
|---|---|
| Qué es | App de **fichaje de personal** para PyMEs: gastronomía, hotelería y comercio de 5 a 50 empleados. |
| Modelo | **SaaS multi-tenant**: una sola app y una sola base. Cada cliente es una fila de `empresas` y todo lleva `empresa_id`. Cada cliente se registra solo (self-serve) y Agustín administra todo como **superadmin**. |
| Posicionamiento | "Dejá la planilla". Simple, rápido de instalar, soporte directo de Agustín, precio en pesos. No competir en funciones con GeoVictoria ni Fichap. |
| Diferencial | **Cuadro semanal (plan) contra el fichaje real**: tardanzas, ausencias y horas extra. El kiosco con código es lo básico. |
| Cómo se ficha | El empleado ingresa un código de 4 a 6 dígitos en una tablet o PC del local (modo kiosco). Sin hardware nuevo y sin biometría (dato sensible, Ley 25.326). |
| App | **PWA** (sin tiendas). El dueño instala el panel `/app` en el celular; el local instala el kiosco `/kiosco` en la tablet. |
| Prueba gratis | 14 días (`empresas.prueba_hasta`). |
| Clientes actuales | **Maga** y **El Pirata** (Villa Carlos Paz) tienen apps propias más viejas en producción. **No tocarlas.** Migrarlos después como empresas 0 y 1, con una semana fichando en paralelo. Pendiente: su permiso para nombrarlos como casos. |

**Precios: no están cerrados.** Propuesta: Gratis (3 empleados), Básico $18.000 (10), Medio $35.000 (25), Grande $60.000 (50). Alternativa: un plan único de ~$25.000/mes al principio.

**Temporada:** producto listo en noviembre; vender de fines de noviembre al 10/12; desde el 16/12 implementar y dar soporte. Ofrecer prepago de diciembre a marzo.

**Hitos para decidir si seguir:**
1. Mediados de noviembre: 3 pilotos con seña.
2. 10/12: con 8 a 10 clientes se sigue; con 3 o 4 queda como producto chico de nicho.
3. Tope de ~100 horas de trabajo antes del primer pago.

**Números de referencia (sin validar):**
- Neto por cliente a $25.000: ~$23.500 después de Mercado Pago.
- Costos fijos: ~USD 45/mes con clientes.
- Hacen falta ~36 a 40 clientes para cubrir los gastos personales (~$848.000/mes).
- Churn esperable: 3 a 8% mensual.

---

## 3. Código

- **Repo:** `https://github.com/agustinmoyaa7-arch/claude`.
  - **`main`** es la rama de **producción**: lo que llega ahí es lo que Hostinger publica (cuando esté configurado).
  - **`claude/charming-turing-gzlb8d`** es la rama de trabajo de la última sesión. Hoy es igual a `main`.
- **Stack:** Next.js **16** (App Router) + React 19 + Tailwind 4 + Supabase (Postgres + Auth + RLS).
  - **Ojo:** esta versión de Next tiene cambios grandes. `middleware` ahora es **`proxy.ts`**. Antes de escribir código, leer las guías en `node_modules/next/dist/docs/` (lo pide `AGENTS.md`).
  - Requiere Node >= 20.9.

### Base de datos (`supabase/migrations/`)
- **`0001_core_multitenant.sql`**: `planes`, `empresas`, `miembros` (dueño/encargado), `superadmins`, `sedes`, `empleados`, `dispositivos` (token del kiosco guardado como hash), `fichajes` (entrada/salida; se anulan, nunca se borran), `horarios` (cuadro semanal), `suscripciones`, `audit_logs`.
  - **RLS en todas las tablas** y claves foráneas compuestas `(id, empresa_id)`: imposible mezclar datos de dos empresas.
  - Límite de empleados según el plan. Cuenta `vencida` = solo lectura (el kiosco sigue fichando); `suspendida` o `cancelada` = el kiosco rechaza.
  - `crear_empresa()` hace el alta self-serve. `fichar()` solo lo ejecuta el servidor (`service_role`).
- **`0002_reporte_plan_vs_real.sql`**: `reporte_plan_vs_real(empresa, desde, hasta, tolerancia=10)`. Estados: ok, tarde, salida_anticipada, extra, ausente, pendiente, sin_salida, en_curso, franco_trabajado. Soporta turnos que cruzan la medianoche.
- **Pruebas:** `PGPASSWORD=postgres bash supabase/tests/run.sh` corre 38 chequeos de aislamiento entre empresas, permisos, plan, auditoría y reporte. Pasan todos.

### Pantallas
- `/`: landing mínima (a reemplazar por la web nueva, ver sección 6).
- `/login`: alta y entrada.
- `/app`: panel con empleados, kiosco y últimos fichajes.
- `/app/horarios`: cuadro semanal.
- `/app/reporte`: plan vs. real, con descarga CSV (`;` y BOM, abre bien en Excel).
- `/kiosco`: teclado para el código.
- `/api/fichar`.
- PWA: manifiestos en `/pwa/panel` y `/pwa/kiosco`; íconos provisorios (una "M") en `/pwa/icono/192|512`; nombre en `lib/pwa.ts`.

### Estado
- Lint y build OK. Se simuló la compilación standalone de Hostinger: la app, `proxy.ts` y los manifiestos responden.
- **Nunca se probó contra un Supabase real ni con datos reales.**

### Limitaciones conocidas
- Un solo turno por día en el cuadro.
- No se pueden editar ni anular fichajes desde el panel.
- **No existe la página que procesa el link de confirmación del mail de alta.** Hasta que exista, desactivar "Confirm email" en Supabase.

### Otras apps (referencia, no se tocan)
- **El Pirata** (`ProfMoya/Fichaje-ElPirataVCP`): mucho más completa que el esqueleto (panel con correcciones, bonos, costo laboral, exportes, PIN con HMAC), pero **no es multi-tenant**. El repo estaba público con un admin por defecto en `schema.sql`: verificar que se cambió y pasarlo a privado.
- **Maga:** pendiente de revisar.
- **Decisión abierta:** usar El Pirata como base y pasarla a multi-tenant, o seguir con el esqueleto. Ver `docs/CONTEXTO-SESION.md` §4.

---

## 4. Dominio y hosting (pendiente: lo hace "luego")

- **Dominio:** **`miteam.online`**, comprado en Hostinger. No es `.com`. Renueva a ~USD 36/año; antes de renovar, evaluar comprar `miteam.com` y redirigir.
- **Hosting:** Agustín compró **Hostinger Premium/Single**, que **no corre Next.js** (solo PHP o páginas estáticas).
  - **Decidió pasar a Business**, que trae "Node.js Web Apps" y deploy desde GitHub. Renueva a ~USD 17/mes.
  - Los nameservers ya son de Hostinger (`lunar` y `solar.dns-parking.com`).
  - El servidor hoy está en EE. UU.: moverlo a **Brasil**.
- **Pasos completos en `docs/DOMINIO-HOSTING.md`:**
  1. Mejorar el plan a Business.
  2. Mover el servidor a Brasil.
  3. Crear el correo `hola@miteam.online`.
  4. Crear el **Supabase de producción** (São Paulo):
     - correr las migraciones `0001` y `0002`;
     - Site URL `https://miteam.online`;
     - SMTP `smtp.hostinger.com:465` con `hola@`;
     - desactivar "Confirm email".
  5. Node.js App:
     - repo `agustinmoyaa7-arch/claude`, rama **`main`**, Node 22, `npm ci` / `npm run build`;
     - cargar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` **antes del primer deploy**;
     - asignar el dominio.
  6. Darse de alta como superadmin: `insert into superadmins (user_id) values ('<uuid>');`.
- **Costos:** ~USD 3 a 4,5/mes ahora; ~USD 45/mes con clientes (Hostinger Business renovado + Supabase Pro USD 25 + dominio).
- **Netlify y Vercel quedaron descartados para MiTeam.** Vercel Hobby, además, prohíbe el uso comercial.

---

## 5. Prospección de clientes (funcionando)

Carpeta `scripts/prospectos/`. Usa **Apify** (actor `compass/crawler-google-places`, ~USD 4 cada 1.000 lugares; la cuenta trae USD 5 gratis).

- **`scrap.cmd`** (doble clic) abre `scrap.ps1`, un menú que pregunta:
  - zona (`cordoba`, `sierras`, `turisticas`) u otra ciudad escrita a mano;
  - rubros (todos, algunos o uno escrito a mano);
  - cantidad por rubro (Enter = 20).
- **El token de Apify** se pide la primera vez, se valida y se guarda **cifrado con DPAPI** en `%APPDATA%\MiTeam\apify-token.txt`. Cambiarlo: `.\scrap.ps1 -CambiarToken`.
- **`buscar.ps1`** hace el trabajo y también se puede usar directo (`-Zona`, `-Ciudades`, `-Rubros`, `-Max`, `-DesdeArchivo` para reprocesar sin pagar, `-IncluirVistos`). Proceso:
  1. Busca por ciudad y rubro.
  2. Saca repetidos, cerrados y cadenas (lista en `config.json`).
  3. Puntúa de 0 a 100 (rubro, reseñas como pista del tamaño, celular, web).
  4. Normaliza el teléfono argentino y arma el link `wa.me` con el primer mensaje.
  5. Deja `salida/prospectos-<zona>-<fecha_hora>.csv` (`;` y BOM).
  6. Los locales sin teléfono quedan al final como `sin_tel`, para visitar en persona.
  7. `salida/vistos.txt` evita contactar dos veces al mismo local.
  8. `salida/` no se sube a git.
- **`config.json`**: zonas, ciudades, rubros, puntos por rubro, cadenas excluidas y mensaje de WhatsApp.
- **`mensajes.md`**: 3 mensajes de WhatsApp y el guion de visita.
- **Primera corrida real** (Córdoba + Carlos Paz, 10 por rubro, ~USD 1): 240 lugares, de los que quedaron **177 con teléfono + 58 sin teléfono**. Ya está importada en un **Google Sheet** con desplegable de estado y filtro.
- **Canales:** WhatsApp manual (15 a 20 por día, uno a uno) y visitas.
  - **Ley 26.951 (Registro No Llame):** alcanza a WhatsApp comercial. Consultar el registro antes de escalar (columna `no_llame_ok`).
- **Próximo:** correr la zona `cordoba` completa (más lugares), después `sierras` y `turisticas`. Puede hacer falta cargar saldo en Apify.
- **Ojo:** la sesión en la nube de Claude **no llega a Apify ni a Google Maps** (la red lo bloquea). Agustín lo corre en su PC.

---

## 6. En curso: la web (landing)

- Agustín dejó un **modelo de web** en `C:\Users\agust\OneDrive\Desktop\Base` y quiere que se edite con toda la información del sistema de fichaje.
- Un chat en la nube no ve su PC. Se le indicó subirlo al repo en una rama aparte:
  ```powershell
  cd "C:\Users\agust\OneDrive\Desktop\miteam"
  git checkout -b web-base
  robocopy "..\Base" ".\web-base" /E /XD node_modules .git .next dist build
  git add web-base
  git commit -m "Modelo de web base"
  git push -u origin web-base
  ```
- **Todavía no se vio el modelo.** Cuando esté:
  1. Revisar qué tecnología usa (HTML suelto, React, otro).
  2. Proponer cómo encaja: como la página `/` de la app en `miteam.online`, o aparte.
  3. Llenarla con: qué es MiTeam, el problema ("dejá la planilla"), cómo funciona (kiosco con código, cuadro semanal, reporte de tardanzas, ausencias y extras, Excel para el contador), sin hardware nuevo, prueba de 14 días, precios (pendientes) y contacto por WhatsApp y `hola@miteam.online`.
  4. Mostrarle opciones de estética antes de cerrar.

---

## 7. Pendientes, en orden

1. **Web:** recibir el modelo `Base` y editarlo (sección 6).
2. **Prospección:** completar Córdoba, Sierras y turísticas; contactar y anotar en el Sheet.
3. **Hosting:** pasar a Hostinger Business y seguir `docs/DOMINIO-HOSTING.md` hasta tener `miteam.online` andando.
4. **Página de confirmación del mail de alta**, para volver a activar "Confirm email".
5. Editar o anular fichajes desde el panel (cargar una salida olvidada), con auditoría.
6. Panel maestro de superadmin: lista de empresas, estados, MRR.
7. Mercado Pago: webhook que actualiza `suscripciones` y `empresas.estado`.
8. Precios definitivos.
9. Términos de uso y política de datos (Ley 25.326) antes del primer cliente externo.
10. Logo e íconos definitivos.
11. Validar la marca MiTeam en el INPI.
12. Migrar Maga y El Pirata como empresas 0 y 1.

## 8. Alertas

- No usar las bases de producción de Maga ni de El Pirata para desarrollar.
- Claves (`service_role`, token de Apify) **nunca** en el repo ni en el chat.
- Si Agustín pegó el token de Apify en PowerShell, borrar esa línea del historial:
  ```powershell
  $h = (Get-PSReadLineOption).HistorySavePath
  (Get-Content $h) | Where-Object { $_ -notmatch 'apify_api_' } | Set-Content $h
  ```
- Revisar que el acuerdo con Maga y El Pirata permita reutilizar su código comercialmente.
