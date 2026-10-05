# Contexto de traspaso · MiTeam (SaaS multi-tenant de New Wave)

> Para retomar en una sesión nueva de Claude Code en local.
> Actualizado: 5 de octubre de 2026. Moneda: ARS salvo que diga USD.
> Contexto personal y de negocio completo: `contexto-fichaje-agustin-moya.md` (documento aparte de Agustín).

---

## 1. Cómo trabajar con Agustín (resumen)

- Español rioplatense con voseo. Directo, sin relleno, respuestas cortas.
- Output accionable y rankeado, con próximos pasos. Decide mirando números.
- Windows + VS Code + PowerShell (prefiere terminal). Scripts: solo `.ps1`.
- Deploy habitual: `git add . && git commit && git push` → Netlify.
- Primero una versión que funcione, después expandir. En desarrollo, Claude gestiona y consulta solo lo esencial.
- Lo estético lo define él: mostrar opciones.
- Formato es-AR. Huso `America/Argentina/Buenos_Aires`.

---

## 2. Qué se decidió

| Tema | Decisión |
|---|---|
| Producto | App de fichaje de personal para PyMEs (gastronomía, hotelería, comercio de 5 a 50 empleados). |
| Modelo | **SaaS multi-tenant**: una sola app, una sola base, cada cliente es una fila de `empresas`; todo lleva `empresa_id`. No se copia la app por cliente. |
| Posicionamiento | "Dejá la planilla". Simple, rápido de instalar, soporte directo de Agustín, precio en pesos. No competir en funciones con GeoVictoria/Fichap. |
| Diferencial real | Cuadro semanal (plan) vs. fichaje real: tardanzas, ausencias, extras. El kiosco con PIN es lo básico, no el diferencial. |
| Hardware | Ninguno al inicio: PC o tablet que el cliente ya tiene, en modo kiosco. |
| Biometría | No en el MVP (dato sensible, Ley 25.326). |
| Temporada | Producto listo en noviembre; vender fines de nov a 10/12; desde el 16/12 (vacaciones de Agustín) implementar y dar soporte. Ofrecer prepago dic–mar. |
| Riesgo con clientes actuales | **No tocar la app de Maga en producción.** Construir en paralelo, base de Supabase separada, migrar con una semana en paralelo. |
| Ley 25.326 | Pendiente de revisar antes del primer cliente externo. |

### Precios en discusión
El documento de contexto propone: Gratis (3 empleados) · Básico $18.000 (10) · Medio $35.000 (25) · Grande $60.000 (50). También se habló de un plan único de ~$25.000/mes al principio. **No está cerrado.**

### Hitos de validación (decidir si seguir)
1. Fin de octubre: base multi-tenant + cuadro semanal; Maga y El Pirata migrados.
2. Mediados de noviembre: 3 pilotos con seña. Si no hay, el nicho no responde.
3. 10/12: 8–10 clientes → seguir. 3–4 → producto chico de nicho.
- Tope: ~100 horas antes de ver el primer pago.

### Números de referencia (estimaciones, no validadas)
- Neto por cliente a $25.000: ~$23.500 tras Mercado Pago (~6% con IVA).
- Costos fijos: ~USD 45/mes (Supabase Pro + hosting Hostinger Business ~USD 17/mes al renovar + dominio).
- Para cubrir gastos fijos personales (~$848.000/mes) hacen falta ~36–40 clientes.
- Churn esperable en SaaS PyME LatAm: 3–8% mensual; los comercios de temporada cancelan en marzo.

---

## 3. Las tres bases de código

### A) Esqueleto multi-tenant nuevo (hecho en la sesión en la nube)
- Repo: `https://github.com/agustinmoyaa7-arch/claude`, rama `claude/competitive-analysis-argentina-qfz3j6`.
- Next.js 16 (App Router; ojo: `middleware` ahora es `proxy.ts`) + Supabase Auth + RLS.
- `supabase/migrations/0001_core_multitenant.sql`: `planes`, `empresas`, `miembros` (dueño/encargado), `superadmins`, `sedes`, `empleados`, `dispositivos` (token de kiosco guardado como hash), `fichajes` (eventos entrada/salida, se anulan, no se borran), `horarios` (cuadro semanal), `suscripciones`, `audit_logs`.
  - RLS en todas las tablas; FK compuestas `(id, empresa_id)` para que no se mezclen empresas; límite de empleados por plan; cuenta `vencida` = solo lectura (el kiosco sigue fichando); `suspendida/cancelada` = el kiosco rechaza.
  - `crear_empresa()` para el alta self-serve; `fichar()` solo ejecutable por `service_role`.
- `supabase/migrations/0002_reporte_plan_vs_real.sql`: función `reporte_plan_vs_real(empresa, desde, hasta, tolerancia=10)`. Estados: ok, tarde, salida_anticipada, extra, ausente, pendiente, sin_salida, en_curso, franco_trabajado. Soporta turnos que cruzan medianoche.
- Pantallas: `/login`, `/app` (panel), `/app/horarios` (grilla semanal), `/app/reporte` (+ CSV con `;` y BOM para Excel), `/kiosco` (teclado PIN), `/api/fichar`.
- Pruebas: `PGPASSWORD=postgres bash supabase/tests/run.sh` (Postgres local con un shim que imita Supabase). **38 pruebas pasan**: aislamiento entre empresas, permisos, plan, auditoría, reporte.
- Lint y build OK. **Nunca se probó contra un Supabase real ni en navegador con datos.**
- Limitaciones: un turno por día en el cuadro; el turno pertenece al día de la entrada; falta editar/anular fichajes desde el panel.

### B) App de El Pirata (revisada, no modificada)
- Repo: `https://github.com/ProfMoya/Fichaje-ElPirataVCP` (estaba **público**; se pidió pasarlo a privado).
- Next.js 16 + React 19 + Tailwind 4 + Supabase + Netlify. pnpm.
- **Mucho más completa que el esqueleto A:**
  - Kiosco con PIN de 4 dígitos; el empleado puede ver sus horas del día, semana y mes.
  - Panel `/admin` (~1.500 líneas): ABM de empleados, corrección de fichajes olvidados (marcados como `corregido`), historial filtrable, bonos/descuentos (`adjustments`), salario por hora, costo laboral, cierre de mes, export CSV/Excel/PDF.
  - Horario cortado (varios fichajes por día; el README dice "un par por día", está desactualizado).
  - Turno nocturno guardado en minutos > 1440 (`01:30 +1`). Huso horario centralizado en `lib/tz.ts`: leerlo antes de tocar fechas.
  - Seguridad: PIN con HMAC-SHA256 (`PIN_PEPPER`), contraseña de admin con bcrypt dentro de Postgres, cookie de sesión firmada (`SESSION_SECRET`), rate limit en memoria.
  - Pruebas: `pnpm test`. Las de lógica (41) pasan; las del kiosco necesitan dependencias instaladas.
- **No es multi-tenant:** ninguna tabla tiene `empresa_id`. Usa `service_role` en el servidor para todo (RLS activo sin políticas).
- Tablas: `employees`, `punches` (`day`, `in_min`, `out_min`, `edited`), `adjustments`, `admins`.

### C) App de Maga (pendiente de revisar)
- Next.js + Supabase + Netlify. Una entrada y una salida por día. "Panel MAGA" para editar fichajes y ABM de empleados.
- Pedido de Maga: no tiene forma de hacer control cruzado (no tiene planilla de horarios para comparar). Lo resuelve el cuadro semanal + reporte plan vs. real.
- **Próximo paso de esta sesión: descargar el repo de Maga y revisarlo.**

---

## 4. Recomendación vigente

Usar como base del producto la app **más completa** (hoy: El Pirata; confirmar después de ver Maga) y pasarla a multi-tenant, en vez de seguir con el esqueleto A:

1. Agregar `empresa_id` a todas sus tablas, con FK compuestas, planes y estados de cuenta (tomar el diseño de `0001_core_multitenant.sql`).
2. La sesión del admin lleva la empresa; todo el acceso a datos la exige en un solo lugar (`lib/repo.ts`).
3. Traer el cuadro semanal y el reporte plan vs. real del esqueleto A.
4. Traer las pruebas de aislamiento entre empresas y hacerlas obligatorias.
5. Recién después: panel maestro de New Wave, webhook de Mercado Pago, alta self-serve.

**Riesgo de diseño a decidir:** la app de El Pirata usa `service_role` (ignora RLS). En multi-tenant el aislamiento queda en el código: un filtro olvidado muestra datos de un cliente a otro. Opciones:
- Mantener `service_role` + capa única de acceso + pruebas de aislamiento (más rápido).
- Migrar a Supabase Auth + RLS por empresa como en el esqueleto A (más seguro, más trabajo).

---

## 5. Alertas abiertas

- **Repo de El Pirata público:** el `schema.sql` deja ver el admin inicial `admin` / `cambiar123`. Verificar que en producción se haya cambiado. Pasar el repo a privado.
- No se revisó el historial completo de commits de El Pirata (clon superficial). Si alguna vez se subió un `.env`, rotar claves (`PIN_PEPPER` invalida todos los PIN).
- **Propiedad del código:** El Pirata y Maga son desarrollos para clientes (El Pirata tiene su logo). Revisar que el acuerdo permita reutilizarlo comercialmente.
- Nunca usar la base de producción de Maga o El Pirata para desarrollar. Proyecto de Supabase **nuevo** para desarrollo.
- Claves (`service_role`, `PIN_PEPPER`, `SESSION_SECRET`) solo en `.env.local` o en las variables de entorno del hosting (Hostinger para MiTeam). Nunca en el repo ni en el chat.

---

## 6. Próximos pasos (en orden)

1. Clonar el repo de Maga en local (en una carpeta nueva, no sobre la de producción).
2. Revisar su estructura, tablas y pantallas. Compararla con El Pirata y con el esqueleto A.
3. Decidir la base del producto y el modelo de seguridad (sección 4).
4. Crear el proyecto de Supabase de desarrollo.
5. Pasar la base elegida a multi-tenant y traer el cuadro semanal + reporte.
6. Plan de migración de Maga y El Pirata como empresas 0 y 1, con una semana fichando en paralelo.

### Para clonar el esqueleto A en Windows
```powershell
cd $HOME\Desktop
git clone -b claude/competitive-analysis-argentina-qfz3j6 https://github.com/agustinmoyaa7-arch/claude.git newwave-fichaje
cd newwave-fichaje
npm install
```
(No correr PowerShell como administrador: arranca en `C:\WINDOWS\system32` y no deja crear carpetas.)

---

## 7. Pendientes de negocio

- **Decidido (5/10):** nombre **MiTeam**, dominio **miteam.online** (comprado en Hostinger; renueva a ~USD 36/año, evaluar `miteam.com` antes de renovar). Validar marca en INPI.
- **Hosting:** Hostinger **Business** con Node.js Web Apps (el Premium que se compró primero no corre Next.js). Deploy automático desde la rama **`main`** de `agustinmoyaa7-arch/claude`. Correo `hola@miteam.online` en Hostinger, que también es el SMTP de Supabase Auth. Paso a paso: `docs/DOMINIO-HOSTING.md`. Netlify descartado para MiTeam.
- App = **PWA** (sin tiendas): manifiesto del panel (`/pwa/panel`, abre en `/app`) y del kiosco (`/pwa/kiosco`, abre en `/kiosco`). Nombre en `lib/pwa.ts`; íconos provisorios.
- Precio y planes definitivos.
- Términos de uso y datos personales (Ley 25.326) antes del primer cliente externo.
- Canal principal de venta: contadores (export de horas en su formato) + prospección con Apify. **Hecho:** `scripts/prospectos/buscar.ps1` (zonas Córdoba + Carlos Paz → Sierras → turísticas; CSV para Google Sheets; contacto por WhatsApp manual y visita). Plantillas en `scripts/prospectos/mensajes.md`.
- Falta la ruta de confirmación del mail de alta (Supabase manda el link y la app no lo procesa). Hasta tenerla, desactivar "Confirm email" en los pilotos.
- Pedir autorización de portfolio a Maga y El Pirata para casos en video.
- Pedix como referencia (no verificado en detalle): Córdoba, 2020, ~3.000 tiendas creadas, crecimiento por producto (prueba gratis, sin vendedores). Facturación no pública.
