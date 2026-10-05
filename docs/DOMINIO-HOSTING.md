# Dominio y hosting · paso a paso

Precios verificados en octubre de 2026. Moneda USD salvo que diga ARS.

## Cómo queda armado
El cliente se identifica por su sesión, no por un subdominio propio. Por eso alcanza **un solo dominio**, sin certificado wildcard ni configuración por cliente:

| URL | Qué es |
|---|---|
| `nombre.com/` | Landing |
| `nombre.com/login` | Alta y entrada de cada cliente (self-serve) |
| `nombre.com/app` | Panel del dueño (se instala en el celular como app) |
| `nombre.com/kiosco` | Kiosco del local (se instala en la tablet o PC en pantalla completa) |
| `hola@nombre.com` | Correo que llega a tu Gmail |

Vos administrás todo como superadmin desde la misma app.

## Costos
| Qué | Dónde | Hoy | Con clientes |
|---|---|---|---|
| Dominio `.com` | Cloudflare Registrar | ~10,5/año | igual (renueva al mismo precio) |
| Correo `hola@` | Cloudflare Email Routing | 0 | 0 |
| App + landing | Netlify | 0 (Free: 300 créditos) | 9/mes (Personal: 1.000 créditos) |
| Base de datos | Supabase | 0 (Free) | 25/mes (Pro: backups diarios, no se pausa) |
| Mails de alta y contraseña | Resend | 0 (3.000/mes, 100/día) | 0 hasta ~100 altas por día |
| **Total** | | **~1/mes** | **~35/mes** |

- **No usar** GoDaddy ni Hostinger: el primer año es barato y la renovación sale cara.
- **No usar Vercel Hobby**: prohíbe el uso comercial.
- **Netlify Free**: cada deploy a producción gasta 15 créditos (~20 deploys por mes si no hay más consumo). Juntá cambios antes de hacer `git push` a la rama de producción, o pasá a Personal cuando entre el primer pago.
- **Supabase Free**: no tiene backups y se pausa tras 7 días sin uso. Sirve para desarrollo y para los primeros pilotos; pasalo a Pro con el primer cliente que paga.
- Pagás en dólares con tarjeta: sumá los impuestos y percepciones del dólar tarjeta.

---

## 1. Elegir el nombre (antes de comprar nada)
1. Armá 3 a 5 candidatos cortos, fáciles de dictar por teléfono y sin tildes ni ñ.
2. Para cada uno chequeá:
   - el `.com` en [dash.cloudflare.com](https://dash.cloudflare.com) → Domain Registration → Register Domains;
   - el usuario libre en Instagram;
   - la marca en el INPI ([portaltramites.inpi.gob.ar](https://portaltramites.inpi.gob.ar)), clases 9 (software) y 42 (servicios de software).
3. Cuando lo elijas, cambiá `NOMBRE_APP` en `lib/pwa.ts`: es el nombre que aparece al instalar la app.

## 2. Comprar el dominio y activar el correo
1. Cloudflare → Register Domains → comprá el `.com` (1 año, con renovación automática).
2. Cloudflare → tu dominio → Email → Email Routing → crear `hola@nombre.com` y reenviarlo a tu Gmail. Para responder desde esa dirección: Gmail → Configuración → Cuentas → "Enviar como".

## 3. Supabase de producción
1. Proyecto **nuevo** (no el de desarrollo, ni el de Maga ni el de El Pirata), región São Paulo (`sa-east-1`, la más cercana).
2. SQL Editor: ejecutar en orden `supabase/migrations/0001_core_multitenant.sql` y `0002_reporte_plan_vs_real.sql`.
3. Authentication → URL Configuration:
   - Site URL: `https://nombre.com`
   - Redirect URLs: `https://nombre.com/**`
4. Mails de alta (sin esto el registro self-serve **no funciona**: el SMTP que trae Supabase solo manda 2 mails por hora y solo al equipo del proyecto):
   1. En [resend.com](https://resend.com) → Domains → agregar `nombre.com` → copiar los registros DNS que te da (TXT/MX) a Cloudflare → DNS, y esperar "Verified".
   2. Resend → API Keys → crear una.
   3. Supabase → Authentication → Emails → SMTP Settings → activar Custom SMTP:
      - Host `smtp.resend.com`, puerto `465`, usuario `resend`, contraseña = la API key de Resend.
      - Remitente `hola@nombre.com`, nombre del remitente = nombre del producto.
   4. Authentication → Emails → Templates: pasar al español los textos de "Confirm signup" y "Reset password".
5. Project Settings → API: copiar URL, `anon` key y `service_role` key (esta última, solo al paso 4).

## 4. Netlify
1. Add new project → importar el repo de GitHub → rama de producción (por ejemplo `main`). Netlify detecta Next.js 16 solo: no hace falta `netlify.toml`.
2. Site configuration → Environment variables, las 3 de `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (marcala como secreta; nunca con prefijo `NEXT_PUBLIC_`)
3. Domain management → Add a domain → `nombre.com`. Netlify te da los registros DNS.
4. En Cloudflare → DNS, cargá los registros que pide Netlify (para el dominio raíz y para `www`) con la nube en **gris** (DNS only). Si la dejás naranja, Cloudflare se mete en el medio y rompe el certificado de Netlify.
5. Esperá a que Netlify emita el certificado HTTPS (Let's Encrypt, automático).

## 5. Darte de alta como superadmin
1. Entrá a `https://nombre.com/login` y registrate con tu mail.
2. Supabase → Authentication → Users: copiá tu `id`.
3. SQL Editor: `insert into superadmins (user_id) values ('<tu id>');`

## 6. Instalar la app (PWA)
- **Celular del dueño**: abrir `nombre.com/app` → Chrome: menú ⋮ → "Instalar app" / Safari: Compartir → "Agregar a inicio".
- **Tablet o PC del local**: abrir `nombre.com/kiosco` → instalar igual. Se abre directo en el kiosco, en pantalla completa.
- No hay tiendas ni aprobaciones: cada `git push` actualiza la app instalada.

## Pendiente antes del primer cliente externo
- Términos de uso y política de datos (Ley 25.326) enlazados desde la landing y el registro.
- El registro con confirmación por mail necesita una ruta que reciba el link del mail y abra la sesión (hoy `/login` no la tiene). Sin esa ruta, desactivá "Confirm email" en Supabase para los pilotos.
