# New Wave Fichaje

Fichaje digital multi-tenant para PyMEs. **Una app, una base, muchas empresas.**
Next.js (App Router) + Supabase (Postgres + Auth + RLS).

## Cómo funciona el multi-tenant
- Cada cliente es una fila de `empresas`. Toda tabla de negocio lleva `empresa_id`.
- RLS en todas las tablas: un usuario solo ve y escribe datos de las empresas donde es miembro (`miembros`).
- Claves foráneas compuestas `(id, empresa_id)`: imposible mezclar un empleado de una empresa con otra.
- Cuenta `vencida` = modo lectura (el kiosco sigue fichando). `suspendida`/`cancelada` = el kiosco rechaza. Nunca se borran datos.
- Los fichajes no se borran, se anulan. Los cambios en empleados, horarios y fichajes editados quedan en `audit_logs`.
- Empleados sin cuenta: ficha desde el kiosco con un código de 4 a 6 dígitos. El kiosco se activa con un token por equipo (se guarda solo su hash).
- `fichar()` solo la puede ejecutar el servidor (`service_role`), nunca el navegador.

## Arrancar en tu PC
1. Creá un proyecto de Supabase **nuevo para desarrollo** (no uses el de Maga ni el de El Pirata).
2. En el SQL Editor pegá y ejecutá `supabase/migrations/0001_core_multitenant.sql`.
3. `cp .env.example .env.local` y completá las 3 variables (Project Settings → API).
4. `npm install` y `npm run dev` → http://localhost:3000
5. Registrate en `/login`, creá tu empresa, cargá empleados y creá un código de activación.
6. Abrí `/kiosco` (en otro navegador o tablet), pegá el código y fichá.

Para ser superadmin (panel maestro): `insert into superadmins (user_id) values ('<tu uuid de auth.users>');`

## Pruebas del aislamiento
Necesita Postgres local (imita Supabase con un shim):
```
PGPASSWORD=postgres bash supabase/tests/run.sh
```
26 chequeos: aislamiento entre empresas, límite del plan, permisos de `fichar()`, modo lectura, auditoría.

## Falta (en orden)
1. Cuadro semanal por empleado (tabla `horarios` ya existe) + reporte plan vs. real.
2. Edición de fichajes con auditoría desde el panel + export a Excel/CSV.
3. Panel maestro de New Wave (lista de empresas, MRR).
4. Mercado Pago: webhook que actualiza `suscripciones` y `empresas.estado`.
5. Geolocalización con radio de sede (columnas ya creadas).
6. Importar Maga y El Pirata como empresas 0 y 1.
