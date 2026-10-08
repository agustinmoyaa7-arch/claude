import "@fontsource-variable/fraunces/full.css";
import "@fontsource/outfit/400.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/600.css";
import "@fontsource/kalam/700.css";
import React from "react";

// Colores y tipografías de la ficha del producto (MiTeam v1.0.1).
export const C = {
  violet: "#4A26F0",
  violetLight: "#8F78FF",
  violetSoft: "#ECE8FE",
  violetMuted: "#E4DEFF",
  ink: "#17142B",
  dark: "#110F1C",
  surface: "#1A1729",
  bg: "#F7F6FB",
  muted: "#625D7A",
  mutedDark: "#A49FBC",
  line: "#E3E0EE",
  ok: "#166B52",
  okBg: "#DDF3EA",
  warn: "#8A4A10",
  warnBg: "#FCEBD8",
  bad: "#9B1C1C",
  badBg: "#FDE3E3",
  green: "#1E8A6A",
  white: "#FFFFFF",
};

export const F = {
  display: "'Fraunces Variable', Georgia, serif",
  body: "'Outfit', sans-serif",
  mono: "'JetBrains Mono', monospace",
  hand: "'Kalam', cursive",
};

export const display: React.CSSProperties = {
  fontFamily: F.display,
  fontVariationSettings: "'SOFT' 100, 'opsz' 144",
  fontWeight: 900,
  letterSpacing: "-0.01em",
  wordSpacing: "0.06em",
  margin: 0,
};

// Zona segura de un reel: arriba la barra de Instagram, abajo el texto y los botones.
export const SAFE = { top: 230, bottom: 420, side: 90 };

const OREJAS =
  "M25 67 C24 53 27 41 31 33 Q33.5 28.5 37.5 31.5 C42 35 46.5 41 50 47.5 C53.5 41 58 35 62.5 31.5 Q66.5 28.5 69 33 C73 41 76 53 75 67";
const OJOS = "M32 60 Q39 47 46 60 M54 60 Q61 47 68 60";
const CHISPAS =
  "M14 30 L19 35 M8 44 L15 45 M23 18 L25 24 M86 30 L81 35 M92 44 L85 45 M77 18 L75 24";

export const Mascota: React.FC<{
  width: number;
  color: string;
  chispas?: number; // 0 a 1: cuánto se ven las chispas
  parpadeo?: number; // 0 a 1: cuánto se cierran los ojos
  dibujo?: number; // 0 a 1: cuánto de la M está dibujado
  ojos?: number; // 0 a 1: cuánto se ven los ojos
}> = ({ width, color, chispas, parpadeo = 0, dibujo = 1, ojos = 1 }) => {
  const conChispas = chispas !== undefined;
  const viewBox = conChispas ? "4 14 92 66" : "18 18 64 60";
  const [, , vw, vh] = viewBox.split(" ").map(Number);
  return (
    <svg
      width={width}
      height={(width * vh) / vw}
      viewBox={viewBox}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={OREJAS} strokeWidth={6.6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - dibujo} />
      <g style={{ transformOrigin: "50px 55px", transform: `scaleY(${(1 - parpadeo * 0.7) * ojos})`, opacity: ojos }}>
        <path d={OJOS} strokeWidth={3.6} />
      </g>
      {conChispas && (
        <path
          d={CHISPAS}
          strokeWidth={2.6}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - chispas}
          opacity={chispas}
        />
      )}
    </svg>
  );
};

export const Icono: React.FC<{ size: number; fondo?: string; trazo?: string }> = ({
  size,
  fondo = C.violet,
  trazo = C.white,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.29,
      background: fondo,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Mascota width={size * 0.7} color={trazo} />
  </div>
);

export const Logo: React.FC<{ oscuro?: boolean; size?: number }> = ({ oscuro, size = 44 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.34 }}>
    <Icono size={size * 1.4} />
    <span
      style={{
        ...display,
        fontSize: size,
        letterSpacing: "-0.02em",
        color: oscuro ? C.white : C.ink,
        display: "flex",
        alignItems: "baseline",
      }}
    >
      MiTeam
      <span
        style={{
          display: "inline-block",
          width: size * 0.24,
          height: size * 0.24,
          borderRadius: "50%",
          background: oscuro ? C.violetLight : C.violet,
          marginLeft: size * 0.07,
        }}
      />
    </span>
  </div>
);

export const Check: React.FC<{ size: number; color: string; progreso?: number }> = ({
  size,
  color,
  progreso = 1,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5l4.5 4.5L19 7.5" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progreso} />
  </svg>
);
