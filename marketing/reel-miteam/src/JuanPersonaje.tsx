// Juan, dueño del café: personaje de cuerpo entero en colores planos
// (campera universitaria violeta, remera blanca, pantalón terracota, manos en los bolsillos).
import React from "react";
import { C } from "./brand";

export type Expresion = "feliz" | "preocupado" | "tranquilo";

const PIEL = "#F2C9A5";
const PIEL_SOMBRA = "#E0AC86";
const PELO = "#8A5536";
const PELO_OSCURO = "#6B3F25";
const OJOS = "#2B2240";
const CAMPERA = C.violet;
const CAMPERA_SOMBRA = "#3A1BC9";
const MANGA = "#8F78FF";
const MANGA_SOMBRA = "#7A62F0";
const RIB = "#ECE8FE";
const PANTALON = "#D9734E";
const PANTALON_SOMBRA = "#BD5C3B";
const ZAPA = "#17142B";

const tramoParte = (p: number, desde: number) => Math.min(1, Math.max(0, (p - desde) / 0.4));

export const Juan: React.FC<{
  ancho: number;
  dibujo?: number; // 0 a 1: el personaje aparece de abajo hacia arriba
  brazo?: number; // 0 = manos en los bolsillos, 1 = brazo derecho levantado saludando
  ola?: number; // grados extra para que la mano salude
  expresion?: Expresion;
  parpadeo?: number; // 0 a 1
}> = ({ ancho, dibujo = 1, brazo = 0, ola = 0, expresion = "feliz", parpadeo = 0 }) => {
  const piernas = tramoParte(dibujo, 0);
  const cuerpo = tramoParte(dibujo, 0.2);
  const cabeza = tramoParte(dibujo, 0.4);
  const pelo = tramoParte(dibujo, 0.6);
  const entra = (p: number): React.SVGProps<SVGGElement> => ({ opacity: p, transform: `translate(0 ${(1 - p) * 24})` });
  const saluda = Math.min(1, brazo * 4);
  const ojoAlto = 7 * (1 - parpadeo * 0.9);

  return (
    <svg width={ancho} height={ancho * 2.5} viewBox="0 0 320 800" style={{ overflow: "visible" }}>
      <ellipse cx={160} cy={762} rx={78} ry={9} fill="rgba(23, 20, 43, 0.12)" opacity={piernas} />

      <g {...entra(piernas)}>
        <path d="M110 478 L210 478 L206 548 L114 548 Z" fill={PANTALON} />
        <path d="M110 486 L158 486 L153 732 L118 732 Z" fill={PANTALON} />
        <path d="M162 486 L210 486 L202 732 L167 732 Z" fill={PANTALON} />
        <path d="M150 540 L158 540 L153 732 L144 732 Z" fill={PANTALON_SOMBRA} />
        <path d="M162 540 L170 540 L176 732 L167 732 Z" fill={PANTALON_SOMBRA} />
        <path d="M114 728 L155 728 L157 752 L100 752 C100 741 105 732 114 728 Z" fill={ZAPA} />
        <path d="M165 728 L206 728 C215 732 220 741 220 752 L163 752 Z" fill={ZAPA} />
        <path d="M100 748 L157 748 M163 748 L220 748" stroke={C.white} strokeWidth={4} opacity={0.85} />
      </g>

      <g {...entra(cuerpo)}>
        <path d="M130 214 L190 214 L196 478 L124 478 Z" fill={C.white} />
        <path d="M130 214 L142 214 L136 478 L124 478 Z" fill="#E7E4F0" />
        <path d="M96 240 C104 222 122 214 140 212 L146 262 L140 482 L102 488 C96 400 92 300 96 240 Z" fill={CAMPERA} />
        <path d="M224 240 C216 222 198 214 180 212 L174 262 L180 482 L218 488 C224 400 228 300 224 240 Z" fill={CAMPERA} />
        <path d="M96 240 C93 300 96 400 102 488 L114 486 C108 400 106 300 110 236 Z" fill={CAMPERA_SOMBRA} />
        <path d="M102 470 L140 466 L140 490 L102 494 Z" fill={RIB} />
        <path d="M180 466 L218 470 L218 494 L180 490 Z" fill={RIB} />
        <path d="M104 480 L140 477 M180 477 L216 480" stroke={CAMPERA} strokeWidth={3} />
        <path d="M140 212 C146 236 152 252 160 256 C168 252 174 236 180 212 L172 210 C168 228 164 238 160 240 C156 238 152 228 148 210 Z" fill={RIB} />
        <g transform="translate(186 288)">
          <path d="M0 0 L22 0 L20 18 Q11 24 2 18 Z" fill={C.white} />
          <path d="M22 4 C30 4 30 14 21 14" fill="none" stroke={C.white} strokeWidth={3} />
          <path d="M6 -6 C3 -10 9 -12 6 -16 M14 -6 C11 -10 17 -12 14 -16" fill="none" stroke={C.white} strokeWidth={2.5} strokeLinecap="round" />
        </g>

        <g opacity={1 - saluda}>
          <path d="M224 244 C244 256 252 304 250 362 C248 404 236 432 218 448 L202 440 C214 420 222 390 220 350 C218 310 212 282 206 262 Z" fill={MANGA} />
          <path d="M250 362 C248 404 236 432 218 448 L210 444 C226 426 236 400 238 362 Z" fill={MANGA_SOMBRA} />
          <path d="M202 440 L218 448 L212 462 L196 452 Z" fill={RIB} />
        </g>
        <path d="M96 244 C76 256 68 304 70 362 C72 404 84 432 102 448 L118 440 C106 420 98 390 100 350 C102 310 108 282 114 262 Z" fill={MANGA} />
        <path d="M70 362 C72 404 84 432 102 448 L110 444 C94 426 84 400 82 362 Z" fill={MANGA_SOMBRA} />
        <path d="M118 440 L102 448 L108 462 L124 452 Z" fill={RIB} />

        {saluda > 0 && (
          <g opacity={saluda} transform={`translate(214 250) rotate(${-150 * brazo + ola})`}>
            <path d="M-16 -2 C4 -10 22 0 26 16 C32 62 32 122 26 168 L0 170 C2 120 0 70 -12 24 Z" fill={MANGA} />
            <path d="M0 160 L26 158 L26 176 L0 178 Z" fill={RIB} />
            <circle cx={13} cy={192} r={17} fill={PIEL} />
            <path d="M2 182 L-6 168 M10 178 L8 162 M18 178 L20 162 M25 182 L32 170" stroke={PIEL} strokeWidth={8} strokeLinecap="round" />
          </g>
        )}
      </g>

      <g {...entra(cabeza)}>
        <path d="M146 176 L174 176 L176 216 C166 222 154 222 144 216 Z" fill={PIEL_SOMBRA} />
        <circle cx={106} cy={136} r={11} fill={PIEL} />
        <circle cx={214} cy={136} r={11} fill={PIEL} />
        <circle cx={107} cy={137} r={5} fill={PIEL_SOMBRA} />
        <circle cx={213} cy={137} r={5} fill={PIEL_SOMBRA} />
        <path d="M106 118 C106 80 130 62 160 62 C190 62 214 80 214 118 C214 168 194 202 160 202 C126 202 106 168 106 118 Z" fill={PIEL} />
        <path
          d="M110 140 C112 180 134 200 160 200 C186 200 208 180 210 140 C202 160 190 168 176 166 C170 165 166 163 160 163 C154 163 150 165 144 166 C130 168 118 160 110 140 Z"
          fill={PELO_OSCURO}
          opacity={0.9}
        />
        <path d="M152 122 C150 134 150 142 160 144" fill="none" stroke={PIEL_SOMBRA} strokeWidth={4} strokeLinecap="round" />

        {expresion === "tranquilo" ? (
          <>
            <path d="M130 124 Q140 114 150 124" fill="none" stroke={OJOS} strokeWidth={4.5} strokeLinecap="round" />
            <path d="M170 124 Q180 114 190 124" fill="none" stroke={OJOS} strokeWidth={4.5} strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx={140} cy={122} rx={6} ry={ojoAlto} fill={OJOS} />
            <ellipse cx={180} cy={122} rx={6} ry={ojoAlto} fill={OJOS} />
            {parpadeo < 0.5 && (
              <>
                <circle cx={142} cy={119} r={2} fill={C.white} />
                <circle cx={182} cy={119} r={2} fill={C.white} />
              </>
            )}
          </>
        )}

        {expresion === "preocupado" ? (
          <>
            <path d="M126 108 L150 100" stroke={PELO_OSCURO} strokeWidth={5} strokeLinecap="round" />
            <path d="M170 100 L194 108" stroke={PELO_OSCURO} strokeWidth={5} strokeLinecap="round" />
            <path d="M148 180 Q160 173 172 180" fill="none" stroke={OJOS} strokeWidth={4.5} strokeLinecap="round" />
            <path d="M222 92 C215 106 215 115 222 117 C229 115 229 106 222 92 Z" fill="#9FD3F0" />
          </>
        ) : (
          <>
            <path d="M126 104 Q138 96 151 102" fill="none" stroke={PELO_OSCURO} strokeWidth={5} strokeLinecap="round" />
            <path d="M169 102 Q182 96 194 104" fill="none" stroke={PELO_OSCURO} strokeWidth={5} strokeLinecap="round" />
            {expresion === "tranquilo" ? (
              <path d="M144 172 Q160 186 176 172" fill="none" stroke={OJOS} strokeWidth={4.5} strokeLinecap="round" />
            ) : (
              <>
                <path d="M142 168 Q160 194 178 168 Z" fill="#6E2A35" />
                <path d="M146 169 L174 169 L172 175 L148 175 Z" fill={C.white} />
              </>
            )}
          </>
        )}
      </g>

      <g {...entra(pelo)}>
        <path
          d="M104 124 C98 88 116 62 146 56 C140 40 148 24 162 14 C164 30 170 38 180 40 C186 26 200 18 214 20 C206 32 208 44 216 54 C226 70 224 100 216 124 C210 104 198 94 182 90 C162 86 134 90 118 104 C112 110 106 118 104 124 Z"
          fill={PELO}
        />
        <path d="M146 56 C150 70 162 80 182 82 C170 72 166 62 168 50 C160 58 152 60 146 56 Z" fill={PELO_OSCURO} opacity={0.7} />
        <path d="M104 124 C104 134 106 142 110 148 L114 120 Z M216 124 C216 134 214 142 210 148 L206 120 Z" fill={PELO} />
      </g>
    </svg>
  );
};
