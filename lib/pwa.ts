import type { MetadataRoute } from "next";

// Cambiar el nombre acá cambia los dos manifiestos, el título en iPhone y el ícono.
export const NOMBRE_APP = "MiTeam";
export const COLOR_FONDO = "#18181b";
export const TAMANOS_ICONO = [192, 512] as const;

// Dos manifiestos: el dueño instala el panel en su celular y la tablet del local instala el kiosco.
export function manifiesto(tipo: "panel" | "kiosco"): MetadataRoute.Manifest {
  const kiosco = tipo === "kiosco";
  return {
    id: kiosco ? "/kiosco" : "/app",
    name: kiosco ? `${NOMBRE_APP} · Kiosco` : NOMBRE_APP,
    short_name: kiosco ? "Kiosco" : NOMBRE_APP,
    description: kiosco ? "Fichaje de entrada y salida con código." : "Panel de fichaje para tu negocio.",
    start_url: kiosco ? "/kiosco" : "/app",
    scope: kiosco ? "/kiosco" : "/",
    display: kiosco ? "fullscreen" : "standalone",
    orientation: kiosco ? "any" : "portrait",
    lang: "es-AR",
    background_color: COLOR_FONDO,
    theme_color: COLOR_FONDO,
    icons: TAMANOS_ICONO.map((t) => ({ src: `/pwa/icono/${t}`, sizes: `${t}x${t}`, type: "image/png", purpose: "any" })),
  };
}

export function respuestaManifiesto(tipo: "panel" | "kiosco") {
  return Response.json(manifiesto(tipo), { headers: { "Content-Type": "application/manifest+json" } });
}
