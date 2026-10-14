// Juan, dueño del café: dibujo de líneas violetas en el estilo de los stickers de MiTeam.
import React from "react";
import { C } from "./brand";

export type Expresion = "feliz" | "preocupado" | "tranquilo";

const CAMISA = "M112 345 C116 286 156 258 200 258 C244 258 284 286 288 345 L298 640 L102 640 Z";
const DELANTAL = "M150 322 L250 322 L266 640 L134 640 Z";
const TIRA = "M162 322 C160 290 240 290 238 322";
const BOLSILLO = "M172 430 L228 430 L226 478 L174 478 Z";
const CABEZA = "M138 150 C138 102 166 78 200 78 C234 78 262 102 262 150 C262 200 234 226 200 226 C166 226 138 200 138 150 Z";
const PELO = "M134 142 C128 92 162 62 204 64 C246 66 272 96 266 144 C258 120 238 106 214 104 C196 102 182 110 162 110 C150 110 140 124 134 142 Z";
const BARBA =
  "M140 160 C142 206 168 234 200 234 C232 234 258 206 260 160 C252 180 238 190 222 188 C214 187 208 183 200 183 C192 183 186 187 178 188 C162 190 148 180 140 160 Z";
const OREJA_I = "M140 136 C122 134 122 172 142 170 Z";
const OREJA_D = "M260 136 C278 134 278 172 258 170 Z";
const NARIZ = "M201 148 C196 160 194 168 205 170";
const BRAZO_I = "M0 0 C-14 56 -16 120 -8 176";
const BRAZO_D = "M0 0 C14 56 16 120 8 176";

const CEJAS: Record<Expresion, [string, string]> = {
  feliz: ["M165 130 Q177 123 190 128", "M210 128 Q223 123 235 130"],
  preocupado: ["M166 134 L190 123", "M210 123 L234 134"],
  tranquilo: ["M165 127 Q177 120 190 125", "M210 125 Q223 120 235 127"],
};
const BOCA: Record<Expresion, string> = {
  feliz: "M184 196 Q200 210 216 196",
  preocupado: "M188 203 Q200 197 212 203",
  tranquilo: "M182 194 Q200 213 218 194",
};

export const Juan: React.FC<{
  ancho: number;
  dibujo?: number; // 0 a 1: cuánto del dibujo está trazado
  brazo?: number; // 0 = brazo derecho abajo, 1 = levantado saludando
  ola?: number; // grados extra para que la mano salude
  expresion?: Expresion;
  parpadeo?: number; // 0 a 1
}> = ({ ancho, dibujo = 1, brazo = 0, ola = 0, expresion = "feliz", parpadeo = 0 }) => {
  const V = C.violet;
  const relleno = Math.min(1, Math.max(0, (dibujo - 0.45) * 2.2));
  const trazo = (d: string, w = 6, color = V) =>
    dibujo > 0.002 && (
    <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - dibujo} />
  );
  const forma = (d: string, fill: string) => <path d={d} fill={fill} opacity={relleno} />;
  const mano = (cx: number) => <circle cx={cx} cy={190} r={20} fill={C.white} stroke={V} strokeWidth={6} opacity={relleno} />;
  const [cejaI, cejaD] = CEJAS[expresion];
  const ojoAlto = 6.5 * (1 - parpadeo * 0.9);

  return (
    <svg width={ancho} height={ancho * 1.6} viewBox="0 0 400 640" style={{ overflow: "visible" }}>
      <g transform="translate(132 312)">
        {trazo(BRAZO_I, 11)}
        {mano(-8)}
      </g>
      {forma(CAMISA, C.white)}
      {trazo(CAMISA)}
      {forma(DELANTAL, C.violetSoft)}
      {trazo(DELANTAL)}
      {trazo(TIRA, 5)}
      {trazo(BOLSILLO, 5)}
      <g transform={`translate(268 312) rotate(${-150 * brazo + ola})`}>
        {trazo(BRAZO_D, 11)}
        {mano(8)}
      </g>
      {trazo("M184 222 L182 262 M216 222 L218 262")}
      {forma(OREJA_I, C.white)}
      {trazo(OREJA_I, 5)}
      {forma(OREJA_D, C.white)}
      {trazo(OREJA_D, 5)}
      {forma(CABEZA, C.white)}
      {trazo(CABEZA)}
      {forma(PELO, V)}
      {forma(BARBA, V)}
      {trazo(NARIZ, 4)}
      {trazo(cejaI, 5)}
      {trazo(cejaD, 5)}
      {expresion === "tranquilo" ? (
        <>
          {trazo("M168 154 Q178 143 188 154", 5, C.ink)}
          {trazo("M212 154 Q222 143 232 154", 5, C.ink)}
        </>
      ) : (
        <>
          <ellipse cx={179} cy={152} rx={6.5} ry={ojoAlto} fill={C.ink} opacity={relleno} />
          <ellipse cx={221} cy={152} rx={6.5} ry={ojoAlto} fill={C.ink} opacity={relleno} />
        </>
      )}
      <path d={BOCA[expresion]} fill="none" stroke={C.white} strokeWidth={5} strokeLinecap="round" opacity={relleno} />
      {expresion === "preocupado" && (
        <path d="M266 108 C259 121 259 130 266 132 C273 130 273 121 266 108 Z" fill={C.violetSoft} stroke={V} strokeWidth={3} opacity={relleno} />
      )}
    </svg>
  );
};
