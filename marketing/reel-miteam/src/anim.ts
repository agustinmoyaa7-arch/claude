import type { CSSProperties } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Entrada con rebote suave: 0 antes de `delay`, llega a 1 poco después.
export const useEntrada = (delay = 0, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness: 130, mass: 0.8 } });
};

// Aparece subiendo desde abajo.
export const subir = (p: number, distancia = 70): CSSProperties => ({
  opacity: interpolate(p, [0, 0.6], [0, 1], { extrapolateRight: "clamp" }),
  transform: `translateY(${(1 - p) * distancia}px)`,
});

// Aparece creciendo desde un poco más chico.
export const pop = (p: number, desde = 0.6, giro = 0): CSSProperties => ({
  opacity: interpolate(p, [0, 0.5], [0, 1], { extrapolateRight: "clamp" }),
  transform: `scale(${desde + (1 - desde) * p}) rotate(${giro}deg)`,
});

// Progreso lineal entre dos frames, para trazos que se dibujan.
export const useTrazo = (desde: number, hasta: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [desde, hasta], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};
