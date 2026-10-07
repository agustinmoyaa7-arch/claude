# Reel de lanzamiento de MiTeam (Remotion)

Video vertical para Instagram: 1080×1920, 30 fps, unos 24 segundos, sin audio (la música se agrega en Instagram).

Escenas, en orden: ¿Quién llegó tarde hoy? → Chau planilla → Fichan con un PIN → Plan vs. real → Sin internet → Cierre de mes → Precios → Probalo 14 días gratis.

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
