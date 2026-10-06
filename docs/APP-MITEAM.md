# MiTeam · la app por dentro

> Qué hace hoy la app de fichaje, cómo se usa, qué reglas sigue y qué falta. Sacado del código, no de ideas.
> Estado al 6 de octubre de 2026. Repo `agustinmoyaa7-arch/claude`, rama `main`.
> Contexto de negocio, hosting y prospección: `docs/CONTEXTO-MITEAM.md`.

---

## 1. En una frase
Los empleados fichan entrada y salida con un **código de 4 a 6 números** en una tablet o PC del local. El dueño carga el **horario de la semana** de cada uno y la app le muestra, día por día, **quién llegó tarde, quién faltó, quién se fue antes y quién hizo horas extra**. A fin de mes lo baja en Excel para el contador.

## 2. Quién la usa

| Quién | Qué hace | Dónde |
|---|---|---|
| **Dueño** | Se registra solo, crea su empresa, carga empleados y horarios, activa el kiosco y mira el reporte. | `miteam.online/app`, desde el celular o la PC (se instala como app) |
| **Encargado** | Mismos permisos que el dueño sobre los datos del día a día (empleados, horarios, fichajes). No ve la facturación ni gestiona otros usuarios. El rol existe en la base, pero **todavía no hay pantalla para invitarlo**. | Igual que el dueño |
| **Empleado** | Solo ficha. **No necesita cuenta, mail ni celular.** | El kiosco del local: `miteam.online/kiosco` |
| **Agustín (superadmin)** | Ve y puede editar todas las empresas. | Hoy por SQL en Supabase; el panel maestro está pendiente |

---

## 3. Cómo se usa, paso a paso

### Alta del cliente (self-serve)
1. Entra a `/login`, se registra con mail y contraseña.
2. La primera vez, el panel le pide **crear su empresa**: nombre del negocio y un identificador corto (ej: `bar-carlos`).
3. Queda como **dueño**, con **14 días de prueba** y el plan **Gratis** asignado (hasta 3 empleados).

### Cargar empleados
- En el panel: nombre y, opcional, un código.
- Si no pone código, la app **genera uno de 4 dígitos** que no se repita en esa empresa y lo muestra para pasárselo al empleado.
- El código no se puede repetir dentro de la misma empresa (sí entre empresas distintas).
- Si se pasa del límite de empleados del plan, la app avisa: "Llegaste al límite de empleados de tu plan".

### Activar el kiosco (la tablet o PC del local)
1. En el panel: "Crear código de activación" (con un nombre, ej: "PC recepción").
2. La app muestra un código largo **una sola vez**. Se guarda solo su huella (hash), así que si se pierde se crea otro.
3. En la tablet se abre `miteam.online/kiosco`, se pega el código y queda activada para siempre en ese navegador.
4. Se puede instalar como app en pantalla completa.
5. **No hace falta comprar nada:** sirve la PC o tablet que el local ya tiene.

### Fichar (empleado)
- Pantalla con teclado numérico grande. El empleado escribe su código y toca **OK**.
- La app decide sola si es **entrada o salida**:
  - si el último fichaje fue una entrada de hace menos de 16 horas → **salida**;
  - si no → **entrada**.
- Aviso a pantalla completa por 4 segundos:
  - **verde "ENTRADA"** o **rojo "SALIDA"**, con el nombre del empleado;
  - en ámbar, si hubo un error: "Código incorrecto", "Ya fichaste hace un momento" (menos de 1 minuto), "Demasiados intentos, esperá un minuto", "La cuenta está suspendida" o "Este equipo ya no está activado".

### Cuadro semanal (`/app/horarios`)
- Grilla por empleado y día (lunes a domingo), con hora de entrada y de salida.
- **Vacío = franco.**
- Si la salida es menor que la entrada (ej: 20:00 a 02:00), el turno **cruza la medianoche** y se cuenta bien.
- Un turno por día por empleado.

### Reporte plan vs. real (`/app/reporte`)
- Por defecto muestra **la semana actual** (lunes a domingo), con flechas a la semana anterior y la siguiente.
- Para cada empleado y día compara el horario cargado con lo fichado. **Tolerancia de 10 minutos.** Estados:

| Estado | Cuándo |
|---|---|
| ✅ En horario | Entró y salió dentro de la tolerancia |
| 🟡 Tarde | Entró más de 10 min después del horario |
| 🟡 Salió antes | Salió más de 10 min antes |
| 🔵 Horas extra | Trabajó más de 10 min por encima de lo planificado |
| 🔴 Ausente | Tenía turno, el día ya pasó y no fichó |
| 🟠 Sin salida | Fichó la entrada de un día pasado y nunca la salida |
| 🟢 En curso | Entró hoy y todavía no salió |
| ⚪ Pendiente | Tiene turno hoy o más adelante y todavía no fichó |
| 🟣 Franco trabajado | Fichó un día que tenía franco |

- Resumen por empleado: minutos planificados contra reales, tardanzas y ausencias.
- **Descarga CSV** (abre directo en Excel en español) con fecha, empleado, horario planificado, horario real, minutos, diferencia y estado. Es lo que se le pasa al contador.

### Panel principal (`/app`)
- Nombre de la empresa, plan, estado y fecha de fin de la prueba.
- Lista de empleados con su código.
- Equipos de kiosco activados y su último uso.
- Últimos 20 fichajes.

---

## 4. Reglas del negocio (las hace cumplir la base de datos)

- **Aislamiento entre clientes:** cada empresa ve solo sus datos. Lo controla la base misma (RLS + claves compuestas), no solo la pantalla. Hay 38 pruebas automáticas que lo verifican.
- **Planes** (tabla `planes`; los precios son provisorios):

| Plan | Empleados activos | Precio |
|---|---|---|
| Gratis | 3 | $0 |
| Básico | 10 | $18.000 |
| Medio | 25 | $35.000 |
| Grande | 50 | $60.000 |

- **Estados de la cuenta:**
  - `prueba` (14 días) y `activa`: todo funciona.
  - `vencida`: **modo solo lectura**. El dueño ve todo pero no puede cambiar nada, y **el kiosco sigue fichando**, así no se pierden horas trabajadas.
  - `suspendida` / `cancelada`: el kiosco rechaza los fichajes.
  - **Nunca se borran datos.**
  - El plan y el estado solo los cambia el sistema (el futuro webhook de Mercado Pago o Agustín); el dueño no.
- **Los fichajes no se borran, se anulan.** Lo cargado o editado a mano queda en un **registro de auditoría** (quién, cuándo, antes y después), igual que los cambios en empleados y horarios.
- **Seguridad del kiosco:**
  - fichar solo lo puede hacer el servidor, nunca el navegador directo;
  - límite de 10 intentos por minuto por equipo, contra quien quiera adivinar códigos;
  - no se puede fichar dos veces en menos de 1 minuto.

---

## 5. Qué se puede prometer en la web y qué todavía no

**Sí, ya funciona:**
- Fichaje con código en tablet o PC del local, sin hardware nuevo y sin cuenta para el empleado.
- La app reconoce sola si es entrada o salida.
- Cuadro semanal de horarios, francos y turnos nocturnos.
- Reporte automático: tardanzas, ausencias, salidas anticipadas, horas extra y "sin salida".
- Excel (CSV) para el contador.
- Panel desde el celular, instalable como app.
- Prueba gratis de 14 días, alta en minutos.
- Datos separados por cliente; nada se borra; historial de cambios.

**Todavía no (no prometer, o decir "próximamente"):**
- Corregir o cargar a mano un fichaje olvidado desde el panel (está en la base, falta la pantalla).
- Invitar a un encargado.
- Varias sedes por empresa (la tabla existe, falta la pantalla).
- Fichaje con ubicación GPS / radio del local (las columnas existen, no se usan).
- Pago online con Mercado Pago.
- Horario cortado (dos turnos el mismo día).
- Bonos, descuentos, costo laboral o sueldos (la app de El Pirata lo tiene; MiTeam todavía no).
- Que el empleado vea sus propias horas.
- Funcionar sin internet.

---

## 6. Técnico (para quien programe)

- **Stack:** Next.js 16 (App Router) + React 19 + Tailwind 4 + Supabase (Postgres, Auth, RLS). Node >= 20.9.
  - En esta versión de Next, `middleware` se llama **`proxy.ts`**. Leer `node_modules/next/dist/docs/` antes de tocar código (`AGENTS.md`).
- **Archivos clave:**

| Qué | Dónde |
|---|---|
| Esquema, RLS, planes, `crear_empresa()`, `fichar()` | `supabase/migrations/0001_core_multitenant.sql` |
| Reporte plan vs. real | `supabase/migrations/0002_reporte_plan_vs_real.sql` |
| Pruebas de aislamiento | `supabase/tests/run.sh` |
| Panel y sus acciones | `app/app/page.tsx`, `app/app/actions.ts`, `app/app/forms.tsx` |
| Cuadro semanal | `app/app/horarios/` |
| Reporte y CSV | `app/app/reporte/`, `lib/reporte.ts` |
| Kiosco | `app/kiosco/page.tsx` (token guardado en `localStorage`) |
| API de fichaje | `app/api/fichar/route.ts` (usa `service_role`) |
| Sesión y protección de `/app` | `proxy.ts`, `lib/supabase/` |
| PWA (nombre, colores, íconos) | `lib/pwa.ts`, `app/pwa/` |

- **Variables de entorno:**
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`;
  - `SUPABASE_SERVICE_ROLE_KEY`: solo servidor, nunca con prefijo `NEXT_PUBLIC_`.
- **Estado:** lint, build y las 38 pruebas pasan. **Nunca se probó contra un Supabase real ni con usuarios reales.**
- **Huecos técnicos conocidos:**
  - no existe la página que procesa el **link de confirmación del mail de alta** (mientras tanto, desactivar "Confirm email" en Supabase);
  - el límite de intentos del kiosco vive en memoria (alcanza con un solo servidor);
  - el panel toma la primera empresa del usuario (no hay selector si es miembro de varias).
