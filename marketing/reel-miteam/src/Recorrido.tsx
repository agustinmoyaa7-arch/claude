// Reel "Así funciona MiTeam": recorrido por la app en 5 pasos, sincronizado con public/voz-recorrido.mp3.
// La interfaz copia la app real (kiosco, resumen, horarios, plan vs. real y meses) con datos inventados.
import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { C, display, F, Logo, Mascota } from "./brand";
import { Destello, OndaClic, Rayitas } from "./garabatos";

const FPS = 30;
const s = (seg: number) => Math.round(seg * FPS);
const suave = Easing.inOut(Easing.cubic);

// Segundos en los que la voz dice cada parte (medidos en voz-recorrido.mp3).
const T = {
  mira: 3.35,
  uno: 5.19,
  pin: 7.63,
  salida: 10.1,
  sirve: 12.98,
  sinRelojes: 14.87,
  internet: 16.4,
  sigue: 17.6,
  dos: 18.86,
  trabajando: 21.3,
  horasHoy: 22.5,
  costoMes: 23.4,
  tres: 25.33,
  armas: 27.13,
  rotacion: 29.3,
  avisos: 30.5,
  cuatro: 32.04,
  tarde: 34.21,
  falto: 35.5,
  extra: 36.3,
  aprobas: 37.8,
  cinco: 40.94,
  cerras: 42.73,
  excel: 43.8,
  contador: 44.9,
  probalo: 46.46,
  online: 49.12,
  fin: 53,
};
export const DURACION_RECORRIDO = s(T.fin);

// Cortes entre escenas
const E = { tablet: 5.0, celular: 18.6, turnos: 25.1, plan: 31.85, mes: 40.75, cierre: 46.3 };

// Colores de la app (sacados de las capturas)
const A = {
  bg: "#F6F6FB",
  card: "#FFFFFF",
  line: "#E6E6EE",
  ink: "#1C1C28",
  muted: "#8C8C98",
  mutedDark: "#5E5E6E",
  primary: "#5C60D0",
  primaryLight: "#888CDC",
  soft: "#ECEDFB",
  sel: "#CCD0F0",
  warnBorder: "#C4844C",
  warnBg: "#F0E2D8",
  warnText: "#A85A1E",
  banner: "#F4ECE4",
  ok: "#1E8A6A",
  okBg: "#DDF3EA",
  bad: "#C2364F",
  badBg: "#FBE3E8",
};

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

const ventana = (frame: number, desde: number, hasta: number, fundido = 8) =>
  Math.min(tramo(frame, desde, desde + fundido), 1 - tramo(frame, hasta, hasta + fundido));

const resorte = (frame: number, desde: number, damping = 13, stiffness = 120) =>
  spring({ frame: frame - desde, fps: FPS, config: { damping, stiffness, mass: 0.85 } });

const miles = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const Icono24: React.FC<{ tam: number; color?: string; grosor?: number; children: React.ReactNode }> = ({ tam, color = A.primary, grosor = 2, children }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={grosor} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    {children}
  </svg>
);

const P = {
  check: "M5 12.5l4.5 4.5L19 7.5",
  wifiOff: "M2 8.8a15 15 0 0 1 4.2-2.6 M10.6 5.1A15 15 0 0 1 22 8.8 M5 12.6a10 10 0 0 1 5.2-2.7 M16.8 11.2a10 10 0 0 1 2.2 1.4 M8.5 16.3a5 5 0 0 1 7 0 M12 20h.01 M3 3l18 18",
  escudo: "M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z M9 12l2 2 4-4",
  huella: "M12 11v3 M8.5 8.5a5 5 0 0 1 8.5 3.5v1.5 M7 12v1a7 7 0 0 0 1 3.5 M17 16.5a7 7 0 0 1-1 2 M12 3a9 9 0 0 1 9 9 M3 12a9 9 0 0 1 3-6.7 M10 15a2 2 0 0 0 4 0v-3a2 2 0 0 0-4 0",
  reloj: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18 M12 7v5l3 2",
  rotar: "M4 12a8 8 0 0 1 14-5.3L20 9 M20 4v5h-5 M20 12a8 8 0 0 1-14 5.3L4 15 M4 20v-5h5",
  pdf: "M6 3h9l4 4v14H6z M14 3v5h5 M9 13h6 M9 17h4",
  copiar: "M9 9h11v11H9z M5 15H4V4h11v1",
  candado: "M6 11h12v9H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3",
  excel: "M4 5h16v14H4z M4 10h16 M4 15h16 M10 5v14",
  bajar: "M12 4v11M7 10.5l5 5 5-5M5 20h14",
  alerta: "M12 3l9.5 17h-19z M12 10v4 M12 17.5v.01",
  calendario: "M4 6h16v14H4z M4 10h16 M9 3v4 M15 3v4",
  menu: "M4 7h16 M4 12h16 M4 17h16",
  borrar: "M9 6h11v12H9l-6-6z M12.5 9.5l5 5 M17.5 9.5l-5 5",
};

// Cursor de mouse con onda al hacer clic (para el panel, que se usa en la compu)
const Cursor: React.FC<{ camino: [number, number, number][]; clics: number[]; visible: [number, number] }> = ({ camino, clics, visible }) => {
  const frame = useCurrentFrame();
  const x = pista(frame, camino.map(([t, px]) => [s(t), px]));
  const y = pista(frame, camino.map(([t, , py]) => [s(t), py]));
  const op = ventana(frame, s(visible[0]), s(visible[1]), 4);
  const presion = Math.max(0, ...clics.map((t) => 1 - Math.min(1, Math.abs(frame - s(t)) / 3)));
  const donde = (t: number) => camino[Math.max(0, camino.findIndex(([tc]) => tc >= t - 0.06))];
  return (
    <>
      {clics.map((t) => {
        const [, px, py] = donde(t);
        return <OndaClic key={t} x={px} y={py} delay={s(t)} color={A.primaryLight} />;
      })}
      <svg width={64} height={64} viewBox="0 0 24 24" style={{ position: "absolute", left: x - 9, top: y - 6, opacity: op, transform: `scale(${1 - 0.15 * presion})`, transformOrigin: "9px 6px", filter: "drop-shadow(0 6px 10px rgba(23,20,43,0.35))" }}>
        <path d="M5 3l14 8-6 1.5L10 19z" fill={C.ink} stroke={C.white} strokeWidth={1.4} strokeLinejoin="round" />
      </svg>
    </>
  );
};

// Dedo que toca la pantalla (tablet y celular)
const Dedo: React.FC<{ camino: [number, number, number][]; toques: number[]; visible: [number, number] }> = ({ camino, toques, visible }) => {
  const frame = useCurrentFrame();
  const x = pista(frame, camino.map(([t, px]) => [s(t), px]));
  const y = pista(frame, camino.map(([t, , py]) => [s(t), py]));
  const op = ventana(frame, s(visible[0]), s(visible[1]), 4);
  const presion = Math.max(0, ...toques.map((t) => 1 - Math.min(1, Math.abs(frame - s(t)) / 3)));
  const donde = (t: number) => camino[Math.max(0, camino.findIndex(([tc]) => tc >= t - 0.06))];
  return (
    <>
      {toques.map((t) => {
        const [, px, py] = donde(t);
        return <OndaClic key={t} x={px} y={py} delay={s(t)} color={A.primary} />;
      })}
      <div style={{ position: "absolute", left: x - 38, top: y - 38, width: 76, height: 76, borderRadius: "50%", background: "rgba(28, 28, 40, 0.22)", border: "4px solid rgba(255,255,255,0.95)", boxSizing: "border-box", opacity: op, transform: `scale(${1 - 0.18 * presion})`, boxShadow: "0 8px 20px rgba(28,28,40,0.25)" }} />
    </>
  );
};

// Arma el camino del dedo: llega a cada tecla un poco antes del toque y se queda hasta que suelta
const caminoToques = (inicio: [number, number, number], toques: [number, number, number][], fin: [number, number, number]): [number, number, number][] => [
  inicio,
  ...toques.flatMap(([t, x, y]): [number, number, number][] => [
    [t - 0.06, x, y],
    [t + 0.05, x, y],
  ]),
  fin,
];

// ---------- Kiosco (copia de la pantalla real) ----------

const KIO = { w: 940, h: 690 };
const TEC = { x: 568, y: 270, w: 108, h: 64, gap: 13 };
const TECLAS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "✓"];
const teclaKiosco = (k: string): [number, number] => {
  const i = TECLAS.indexOf(k);
  return [TEC.x + (i % 3) * (TEC.w + TEC.gap) + TEC.w / 2, TEC.y + Math.floor(i / 3) * (TEC.h + TEC.gap) + TEC.h / 2];
};

type Saludo = { nombre: string; tipo: "entrada" | "salida"; hora: string; nota?: string; sinConexion?: boolean; p: number };

const Kiosco: React.FC<{ hora: string; seg: string; llenos: number; activa?: string | null; saludo?: Saludo | null; sinConexion?: number }> = ({ hora, seg, llenos, activa, saludo, sinConexion = 0 }) => {
  const [hh, mm] = hora.split(":");
  return (
    <div style={{ position: "relative", width: KIO.w, height: KIO.h, background: A.bg, fontFamily: F.body, color: A.ink, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 24, top: 22, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 58, height: 58, borderRadius: 16, background: A.card, border: `1.5px solid ${A.line}`, display: "flex", alignItems: "center", justifyContent: "center", color: A.primaryLight, fontSize: 20, fontWeight: 500 }}>BL</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 17, fontWeight: 600 }}>Bodegón Los Álamos</span>
          <span style={{ fontSize: 13, letterSpacing: "0.28em", color: A.muted }}>CAJA</span>
        </div>
      </div>
      <div style={{ position: "absolute", right: 24, top: 30, display: "flex", alignItems: "center", gap: 9, background: A.card, border: `1.5px solid ${A.line}`, borderRadius: 30, padding: "10px 18px", fontSize: 15, color: A.mutedDark }}>
        <Icono24 tam={17} color={A.primary}>
          <path d={P.escudo} />
        </Icono24>
        Panel de administración ›
      </div>
      {sinConexion > 0.01 && (
        <div style={{ position: "absolute", left: KIO.w / 2 - 150, width: 300, top: 33, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: A.warnBg, color: A.warnText, border: `1.5px solid ${A.warnBorder}`, borderRadius: 30, padding: "8px 0", fontSize: 15, fontWeight: 600, opacity: sinConexion, transform: `scale(${0.85 + 0.15 * sinConexion})` }}>
          <Icono24 tam={18} color={A.warnText} grosor={2.2}>
            <path d={P.wifiOff} />
          </Icono24>
          Sin conexión · sigue fichando
        </div>
      )}

      <div style={{ position: "absolute", left: 0, width: 540, top: 215, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "flex-end", fontFamily: F.mono, lineHeight: 1 }}>
          <span style={{ fontSize: 140, fontWeight: 500, letterSpacing: "-0.02em" }}>{hh}</span>
          <span style={{ fontSize: 140, fontWeight: 500, color: A.primaryLight, margin: "0 4px" }}>:</span>
          <span style={{ fontSize: 140, fontWeight: 500, letterSpacing: "-0.02em" }}>{mm}</span>
          <span style={{ fontSize: 58, color: A.primaryLight, marginLeft: 10, marginBottom: 12 }}>{seg}</span>
        </div>
        <span style={{ marginTop: 24, fontSize: 22, color: A.mutedDark }}>Miércoles, 14 de octubre de 2026</span>
        <span style={{ marginTop: 14, fontSize: 17, color: A.mutedDark }}>¡Que tengas un gran turno!</span>
      </div>

      <div style={{ position: "absolute", left: TEC.x, width: 350, top: 116, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 15, fontWeight: 600, letterSpacing: "0.26em", color: A.primary }}>
        <Icono24 tam={18} color={A.primary} grosor={1.8}>
          <path d={P.huella} />
        </Icono24>
        INGRESÁ TU PIN
      </div>
      <div style={{ position: "absolute", left: TEC.x, width: 350, top: 148, height: 76, borderRadius: 22, background: A.card, border: `1.5px solid ${A.line}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 22 }}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} style={{ width: 15, height: 15, borderRadius: "50%", background: i < llenos ? A.primary : "#D4D4DC", transform: `scale(${i < llenos ? 1.15 : 1})` }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: TEC.x - 20, width: 390, top: 236, textAlign: "center", fontSize: 14.5, color: A.mutedDark }}>Ingresá tu PIN para registrar tu entrada o tu salida</div>
      {TECLAS.map((t, i) => {
        const on = activa === t;
        const ok = t === "✓";
        return (
          <div key={t} style={{ position: "absolute", left: TEC.x + (i % 3) * (TEC.w + TEC.gap), top: TEC.y + Math.floor(i / 3) * (TEC.h + TEC.gap), width: TEC.w, height: TEC.h, borderRadius: 18, background: on ? A.soft : ok ? "#F2F2FA" : A.card, border: `1.5px solid ${on ? A.primaryLight : A.line}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.mono, fontSize: 32, color: ok ? A.primaryLight : A.ink, transform: `scale(${on ? 0.93 : 1})` }}>
            {t === "⌫" ? (
              <Icono24 tam={30} color={A.mutedDark} grosor={1.7}>
                <path d={P.borrar} />
              </Icono24>
            ) : ok ? (
              <Icono24 tam={30} color={on ? A.primary : A.primaryLight} grosor={2}>
                <path d={P.check} />
              </Icono24>
            ) : (
              t
            )}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: TEC.x, width: 350, top: 590, height: 50, borderRadius: 26, background: A.card, border: `1.5px solid ${A.line}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, fontSize: 15, color: A.mutedDark }}>
        <Icono24 tam={17} color={A.mutedDark} grosor={1.8}>
          <path d={P.reloj} />
        </Icono24>
        Consultar mis horas trabajadas
      </div>

      {saludo && saludo.p > 0.01 && (
        <div style={{ position: "absolute", left: TEC.x - 6, width: 362, top: 112, height: 150, borderRadius: 26, background: A.card, border: `2px solid ${A.sel}`, boxSizing: "border-box", boxShadow: "0 24px 40px -24px rgba(28,28,40,0.35)", padding: "0 24px", display: "flex", alignItems: "center", gap: 18, opacity: Math.min(1, saludo.p * 2), transform: `scale(${0.88 + 0.12 * saludo.p})` }}>
          <div style={{ width: 64, height: 64, flexShrink: 0, borderRadius: "50%", background: A.soft, color: A.primary, fontSize: 28, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>{saludo.nombre[0]}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 27, fontWeight: 600 }}>{saludo.tipo === "entrada" ? `¡Hola, ${saludo.nombre}!` : `¡Chau, ${saludo.nombre}!`}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.06em", padding: "5px 12px", borderRadius: 20, background: saludo.tipo === "entrada" ? A.okBg : A.soft, color: saludo.tipo === "entrada" ? A.ok : A.primary }}>
                {saludo.tipo === "entrada" ? "ENTRADA" : "SALIDA"} · {saludo.hora}
              </span>
              {saludo.nota && <span style={{ fontSize: 15, color: saludo.sinConexion ? A.warnText : A.mutedDark, fontWeight: saludo.sinConexion ? 600 : 400 }}>{saludo.nota}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Tablet: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div style={{ position: "absolute", width: KIO.w + 60, height: KIO.h + 50, borderRadius: 54, background: "#1C1C28", boxShadow: "0 50px 90px -50px rgba(28,28,40,0.6)", ...style }}>
    <span style={{ position: "absolute", left: 11, top: (KIO.h + 50) / 2 - 4, width: 8, height: 8, borderRadius: "50%", background: "#3A3A4C" }} />
    <div style={{ position: "absolute", left: 30, top: 25, width: KIO.w, height: KIO.h, borderRadius: 26, overflow: "hidden" }}>{children}</div>
  </div>
);

// ---------- Escena 0: la planilla ----------

const FILAS_PLANILLA: [string, string, string, string, boolean][] = [
  ["Sofía", "8:00", "16:05", "8h?", false],
  ["Martín", "8:1?", "16:00", "??", true],
  ["Camila", "", "15:50", "—", true],
  ["Tomás", "16:00", "0:15", "8:15", false],
  ["Lucía", "11:00", "¿?", "", true],
  ["Valentina", "10:00", "18:00", "8h", false],
  ["Juan P.", "8:30", "", "", true],
];

const EscenaPlanilla: React.FC = () => {
  const frame = useCurrentFrame();
  const entra = resorte(frame, 0, 15, 110);
  const cae = tramo(frame, s(T.mira), s(T.mira) + 14);
  const logo = resorte(frame, s(T.mira) + 8, 12, 120);
  return (
    <>
      <div style={{ position: "absolute", left: 90, top: 470, width: 900, height: 760, transform: `translateY(${(1 - entra) * 80 + cae * 700}px) rotate(${-2 + cae * 14}deg)`, opacity: Math.min(1, entra * 1.5) * (1 - cae), transformOrigin: "50% 100%" }}>
        <div style={{ position: "absolute", inset: 0, background: C.white, borderRadius: 30, border: `2px solid ${C.line}`, overflow: "hidden", boxShadow: "0 40px 80px -50px rgba(23,20,43,0.45)", fontFamily: F.body }}>
          <div style={{ height: 80, background: C.green, display: "flex", alignItems: "center", gap: 14, padding: "0 32px", color: C.white, fontSize: 28, fontWeight: 600 }}>
            <Icono24 tam={34} color={C.white}>
              <path d={P.excel} />
            </Icono24>
            horas_octubre_FINAL_v3.xlsx
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "250px 1fr 1fr 1fr", padding: "0 30px", height: 54, alignItems: "center", background: "#F1EFF8", fontSize: 22, fontWeight: 600, letterSpacing: "0.06em", color: C.muted }}>
            <span>NOMBRE</span>
            <span>ENTRA</span>
            <span>SALE</span>
            <span>HORAS</span>
          </div>
          {FILAS_PLANILLA.map(([n, e, sa, h, mal], i) => {
            const p = tramo(frame, 4 + i * 3, 10 + i * 3);
            return (
              <div key={n} style={{ display: "grid", gridTemplateColumns: "250px 1fr 1fr 1fr", padding: "0 30px", height: 82, alignItems: "center", borderBottom: `2px solid ${C.line}`, fontSize: 32, opacity: p }}>
                <span style={{ fontWeight: 600, color: C.ink }}>{n}</span>
                {[e, sa, h].map((v, j) => (
                  <span key={j} style={{ fontFamily: F.hand, fontSize: 38, color: v.includes("?") ? "#C2364F" : "#2B4BA8", background: mal && (v === "" || v.includes("?")) ? "#FDE3E3" : "transparent", borderRadius: 10, padding: "0 10px", marginRight: 30, minHeight: 56, display: "flex", alignItems: "center" }}>
                    {v}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", right: -20, bottom: 40, width: 330, padding: "26px 28px", background: "#FFF1A8", borderRadius: 8, transform: "rotate(5deg)", boxShadow: "0 20px 30px -20px rgba(23,20,43,0.45)", fontFamily: F.hand, fontSize: 38, lineHeight: 1.15, color: "#5A4A10" }}>¿quién cerró el sábado??</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 700, display: "flex", justifyContent: "center", opacity: Math.min(1, logo * 2), transform: `scale(${0.7 + 0.3 * logo})` }}>
        <Logo size={96} />
      </div>
      <div style={{ opacity: ventana(frame, s(T.mira) + 14, s(E.tablet) - 6, 4) }}>
        <Rayitas x={230} y={760} angulo={200} delay={s(T.mira) + 16} color={C.violet} largo={60} />
        <Rayitas x={850} y={760} angulo={340} delay={s(T.mira) + 16} color={C.violet} largo={60} />
      </div>
    </>
  );
};

// ---------- Escena 1: la tablet del local ----------

const TAB_X = 40;
const TAB_Y = 580;
const enTablet = ([x, y]: [number, number]): [number, number] => [TAB_X + 30 + x, TAB_Y + 25 + y];
const PIN_SOFIA = ["4", "8", "1", "5"];
const PIN_CAMILA = ["2", "0", "9", "3"];
const TOQUES_ENTRADA = [7.95, 8.25, 8.55, 8.85];
const OK_ENTRADA = 9.12;
const TOQUES_SALIDA = [10.8, 11.02, 11.24, 11.46];
const OK_SALIDA = 11.66;
const TOQUES_OFFLINE = [16.78, 16.98, 17.18, 17.38];
const OK_OFFLINE = 17.56;

// Lo que pasó en cada fichaje, grande debajo de la tablet: [desde, hasta, texto, fondo, color]
const EVENTOS: [number, number, string, string, string][] = [
  [OK_ENTRADA + 0.1, T.salida, "Sofía · Entrada 08:57", A.okBg, A.ok],
  [OK_SALIDA + 0.1, T.sirve, "Sofía · Salida 16:00", A.soft, A.primary],
  [OK_OFFLINE + 0.1, E.celular, "Camila · guardado sin internet", A.warnBg, A.warnText],
];

const EscenaTablet: React.FC = () => {
  const frame = useCurrentFrame();
  const entra = resorte(frame, s(E.tablet), 15, 100);
  const chica = tramo(frame, s(T.sirve), s(T.sirve) + 14) * (1 - tramo(frame, s(T.internet) - 4, s(T.internet) + 8));
  const monitor = resorte(frame, s(T.sirve) + 6, 14) * (1 - tramo(frame, s(T.internet) - 6, s(T.internet) + 2));
  const prohibidos = resorte(frame, s(T.sinRelojes), 12) * (1 - tramo(frame, s(T.internet) - 6, s(T.internet) + 2));
  const offline = tramo(frame, s(T.internet), s(T.internet) + 8);

  // Hora: 08:57 al entrar; avanza rápido hasta las 16:00 para la salida
  const avance = tramo(frame, s(T.salida), s(T.salida) + 14);
  const minutos = Math.round(8 * 60 + 57 + avance * (7 * 60 + 3));
  const segundos = avance > 0 && avance < 1 ? (frame * 7) % 60 : Math.floor(frame / FPS + 12) % 60;
  const hora = `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
  const horaOffline = frame >= s(T.internet) - 6;

  // Puntos del PIN: se llenan con cada toque y se vacían al confirmar
  const cuenta = (toques: number[], ok: number) => (frame >= s(toques[0]) && frame < s(ok) + 3 ? toques.filter((t) => frame >= s(t)).length : 0);
  const llenos = Math.max(cuenta(TOQUES_ENTRADA, OK_ENTRADA), cuenta(TOQUES_SALIDA, OK_SALIDA), cuenta(TOQUES_OFFLINE, OK_OFFLINE));
  const activaEn = (pin: string[], toques: number[], ok: number) => {
    const i = toques.findIndex((t) => frame >= s(t) && frame < s(t) + 4);
    if (i >= 0) return pin[i];
    if (frame >= s(ok) && frame < s(ok) + 4) return "✓";
    return null;
  };
  const activa = activaEn(PIN_SOFIA, TOQUES_ENTRADA, OK_ENTRADA) ?? activaEn(PIN_SOFIA, TOQUES_SALIDA, OK_SALIDA) ?? activaEn(PIN_CAMILA, TOQUES_OFFLINE, OK_OFFLINE);

  let saludo: Saludo | null = null;
  const pEntrada = resorte(frame, s(OK_ENTRADA) + 2, 12) * (1 - tramo(frame, s(T.salida) - 2, s(T.salida) + 4));
  const pSalida = resorte(frame, s(OK_SALIDA) + 2, 12) * (1 - tramo(frame, s(T.sirve) + 10, s(T.sirve) + 16));
  const pOffline = resorte(frame, s(OK_OFFLINE) + 2, 12);
  if (pEntrada > 0.01 && frame < s(T.salida) + 4) saludo = { nombre: "Sofía", tipo: "entrada", hora: "08:57", p: pEntrada };
  else if (pSalida > 0.01 && frame < s(T.internet)) saludo = { nombre: "Sofía", tipo: "salida", hora: "16:00", nota: "7 h 03 m hoy", p: pSalida };
  else if (frame >= s(OK_OFFLINE)) saludo = { nombre: "Camila", tipo: "entrada", hora: "16:02", nota: "Guardado en la tablet", sinConexion: true, p: pOffline };

  const dedoEntrada = caminoToques([7.7, 820, 1500], TOQUES_ENTRADA.map((t, i): [number, number, number] => [t, ...enTablet(teclaKiosco(PIN_SOFIA[i]))]).concat([[OK_ENTRADA, ...enTablet(teclaKiosco("✓"))]]), [9.5, 900, 1500]);
  const dedoSalida = caminoToques([10.55, 820, 1500], TOQUES_SALIDA.map((t, i): [number, number, number] => [t, ...enTablet(teclaKiosco(PIN_SOFIA[i]))]).concat([[OK_SALIDA, ...enTablet(teclaKiosco("✓"))]]), [12.0, 900, 1500]);
  const dedoOffline = caminoToques([16.55, 820, 1500], TOQUES_OFFLINE.map((t, i): [number, number, number] => [t, ...enTablet(teclaKiosco(PIN_CAMILA[i]))]).concat([[OK_OFFLINE, ...enTablet(teclaKiosco("✓"))]]), [17.95, 900, 1500]);

  const escala = 1 - 0.5 * chica;
  const centroX = 540 - 250 * chica;
  const centroY = TAB_Y + (KIO.h + 50) / 2 - 80 * chica;

  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - entra) * 120}px)`, opacity: Math.min(1, entra * 1.5) }}>
        <Tablet style={{ left: TAB_X, top: TAB_Y, transform: `translate(${centroX - 540}px, ${centroY - (TAB_Y + (KIO.h + 50) / 2)}px) scale(${escala})`, transformOrigin: "50% 50%" }}>
          <Kiosco hora={horaOffline ? "16:02" : hora} seg={String(segundos).padStart(2, "0")} llenos={llenos} activa={activa} saludo={saludo} sinConexion={offline} />
        </Tablet>
      </div>

      {/* Monitor de PC con el mismo kiosco */}
      <div style={{ position: "absolute", left: 540, top: 690, width: 500, opacity: Math.min(1, monitor * 1.5), transform: `translateY(${(1 - monitor) * 60}px)` }}>
        <div style={{ width: 500, height: 330, borderRadius: 22, background: "#1C1C28", padding: 14, boxSizing: "border-box", boxShadow: "0 40px 70px -40px rgba(28,28,40,0.6)" }}>
          <div style={{ width: 472, height: 302, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ transform: `scale(${472 / KIO.w})`, transformOrigin: "0 0" }}>
              <Kiosco hora="08:57" seg="12" llenos={0} />
            </div>
          </div>
        </div>
        <div style={{ margin: "0 auto", width: 90, height: 60, background: "#2A2A38" }} />
        <div style={{ margin: "0 auto", width: 220, height: 16, borderRadius: 10, background: "#2A2A38" }} />
      </div>

      {/* Sin relojes ni huellas */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1180, display: "flex", justifyContent: "center", gap: 120, opacity: Math.min(1, prohibidos * 1.5), transform: `scale(${0.8 + 0.2 * prohibidos})` }}>
        {[
          [P.reloj, "Reloj fichador"],
          [P.huella, "Huellero"],
        ].map(([d, txt]) => (
          <div key={txt} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ position: "relative", width: 170, height: 170, borderRadius: "50%", background: C.white, border: `3px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icono24 tam={96} color={C.muted} grosor={1.5}>
                <path d={d} />
              </Icono24>
              <svg width={170} height={170} viewBox="0 0 170 170" style={{ position: "absolute", inset: 0 }}>
                <path d="M30 140 L140 30" stroke="#E5484D" strokeWidth={12} strokeLinecap="round" />
              </svg>
            </div>
            <span style={{ fontFamily: F.body, fontSize: 32, fontWeight: 600, color: C.muted }}>{txt}</span>
          </div>
        ))}
      </div>

      {/* Wifi cortado, arriba a la derecha de la tablet */}
      <div style={{ position: "absolute", left: 930, top: 500, opacity: offline * (frame < s(E.celular) ? 1 : 0), transform: `scale(${0.6 + 0.4 * resorte(frame, s(T.internet), 9, 160)})` }}>
        <div style={{ width: 96, height: 96, borderRadius: "50%", background: A.warnBg, border: `3px solid ${A.warnBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icono24 tam={56} color={A.warnText} grosor={2}>
            <path d={P.wifiOff} />
          </Icono24>
        </div>
      </div>

      {EVENTOS.map(([a, b, texto, fondo, color]) => {
        const p = resorte(frame, s(a), 12);
        const op = Math.min(1, p * 2) * (1 - tramo(frame, s(b) - 6, s(b) - 1));
        if (op <= 0.001) return null;
        return (
          <div key={a} style={{ position: "absolute", left: 0, right: 0, top: 1360, display: "flex", justifyContent: "center", opacity: op, transform: `translateY(${(1 - p) * 24}px)` }}>
            <span style={{ display: "flex", alignItems: "center", gap: 14, background: fondo, color, border: `2px solid ${color}`, borderRadius: 40, padding: "14px 30px", fontFamily: F.body, fontSize: 40, fontWeight: 700 }}>
              <Icono24 tam={36} color={color} grosor={2.6}>
                <path d={P.check} />
              </Icono24>
              {texto}
            </span>
          </div>
        );
      })}

      <Dedo camino={dedoEntrada} toques={[...TOQUES_ENTRADA, OK_ENTRADA]} visible={[7.7, 9.5]} />
      <Dedo camino={dedoSalida} toques={[...TOQUES_SALIDA, OK_SALIDA]} visible={[10.55, 12.0]} />
      <Dedo camino={dedoOffline} toques={[...TOQUES_OFFLINE, OK_OFFLINE]} visible={[16.55, 17.95]} />
    </>
  );
};

// ---------- Escena 2: el celular ----------

const TEL = { w: 470, h: 960, x: 290, y: 450 };
const TRABAJANDO: [string, string, string][] = [
  ["Sofía Ramírez", "08:57", "Salón"],
  ["Martín Gómez", "08:14", "Cocina"],
  ["Camila Rojas", "08:02", "Barra"],
  ["Tomás Benítez", "07:58", "Cocina"],
  ["Valentina Suárez", "10:00", "Caja"],
];

const EscenaCelular: React.FC = () => {
  const frame = useCurrentFrame();
  const entra = resorte(frame, s(E.celular), 15, 100);
  const horas = tramo(frame, s(T.horasHoy), s(T.horasHoy) + 18);
  const costo = tramo(frame, s(T.costoMes), s(T.costoMes) + 24);
  const pHoras = resorte(frame, s(T.horasHoy) - 2, 13);
  const pCosto = resorte(frame, s(T.costoMes) - 2, 13);
  const latido = 0.6 + 0.4 * Math.sin(frame / 4);
  const minHoy = Math.round(horas * (31 * 60 + 40));
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - entra) * 140}px)`, opacity: Math.min(1, entra * 1.5) }}>
      <div style={{ position: "absolute", left: TEL.x - 15, top: TEL.y - 15, width: TEL.w + 30, height: TEL.h + 30, borderRadius: 72, background: "#1C1C28", boxShadow: "0 50px 90px -50px rgba(28,28,40,0.6)" }}>
        <div style={{ position: "absolute", left: 15, top: 15, width: TEL.w, height: TEL.h, borderRadius: 56, overflow: "hidden", background: A.bg, fontFamily: F.body, color: A.ink }}>
          <div style={{ position: "absolute", left: TEL.w / 2 - 60, top: 14, width: 120, height: 32, borderRadius: 20, background: "#1C1C28" }} />
          <div style={{ position: "absolute", left: 24, right: 24, top: 66, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: A.card, border: `1.5px solid ${A.line}`, display: "flex", alignItems: "center", justifyContent: "center", color: A.primaryLight, fontSize: 16 }}>BL</div>
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Bodegón Los Álamos</span>
              <span style={{ ...display, fontSize: 15, color: A.ink }}>MiTeam.</span>
            </div>
            <Icono24 tam={28} color={A.mutedDark}>
              <path d={P.menu} />
            </Icono24>
          </div>
          <div style={{ position: "absolute", left: 24, right: 24, top: 136, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 32, fontWeight: 600 }}>Resumen</span>
              <span style={{ fontSize: 15, color: A.mutedDark }}>Miércoles, 14 de octubre</span>
            </div>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", color: A.ok, background: A.okBg, padding: "6px 12px", borderRadius: 20 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: A.ok, opacity: latido }} />
              EN VIVO
            </span>
          </div>

          <div style={{ position: "absolute", left: 18, right: 18, top: 232, background: A.card, border: `2px solid ${A.sel}`, borderRadius: 26, padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, letterSpacing: "0.16em", color: A.mutedDark }}>TRABAJANDO AHORA</span>
              <span style={{ fontFamily: F.mono, fontSize: 44, lineHeight: 1 }}>{TRABAJANDO.length}</span>
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column" }}>
              {TRABAJANDO.map(([n, h, sector], i) => {
                const p = tramo(frame, s(T.trabajando) - 6 + i * 4, s(T.trabajando) + i * 4);
                return (
                  <div key={n} style={{ height: 62, display: "flex", alignItems: "center", gap: 14, borderTop: i ? `1.5px solid ${A.line}` : "none", opacity: 0.25 + 0.75 * p, transform: `translateX(${(1 - p) * 20}px)` }}>
                    <span style={{ width: 40, height: 40, borderRadius: "50%", background: A.soft, color: A.primary, fontSize: 17, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>{n[0]}</span>
                    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                      <span style={{ fontSize: 18, fontWeight: 500 }}>{n}</span>
                      <span style={{ fontSize: 13.5, color: A.muted }}>{sector}</span>
                    </div>
                    <span style={{ fontFamily: F.mono, fontSize: 15, color: A.mutedDark }}>desde {h}</span>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: A.ok }} />
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ position: "absolute", left: 18, right: 18, top: 640, height: 120, background: A.card, border: `1.5px solid ${pHoras > 0.5 ? A.sel : A.line}`, borderRadius: 24, padding: "18px 22px", boxSizing: "border-box", opacity: Math.min(1, pHoras * 1.5), transform: `translateY(${(1 - pHoras) * 30}px)` }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, letterSpacing: "0.16em", color: A.mutedDark }}>
              <Icono24 tam={18} color={A.mutedDark} grosor={1.8}>
                <path d={P.reloj} />
              </Icono24>
              HORAS DE HOY
            </span>
            <span style={{ display: "block", marginTop: 8, fontFamily: F.mono, fontSize: 42, lineHeight: 1.1 }}>
              {Math.floor(minHoy / 60)}h {String(minHoy % 60).padStart(2, "0")}m
            </span>
          </div>
          <div style={{ position: "absolute", left: 18, right: 18, top: 776, height: 150, background: A.card, border: `2px solid ${pCosto > 0.5 ? A.primaryLight : A.line}`, borderRadius: 24, padding: "18px 22px", boxSizing: "border-box", opacity: Math.min(1, pCosto * 1.5), transform: `translateY(${(1 - pCosto) * 30}px)` }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, letterSpacing: "0.16em", color: A.mutedDark }}>
              <Icono24 tam={18} color={A.mutedDark} grosor={1.8}>
                <path d={P.calendario} />
              </Icono24>
              COSTO ESTIMADO DEL MES
            </span>
            <span style={{ display: "block", marginTop: 10, fontFamily: F.mono, fontSize: 46, lineHeight: 1.1, color: A.primary }}>$ {miles(costo * 6324851)}</span>
            <span style={{ fontSize: 13.5, color: A.muted }}>desde el 01 oct · se actualiza solo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Escena 3: los turnos ----------

type Turno = "m" | "t" | "c" | "j" | "f";
const TURNOS: Record<Exclude<Turno, "f">, { bg: string; borde: string; texto: string; nombre: string; l1: string; l2: string }> = {
  m: { bg: "#FBE4F0", borde: "#F09AC6", texto: "#C83E86", nombre: "Mañana", l1: "8:00–", l2: "16:00" },
  t: { bg: "#E4E0FC", borde: "#9880F4", texto: "#6A50E0", nombre: "Tarde", l1: "16:00–", l2: "24:00" },
  c: { bg: "#F8E6EC", borde: "#EC9CB4", texto: "#C8466C", nombre: "Cortado", l1: "11–15", l2: "20–0:30" },
  j: { bg: "#E0F0F0", borde: "#84CCBC", texto: "#2A8E78", nombre: "Caja", l1: "10:00–", l2: "18:00" },
};
const PERSONAS = ["Sofía Ramírez", "Martín Gómez", "Camila Rojas", "Tomás Benítez", "Lucía Fernández", "Valentina Suárez"];
const SEMANA = ["Lun 12", "Mar 13", "Mié 14", "Jue 15", "Vie 16", "Sáb 17", "Dom 18"];
const PATRONES: Turno[][] = [
  ["m", "m", "m", "m", "m", "f", "f"],
  ["t", "t", "t", "f", "t", "t", "t"],
  ["c", "c", "f", "c", "c", "m", "f"],
  ["f", "m", "m", "m", "m", "m", "f"],
  ["j", "j", "j", "j", "f", "j", "j"],
  ["t", "f", "t", "t", "t", "f", "t"],
];
// Después de rotar, cada fila toma el patrón de la de arriba
const rotado = (fila: number) => PATRONES[(fila + PATRONES.length - 1) % PATRONES.length];
// Aviso de descanso: Tomás (fila 3) sale del cortado a las 0:30 y entra a las 8:00 del sábado
const AVISO = { fila: 3, dia: 5 };

const GRILLA = { x: 30, y: 450, w: 1020, nombre: 210, fila: 106, top: 150 };
const COL = (GRILLA.w - 40 - GRILLA.nombre) / 7;
const celda = (fila: number, dia: number): [number, number] => [GRILLA.x + 20 + GRILLA.nombre + dia * COL + COL / 2, GRILLA.y + GRILLA.top + fila * GRILLA.fila + GRILLA.fila / 2];

const Chip: React.FC<{ t: Turno; aviso?: number }> = ({ t, aviso = 0 }) => {
  if (t === "f") {
    return <div style={{ position: "absolute", inset: 0, borderRadius: 16, border: "2px dashed #DDDDE4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: A.muted }}>Franco</div>;
  }
  const d = TURNOS[t];
  return (
    <div style={{ position: "absolute", inset: 0, borderRadius: 16, background: d.bg, border: `${2 + aviso * 2}px solid ${aviso > 0.5 ? A.warnBorder : d.borde}`, boxSizing: "border-box", padding: "8px 9px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <span style={{ fontFamily: F.mono, fontSize: 17, lineHeight: 1.2, color: A.ink }}>{d.l1}</span>
      <span style={{ fontFamily: F.mono, fontSize: 17, lineHeight: 1.2, color: A.ink }}>{d.l2}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: d.texto, marginTop: 3 }}>{d.nombre}</span>
      {aviso > 0.01 && (
        <svg width={22} height={22} viewBox="0 0 24 24" style={{ position: "absolute", right: 6, top: 6, opacity: aviso }} fill="none" stroke={A.warnBorder} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <path d={P.alerta} />
        </svg>
      )}
    </div>
  );
};

const EscenaTurnos: React.FC = () => {
  const frame = useCurrentFrame();
  const entra = resorte(frame, s(E.turnos), 15, 100);
  const CLIC_ROTAR = 29.5;
  const rot = tramo(frame, s(CLIC_ROTAR) + 2, s(CLIC_ROTAR) + 14);
  const aviso = tramo(frame, s(T.avisos), s(T.avisos) + 6);
  const tooltip = resorte(frame, s(T.avisos) + 4, 13);
  const boton = interpolate(frame, [s(CLIC_ROTAR) - 2, s(CLIC_ROTAR) + 1, s(CLIC_ROTAR) + 6], [1, 0.93, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const giro = rot * 360;
  const [ax, ay] = celda(AVISO.fila, AVISO.dia);
  const BOTON_ROTAR: [number, number] = [GRILLA.x + 915, GRILLA.y + 58];
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - entra) * 120}px)`, opacity: Math.min(1, entra * 1.5) }}>
      <div style={{ position: "absolute", left: GRILLA.x, top: GRILLA.y, width: GRILLA.w, height: GRILLA.top + PERSONAS.length * GRILLA.fila + 30, background: A.card, borderRadius: 30, border: `1.5px solid ${A.line}`, boxShadow: "0 40px 80px -50px rgba(28,28,40,0.45)", fontFamily: F.body, color: A.ink }}>
        <div style={{ position: "absolute", left: 20, right: 20, top: 36, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", background: A.bg, borderRadius: 30, padding: 4 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, background: A.card, borderRadius: 26, padding: "10px 18px", fontSize: 18, fontWeight: 600, boxShadow: "0 2px 6px rgba(28,28,40,0.08)" }}>
              <Icono24 tam={18} color={A.ink} grosor={1.8}>
                <path d={P.calendario} />
              </Icono24>
              Semana
            </span>
            <span style={{ padding: "10px 18px", fontSize: 18, color: A.mutedDark }}>Día</span>
          </div>
          <div style={{ flex: 1 }} />
          {[
            [P.pdf, "Bajar PDF"],
            [P.copiar, "Copiar semana"],
          ].map(([d, txt]) => (
            <span key={txt} style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${A.line}`, borderRadius: 30, padding: "10px 16px", fontSize: 17, color: A.mutedDark }}>
              <Icono24 tam={18} color={A.mutedDark} grosor={1.8}>
                <path d={d} />
              </Icono24>
              {txt}
            </span>
          ))}
          <span style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${rot > 0 && rot < 1 ? A.primary : A.line}`, background: rot > 0 && rot < 1 ? A.soft : A.card, borderRadius: 30, padding: "10px 16px", fontSize: 17, color: rot > 0 ? A.primary : A.mutedDark, transform: `scale(${boton})` }}>
            <span style={{ display: "flex", transform: `rotate(${giro}deg)` }}>
              <Icono24 tam={18} color={rot > 0 ? A.primary : A.mutedDark} grosor={1.8}>
                <path d={P.rotar} />
              </Icono24>
            </span>
            Rotar turnos
          </span>
        </div>
        <div style={{ position: "absolute", left: 20, top: 108, width: GRILLA.nombre, fontSize: 14, letterSpacing: "0.16em", color: A.muted }}>PERSONA</div>
        {SEMANA.map((d, i) => (
          <div key={d} style={{ position: "absolute", left: 20 + GRILLA.nombre + i * COL, width: COL, top: 106, textAlign: "center", fontSize: 16, fontWeight: i === 2 ? 700 : 500, color: i === 2 ? A.primary : A.mutedDark }}>
            {d}
          </div>
        ))}
        {PERSONAS.map((n, fila) => (
          <React.Fragment key={n}>
            <div style={{ position: "absolute", left: 20, top: GRILLA.top + fila * GRILLA.fila, height: GRILLA.fila, width: GRILLA.nombre - 10, display: "flex", alignItems: "center", fontSize: 19, fontWeight: 500 }}>{n}</div>
            {SEMANA.map((_, dia) => {
              const pop = resorte(frame, s(T.armas) + 2 + (fila + dia) * 3, 13, 150);
              const esAviso = fila === AVISO.fila && dia === AVISO.dia;
              return (
                <div key={dia} style={{ position: "absolute", left: 20 + GRILLA.nombre + dia * COL + 5, top: GRILLA.top + fila * GRILLA.fila + 6, width: COL - 10, height: GRILLA.fila - 12, transform: `scale(${0.6 + 0.4 * pop})`, opacity: Math.min(1, pop * 1.5) }}>
                  <div style={{ position: "absolute", inset: 0, opacity: 1 - rot, transform: `translateY(${rot * 26}px)` }}>
                    <Chip t={PATRONES[fila][dia]} />
                  </div>
                  {rot > 0 && (
                    <div style={{ position: "absolute", inset: 0, opacity: rot, transform: `translateY(${(rot - 1) * 26}px)` }}>
                      <Chip t={rotado(fila)[dia]} aviso={esAviso ? aviso : 0} />
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div style={{ position: "absolute", left: ax - 330, top: ay + 66 + (1 - tooltip) * 16, width: 400, background: A.ink, color: C.white, borderRadius: 20, padding: "16px 20px", fontFamily: F.body, fontSize: 21, lineHeight: 1.3, opacity: Math.min(1, tooltip * 2), boxShadow: "0 20px 40px -20px rgba(28,28,40,0.6)" }}>
        <svg width={24} height={14} viewBox="0 0 24 14" style={{ position: "absolute", right: 58, top: -12 }}>
          <path d="M0 14 L12 0 L24 14 Z" fill={A.ink} />
        </svg>
        <b style={{ color: "#F5C9A0" }}>Menos de 12 h de descanso.</b> Sale 00:30 y entra 08:00.
      </div>
      <Cursor
        camino={[
          [27.0, 760, 1500],
          [27.5, ...celda(0, 0)],
          [28.6, ...celda(2, 3)],
          [29.25, ...BOTON_ROTAR],
          [29.75, ...BOTON_ROTAR],
          [30.45, ax + 10, ay],
          [31.9, ax + 10, ay],
        ]}
        clics={[CLIC_ROTAR]}
        visible={[27.0, 31.7]}
      />
    </div>
  );
};

// ---------- Escena 4: plan vs. real ----------

type FilaPlan = { dia: string; nombre: string; plan: string; real: string; estado: string; tipo: "ok" | "tarde" | "ausente" | "extra"; t?: number };
const FILAS_PLAN: FilaPlan[] = [
  { dia: "Mié 14", nombre: "Camila Rojas", plan: "08:00–16:00", real: "08:02–16:01", estado: "En horario", tipo: "ok" },
  { dia: "Mié 14", nombre: "Martín Gómez", plan: "08:00–16:00", real: "08:14–16:00", estado: "Tarde · 14 min", tipo: "tarde", t: T.tarde },
  { dia: "Mié 14", nombre: "Tomás Benítez", plan: "07:30–15:30", real: "07:28–15:31", estado: "En horario", tipo: "ok" },
  { dia: "Mié 14", nombre: "Valentina Suárez", plan: "10:00–18:00", real: "—", estado: "Ausente", tipo: "ausente", t: T.falto },
  { dia: "Mié 14", nombre: "Sofía Ramírez", plan: "08:00–16:00", real: "08:00–16:45", estado: "+0h 45m extra", tipo: "extra", t: T.extra },
];
const ESTILO_ESTADO = {
  ok: { bg: A.okBg, fg: A.ok },
  tarde: { bg: A.warnBg, fg: A.warnText },
  ausente: { bg: A.badBg, fg: A.bad },
  extra: { bg: A.soft, fg: A.primary },
};
const EXTRAS: [string, string, string][] = [
  ["Mié 14 oct", "Sofía Ramírez", "+0h 45m"],
  ["Mié 14 oct", "Tomás Benítez", "+1h 10m"],
  ["Mar 13 oct", "Lucía Fernández", "+0h 23m"],
];
const CLIC_APROBAR = 39.25;
const PLAN = { x: 30, w: 1020, statsY: 450, tablaY: 650 };

const EscenaPlan: React.FC = () => {
  const frame = useCurrentFrame();
  const entra = resorte(frame, s(E.plan), 15, 100);
  const cuenta = tramo(frame, s(T.cuatro) + 18, s(T.cuatro) + 40);
  const aExtras = tramo(frame, s(T.aprobas) - 2, s(T.aprobas) + 8);
  const aprobada = resorte(frame, s(CLIC_APROBAR) + 2, 12);
  const enfoque = FILAS_PLAN.some((f) => f.t !== undefined && frame >= s(f.t));
  const stats: [string, string, string][] = [
    ["TARDANZAS", String(Math.round(cuenta * 5)), P.reloj],
    ["AUSENCIAS", String(Math.round(cuenta * 1)), P.calendario],
    ["HORAS EXTRA", `${Math.floor(cuenta * 22)}h ${String(Math.round(cuenta * 55)).padStart(2, "0")}m`, P.alerta],
  ];
  const fila = (i: number) => PLAN.tablaY + 150 + i * 92;
  const APROBAR: [number, number] = [PLAN.x + 875, PLAN.tablaY + 212];
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - entra) * 120}px)`, opacity: Math.min(1, entra * 1.5), fontFamily: F.body, color: A.ink }}>
      {stats.map(([label, valor, d], i) => (
        <div key={label} style={{ position: "absolute", left: PLAN.x + i * 346, top: PLAN.statsY, width: 328, height: 160, background: A.card, border: `1.5px solid ${i === 0 && frame >= s(T.tarde) && aExtras < 1 ? A.sel : A.line}`, borderRadius: 26, padding: "22px 26px", boxSizing: "border-box" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, letterSpacing: "0.16em", color: A.mutedDark }}>
            <Icono24 tam={20} color={A.mutedDark} grosor={1.8}>
              <path d={d} />
            </Icono24>
            {label}
          </span>
          <span style={{ display: "block", marginTop: 14, fontFamily: F.mono, fontSize: 54, lineHeight: 1 }}>{valor}</span>
        </div>
      ))}

      <div style={{ position: "absolute", left: PLAN.x, top: PLAN.tablaY, width: PLAN.w, height: 640, background: A.card, borderRadius: 30, border: `1.5px solid ${A.line}`, boxShadow: "0 40px 80px -50px rgba(28,28,40,0.45)", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - aExtras, transform: `translateX(${-aExtras * 60}px)` }}>
          <div style={{ position: "absolute", left: 32, top: 32, fontSize: 17, letterSpacing: "0.18em", color: A.mutedDark }}>PLAN VS. REAL · MIÉRCOLES 14</div>
          <div style={{ position: "absolute", left: 32, right: 32, top: 92, display: "grid", gridTemplateColumns: "270px 210px 210px 1fr", fontSize: 15, letterSpacing: "0.14em", color: A.muted }}>
            <span>EMPLEADO</span>
            <span>PLAN</span>
            <span>REAL</span>
            <span>ESTADO</span>
          </div>
          {FILAS_PLAN.map((f, i) => {
            const activa = f.t !== undefined && frame >= s(f.t);
            const pop = f.t !== undefined ? resorte(frame, s(f.t), 12, 150) : 1;
            const st = ESTILO_ESTADO[f.tipo];
            return (
              <div key={f.nombre} style={{ position: "absolute", left: 16, right: 16, top: fila(i) - PLAN.tablaY - 12, height: 84, borderRadius: 18, padding: "0 16px", display: "grid", gridTemplateColumns: "270px 210px 210px 1fr", alignItems: "center", background: activa ? st.bg : "transparent", opacity: enfoque && !activa ? 0.45 : 1, transform: `scale(${activa ? 0.98 + 0.02 * pop : 1})` }}>
                <span style={{ fontSize: 22, fontWeight: 600 }}>{f.nombre}</span>
                <span style={{ fontFamily: F.mono, fontSize: 20, color: A.mutedDark }}>{f.plan}</span>
                <span style={{ fontFamily: F.mono, fontSize: 20, color: f.tipo === "ok" ? A.mutedDark : st.fg, fontWeight: f.tipo === "ok" ? 400 : 600 }}>{f.real}</span>
                <span style={{ justifySelf: "start", fontSize: 19, fontWeight: 700, padding: "8px 16px", borderRadius: 22, background: activa || f.tipo === "ok" ? (activa ? C.white : st.bg) : st.bg, color: st.fg, transform: `scale(${f.t !== undefined ? 0.85 + 0.15 * pop : 1})`, opacity: f.t !== undefined ? Math.min(1, pop * 2) : 1 }}>{f.estado}</span>
              </div>
            );
          })}
        </div>

        <div style={{ position: "absolute", inset: 0, opacity: aExtras, transform: `translateX(${(1 - aExtras) * 60}px)` }}>
          <div style={{ position: "absolute", left: 32, right: 32, top: 32, fontSize: 17, letterSpacing: "0.18em", color: A.mutedDark }}>
            HORAS EXTRA · 3 <span style={{ letterSpacing: 0, fontSize: 17, color: A.muted }}>(no se pagan hasta aprobarlas)</span>
          </div>
          <div style={{ position: "absolute", left: 32, top: 84, display: "flex", alignItems: "center", gap: 10, background: A.primary, color: C.white, fontSize: 19, fontWeight: 600, padding: "14px 22px", borderRadius: 30 }}>
            <Icono24 tam={20} color={C.white} grosor={2.4}>
              <path d={P.check} />
            </Icono24>
            Aprobar las 3 pendientes
          </div>
          {EXTRAS.map(([dia, n, extra], i) => {
            const esSofia = i === 0;
            const p = esSofia ? aprobada : 0;
            return (
              <div key={n} style={{ position: "absolute", left: 16, right: 16, top: 170 + i * 92, height: 84, borderRadius: 18, padding: "0 16px", display: "grid", gridTemplateColumns: "150px 250px 140px 1fr 150px", alignItems: "center", background: esSofia && p > 0.5 ? A.soft : "transparent", borderBottom: `1.5px solid ${A.line}` }}>
                <span style={{ fontSize: 17, color: A.mutedDark }}>{dia}</span>
                <span style={{ fontSize: 21, fontWeight: 600 }}>{n}</span>
                <span style={{ fontFamily: F.mono, fontSize: 21 }}>{extra}</span>
                <span style={{ justifySelf: "start", position: "relative" }}>
                  <span style={{ display: "block", fontSize: 17, fontWeight: 600, padding: "7px 14px", borderRadius: 20, background: A.warnBg, color: A.warnText, opacity: 1 - p }}>Por aprobar</span>
                  {p > 0.01 && <span style={{ position: "absolute", left: 0, top: 0, whiteSpace: "nowrap", fontSize: 17, fontWeight: 600, padding: "7px 14px", borderRadius: 20, background: "#E2E3F8", color: A.primary, opacity: p, transform: `scale(${0.8 + 0.2 * p})` }}>Aprobada · +50 %</span>}
                </span>
                <span style={{ fontSize: 18, fontWeight: 600, color: esSofia && p > 0.5 ? A.muted : A.primary }}>{esSofia && p > 0.5 ? "Deshacer" : "Aprobar"}</span>
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 32, right: 32, top: 470, display: "flex", alignItems: "center", gap: 14, background: A.banner, borderRadius: 20, padding: "18px 22px", fontSize: 20, color: A.warnText }}>
            <Icono24 tam={26} color={A.warnText}>
              <path d={P.alerta} />
            </Icono24>
            Si cerrás el mes sin aprobarlas, quedan sin pagar.
          </div>
        </div>
      </div>
      <Cursor
        camino={[
          [38.4, 900, 1500],
          [39.0, ...APROBAR],
          [39.5, ...APROBAR],
          [40.5, 960, 1450],
        ]}
        clics={[CLIC_APROBAR]}
        visible={[38.4, 40.5]}
      />
    </div>
  );
};

// ---------- Escena 5: fin de mes ----------

const FILAS_MES: [string, string, string, string, string, string][] = [
  ["Sofía Ramírez", "104,72", "5.200", "—", "—", "532.047"],
  ["Martín Gómez", "104,35", "7.500", "—", "—", "723.125"],
  ["Camila Rojas", "88,73", "5.200", "+18.000", "—", "474.733"],
  ["Tomás Benítez", "100,63", "4.900", "—", "-30.000", "442.768"],
  ["Lucía Fernández", "106,35", "5.200", "—", "—", "532.393"],
  ["Valentina Suárez", "99,57", "5.400", "—", "—", "521.460"],
];
const CLIC_CERRAR = 43.05;
const CLIC_EXCEL = 43.95;
const MES = { x: 30, y: 440, w: 1020 };

const EscenaMes: React.FC = () => {
  const frame = useCurrentFrame();
  const entra = resorte(frame, s(E.mes), 15, 100);
  const cerrado = resorte(frame, s(CLIC_CERRAR) + 2, 12);
  const bajarBtn = resorte(frame, s(CLIC_CERRAR) + 8, 13);
  const descarga = resorte(frame, s(CLIC_EXCEL) + 3, 13);
  const excel = resorte(frame, s(CLIC_EXCEL) + 9, 15, 100);
  const nota = resorte(frame, s(T.contador), 11);
  const presion = (t: number) => interpolate(frame, [s(t) - 2, s(t) + 1, s(t) + 6], [1, 0.93, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const CERRAR: [number, number] = [MES.x + 120, MES.y + 112];
  const BAJAR: [number, number] = [MES.x + 380, MES.y + 112];
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - entra) * 120}px)`, opacity: Math.min(1, entra * 1.5), fontFamily: F.body, color: A.ink }}>
      <div style={{ position: "absolute", left: MES.x, top: MES.y, width: MES.w, height: 940, background: A.card, borderRadius: 30, border: `1.5px solid ${A.line}`, boxShadow: "0 40px 80px -50px rgba(28,28,40,0.45)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 32, top: 30, fontSize: 17, letterSpacing: "0.18em", color: cerrado > 0.5 ? A.ok : A.mutedDark, display: "flex", alignItems: "center", gap: 10 }}>
          {cerrado > 0.5 && (
            <Icono24 tam={20} color={A.ok} grosor={2}>
              <path d={P.candado} />
            </Icono24>
          )}
          {cerrado > 0.5 ? "OCTUBRE 2026 · CERRADO" : "PERÍODO EN CURSO · DESDE EL 01 OCT"}
        </div>
        <div style={{ position: "absolute", left: 32, top: 80, display: "flex", alignItems: "center", gap: 10, background: cerrado > 0.5 ? A.okBg : A.primary, color: cerrado > 0.5 ? A.ok : C.white, fontSize: 20, fontWeight: 600, padding: "14px 24px", borderRadius: 30, transform: `scale(${presion(CLIC_CERRAR)})` }}>
          <Icono24 tam={21} color={cerrado > 0.5 ? A.ok : C.white} grosor={2}>
            <path d={cerrado > 0.5 ? P.candado : P.calendario} />
          </Icono24>
          {cerrado > 0.5 ? "Mes cerrado" : "Cerrar mes"}
        </div>
        <div style={{ position: "absolute", left: 270, top: 80, display: "flex", alignItems: "center", gap: 10, background: C.green, color: C.white, fontSize: 20, fontWeight: 600, padding: "14px 24px", borderRadius: 30, opacity: Math.min(1, bajarBtn * 2), transform: `scale(${(0.8 + 0.2 * bajarBtn) * presion(CLIC_EXCEL)})` }}>
          <Icono24 tam={21} color={C.white} grosor={2}>
            <path d={P.bajar} />
          </Icono24>
          Bajar Excel
        </div>
        {[
          ["HORAS", "1174h 19m", P.reloj],
          ["COSTO ESTIMADO", "$ 6.324.938", P.calendario],
          ["FICHAJES", "178", P.check],
        ].map(([label, valor, d], i) => (
          <div key={label} style={{ position: "absolute", left: 24 + i * 328, top: 168, width: 312, height: 138, border: `1.5px solid ${i === 1 ? A.sel : A.line}`, borderRadius: 24, padding: "20px 24px", boxSizing: "border-box" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, letterSpacing: "0.16em", color: A.mutedDark }}>
              <Icono24 tam={18} color={A.mutedDark} grosor={1.8}>
                <path d={d} />
              </Icono24>
              {label}
            </span>
            <span style={{ display: "block", marginTop: 14, fontFamily: F.mono, fontSize: 38, lineHeight: 1 }}>{valor}</span>
          </div>
        ))}
        <div style={{ position: "absolute", left: 32, right: 32, top: 340, display: "grid", gridTemplateColumns: "300px 150px 180px 1fr", fontSize: 15, letterSpacing: "0.14em", color: A.muted }}>
          <span>EMPLEADO</span>
          <span>HORAS</span>
          <span>TARIFA/HORA</span>
          <span style={{ textAlign: "right" }}>TOTAL</span>
        </div>
        {FILAS_MES.map(([n, h, tarifa, , , total], i) => (
          <div key={n} style={{ position: "absolute", left: 32, right: 32, top: 380 + i * 80, height: 80, borderBottom: `1.5px solid ${A.line}`, display: "grid", gridTemplateColumns: "300px 150px 180px 1fr", alignItems: "center", fontSize: 21 }}>
            <span style={{ fontWeight: 500 }}>{n}</span>
            <span style={{ fontFamily: F.mono, color: A.mutedDark }}>{h}</span>
            <span style={{ fontFamily: F.mono, color: A.mutedDark }}>$ {tarifa}</span>
            <span style={{ fontFamily: F.mono, color: A.primary, textAlign: "right" }}>$ {total}</span>
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", left: 300, width: 480, top: 1400 + (1 - descarga) * 60, display: "flex", alignItems: "center", gap: 14, background: A.ink, color: C.white, fontSize: 24, fontWeight: 500, padding: "18px 26px", borderRadius: 24, opacity: Math.min(1, descarga * 2) * (1 - tramo(frame, s(CLIC_EXCEL) + 16, s(CLIC_EXCEL) + 24)), boxShadow: "0 20px 40px -20px rgba(28,28,40,0.6)" }}>
        <Icono24 tam={30} color="#7BE0B0" grosor={2.6}>
          <path d={P.check} />
        </Icono24>
        octubre-2026.xlsx descargado
      </div>

      {/* El Excel que se descarga */}
      <div style={{ position: "absolute", left: 50, top: 760 + (1 - excel) * 700, width: 980, height: 620, background: C.white, borderRadius: 24, border: `2px solid ${C.line}`, overflow: "hidden", boxShadow: "0 50px 90px -40px rgba(23,20,43,0.55)", opacity: Math.min(1, excel * 2), fontFamily: F.body }}>
        <div style={{ height: 70, background: C.green, display: "flex", alignItems: "center", gap: 14, padding: "0 28px", color: C.white, fontSize: 26, fontWeight: 600 }}>
          <Icono24 tam={30} color={C.white}>
            <path d={P.excel} />
          </Icono24>
          octubre-2026.xlsx
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "250px 120px 130px 130px 150px 1fr", padding: "0 24px", height: 52, alignItems: "center", background: "#F1EFF8", fontSize: 16, fontWeight: 700, letterSpacing: "0.06em", color: C.muted }}>
          <span>EMPLEADO</span>
          <span>HORAS</span>
          <span>TARIFA</span>
          <span>BONOS</span>
          <span>DESCUENTOS</span>
          <span style={{ textAlign: "right" }}>TOTAL A PAGAR</span>
        </div>
        {FILAS_MES.map(([n, h, tarifa, bonos, desc, total], i) => {
          const p = tramo(frame, s(CLIC_EXCEL) + 12 + i * 2, s(CLIC_EXCEL) + 18 + i * 2);
          return (
            <div key={n} style={{ display: "grid", gridTemplateColumns: "250px 120px 130px 130px 150px 1fr", padding: "0 24px", height: 66, alignItems: "center", borderBottom: `1.5px solid ${C.line}`, fontSize: 20, opacity: p }}>
              <span style={{ fontWeight: 600 }}>{n}</span>
              <span style={{ fontFamily: F.mono }}>{h}</span>
              <span style={{ fontFamily: F.mono }}>{tarifa}</span>
              <span style={{ fontFamily: F.mono, color: bonos === "—" ? C.muted : A.ok }}>{bonos}</span>
              <span style={{ fontFamily: F.mono, color: desc === "—" ? C.muted : A.bad }}>{desc}</span>
              <span style={{ fontFamily: F.mono, fontWeight: 600, textAlign: "right" }}>$ {total}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 330, top: 1330, display: "flex", alignItems: "center", gap: 14, transform: `rotate(-5deg) scale(${0.7 + 0.3 * nota})`, opacity: Math.min(1, nota * 2) }}>
        <div style={{ width: 70, height: 70, borderRadius: "50%", background: A.ok, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icono24 tam={42} color={C.white} grosor={3}>
            <path d={P.check} />
          </Icono24>
        </div>
        <span style={{ fontFamily: F.hand, fontSize: 54, color: C.violet, background: "rgba(247,246,251,0.92)", padding: "0 14px", borderRadius: 14 }}>listo para el contador</span>
      </div>
      <Cursor
        camino={[
          [42.5, 760, 1450],
          [42.95, ...CERRAR],
          [43.25, ...CERRAR],
          [43.85, ...BAJAR],
          [44.2, ...BAJAR],
          [44.9, 900, 1500],
        ]}
        clics={[CLIC_CERRAR, CLIC_EXCEL]}
        visible={[42.5, 44.8]}
      />
    </div>
  );
};

// ---------- Cierre ----------

const EscenaCierre: React.FC = () => {
  const frame = useCurrentFrame();
  const t0 = s(T.probalo);
  const dibujo = tramo(frame, t0 - 2, t0 + 18);
  const ojos = Math.min(1, resorte(frame, t0 + 16, 10));
  const parpadeo = interpolate(frame, [t0 + 60, t0 + 64, t0 + 68], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const texto = resorte(frame, t0 + 6, 15, 100);
  const tarjeta = resorte(frame, t0 + 40, 12);
  const web = resorte(frame, s(T.online), 12);
  return (
    <AbsoluteFill style={{ background: C.white, alignItems: "center", fontFamily: F.body }}>
      <div style={{ position: "absolute", top: 360, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Mascota width={400} color={C.violet} dibujo={dibujo} ojos={ojos} parpadeo={parpadeo} />
      </div>
      <Rayitas x={310} y={420} angulo={210} delay={t0 + 20} color={C.violet} largo={70} />
      <Rayitas x={770} y={420} angulo={330} delay={t0 + 20} color={C.violet} largo={70} />
      <div style={{ position: "absolute", top: 830, left: 60, right: 60, textAlign: "center", opacity: Math.min(1, texto * 1.5), transform: `translateY(${(1 - texto) * 40}px)` }}>
        <h1 style={{ ...display, fontSize: 110, lineHeight: 1, color: C.ink }}>
          Probalo <span style={{ color: C.violet }}>14 días</span>
          <br />
          gratis.
        </h1>
      </div>
      <div style={{ position: "absolute", top: 1110, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <span style={{ fontSize: 40, fontWeight: 600, color: C.muted, opacity: Math.min(1, tarjeta * 2), transform: `translateY(${(1 - tarjeta) * 20}px)` }}>Sin tarjeta.</span>
        <span style={{ background: C.violet, color: C.white, fontSize: 54, fontWeight: 700, padding: "24px 54px", borderRadius: 70, transform: `scale(${web})`, opacity: Math.min(1, web * 2) }}>miteam.online</span>
      </div>
      <Destello x={880} y={1150} delay={s(T.online) + 6} color={C.violet} tam={60} />
    </AbsoluteFill>
  );
};

// ---------- Textos de arriba ----------

const TITULOS: [number, number, number | null, string][] = [
  [0, T.mira, null, "¿Todavía con *planilla?*"],
  [T.mira, E.tablet, null, "Mirá cómo es con *MiTeam*"],
  [E.tablet, E.celular, 1, "La *tablet* del local"],
  [E.celular, E.turnos, 2, "Tu *celular*"],
  [E.turnos, E.plan, 3, "Los *turnos*"],
  [E.plan, E.mes, 4, "*Plan* vs. real"],
  [E.mes, E.cierre, 5, "*Fin* de mes"],
];

const BAJADAS: [number, number, string][] = [
  [T.pin + 0.3, T.salida, "PIN de *4 dígitos*"],
  [T.salida, T.sirve, "Sabe sola si es *entrada* o *salida*"],
  [T.sirve, T.sinRelojes, "Cualquier *tablet* o *PC*"],
  [T.sinRelojes, T.internet, "Sin relojes ni huellas"],
  [T.internet, E.celular, "Sin internet, *sigue fichando*"],
  [T.trabajando - 0.5, T.horasHoy, "Quién está *trabajando*"],
  [T.horasHoy, T.costoMes, "Las *horas* de hoy"],
  [T.costoMes, E.turnos, "Lo que va *costando el mes*"],
  [T.armas, T.rotacion, "La semana, con *colores*"],
  [T.rotacion, T.avisos, "Rotación *automática*"],
  [T.avisos, E.plan, "Avisos de *descanso*"],
  [T.tarde, T.falto, "Quién llegó *tarde*"],
  [T.falto, T.extra, "Quién *faltó*"],
  [T.extra, T.aprobas, "Quién hizo *horas extra*"],
  [T.aprobas, E.mes, "Las extras se pagan *si las aprobás*"],
  [T.cerras, T.excel, "Cerrás con *un botón*"],
  [T.excel, E.cierre, "El Excel, *listo*"],
];

const acento = (texto: string, color: string) => texto.split("*").map((parte, i) => <span key={i} style={i % 2 ? { color } : undefined}>{parte}</span>);

const Textos: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {TITULOS.map(([a, b, paso, texto]) => {
        const op = Math.min(a === 0 ? 1 : tramo(frame, s(a) - 1, s(a) + 6), 1 - tramo(frame, s(b) - 6, s(b) - 1));
        if (op <= 0.001) return null;
        const sube = a === 0 ? 1 : resorte(frame, s(a) - 1, 15, 130);
        return (
          <div key={a} style={{ position: "absolute", left: 90, right: 90, top: 196, display: "flex", alignItems: "center", gap: 22, opacity: op, transform: `translateY(${(1 - sube) * 36}px)` }}>
            {paso !== null && (
              <span style={{ ...display, width: 92, height: 92, flexShrink: 0, borderRadius: "50%", background: C.violet, color: C.white, fontSize: 56, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.6 + 0.4 * sube})` }}>{paso}</span>
            )}
            <span style={{ ...display, fontSize: 76, lineHeight: 1.02, color: C.ink }}>{acento(texto, C.violet)}</span>
          </div>
        );
      })}
      {BAJADAS.map(([a, b, texto]) => {
        const op = Math.min(tramo(frame, s(a) - 1, s(a) + 5), 1 - tramo(frame, s(b) - 5, s(b) - 1));
        if (op <= 0.001) return null;
        const sube = resorte(frame, s(a) - 1, 14, 150);
        return (
          <div key={a} style={{ position: "absolute", left: 90, top: 318, opacity: op, transform: `translateY(${(1 - sube) * 20}px)` }}>
            <span style={{ display: "inline-block", background: C.white, border: `2px solid ${C.line}`, borderRadius: 40, padding: "14px 28px", fontFamily: F.body, fontSize: 38, fontWeight: 600, color: C.ink, boxShadow: "0 14px 30px -22px rgba(23,20,43,0.4)" }}>{acento(texto, C.violet)}</span>
          </div>
        );
      })}
      {/* Avance del recorrido: un punto por paso */}
      {(() => {
        const op = ventana(frame, s(E.tablet), s(E.cierre) - 6, 8);
        if (op <= 0.001) return null;
        const actual = TITULOS.filter(([a, , paso]) => paso !== null && frame >= s(a) - 1).length;
        return (
          <div style={{ position: "absolute", right: 90, top: 140, display: "flex", gap: 12, opacity: op }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} style={{ width: n === actual ? 40 : 14, height: 14, borderRadius: 7, background: n <= actual ? C.violet : C.line }} />
            ))}
          </div>
        );
      })()}
    </>
  );
};

// Sonidos de uisfx (CC0): [segundo, archivo, volumen]
const SFX: [number, string, number][] = [
  [T.mira + 0.3, "soft-wake", 0.34],
  ...[...TOQUES_ENTRADA, ...TOQUES_SALIDA, ...TOQUES_OFFLINE].map((t): [number, string, number] => [t, "soft-press", 0.32]),
  [OK_ENTRADA + 0.05, "soft-success", 0.4],
  [OK_SALIDA + 0.05, "soft-check", 0.38],
  [T.sirve + 0.2, "soft-swipe", 0.28],
  [T.sinRelojes + 0.05, "soft-error", 0.3],
  [T.internet + 0.05, "soft-disconnect", 0.32],
  [OK_OFFLINE + 0.05, "soft-success", 0.38],
  [E.celular + 0.1, "soft-swipe", 0.26],
  ...TRABAJANDO.map((_, i): [number, string, number] => [T.trabajando + i * 0.13, "soft-select", 0.18]),
  [T.costoMes + 0.1, "soft-receive", 0.3],
  [E.turnos + 0.1, "soft-swipe", 0.26],
  ...[0, 1, 2, 3].map((i): [number, string, number] => [T.armas + 0.1 + i * 0.25, "soft-typing", 0.18]),
  [29.5, "soft-press", 0.36],
  [29.6, "soft-swipe", 0.26],
  [T.avisos + 0.15, "soft-warning", 0.34],
  [E.plan + 0.1, "soft-swipe", 0.26],
  [T.tarde + 0.05, "soft-select", 0.3],
  [T.falto + 0.05, "soft-select", 0.3],
  [T.extra + 0.05, "soft-select", 0.3],
  [CLIC_APROBAR, "soft-press", 0.36],
  [CLIC_APROBAR + 0.1, "soft-check", 0.36],
  [E.mes + 0.1, "soft-swipe", 0.26],
  [CLIC_CERRAR, "soft-press", 0.36],
  [CLIC_CERRAR + 0.12, "soft-complete", 0.34],
  [CLIC_EXCEL, "soft-press", 0.36],
  [CLIC_EXCEL + 0.15, "soft-receive", 0.32],
  [T.contador + 0.05, "soft-success", 0.38],
  [T.probalo + 0.4, "soft-wake", 0.38],
  [T.online + 0.05, "soft-achievement", 0.32],
];

const ESCENAS: [React.FC, number, number][] = [
  [EscenaPlanilla, 0, E.tablet],
  [EscenaTablet, E.tablet, E.celular],
  [EscenaCelular, E.celular, E.turnos],
  [EscenaTurnos, E.turnos, E.plan],
  [EscenaPlan, E.plan, E.mes],
  [EscenaMes, E.mes, E.cierre],
  [EscenaCierre, E.cierre, T.fin + 1],
];

export const ReelRecorrido: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: F.body }}>
      {ESCENAS.map(([Comp, a, b], i) => {
        const p = i === 0 ? 1 : tramo(frame, s(a) - 1, s(a) + 7);
        const op = Math.min(p, 1 - tramo(frame, s(b) - 5, s(b)));
        if (op <= 0.001) return null;
        return (
          <AbsoluteFill key={i} style={{ opacity: op }}>
            <Comp />
          </AbsoluteFill>
        );
      })}
      <Textos />
      <Audio src={staticFile("voz-recorrido.mp3")} />
      {SFX.map(([seg, archivo, volumen], i) => (
        <Sequence key={`sfx-${i}`} from={s(seg)} durationInFrames={s(2)} name={`sfx ${archivo}`}>
          <Audio src={staticFile(`sfx/uisfx/${archivo}.mp3`)} volume={volumen} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// Portada: "Así funciona MiTeam, en 5 pasos" (lo importante queda dentro del recorte 3:4 del perfil)
export const PortadaRecorrido: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: F.body }}>
    <div style={{ position: "absolute", left: 96, top: 330 }}>
      <span style={{ fontFamily: F.mono, fontSize: 34, fontWeight: 600, letterSpacing: "0.12em", color: C.violet, background: C.violetSoft, padding: "14px 26px", borderRadius: 40 }}>RECORRIDO</span>
    </div>
    <div style={{ position: "absolute", left: 90, right: 60, top: 440, ...display, fontSize: 170, lineHeight: 0.98, color: C.ink }}>
      Así funciona
      <br />
      <span style={{ color: C.violet }}>MiTeam.</span>
    </div>
    <div style={{ position: "absolute", left: 90, right: 90, top: 870, display: "flex", flexDirection: "column", gap: 22 }}>
      {["Fichan con PIN", "Lo ves en vivo", "Armás los turnos", "Plan vs. real", "Cerrás el mes"].map((t, i) => (
        <div key={t} style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <span style={{ ...display, width: 82, height: 82, borderRadius: "50%", background: C.violet, color: C.white, fontSize: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
          <span style={{ fontSize: 54, fontWeight: 600, color: C.ink }}>{t}</span>
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1560, display: "flex", justifyContent: "center" }}>
      <Logo size={50} />
    </div>
  </AbsoluteFill>
);
