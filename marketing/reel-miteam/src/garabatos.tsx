// Trazos a mano de la hoja de recursos de MiTeam, animados: rayitas, subrayados,
// flechas curvas, destellos de 4 puntas y garabatos. Se ubican con x/y absolutos.
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const tramo = (frame: number, desde: number, dur: number) =>
  interpolate(frame, [desde, desde + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

type Base = { x: number; y: number; delay: number; color: string };

// Tres rayitas que salen de un punto, como las del logo en los stickers.
export const Rayitas: React.FC<Base & { angulo: number; largo?: number; grosor?: number; fugaz?: boolean }> = ({
  x,
  y,
  delay,
  color,
  angulo,
  largo = 70,
  grosor = 11,
  fugaz = false,
}) => {
  const frame = useCurrentFrame();
  const sale = tramo(frame, delay, 7);
  const vuela = fugaz ? tramo(frame, delay + 8, 9) : 0;
  const r0 = 26 + vuela * 40;
  const r1 = r0 + largo * sale * (1 - vuela * 0.6);
  const lineas = [-38, 0, 38].map((d, i) => {
    const a = ((angulo + d) * Math.PI) / 180;
    const extra = i === 1 ? 1.25 : 1;
    return { x1: Math.cos(a) * r0, y1: Math.sin(a) * r0, x2: Math.cos(a) * r1 * extra, y2: Math.sin(a) * r1 * extra };
  });
  const caja = largo * 1.4 + 70;
  return (
    <svg
      width={caja * 2}
      height={caja * 2}
      viewBox={`${-caja} ${-caja} ${caja * 2} ${caja * 2}`}
      style={{ position: "absolute", left: x - caja, top: y - caja, opacity: sale > 0 ? 1 - vuela : 0, overflow: "visible" }}
    >
      {lineas.map((l, i) => (
        <line key={i} {...l} stroke={color} strokeWidth={grosor} strokeLinecap="round" />
      ))}
    </svg>
  );
};

// Subrayado de marcador en dos pasadas, como el de "MiTeam!" en el sticker.
export const Subrayado: React.FC<Base & { ancho: number; grosor?: number }> = ({ x, y, delay, color, ancho, grosor = 10 }) => {
  const frame = useCurrentFrame();
  const a = tramo(frame, delay, 9);
  const b = tramo(frame, delay + 6, 9);
  return (
    <svg width={ancho} height={44} viewBox="0 0 300 44" preserveAspectRatio="none" fill="none" stroke={color} strokeWidth={grosor} strokeLinecap="round" style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
      <path d="M4 16 C80 6 180 10 296 4" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - a} />
      <path d="M40 34 C120 24 210 28 270 22" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - b} />
    </svg>
  );
};

// Flecha curva dibujada a mano, con la punta que aparece al final.
export const FlechaCurva: React.FC<Base & { ancho?: number; giro?: number; espejo?: boolean }> = ({
  x,
  y,
  delay,
  color,
  ancho = 200,
  giro = 0,
  espejo = false,
}) => {
  const frame = useCurrentFrame();
  const cuerpo = tramo(frame, delay, 12);
  const punta = tramo(frame, delay + 11, 5);
  return (
    <svg
      width={ancho}
      height={ancho * 0.75}
      viewBox="0 0 160 120"
      fill="none"
      stroke={color}
      strokeWidth={9}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ position: "absolute", left: x, top: y, transform: `rotate(${giro}deg) scaleX(${espejo ? -1 : 1})`, overflow: "visible" }}
    >
      <path d="M10 100 C30 40 80 20 140 36" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - cuerpo} />
      <path d="M116 14 L142 36 L114 56" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - punta} />
    </svg>
  );
};

// Destello de 4 puntas que aparece girando y después titila.
export const Destello: React.FC<Base & { tam?: number }> = ({ x, y, delay, color, tam = 70 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 9, stiffness: 160, mass: 0.6 } });
  const titila = frame > delay + 12 ? 1 + Math.sin((frame - delay) / 5) * 0.08 : 1;
  return (
    <svg
      width={tam}
      height={tam}
      viewBox="0 0 24 24"
      style={{ position: "absolute", left: x - tam / 2, top: y - tam / 2, transform: `scale(${p * titila}) rotate(${(1 - p) * -90}deg)`, opacity: Math.min(1, p * 2) }}
    >
      <path d="M12 1.5C12.9 8.6 15.4 11.1 22.5 12C15.4 12.9 12.9 15.4 12 22.5C11.1 15.4 8.6 12.9 1.5 12C8.6 11.1 11.1 8.6 12 1.5Z" fill={color} />
    </svg>
  );
};

// Garabato ondulado, como los "~~" de la hoja de recursos.
export const Garabato: React.FC<Base & { ancho?: number }> = ({ x, y, delay, color, ancho = 260 }) => {
  const frame = useCurrentFrame();
  const p = tramo(frame, delay, 14);
  return (
    <svg width={ancho} height={ancho * 0.28} viewBox="0 0 112 32" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: x, top: y }}>
      <path d="M4 18 C14 2 24 2 30 18 S46 34 56 18 S72 2 82 18 S98 34 108 18" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
    </svg>
  );
};

// Ondas de clic alrededor del cursor, como el puntero con rayitas de la hoja.
export const OndaClic: React.FC<Base> = ({ x, y, delay, color }) => {
  const frame = useCurrentFrame();
  const p = tramo(frame, delay, 10);
  if (p <= 0 || p >= 1) return null;
  return (
    <svg width={220} height={220} viewBox="-110 -110 220 220" style={{ position: "absolute", left: x - 110, top: y - 110, opacity: 1 - p }}>
      <circle r={20 + p * 80} fill="none" stroke={color} strokeWidth={8 * (1 - p) + 2} />
    </svg>
  );
};
