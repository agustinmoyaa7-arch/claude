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
