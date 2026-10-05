# MiTeam en miteam.online · paso a paso

Hostinger (dominio + hosting Business con Node.js) + Supabase (base de datos y usuarios). Precios verificados en octubre de 2026, en USD.

## Cómo queda armado
El cliente se identifica por su sesión, no por un subdominio propio. Por eso alcanza **un solo dominio** y una sola app para todos los clientes:

| URL | Qué es |
|---|---|
| `miteam.online/` | Landing |
| `miteam.online/login` | Alta y entrada de cada cliente (self-serve) |
| `miteam.online/app` | Panel del dueño (se instala en el celular como app) |
| `miteam.online/kiosco` | Kiosco del local (se instala en la tablet o PC en pantalla completa) |
| `hola@miteam.online` | Correo de MiTeam (también manda los mails de alta) |

Vos administrás todo como superadmin desde la misma app.

## Qué plan de Hostinger
**Business Web Hosting.** Es el plan más barato que trae **Node.js Web Apps**, y Next.js lo necesita: el login, el panel, el kiosco y la API corren en un servidor Node.
- Premium/Single (el que tenés ahora) solo sirve PHP o páginas estáticas: la app no anda ahí.
- Cloud Startup también sirve, pero cuesta el doble y es para mucho más tráfico. Business alcanza holgado para los primeros cientos de clientes.

## Costos
| Qué | Dónde | Hoy | Después |
|---|---|---|---|
| Hosting | Hostinger Business | ~3 a 4,5/mes en promo | renueva a ~17/mes |
| Dominio `miteam.online` | Hostinger | ~1 el primer año | renueva a ~36/año |
| Correo `hola@` | Hostinger | gratis el primer año | ~1,6/mes |
| Base de datos | Supabase | 0 (Free) | 25/mes (Pro) desde el primer cliente que paga |

- El `.online` renueva caro y suena menos serio que un `.com`. Antes de la renovación, fijate si `miteam.com` está libre: si está, compralo y redirigí el `.online`.
- Supabase Free no tiene backups y se pausa tras 7 días sin uso. Sirve para desarrollo y pilotos, no para clientes que pagan.
- Pagás en dólares con tarjeta: sumá los impuestos del dólar tarjeta.

---

## 1. Pasar a Business
hPanel → Hosting → Detalles del plan → **Mejorar plan** → Business. Pagás la diferencia del período que te queda.

## 2. Mover el servidor a Brasil
Detalles del plan → Ubicación del servidor → lápiz → **Brasil (São Paulo)**. Es gratis y queda cerca de Argentina y de la base de Supabase. Hacelo antes de crear la app.

## 3. Correo
hPanel → Emails → crear `hola@miteam.online` con una contraseña fuerte. Guardala: la usa Supabase en el paso 4.
Para leerlo desde Gmail: Gmail → Configuración → Cuentas → "Consultar el correo de otras cuentas" + "Enviar como".

## 4. Supabase de producción
1. Proyecto **nuevo** (no el de desarrollo, ni el de Maga ni el de El Pirata), región **South America (São Paulo)**.
2. SQL Editor: ejecutar en orden `supabase/migrations/0001_core_multitenant.sql` y `0002_reporte_plan_vs_real.sql`.
3. Authentication → URL Configuration:
   - Site URL: `https://miteam.online`
   - Redirect URLs: `https://miteam.online/**`
4. Authentication → Emails → SMTP Settings → activar Custom SMTP. El SMTP que trae Supabase solo manda 2 mails por hora y solo al equipo del proyecto: sin este paso el alta self-serve no funciona.
   - Host `smtp.hostinger.com`, puerto `465`
   - Usuario `hola@miteam.online`, contraseña = la del paso 3
   - Remitente `hola@miteam.online`, nombre `MiTeam`
   - El correo incluido manda hasta 100 mails por día. Si algún día no alcanza, se cambia por Resend sin tocar el código.
5. Authentication → Sign In / Providers → Email: **desactivar "Confirm email"** por ahora. La app todavía no tiene la página que procesa el link de confirmación.
6. Authentication → Emails → Templates: pasar al español "Reset password".
7. Project Settings → API: copiar URL, `anon` key y `service_role` key para el paso 5.

## 5. Crear la app en Hostinger
1. hPanel → Websites → **Add Website** → **Node.js Apps** → **Import Git Repository**.
2. Autorizá GitHub y elegí el repo `agustinmoyaa7-arch/claude`, rama **`main`**.
3. Configuración de build (si Hostinger detecta otra cosa, poné esto):
   - Node.js: **22**
   - Install: `npm ci`
   - Build: `npm run build`
   - Start: el que propone Hostinger; si falla, `npm run start -- -p $PORT`
4. **Variables de entorno, antes del primer deploy** (las `NEXT_PUBLIC_*` se graban al compilar: si las cargás después, hay que redeployar):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`: secreta. Nunca con prefijo `NEXT_PUBLIC_`, nunca en el repo ni en el chat.
5. **Deploy**. Cuando termine, asignale el dominio `miteam.online` (y `www`) a la app. Los nameservers ya son de Hostinger, así que no hay DNS que tocar afuera. El certificado HTTPS es automático.

Hostinger compila Next.js en modo `standalone` por su cuenta: no hace falta cambiar `next.config.ts`.

## 6. Darte de alta como superadmin
1. Entrá a `https://miteam.online/login` y registrate con tu mail.
2. Supabase → Authentication → Users: copiá tu `id`.
3. SQL Editor: `insert into superadmins (user_id) values ('<tu id>');`

## 7. Instalar la app (PWA)
- **Celular del dueño**: abrir `miteam.online/app` → Chrome: menú ⋮ → "Instalar app" / Safari: Compartir → "Agregar a inicio".
- **Tablet o PC del local**: abrir `miteam.online/kiosco` → instalar igual. Se abre directo en el kiosco, en pantalla completa.

## Cómo se publica de ahora en más
- `main` es la rama de producción: cada push o merge a `main` recompila y publica en miteam.online en unos minutos.
- Las ramas `claude/...` son de trabajo y no publican. Cuando algo está probado, se pasa a `main`.
- Si un deploy falla, Hostinger deja andando la versión anterior. Mirá el log del build en la app de hPanel.

## Pendiente antes del primer cliente externo
- Términos de uso y política de datos (Ley 25.326) enlazados desde la landing y el registro.
- Página de confirmación del mail de alta. Con eso se vuelve a activar "Confirm email".
- Logo e íconos definitivos (hoy son una "M" sobre fondo oscuro, en `lib/pwa.ts` y `app/pwa/icono/`).
