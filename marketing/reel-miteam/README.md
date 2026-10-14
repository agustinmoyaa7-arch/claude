# Reels de MiTeam (Remotion)

Video vertical para Instagram: 1080×1920, 30 fps, unos 24 segundos, sin audio (la música se agrega en Instagram).

Escenas, en orden: ¿Quién llegó tarde hoy? → Chau planilla → Fichan con un PIN → Plan vs. real → Sin internet → Cierre de mes → Precios → Probalo 14 días gratis.

## Reel con voz: "Somos MiTeam" (`Presentacion`)

51 segundos, con la voz de ElevenLabs (`public/voz-presentacion.mp3`). Cada escena arranca cuando la voz dice su frase y cierra con la M de la mascota. Los segundos de cada escena están en `src/Presentacion.tsx` (lista `ESCENAS`): si regenerás el audio, ajustá esos números.

```powershell
npm run render:presentacion   # genera out/miteam-reel-presentacion.mp4
```

Efectos de sonido: barridos de viento en cada cambio de escena, pops, taps del PIN, clic, campanas, marcador y destellos. Se generan por síntesis con `python sfx/generar_sfx.py` (solo necesita numpy) y quedan en `public/sfx/`. Cuándo suena cada uno y a qué volumen: lista `SFX` en `src/Presentacion.tsx`.

Garabatos animados de la hoja de recursos (rayitas, subrayados, flechas, destellos, garabatos, onda de clic): `src/garabatos.tsx`. Dónde va cada uno: `CAPAS` en `src/Presentacion.tsx`.

## Reel historia: "Juan" (`Juan`)

45 segundos, ritmo tranquilo, voz en `public/voz-juan.mp3`. Juan, dueño de un café, saluda a cámara, cuenta el problema de la planilla y prueba MiTeam: el calendario se transforma en la M, la M en la tablet, la tablet en el celular, el celular en el Excel y el Excel en su taza de café. Cierra con la M de la mascota.

- Juan (personaje de cuerpo entero en colores planos, sus caras y el saludo): `src/JuanPersonaje.tsx`.
- Sonidos: de [uisfx](https://github.com/romainsimon/uisfx), paquetes "soft" y "organic", con licencia CC0 (`public/sfx/uisfx/`).
- Escenas, tiempos de cada frase (`T`), subtítulos y sonidos: `src/Juan.tsx`.

```powershell
npm run render:juan   # genera out/miteam-reel-juan.mp4
```

## Reel "Entran 10 chicos nuevos para la temporada" (`Temporada`)

21 segundos, voz en `public/voz-temporada.mp3`. Muestra la carga de empleados desde Excel: la planilla con los 10 nombres, el "no" a cargarlos uno por uno, bajar la planilla base, llenarla, subirla (te marca la fila con error y se corrige), el PDF con los PIN para repartir y Sofi fichando al otro día en la tablet. Cierra con la M de la mascota y "Probalo 14 días gratis".

- Todos los datos son inventados (Sofi, Tomi, Martín…): no usar empleados reales de los clientes.
- Escenas, tiempos de cada frase (`T`), textos de arriba y sonidos: `src/Temporada.tsx`.
- Portada "10 nuevos → fichando mañana": `PortadaTemporada`, en el mismo archivo.

```powershell
npm run render:temporada    # genera out/miteam-reel-temporada.mp4
npm run portada:temporada   # genera out/portada-temporada.png
```

## Reel "Así funciona MiTeam" (`Recorrido`)

53 segundos, voz en `public/voz-recorrido.mp3`. Recorrido por la app en 5 pasos: la tablet del local (PIN, entrada y salida, sin internet), el resumen en vivo en el celular, los horarios con colores, rotación y aviso de descanso, plan vs. real con la aprobación de horas extra, y el cierre de mes con el Excel. La interfaz copia las pantallas reales de la app, con datos inventados.

- Escenas, tiempos de cada frase (`T`), textos de arriba y sonidos: `src/Recorrido.tsx`.
- Portada "Así funciona MiTeam": `PortadaRecorrido`, en el mismo archivo.

```powershell
npm run render:recorrido    # genera out/miteam-reel-recorrido.mp4
npm run portada:recorrido   # genera out/portada-recorrido.png
```

## Usarlo en tu PC

Desde esta carpeta, en PowerShell:

```powershell
npm install
npm run studio    # abre el editor en el navegador para ver y ajustar el video
npm run render    # genera out/miteam-reel-lanzamiento.mp4
npm run portada   # genera out/portada.png (portada del reel)
```

## Dónde se cambia cada cosa

- Textos y animaciones de cada escena: `src/escenas.tsx`.
- Duración de cada escena y transiciones: `src/Reel.tsx`.
- Colores, tipografías, logo y mascota: `src/brand.tsx` (los de la ficha del producto).
