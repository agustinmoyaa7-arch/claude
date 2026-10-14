// Reel "Juan": la historia de un dueño de café que deja la planilla.
// Parte 1 ilustrada y cálida, parte 2 una sola forma que se transforma en la app,
// parte 3 vuelve al café. Todo está sincronizado con public/voz-juan.mp3.
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  interpolateColors,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { C, display, F, Mascota } from "./brand";
import { FlechaCurva, OndaClic, Rayitas } from "./garabatos";
import { Juan } from "./JuanPersonaje";
import { LogoFinal } from "./Presentacion";

const FPS = 30;
// Pausa que se abre en la voz después de "…en la barra", para que la tablet respire.
// Todos los tiempos de este archivo están en segundos de la voz; s() los pasa a cuadros del video.
const CORTE = 24.6;
const PAUSA = 1.8;
const crudo = (seg: number) => Math.round(seg * FPS);
const s = (seg: number) => crudo(seg >= CORTE ? seg + PAUSA : seg);
const suave = Easing.inOut(Easing.cubic);

// Segundos en los que la voz dice cada frase (medidos en voz-juan.mp3).
const T = {
  cafe: 1.62,
  gente: 5.1,
  planilla: 7.41,
  p1: 11.43,
  p2: 12.64,
  p3: 13.9,
  repetian: 15.8,
  meses: 17.51,
  miteam: 19.18,
  pin: 20.96,
  celular: 24.88,
  internet: 27.03,
  finMes: 29.67,
  clic: 30.75,
  excel: 30.95,
  tiempo: 35.41,
  suCafe: 38.04,
  probalo: 39.02,
  logo: 42.3,
  fin: 45,
};
export const DURACION_JUAN = s(T.fin);

const CREMA = "#FAF6EE";
const CREMA_GASTADA = "#F1EBDF";
const MADERA = "#E8DCC6";
const BARRA = "#F3EBDD";
const MANCHA = "#CDBA97";

// Ayudas de animación (todas dependen solo del cuadro actual)

const tramo = (frame: number, desde: number, hasta: number) =>
  interpolate(frame, [desde, hasta], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });

const pista = (frame: number, claves: [number, number][]) => {
  if (frame <= claves[0][0]) return claves[0][1];
  for (let i = 0; i < claves.length - 1; i++) {
    const [f0, v0] = claves[i];
    const [f1, v1] = claves[i + 1];
    if (frame <= f1) return v0 + (v1 - v0) * tramo(frame, f0, f1);
  }
  return claves[claves.length - 1][1];
};

const ventana = (frame: number, desde: number, hasta: number, fundido = 12) =>
  Math.min(tramo(frame, desde, desde + fundido), 1 - tramo(frame, hasta, hasta + fundido));

const resorte = (frame: number, desde: number, damping = 13, stiffness = 110) =>
  spring({ frame: frame - desde, fps: FPS, config: { damping, stiffness, mass: 0.9 } });

const parpadeos = (frame: number, cuadros: number[]) =>
  Math.max(0, ...cuadros.map((c) => 1 - Math.min(1, Math.abs(frame - c) / 3)));

const rr = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;

const Trazo: React.FC<{ d: string; p: number; w?: number; color?: string; fill?: string }> = ({ d, p, w = 6, color = C.violet, fill }) => (
  <>
    {fill && <path d={d} fill={fill} opacity={Math.min(1, Math.max(0, p * 2 - 0.8))} />}
    {p > 0.002 && <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />}
  </>
);

const Icono24: React.FC<{ tam: number; color?: string; grosor?: number; children: React.ReactNode }> = ({ tam, color = C.violet, grosor = 1.8, children }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={grosor} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const Globo: React.FC<{ x: number; y: number; desde: number; cola: "izq" | "der"; children: React.ReactNode }> = ({ x, y, desde, cola, children }) => {
  const frame = useCurrentFrame();
  const p = resorte(frame, desde, 11);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `scale(${p}) rotate(${(1 - p) * (cola === "izq" ? -8 : 8)}deg)`, transformOrigin: cola === "izq" ? "100% 100%" : "0% 100%", opacity: Math.min(1, p * 2) }}>
      <div style={{ background: C.white, border: `5px solid ${C.violet}`, borderRadius: 60, padding: "20px 34px", fontFamily: F.hand, fontSize: 44, color: C.ink, whiteSpace: "nowrap" }}>{children}</div>
      <svg width={60} height={40} viewBox="0 0 60 40" style={{ position: "absolute", bottom: -32, [cola === "izq" ? "right" : "left"]: 50 }}>
        <path d={cola === "izq" ? "M6 0 L44 34 L40 0" : "M54 0 L16 34 L20 0"} fill={C.white} stroke={C.violet} strokeWidth={5} strokeLinejoin="round" />
        <path d={cola === "izq" ? "M8 -3 L38 -3" : "M22 -3 L52 -3"} stroke={C.white} strokeWidth={8} />
      </svg>
    </div>
  );
};

// PARTE 1 · La historia

const EscenaCafe: React.FC = () => {
  const frame = useCurrentFrame();
  const p = (a: number, b: number) => tramo(frame, s(a), s(b));
  const brazo = tramo(frame, 6, 18) * (1 - tramo(frame, s(2.2), s(2.8)));
  const ola = Math.sin(frame / 3.4) * 16 * brazo;
  const etiqueta = tramo(frame, 8, 18) * (1 - tramo(frame, s(2.3), s(2.8)));
  const vapor = Math.sin(frame / 12) * 7;
  const corazon = resorte(frame, s(6.3), 10);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <Trazo d={rr(350, 250, 380, 112, 26)} p={p(2.6, 3.3)} fill={C.white} />
        <Trazo d="M270 150 L270 300 M810 150 L810 300" p={p(1.7, 2.3)} w={5} />
        <Trazo d="M220 362 L320 362 L300 300 L240 300 Z" p={p(1.9, 2.5)} fill={C.violetSoft} />
        <Trazo d="M760 362 L860 362 L840 300 L780 300 Z" p={p(1.9, 2.5)} fill={C.violetSoft} />
        <Trazo d={rr(704, 450, 286, 330, 22)} p={p(2.2, 3.0)} fill={C.white} />
        <Trazo d="M847 450 L847 780 M704 615 L990 615" p={p(2.6, 3.2)} w={5} />
        <Trazo d="M70 640 L340 640" p={p(2.4, 2.9)} />
        {[100, 172, 244].map((x, i) => (
          <Trazo key={x} d={`M${x} 594 L${x + 46} 594 L${x + 42} 632 Q${x + 23} 642 ${x + 4} 632 Z`} p={p(2.6 + i * 0.15, 3.1 + i * 0.15)} w={5} fill={C.white} />
        ))}
      </svg>
      <div style={{ position: "absolute", left: 350, top: 274, width: 380, textAlign: "center", fontFamily: F.hand, fontSize: 52, lineHeight: 1.2, whiteSpace: "nowrap", color: C.violet, opacity: p(3.0, 3.5) }}>Café de Juan</div>

      <div style={{ position: "absolute", left: 280, top: 404 }}>
        <Juan ancho={520} dibujo={tramo(frame, 0, 20)} brazo={brazo} ola={ola} parpadeo={parpadeos(frame, [s(3.4), s(6.6)])} />
      </div>

      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <Trazo d={rr(70, 1098, 940, 230, 10)} p={p(1.7, 2.6)} fill={BARRA} />
        <Trazo d={rr(50, 1070, 980, 30, 10)} p={p(1.7, 2.4)} fill={MADERA} />
        <Trazo d="M330 1130 L330 1300 M590 1130 L590 1300 M850 1130 L850 1300" p={p(2.4, 3.0)} w={4} />
        <Trazo d={rr(120, 884, 220, 186, 22)} p={p(2.0, 2.9)} fill={C.white} />
        <Trazo d={rr(108, 860, 244, 30, 10)} p={p(2.2, 2.8)} fill={C.violetSoft} />
        <Trazo d="M230 902 m-24 0 a24 24 0 1 0 48 0 a24 24 0 1 0 -48 0" p={p(2.6, 3.1)} w={5} />
        <Trazo d={rr(190, 975, 80, 26, 6)} p={p(2.7, 3.1)} w={5} fill={C.violetSoft} />
        <Trazo d="M206 1030 L254 1030 L250 1064 Q230 1072 210 1064 Z" p={p(2.9, 3.3)} w={5} fill={C.white} />
        <Trazo d="M770 1000 L860 1000 L854 1064 Q815 1080 776 1064 Z" p={p(3.4, 3.9)} fill={C.white} />
        <Trazo d="M860 1014 C888 1014 890 1052 858 1052" p={p(3.7, 4.0)} w={5} />
        <g transform={`translate(${vapor} 0)`}>
          <Trazo d="M796 978 C780 958 812 944 796 922" p={p(3.9, 4.5)} w={5} />
          <Trazo d="M832 978 C816 958 848 944 832 922" p={p(4.0, 4.6)} w={5} />
        </g>
      </svg>

      <div style={{ opacity: etiqueta }}>
        <div style={{ position: "absolute", left: 90, top: 470, fontFamily: F.hand, fontSize: 104, color: C.violet, transform: "rotate(-6deg)" }}>Juan</div>
        <FlechaCurva x={200} y={590} ancho={160} giro={28} delay={14} color={C.violet} />
      </div>

      <Globo x={52} y={690} desde={s(T.gente) + 3} cola="izq">
        ¡Hola, Juan!
      </Globo>
      <Globo x={640} y={830} desde={s(5.75)} cola="der">
        ¡Lo de siempre!
      </Globo>
      <svg width={90} height={90} viewBox="0 0 24 24" style={{ position: "absolute", left: 650, top: 420, transform: `scale(${corazon}) rotate(${(1 - corazon) * 20}deg)`, opacity: Math.min(1, corazon * 2) }}>
        <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" fill={C.violet} />
      </svg>
    </AbsoluteFill>
  );
};

const FILAS_PLANILLA = [
  ["Lucía", "8:58", "17:0?"],
  ["Martín", "9:1?", "18:3?"],
  ["Sofía", "¿?", "15:00"],
  ["Diego", "16:0?", "¿?"],
  ["Lucía", "9:02", "17:?"],
  ["Martín", "8:14", "¿?"],
  ["Sofía", "—", "14:5?"],
  ["Diego", "¿16?", "00:4?"],
];

const EscenaPlanilla: React.FC = () => {
  const frame = useCurrentFrame();
  const entra = spring({ frame: frame - s(T.planilla) - 2, fps: FPS, config: { damping: 22, stiffness: 55, mass: 1 } });
  const tachones = [s(8.6), s(9.4), s(10.2)];
  const zigzag = (x: number, y: number) => `M${x} ${y} l20 -14 l20 28 l20 -28 l20 28 l20 -28 l20 14`;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 392, top: 300, width: 610, height: 880, background: C.white, border: `6px solid ${C.violet}`, borderRadius: 18, boxSizing: "border-box", transform: `translateY(${(1 - entra) * 1100}px) rotate(${3 + (1 - entra) * 6}deg)` }}>
        <div style={{ position: "absolute", left: 30, top: 36, fontFamily: F.hand, fontSize: 52, color: C.ink }}>Horarios · octubre</div>
        {["Nombre", "Entra", "Sale"].map((t, i) => (
          <div key={t} style={{ position: "absolute", left: [30, 250, 430][i], top: 118, fontFamily: F.hand, fontSize: 32, color: C.muted }}>{t}</div>
        ))}
        <svg width={598} height={868} viewBox="0 0 598 868" style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={i} x1={24} x2={574} y1={170 + i * 80} y2={170 + i * 80} stroke={C.line} strokeWidth={3} />
          ))}
          <line x1={226} x2={226} y1={120} y2={810} stroke={C.line} strokeWidth={3} />
          <line x1={408} x2={408} y1={120} y2={810} stroke={C.line} strokeWidth={3} />
          <circle cx={500} cy={790} r={46} fill="none" stroke={MANCHA} strokeWidth={7} opacity={0.55} />
          <Trazo d={zigzag(244, 330)} p={tramo(frame, tachones[0], tachones[0] + 8)} w={6} />
          <Trazo d={zigzag(428, 490)} p={tramo(frame, tachones[1], tachones[1] + 8)} w={6} />
          <Trazo d={zigzag(244, 650)} p={tramo(frame, tachones[2], tachones[2] + 8)} w={6} />
        </svg>
        {FILAS_PLANILLA.map((fila, i) =>
          fila.map((t, j) => {
            const aparece = tramo(frame, s(7.9) + i * 5 + j * 2, s(7.9) + i * 5 + j * 2 + 6);
            return (
              <div key={`${i}-${j}`} style={{ position: "absolute", left: [30, 250, 430][j], top: 182 + i * 80, fontFamily: F.hand, fontSize: 40, color: j === 0 ? C.ink : "#3E3A56", opacity: aparece, transform: `rotate(${((i + j) % 3) - 1}deg)` }}>
                {t}
              </div>
            );
          }),
        )}
      </div>
      <div style={{ position: "absolute", left: 40, top: 800 }}>
        <Juan ancho={330} expresion="preocupado" parpadeo={parpadeos(frame, [s(9.8)])} />
      </div>
    </AbsoluteFill>
  );
};

const BurbujaPregunta: React.FC<{ x: number; y: number; desde: number; children: React.ReactNode }> = ({ x, y, desde, children }) => {
  const frame = useCurrentFrame();
  const p = resorte(frame, desde, 11);
  const flota = Math.sin((frame - desde) / 18) * 8;
  return (
    <div style={{ position: "absolute", left: x - 105, top: y - 105 + flota, width: 210, height: 210, transform: `scale(${p})`, opacity: Math.min(1, p * 2) }}>
      <div style={{ width: 210, height: 210, borderRadius: "50%", background: C.white, border: `6px solid ${C.violet}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
      <span style={{ ...display, position: "absolute", right: -46, top: -70, fontSize: 130, color: C.violet }}>?</span>
    </div>
  );
};

const EscenaPreguntas: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 310, top: 470 }}>
        <Juan ancho={460} expresion="preocupado" parpadeo={parpadeos(frame, [s(14.7)])} />
      </div>
      <BurbujaPregunta x={200} y={500} desde={s(T.p1)}>
        <Icono24 tam={116}>
          <circle cx={12} cy={12} r={9} />
          <path d="M12 7v5l3 2" />
        </Icono24>
      </BurbujaPregunta>
      <BurbujaPregunta x={860} y={470} desde={s(T.p2)}>
        <Icono24 tam={112}>
          <path d="M10 4H6v16h4" />
          <path d="M14 8l4 4-4 4" />
          <path d="M18 12H9" />
        </Icono24>
      </BurbujaPregunta>
      <BurbujaPregunta x={870} y={1010} desde={s(T.p3)}>
        <Icono24 tam={112}>
          <rect x={6} y={3} width={12} height={18} rx={2} />
          <rect x={8.5} y={6} width={7} height={3} rx={0.6} />
          <circle cx={9} cy={13} r={0.6} fill={C.violet} />
          <circle cx={12} cy={13} r={0.6} fill={C.violet} />
          <circle cx={15} cy={13} r={0.6} fill={C.violet} />
          <circle cx={9} cy={16.5} r={0.6} fill={C.violet} />
          <circle cx={12} cy={16.5} r={0.6} fill={C.violet} />
          <circle cx={15} cy={16.5} r={0.6} fill={C.violet} />
        </Icono24>
      </BurbujaPregunta>
    </AbsoluteFill>
  );
};

const EscenaMeses: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 40, top: 930 }}>
      <Juan ancho={260} expresion="preocupado" parpadeo={parpadeos(frame, [s(17.0), s(18.7)])} />
    </div>
  );
};

const EscenaFinal: React.FC = () => {
  const frame = useCurrentFrame();
  const p = (a: number, b: number) => tramo(frame, s(a), s(b));
  const queda = 1 - tramo(frame, s(T.suCafe), s(T.suCafe) + 22);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, opacity: queda }}>
        <Trazo d={rr(90, 280, 300, 300, 24)} p={p(35.5, 36.3)} fill={C.white} />
        <circle cx={240} cy={440} r={62} fill="#F6C88B" opacity={p(36.0, 36.6) * 0.85} />
        <Trazo d="M240 280 L240 580 M90 430 L390 430" p={p(35.9, 36.5)} w={5} />
        <Trazo d="M800 150 L800 300" p={p(35.6, 36.0)} w={5} />
        <Trazo d="M750 362 L850 362 L830 300 L770 300 Z" p={p(35.7, 36.2)} fill={C.violetSoft} />
      </svg>
      <div style={{ position: "absolute", left: 96, top: 540, opacity: queda }}>
        <Juan ancho={440} expresion="tranquilo" dibujo={p(35.6, 36.9)} parpadeo={parpadeos(frame, [s(37.3)])} />
      </div>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <Trazo d={rr(80, 1226, 920, 150, 10)} p={p(35.5, 36.2)} fill={BARRA} />
        <Trazo d={rr(60, 1198, 960, 30, 10)} p={p(35.5, 36.1)} fill={MADERA} />
      </svg>
    </AbsoluteFill>
  );
};

// PARTE 2 · Una sola forma que se transforma

type Forma = { t: number; cx: number; cy: number; w: number; h: number; rt: number; rb: number; borde: number; fondo: string; bordeColor: string };
type Num = "cx" | "cy" | "w" | "h" | "rt" | "rb" | "borde";

const FORMAS: Forma[] = [
  { t: T.repetian, cx: 560, cy: 720, w: 560, h: 600, rt: 40, rb: 40, borde: 6, fondo: C.white, bordeColor: C.violet }, // calendario
  { t: T.miteam, cx: 540, cy: 800, w: 380, h: 380, rt: 110, rb: 110, borde: 0, fondo: C.violet, bordeColor: C.violet }, // ícono de MiTeam
  { t: T.pin, cx: 540, cy: 820, w: 780, h: 1040, rt: 64, rb: 64, borde: 0, fondo: C.violet, bordeColor: C.violet }, // tablet
  { t: T.celular, cx: 540, cy: 820, w: 560, h: 1080, rt: 84, rb: 84, borde: 0, fondo: C.ink, bordeColor: C.ink }, // celular
  { t: T.excel, cx: 540, cy: 800, w: 920, h: 820, rt: 32, rb: 32, borde: 4, fondo: C.white, bordeColor: C.line }, // Excel
  { t: T.tiempo, cx: 620, cy: 1058, w: 340, h: 280, rt: 22, rb: 150, borde: 8, fondo: C.white, bordeColor: C.violet }, // taza
];
const RESORTE = { damping: 19, stiffness: 95, mass: 1 };
const aDe = (frame: number, i: number) => spring({ frame: frame - s(FORMAS[i].t), fps: FPS, config: RESORTE });

const valorForma = (frame: number, k: Num) => {
  let v = FORMAS[0][k];
  for (let i = 1; i < FORMAS.length; i++) v += (FORMAS[i][k] - FORMAS[i - 1][k]) * aDe(frame, i);
  return v;
};

const colorForma = (frame: number, k: "fondo" | "bordeColor") => {
  let i = 0;
  for (let j = 1; j < FORMAS.length; j++) if (frame >= s(FORMAS[j].t)) i = j;
  if (i === 0) return FORMAS[0][k];
  return interpolateColors(Math.min(1, aDe(frame, i)), [0, 1], [FORMAS[i - 1][k], FORMAS[i][k]]);
};

// Tablet: medidas compartidas entre el dibujo y el dedo que toca las teclas
const TAB = { w: 780, h: 1040, cx: 540, cy: 820, pad: 44, tecladoTop: 496, teclaH: 96, gap: 14 };
const TECLAS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "✓"];
const COL_W = (TAB.w - TAB.pad * 2 - TAB.gap * 2) / 3;
const centroTecla = (idx: number): [number, number] => {
  const fila = Math.floor(idx / 3);
  const col = idx % 3;
  return [TAB.cx - TAB.w / 2 + TAB.pad + col * (COL_W + TAB.gap) + COL_W / 2, TAB.cy - TAB.h / 2 + TAB.tecladoTop + fila * (TAB.teclaH + TAB.gap) + TAB.teclaH / 2];
};
const PIN = ["4", "8", "1", "5"];
const TOQUES_PIN = [22.1, 22.65, 23.2, 23.75];
const TOQUE_OK = 24.3;
const SALUDO = 24.42;
const BOTON_CIERRE: [number, number] = [540, 1229];

const ContCalendario: React.FC = () => {
  const frame = useCurrentFrame();
  const meses: [string, number][] = [["OCT", T.repetian], ["NOV", 16.5], ["DIC", 17.2], ["ENE", 17.9], ["FEB", 18.5]];
  let actual = 0;
  meses.forEach(([, t], i) => {
    if (frame >= s(t)) actual = i;
  });
  const cambio = actual === 0 ? 1 : tramo(frame, s(meses[actual][1]), s(meses[actual][1]) + 8);
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 130, background: C.violet }} />
      {[150, 386].map((x) => (
        <div key={x} style={{ position: "absolute", left: x, top: 28, width: 24, height: 70, borderRadius: 12, background: C.white }} />
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", transform: `translateY(${(1 - cambio) * -50}px)`, opacity: cambio, filter: `blur(${(1 - cambio) * 6}px)` }}>
        <div style={{ ...display, fontSize: 176, lineHeight: 1, color: C.ink }}>{meses[actual][0]}</div>
        <div style={{ fontFamily: F.hand, fontSize: 84, color: C.violet, marginTop: 30, letterSpacing: "0.3em" }}>? ? ?</div>
      </div>
    </>
  );
};

const ContIcono: React.FC = () => {
  const frame = useCurrentFrame();
  const dibujo = tramo(frame, s(T.miteam) + 6, s(T.miteam) + 26);
  const ojos = Math.min(1, resorte(frame, s(T.miteam) + 26, 10));
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Mascota width={270} color={C.white} dibujo={dibujo} ojos={ojos} />
    </div>
  );
};

const ContTablet: React.FC = () => {
  const frame = useCurrentFrame();
  const llenos = TOQUES_PIN.filter((t) => frame >= s(t)).length;
  const saludo = resorte(frame, s(SALUDO), 12);
  const activa = (idx: number) => {
    const tecla = TECLAS[idx];
    const tiempos = TOQUES_PIN.filter((_, i) => PIN[i] === tecla).concat(tecla === "✓" ? [TOQUE_OK] : []);
    return tiempos.some((t) => frame >= s(t) && frame < s(t) + 6);
  };
  return (
    <>
      <div style={{ position: "absolute", left: TAB.pad, right: TAB.pad, top: 44, display: "flex", justifyContent: "space-between", fontSize: 28, color: C.violetMuted, fontFamily: F.body }}>
        <span>Café de Juan</span>
        <span>Tablet de la barra</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 104, textAlign: "center", fontFamily: F.mono, fontSize: 128, fontWeight: 600, lineHeight: 1, color: C.white }}>08:59</div>
      <div style={{ position: "absolute", left: TAB.pad, right: TAB.pad, top: 266, height: 150 }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: C.violetMuted, fontFamily: F.body, opacity: 1 - Math.min(1, saludo) }}>Escribí tu PIN</div>
        <div style={{ position: "absolute", inset: 0, background: C.white, borderRadius: 34, padding: "0 36px", display: "flex", alignItems: "center", gap: 26, transform: `scale(${0.7 + 0.3 * saludo})`, opacity: Math.min(1, saludo * 2) }}>
          <Mascota width={110} color={C.violet} />
          <div style={{ display: "flex", flexDirection: "column", fontFamily: F.body }}>
            <span style={{ ...display, fontWeight: 800, fontSize: 56, color: C.ink }}>¡Hola, Lucía!</span>
            <span style={{ fontSize: 32, color: C.muted }}>Entrada registrada · 08:59</span>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 440, display: "flex", justifyContent: "center", gap: 24 }}>
        {PIN.map((_, i) => (
          <span key={i} style={{ width: 26, height: 26, borderRadius: "50%", border: `3px solid ${C.white}`, boxSizing: "border-box", background: i < llenos ? C.white : "transparent" }} />
        ))}
      </div>
      {TECLAS.map((t, idx) => {
        const fila = Math.floor(idx / 3);
        const col = idx % 3;
        const on = activa(idx);
        const ok = t === "✓";
        return (
          <div
            key={t}
            style={{
              position: "absolute",
              left: TAB.pad + col * (COL_W + TAB.gap),
              top: TAB.tecladoTop + fila * (TAB.teclaH + TAB.gap),
              width: COL_W,
              height: TAB.teclaH,
              borderRadius: 26,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: F.mono,
              fontSize: 42,
              fontWeight: 600,
              background: ok || on ? C.white : "rgba(255,255,255,0.16)",
              color: ok || on ? C.violet : C.white,
              transform: `scale(${on ? 0.93 : 1})`,
            }}
          >
            {t}
          </div>
        );
      })}
    </>
  );
};

const Chip: React.FC<{ color: string; fondo: string; children: React.ReactNode }> = ({ color, fondo, children }) => (
  <span style={{ fontSize: 24, fontWeight: 600, color, background: fondo, padding: "10px 18px", borderRadius: 30, whiteSpace: "nowrap", fontFamily: F.body }}>{children}</span>
);

const FILAS_VIVO = [
  { n: "Lucía", sub: "Salón · entró 08:59", chip: "Adentro", color: C.ok, fondo: C.okBg, ini: "L" },
  { n: "Martín", sub: "Cocina · entró 08:14", chip: "Tarde · 14 min", color: C.warn, fondo: C.warnBg, ini: "M" },
  { n: "Sofía", sub: "Caja · entró 10:02", chip: "Adentro", color: C.ok, fondo: C.okBg, ini: "S" },
  { n: "Diego", sub: "Barra · turno 16:00", chip: "Más tarde", color: C.violet, fondo: C.violetSoft, ini: "D" },
];

const FilaTel: React.FC<{ top: number; ini: string; n: string; sub: string; chip: React.ReactNode; style?: React.CSSProperties }> = ({ top, ini, n, sub, chip, style }) => (
  <div style={{ position: "absolute", left: 32, right: 32, top, height: 124, display: "flex", alignItems: "center", gap: 18, borderTop: `2px solid ${C.line}`, fontFamily: F.body, ...style }}>
    <span style={{ width: 64, height: 64, borderRadius: "50%", background: C.violetSoft, color: C.violet, fontSize: 26, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{ini}</span>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
      <span style={{ fontSize: 32, fontWeight: 600, color: C.ink, whiteSpace: "nowrap" }}>{n}</span>
      <span style={{ fontSize: 22, color: C.muted, whiteSpace: "nowrap" }}>{sub}</span>
    </div>
    {chip}
  </div>
);

const ContTelefono: React.FC = () => {
  const frame = useCurrentFrame();
  const cierre = tramo(frame, s(T.finMes), s(T.finMes) + 10);
  const nueva = tramo(frame, s(27.6), s(27.6) + 12);
  const sinRed = frame >= s(T.internet) && frame < s(28.6);
  const sincro = frame >= s(28.6);
  const estado = resorte(frame, sincro ? s(28.6) : s(T.internet), 12);
  const checks = [0, 1, 2].map((i) => tramo(frame, s(T.finMes) + 10 + i * 5, s(T.finMes) + 16 + i * 5));
  const presion = interpolate(frame, [s(T.clic) - 2, s(T.clic) + 1, s(T.clic) + 6], [1, 0.94, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 16, top: 16, width: 528, height: 1048, borderRadius: 68, background: C.white, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - cierre }}>
        <div style={{ ...display, position: "absolute", left: 32, top: 66, fontSize: 48, fontWeight: 800, color: C.ink }}>Hoy en el café</div>
        <div style={{ position: "absolute", left: 32, top: 138, fontFamily: F.body, fontSize: 24, fontWeight: 600 }}>
          {!sinRed && !sincro && (
            <span style={{ color: C.green, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", background: C.green }} />
              En vivo
            </span>
          )}
          {sinRed && (
            <span style={{ display: "flex", alignItems: "center", gap: 10, color: C.warn, background: C.warnBg, padding: "8px 16px", borderRadius: 30, transform: `scale(${0.8 + 0.2 * estado})` }}>
              <Icono24 tam={26} color={C.warn} grosor={2.2}>
                <path d="M2 8.8a15 15 0 0 1 4.2-2.6 M10.6 5.1A15 15 0 0 1 22 8.8 M5 12.6a10 10 0 0 1 5.2-2.7 M16.8 11.2a10 10 0 0 1 2.2 1.4 M8.5 16.3a5 5 0 0 1 7 0 M3 3l18 18" />
              </Icono24>
              Sin internet en el café
            </span>
          )}
          {sincro && (
            <span style={{ display: "flex", alignItems: "center", gap: 10, color: C.ok, background: C.okBg, padding: "8px 16px", borderRadius: 30, transform: `scale(${0.8 + 0.2 * estado})` }}>
              <Icono24 tam={24} color={C.ok} grosor={2.6}>
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </Icono24>
              Sincronizado
            </span>
          )}
        </div>
        <FilaTel
          top={210}
          ini="S"
          n="Sofía"
          sub="Caja · salió 15:02"
          chip={<Chip color={C.muted} fondo="#F1EFF8">sin conexión ✓</Chip>}
          style={{ opacity: nueva, transform: `translateX(${(1 - nueva) * -40}px)` }}
        />
        {FILAS_VIVO.map((f, i) => (
          <FilaTel key={f.n} top={210 + (i + nueva) * 130} ini={f.ini} n={f.n} sub={f.sub} chip={<Chip color={f.color} fondo={f.fondo}>{f.chip}</Chip>} />
        ))}
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: cierre }}>
        <div style={{ ...display, position: "absolute", left: 32, top: 66, fontSize: 48, fontWeight: 800, color: C.ink }}>Cierre de octubre</div>
        {["Horas y tarifa", "Bonos y descuentos", "Total por empleado"].map((t, i) => (
          <div key={t} style={{ position: "absolute", left: 32, right: 32, top: 170 + i * 96, height: 80, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `2px solid ${C.line}`, fontFamily: F.body, fontSize: 30, fontWeight: 500, color: C.ink }}>
            <span>{t}</span>
            <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - checks[i]} />
            </svg>
          </div>
        ))}
        <div style={{ position: "absolute", left: 32, right: 32, top: 490, display: "flex", gap: 16, opacity: checks[2] }}>
          {[["580 h", "trabajadas"], ["13 h", "extra"]].map(([v, t]) => (
            <div key={t} style={{ flex: 1, background: C.violetSoft, borderRadius: 28, padding: "26px 24px", display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontFamily: F.mono, fontSize: 46, fontWeight: 600, color: C.violet }}>{v}</span>
              <span style={{ fontFamily: F.body, fontSize: 24, color: C.muted }}>{t}</span>
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", left: 32, right: 32, bottom: 60, height: 110, borderRadius: 56, background: C.violet, color: C.white, fontFamily: F.body, fontSize: 30, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, transform: `scale(${presion})` }}>
          <Icono24 tam={34} color={C.white} grosor={2.6}>
            <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />
          </Icono24>
          Cerrar mes y bajar Excel
        </div>
      </div>
    </div>
  );
};

const FILAS_EXCEL = [
  ["Lucía", "152 h", "4 h", "$ 712.000"],
  ["Martín", "160 h", "6 h", "$ 768.000"],
  ["Sofía", "120 h", "0 h", "$ 540.000"],
  ["Diego", "148 h", "3 h", "$ 690.000"],
];
const COLS_EXCEL = [
  { left: 40 },
  { right: 450 },
  { right: 290 },
  { right: 40 },
];

const ContExcel: React.FC = () => {
  const frame = useCurrentFrame();
  const total = tramo(frame, s(33.2), s(33.2) + 8);
  const listo = resorte(frame, s(34.0), 10);
  const celda = (j: number): React.CSSProperties => ({ position: "absolute", ...COLS_EXCEL[j], fontFamily: j === 0 ? F.body : F.mono, fontSize: 32, color: C.ink, fontWeight: j === 0 ? 600 : 500 });
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 96, background: C.green, display: "flex", alignItems: "center", gap: 16, padding: "0 40px", fontFamily: F.body, fontSize: 32, fontWeight: 600, color: C.white }}>
        <Icono24 tam={40} color={C.white} grosor={2}>
          <path d="M4 5h16v14H4z M4 10h16 M4 15h16 M10 5v14" />
        </Icono24>
        cierre-octubre.xlsx
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 96, height: 76, background: "#F1EFF8" }}>
        {["Empleado", "Horas", "Extras", "Total a pagar"].map((t, j) => (
          <span key={t} style={{ ...celda(j), top: 24, fontFamily: F.body, fontSize: 24, fontWeight: 600, color: C.muted, letterSpacing: "0.04em" }}>{t}</span>
        ))}
      </div>
      {FILAS_EXCEL.map((fila, i) => {
        const p = tramo(frame, s(31.6 + i * 0.35), s(31.6 + i * 0.35) + 7);
        return (
          <div key={fila[0]} style={{ position: "absolute", left: 0, right: 0, top: 172 + i * 92, height: 92, borderBottom: `2px solid ${C.line}`, opacity: p, transform: `translateY(${(1 - p) * 16}px)` }}>
            {fila.map((t, j) => (
              <span key={j} style={{ ...celda(j), top: 26 }}>{t}</span>
            ))}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 540, height: 96, background: C.violetSoft, opacity: total }}>
        {["Totales", "580 h", "13 h", "$ 2.710.000"].map((t, j) => (
          <span key={j} style={{ ...celda(j), top: 26, color: C.violet, fontWeight: 700 }}>{t}</span>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 676, display: "flex", justifyContent: "center" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 12, background: C.okBg, color: C.ok, fontFamily: F.body, fontSize: 34, fontWeight: 600, padding: "18px 34px", borderRadius: 40, transform: `scale(${listo}) rotate(${(1 - listo) * -6}deg)`, opacity: Math.min(1, listo * 2) }}>
          <Icono24 tam={36} color={C.ok} grosor={2.8}>
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </Icono24>
          Listo para el contador
        </span>
      </div>
    </>
  );
};

const ContTaza: React.FC = () => {
  const frame = useCurrentFrame();
  const asa = tramo(frame, s(T.tiempo) + 14, s(T.tiempo) + 26);
  const vapores = [0, 1, 2].map((i) => tramo(frame, s(T.tiempo) + 26 + i * 5, s(T.tiempo) + 46 + i * 5));
  const meneo = (i: number) => Math.sin(frame / 14 + i * 1.7) * 8;
  return (
    <>
      <div style={{ position: "absolute", left: 30, right: 30, top: 60, height: 0, borderTop: `6px solid ${C.violetSoft}`, opacity: asa }} />
      <svg width={110} height={170} viewBox="0 0 110 170" style={{ position: "absolute", left: 318, top: 44, overflow: "visible" }}>
        <path d="M0 14 C92 14 98 140 0 142" fill="none" stroke={C.violet} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - asa} />
      </svg>
      <svg width={340} height={250} viewBox="0 0 340 250" style={{ position: "absolute", left: 0, top: -260, overflow: "visible" }}>
        {[90, 170, 250].map((x, i) => (
          <path
            key={x}
            d={`M${x} 240 C${x - 30} 200 ${x + 30} 168 ${x} 128 C${x - 22} 98 ${x + 12} 70 ${x} 34`}
            fill="none"
            stroke={C.violet}
            strokeWidth={8}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - vapores[i]}
            transform={`translate(${meneo(i)} 0)`}
            opacity={0.85}
          />
        ))}
      </svg>
    </>
  );
};

const CONTENIDOS: { Comp: React.FC; clip: boolean }[] = [
  { Comp: ContCalendario, clip: true },
  { Comp: ContIcono, clip: true },
  { Comp: ContTablet, clip: true },
  { Comp: ContTelefono, clip: false },
  { Comp: ContExcel, clip: true },
  { Comp: ContTaza, clip: false },
];

const LaForma: React.FC = () => {
  const frame = useCurrentFrame();
  const t0 = s(FORMAS[0].t);
  if (frame < t0 - 1) return null;
  const aparece = resorte(frame, t0, 14, 120);
  const sale = 1 - tramo(frame, s(T.logo) - 4, s(T.logo) + 6);
  const cx = valorForma(frame, "cx");
  const cy = valorForma(frame, "cy");
  const w = valorForma(frame, "w");
  const h = valorForma(frame, "h");
  const rt = Math.max(0, valorForma(frame, "rt"));
  const rb = Math.max(0, valorForma(frame, "rb"));
  const borde = Math.max(0, valorForma(frame, "borde"));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: sale }}>
      <div
        style={{
          position: "absolute",
          left: cx - w / 2,
          top: cy - h / 2,
          width: w,
          height: h,
          borderRadius: `${rt}px ${rt}px ${rb}px ${rb}px`,
          background: colorForma(frame, "fondo"),
          border: `${borde}px solid ${colorForma(frame, "bordeColor")}`,
          boxSizing: "border-box",
          transform: `scale(${aparece})`,
          boxShadow: "0 40px 70px -48px rgba(23, 20, 43, 0.45)",
        }}
      />
      {CONTENIDOS.map(({ Comp, clip }, i) => {
        const inicio = s(FORMAS[i].t) + (i === 0 ? 6 : 5);
        const fin = i < FORMAS.length - 1 ? s(FORMAS[i + 1].t) : s(T.logo);
        const entra = tramo(frame, inicio, inicio + 10);
        const va = tramo(frame, fin - 2, fin + 5);
        const op = entra * (1 - va);
        if (op <= 0.001) return null;
        const f = FORMAS[i];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx - f.w / 2,
              top: cy - f.h / 2,
              width: f.w,
              height: f.h,
              borderRadius: `${f.rt}px ${f.rt}px ${f.rb}px ${f.rb}px`,
              overflow: clip ? "hidden" : "visible",
              opacity: op,
              filter: `blur(${(1 - entra) * 10 + va * 10}px)`,
              transform: i === 0 ? `scale(${aparece})` : undefined,
            }}
          >
            <Comp />
          </div>
        );
      })}
    </div>
  );
};

// Dedo que toca la pantalla
const CAMINO: [number, number, number][] = [
  [21.55, 760, 1500],
  [21.98, ...centroTecla(TECLAS.indexOf(PIN[0]))],
  [22.53, ...centroTecla(TECLAS.indexOf(PIN[1]))],
  [23.08, ...centroTecla(TECLAS.indexOf(PIN[2]))],
  [23.63, ...centroTecla(TECLAS.indexOf(PIN[3]))],
  [24.18, ...centroTecla(TECLAS.indexOf("✓"))],
  [24.58, 900, 1520],
  [30.1, 820, 1520],
  [30.6, ...BOTON_CIERRE],
  [31.25, 780, 1520],
];
const TOQUES = [...TOQUES_PIN, TOQUE_OK, T.clic];

const Dedo: React.FC = () => {
  const frame = useCurrentFrame();
  const x = pista(frame, CAMINO.map(([t, px]) => [s(t), px]));
  const y = pista(frame, CAMINO.map(([t, , py]) => [s(t), py]));
  const op = Math.max(ventana(frame, s(21.55), s(24.46), 5), ventana(frame, s(30.1), s(31.1), 5));
  const presion = Math.max(0, ...TOQUES.map((t) => 1 - Math.min(1, Math.abs(frame - s(t)) / 3)));
  const lugar = (t: number) => {
    const i = CAMINO.findIndex(([tc]) => tc >= t - 0.11);
    return CAMINO[Math.max(0, i)];
  };
  return (
    <>
      {TOQUES.map((t) => {
        const [, px, py] = lugar(t);
        return <OndaClic key={t} x={px} y={py} delay={s(t)} color={C.white} />;
      })}
      <div
        style={{
          position: "absolute",
          left: x - 40,
          top: y - 40,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(23, 20, 43, 0.24)",
          border: "4px solid rgba(255, 255, 255, 0.92)",
          boxSizing: "border-box",
          opacity: op,
          transform: `scale(${1 - 0.18 * presion})`,
          boxShadow: "0 12px 26px -12px rgba(23, 20, 43, 0.55)",
        }}
      />
    </>
  );
};

// Subtítulos: lo que dice la voz, con las palabras clave en violeta (*así*)
const SUBTITULOS: [number, number, string][] = [
  [0.05, 1.5, "Él es *Juan*."],
  [T.cafe, 5.0, "Abrió su café porque le encanta el olor a café recién hecho…"],
  [T.gente, 7.3, "…y la gente que vuelve todos los días."],
  [T.planilla, 11.3, "Lo que no sabía es que iba a pasar tantas horas con una *planilla*."],
  [T.p1, 12.5, "¿Quién llegó *tarde*?"],
  [T.p2, 13.8, "¿Quién se fue *antes*?"],
  [T.p3, 15.7, "¿Cuántas *extras* hizo cada uno?"],
  [T.repetian, 17.4, "Preguntas que se repetían."],
  [T.meses, 19.05, "Todos los meses."],
  [T.miteam, 20.85, "Hasta que probó *MiTeam*."],
  [T.pin, 24.8, "Cada empleado ficha con su *PIN*, en la tablet que ya tenía en la barra."],
  [T.celular, 26.95, "Y Juan lo ve todo desde el *celular*."],
  [T.internet, 29.55, "Hasta si se corta internet, *se sigue fichando*."],
  [T.finMes, 32.4, "A fin de mes, *un clic*…"],
  [32.4, 35.3, "…y tiene un *Excel* listo con todos los totales, listo para el contador."],
  [T.tiempo, 37.95, "Ahora Juan tiene tiempo para lo que le gusta."],
  [T.suCafe, 38.95, "*Su café.*"],
];

const Subtitulos: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {SUBTITULOS.map(([a, b, texto]) => {
        const op = ventana(frame, s(a), s(b), 6);
        if (op <= 0.001) return null;
        const sube = tramo(frame, s(a), s(a) + 8);
        return (
          <div key={a} style={{ position: "absolute", left: 70, right: 70, top: 1388, textAlign: "center", opacity: op, transform: `translateY(${(1 - sube) * 18}px)` }}>
            <span style={{ display: "inline-block", background: "rgba(255, 255, 255, 0.86)", borderRadius: 30, padding: "12px 28px", fontFamily: F.body, fontSize: 44, fontWeight: 500, lineHeight: 1.28, color: C.ink }}>
              {texto.split("*").map((parte, i) => (
                <span key={i} style={i % 2 ? { color: C.violet, fontWeight: 700 } : undefined}>{parte}</span>
              ))}
            </span>
          </div>
        );
      })}
    </>
  );
};

const TextoFinal: React.FC = () => {
  const frame = useCurrentFrame();
  const a = resorte(frame, s(T.probalo) + 2, 15, 90);
  const b = resorte(frame, s(T.probalo) + 16, 12);
  const sale = 1 - tramo(frame, s(T.logo) - 4, s(T.logo) + 6);
  if (frame < s(T.probalo)) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", flexDirection: "column", alignItems: "center", gap: 40, opacity: sale }}>
      <h1 style={{ ...display, fontSize: 104, lineHeight: 1.02, color: C.ink, textAlign: "center", opacity: Math.min(1, a * 1.5), transform: `translateY(${(1 - a) * 50}px)`, filter: `blur(${(1 - Math.min(1, a)) * 8}px)` }}>
        Probalo <span style={{ color: C.violet }}>14 días</span>
        <br />
        gratis.
      </h1>
      <div style={{ display: "flex", alignItems: "center", gap: 18, background: C.violet, color: C.white, fontFamily: F.body, fontSize: 52, fontWeight: 700, padding: "26px 54px", borderRadius: 80, transform: `scale(${b})`, opacity: Math.min(1, b * 2) }}>
        <Icono24 tam={52} color={C.white} grosor={2.6}>
          <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
          <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
        </Icono24>
        miteam.online
      </div>
    </div>
  );
};

const GarabatosUI: React.FC = () => {
  const frame = useCurrentFrame();
  const enIcono = ventana(frame, s(T.miteam), s(T.pin) - 4, 4);
  const enTablet = ventana(frame, s(SALUDO), s(T.celular) - 6, 4);
  const enExcel = ventana(frame, s(34.0), s(T.tiempo) - 4, 4);
  return (
    <>
      <div style={{ opacity: enIcono }}>
        <Rayitas x={300} y={640} angulo={215} delay={s(T.miteam) + 28} color={C.violet} />
        <Rayitas x={780} y={640} angulo={325} delay={s(T.miteam) + 28} color={C.violet} />
      </div>
      <div style={{ opacity: enTablet }}>
        <Rayitas x={64} y={600} angulo={205} delay={s(SALUDO) + 2} color={C.violet} largo={55} />
        <Rayitas x={1016} y={600} angulo={335} delay={s(SALUDO) + 2} color={C.violet} largo={55} />
      </div>
      <div style={{ opacity: enExcel }}>
        <Rayitas x={290} y={1090} angulo={200} delay={s(34.0) + 2} color={C.green} largo={50} />
        <Rayitas x={790} y={1090} angulo={340} delay={s(34.0) + 2} color={C.green} largo={50} />
      </div>
    </>
  );
};

// Efectos de sonido: pocos y suaves, solo donde pasa algo concreto.
// [segundo de la voz, archivo en public/sfx, volumen, duración opcional en s]
const SFX: [number, string, number, number?][] = [
  [T.cafe, "ambiente-cafe", 0.1, 5.9],
  [3.65, "taza", 0.14],
  [7.55, "papel", 0.2],
  [16.5, "pagina", 0.13], [17.2, "pagina", 0.13], [17.9, "pagina", 0.13], [18.5, "pagina", 0.13],
  ...TOQUES_PIN.map((t): [number, string, number] => [t, "tap-suave", 0.3]),
  [TOQUE_OK, "tap-suave", 0.34],
  [SALUDO + 0.05, "campana-suave", 0.22],
  [T.clic, "clic-suave", 0.3],
  [34.0, "campana-suave", 0.2],
  [T.tiempo, "ambiente-cafe", 0.07, 6.6],
  [35.9, "taza", 0.16],
  [43.1, "acorde-final", 0.2],
];

const Sonidos: React.FC = () => (
  <>
    <Audio src={staticFile("voz-juan.mp3")} trimAfter={crudo(CORTE)} />
    <Sequence from={s(CORTE)} name="voz después de la pausa">
      <Audio src={staticFile("voz-juan.mp3")} trimBefore={crudo(CORTE)} />
    </Sequence>
    {SFX.map(([seg, archivo, volumen, dur], i) => {
      const largo = crudo(dur ?? 2.5);
      return (
        <Sequence key={`sfx-${i}`} from={s(seg)} durationInFrames={largo} name={`sfx ${archivo}`}>
          <Audio
            src={staticFile(`sfx/${archivo}.wav`)}
            volume={(f) => (dur ? interpolate(f, [0, 20, largo - 24, largo], [0, volumen, volumen, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : volumen)}
          />
        </Sequence>
      );
    })}
  </>
);

const camara = (frame: number) => {
  const esc = pista(frame, [[0, 1.25], [s(1.7), 1.25], [s(4.8), 1], [s(38.0), 1], [s(39.2), 1.12]]);
  const fx = pista(frame, [[0, 540], [s(38.0), 540], [s(39.2), 620]]);
  const fy = pista(frame, [[0, 700], [s(1.7), 700], [s(4.8), 860], [s(38.0), 860], [s(39.2), 769]]);
  return `translate(${540 - fx * esc}px, ${860 - fy * esc}px) scale(${esc})`;
};

const FONDOS: [number, string][] = [
  [0, CREMA],
  [s(7.2), CREMA],
  [s(7.9), CREMA_GASTADA],
  [s(19.0), CREMA_GASTADA],
  [s(19.7), C.bg],
  [s(35.2), C.bg],
  [s(36.0), "#FBF3E4"],
];

export const ReelJuan: React.FC = () => {
  const frame = useCurrentFrame();
  const fondo = interpolateColors(frame, FONDOS.map(([f]) => f), FONDOS.map(([, c]) => c));
  const escenas: [React.FC, number, number][] = [
    [EscenaCafe, -1, s(T.planilla)],
    [EscenaPlanilla, s(T.planilla) - 4, s(T.p1) - 6],
    [EscenaPreguntas, s(T.p1) - 8, s(T.repetian) - 4],
    [EscenaMeses, s(T.repetian) - 2, s(T.miteam)],
    [EscenaFinal, s(T.tiempo) - 2, s(T.logo) - 4],
  ];
  return (
    <AbsoluteFill style={{ background: fondo, fontFamily: F.body }}>
      <AbsoluteFill style={{ transform: camara(frame), transformOrigin: "0 0" }}>
        {escenas.map(([Comp, desde, hasta], i) => {
          const op = ventana(frame, desde, hasta, 12);
          if (op <= 0.001) return null;
          return (
            <AbsoluteFill key={i} style={{ opacity: op }}>
              <Comp />
            </AbsoluteFill>
          );
        })}
        <LaForma />
        <GarabatosUI />
        <Dedo />
      </AbsoluteFill>
      <Subtitulos />
      <TextoFinal />
      <Sequence from={s(T.logo)} durationInFrames={s(T.fin) - s(T.logo)} name="logo">
        <FundidoLogo />
      </Sequence>
      <Sonidos />
    </AbsoluteFill>
  );
};

const FundidoLogo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: tramo(frame, 0, 8) }}>
      <LogoFinal />
      <Rayitas x={205} y={700} angulo={210} delay={26} color={C.violet} largo={80} />
      <Rayitas x={875} y={700} angulo={330} delay={26} color={C.violet} largo={80} />
    </AbsoluteFill>
  );
};
