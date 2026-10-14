// Reel "Entran 10 chicos nuevos para la temporada": importar empleados desde Excel.
// Animado con datos inventados y sincronizado con public/voz-temporada.mp3.
import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { C, display, F, Logo, Mascota } from "./brand";
import { Destello, OndaClic, Rayitas } from "./garabatos";

const FPS = 30;
const s = (seg: number) => Math.round(seg * FPS);
const suave = Easing.inOut(Easing.cubic);

// Segundos en los que la voz dice cada parte (medidos en voz-temporada.mp3).
const T = {
  nuevos: 2.15,
  unoPorUno: 4.35,
  no: 6.22,
  bajas: 7.07,
  llenas: 8.25,
  subis: 9.22,
  error: 10.08,
  fila: 11.14,
  pines: 12.5,
  repartir: 14.25,
  otroDia: 15.6,
  fichando: 16.77,
  probalo: 18.1,
  fin: 21,
};
export const DURACION_TEMPORADA = s(T.fin);

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

// Escribe un texto letra por letra entre dos segundos.
const tipeo = (frame: number, texto: string, desde: number, hasta: number) =>
  texto.slice(0, Math.round(texto.length * tramo(frame, s(desde), s(hasta))));

const Icono24: React.FC<{ tam: number; color?: string; grosor?: number; children: React.ReactNode }> = ({ tam, color = C.violet, grosor = 2, children }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={grosor} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const Tarjeta: React.FC<{ top: number; alto: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ top, alto, children, style }) => (
  <div style={{ position: "absolute", left: 90, width: 900, top, height: alto, background: C.white, borderRadius: 34, border: `2px solid ${C.line}`, boxShadow: "0 40px 80px -50px rgba(23, 20, 43, 0.45)", overflow: "hidden", fontFamily: F.body, ...style }}>
    {children}
  </div>
);

const BarraExcel: React.FC<{ nombre: string }> = ({ nombre }) => (
  <div style={{ height: 84, background: C.green, display: "flex", alignItems: "center", gap: 16, padding: "0 36px", color: C.white, fontSize: 32, fontWeight: 600 }}>
    <Icono24 tam={38} color={C.white}>
      <path d="M4 5h16v14H4z M4 10h16 M4 15h16 M10 5v14" />
    </Icono24>
    {nombre}
  </div>
);

// Cursor de mouse con onda al hacer clic
const Cursor: React.FC<{ camino: [number, number, number][]; clics: number[]; visible: [number, number] }> = ({ camino, clics, visible }) => {
  const frame = useCurrentFrame();
  const x = pista(frame, camino.map(([t, px]) => [s(t), px]));
  const y = pista(frame, camino.map(([t, , py]) => [s(t), py]));
  const op = ventana(frame, s(visible[0]), s(visible[1]), 4);
  const presion = Math.max(0, ...clics.map((t) => 1 - Math.min(1, Math.abs(frame - s(t)) / 3)));
  const donde = (t: number) => {
    const i = camino.findIndex(([tc]) => tc >= t - 0.06);
    return camino[Math.max(0, i)];
  };
  return (
    <>
      {clics.map((t) => {
        const [, px, py] = donde(t);
        return <OndaClic key={t} x={px} y={py} delay={s(t)} color={C.violetLight} />;
      })}
      <svg width={64} height={64} viewBox="0 0 24 24" style={{ position: "absolute", left: x - 9, top: y - 6, opacity: op, transform: `scale(${1 - 0.15 * presion})`, transformOrigin: "9px 6px", filter: "drop-shadow(0 6px 10px rgba(23,20,43,0.35))" }}>
        <path d="M5 3l14 8-6 1.5L10 19z" fill={C.ink} stroke={C.white} strokeWidth={1.4} strokeLinejoin="round" />
      </svg>
    </>
  );
};

// A · El Excel con los 10 nombres
const NOMBRES = ["Sofi", "Tomi", "Martín", "Valen", "Cami", "Lucas", "Juli", "Nico", "Agus", "Flor"];

const EscenaExcel: React.FC = () => {
  const frame = useCurrentFrame();
  const mas10 = resorte(frame, s(3.95), 10);
  const entra = resorte(frame, 0, 15, 110);
  return (
    <>
      <Tarjeta top={600} alto={754} style={{ transform: `translateY(${(1 - entra) * 80}px) scale(${0.94 + 0.06 * entra})`, opacity: Math.min(1, entra * 1.5) }}>
        <BarraExcel nombre="temporada.xlsx" />
        <div style={{ height: 50, background: "#F1EFF8", display: "flex", alignItems: "center", fontSize: 22, fontWeight: 600, color: C.muted, letterSpacing: "0.06em" }}>
          <span style={{ width: 90, textAlign: "center" }}>#</span>
          <span>NOMBRE</span>
        </div>
        {NOMBRES.map((n, i) => {
          const p = tramo(frame, s(T.nuevos) + 2 + i * 4, s(T.nuevos) + 8 + i * 4);
          return (
            <div key={n} style={{ height: 62, display: "flex", alignItems: "center", borderBottom: `2px solid ${C.line}`, opacity: p, transform: `translateX(${(1 - p) * -30}px)` }}>
              <span style={{ width: 90, textAlign: "center", fontFamily: F.mono, fontSize: 24, color: C.muted }}>{i + 1}</span>
              <span style={{ fontSize: 34, fontWeight: 500, color: C.ink }}>{n}</span>
            </div>
          );
        })}
      </Tarjeta>
      <div style={{ position: "absolute", left: 800, top: 560, width: 170, height: 170, borderRadius: "50%", background: C.violet, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", ...display, fontSize: 70, transform: `scale(${mas10}) rotate(${(1 - mas10) * 30 - 8}deg)`, opacity: Math.min(1, mas10 * 2) }}>+10</div>
    </>
  );
};

// B · Cargarlos uno por uno… no
const EscenaUnoPorUno: React.FC = () => {
  const frame = useCurrentFrame();
  const no = resorte(frame, s(T.no), 11, 160);
  const campos: [string, string, number, number][] = [
    ["Nombre", "Sofi", 4.55, 4.95],
    ["Sector", "Salón", 5.05, 5.4],
    ["Valor hora", "$ 4.800", 5.45, 5.85],
  ];
  return (
    <>
      {[2, 1].map((k) => (
        <div key={k} style={{ position: "absolute", left: 90 + k * 22, width: 900 - k * 44, top: 620 - k * 26, height: 700, background: C.white, borderRadius: 34, border: `2px solid ${C.line}`, opacity: 0.7 }} />
      ))}
      <Tarjeta top={620} alto={700} style={{ opacity: 1 - no * 0.5, filter: `grayscale(${no})` }}>
        <div style={{ padding: "40px 48px", display: "flex", flexDirection: "column", gap: 30 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ ...display, fontSize: 48, fontWeight: 800, color: C.ink }}>Nuevo empleado</span>
            <span style={{ fontFamily: F.mono, fontSize: 28, fontWeight: 600, color: C.violet, background: C.violetSoft, padding: "10px 20px", borderRadius: 30 }}>1 de 10</span>
          </div>
          {campos.map(([etiqueta, valor, a, b]) => (
            <div key={etiqueta} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ fontSize: 26, fontWeight: 600, color: C.muted }}>{etiqueta}</span>
              <div style={{ height: 84, borderRadius: 20, border: `3px solid ${frame >= s(a) && frame < s(b) + 6 ? C.violet : C.line}`, display: "flex", alignItems: "center", padding: "0 26px", fontSize: 36, color: C.ink }}>
                {tipeo(frame, valor, a, b)}
                {frame >= s(a) && frame < s(b) + 6 && <span style={{ width: 3, height: 40, background: C.violet, marginLeft: 4, opacity: Math.floor(frame / 8) % 2 }} />}
              </div>
            </div>
          ))}
          <div style={{ height: 14, borderRadius: 7, background: C.line, overflow: "hidden" }}>
            <div style={{ width: "10%", height: "100%", background: C.violet }} />
          </div>
        </div>
      </Tarjeta>
      <div style={{ position: "absolute", left: 230, top: 760, width: 620, height: 380, borderRadius: 40, border: "16px solid #E5484D", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1.8 - 0.8 * no}) rotate(-10deg)`, opacity: Math.min(1, no * 1.6) }}>
        <span style={{ ...display, fontSize: 230, color: "#E5484D", lineHeight: 1 }}>NO</span>
      </div>
    </>
  );
};

// C · Panel › Empleados › Importar desde Excel › bajar la planilla base
const EscenaImportar: React.FC = () => {
  const frame = useCurrentFrame();
  const modal = resorte(frame, s(7.32), 14);
  const descarga = resorte(frame, s(7.7), 13);
  const presionBoton = (t: number) => interpolate(frame, [s(t) - 2, s(t) + 1, s(t) + 6], [1, 0.94, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <Tarjeta top={600} alto={760}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 230, borderRight: `2px solid ${C.line}`, padding: "34px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, padding: "0 10px" }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: C.violet, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Mascota width={31} color={C.white} />
            </div>
            <span style={{ ...display, fontSize: 30, fontWeight: 900, color: C.ink }}>MiTeam</span>
          </div>
          {["Resumen", "Empleados", "Turnos", "Cierre de mes"].map((t) => (
            <span key={t} style={{ fontSize: 26, fontWeight: t === "Empleados" ? 700 : 500, color: t === "Empleados" ? C.violet : C.muted, background: t === "Empleados" ? C.violetSoft : "transparent", padding: "14px 16px", borderRadius: 16 }}>{t}</span>
          ))}
        </div>
        <div style={{ position: "absolute", left: 230, right: 0, top: 0, bottom: 0, padding: "36px 40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ ...display, fontSize: 46, fontWeight: 800, color: C.ink }}>Empleados</span>
            <span style={{ display: "flex", alignItems: "center", gap: 12, background: C.violet, color: C.white, fontSize: 24, fontWeight: 600, padding: "18px 24px", borderRadius: 40, transform: `scale(${presionBoton(7.24)})` }}>
              <Icono24 tam={28} color={C.white}>
                <path d="M4 5h16v14H4z M4 10h16 M10 5v14" />
              </Icono24>
              Importar desde Excel
            </span>
          </div>
          {["Lucía", "Martín", "Diego"].map((n, i) => (
            <div key={n} style={{ marginTop: i === 0 ? 40 : 0, height: 92, display: "flex", alignItems: "center", gap: 18, borderTop: `2px solid ${C.line}` }}>
              <span style={{ width: 54, height: 54, borderRadius: "50%", background: C.violetSoft, color: C.violet, fontWeight: 700, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>{n[0]}</span>
              <span style={{ fontSize: 30, fontWeight: 500, color: C.ink }}>{n}</span>
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", inset: 0, background: "rgba(23, 20, 43, 0.28)", opacity: Math.min(1, modal) }} />
        <div style={{ position: "absolute", left: 130, width: 640, top: 210, height: 380, background: C.white, borderRadius: 30, padding: "36px 40px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 22, transform: `scale(${0.85 + 0.15 * modal})`, opacity: Math.min(1, modal * 2), boxShadow: "0 30px 60px -30px rgba(23,20,43,0.5)" }}>
          <span style={{ ...display, fontSize: 40, fontWeight: 800, color: C.ink }}>Importar empleados</span>
          <span style={{ fontSize: 28, color: C.muted }}>1 · Bajá la planilla base y completala.</span>
          <span style={{ marginTop: 18, alignSelf: "center", display: "flex", alignItems: "center", gap: 12, border: `3px solid ${C.violet}`, color: C.violet, fontSize: 28, fontWeight: 600, padding: "20px 34px", borderRadius: 40, transform: `scale(${presionBoton(7.6)})` }}>
            <Icono24 tam={30}>
              <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />
            </Icono24>
            Bajar planilla base
          </span>
        </div>
      </Tarjeta>
      <div style={{ position: "absolute", left: 300, width: 480, top: 1270, display: "flex", alignItems: "center", gap: 16, background: C.ink, color: C.white, fontSize: 26, fontWeight: 500, padding: "20px 28px", borderRadius: 26, transform: `translateY(${(1 - descarga) * 60}px)`, opacity: Math.min(1, descarga * 2), boxShadow: "0 20px 40px -20px rgba(23,20,43,0.6)" }}>
        <Icono24 tam={34} color="#7BE0B0" grosor={2.6}>
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </Icono24>
        planilla-base.xlsx descargada
      </div>
      <Cursor
        camino={[
          [6.98, 900, 1300],
          [7.2, 795, 682],
          [7.36, 795, 682],
          [7.55, 545, 1040],
          [7.66, 545, 1040],
          [8.3, 640, 1180],
        ]}
        clics={[7.24, 7.6]}
        visible={[7.0, 8.2]}
      />
    </>
  );
};

// D · La planilla llenándose (rápido)
const FILAS = [
  ["Sofi", "Salón", "$ 4.800"],
  ["Tomi", "Barra", "$ 4.800"],
  ["Martín", "Cocina", "$ 5.200"],
  ["Valen", "Salón", "$ 4.800"],
  ["Cami", "Caja", "$ 4.600"],
  ["Lucas", "Cocina", "$ 5.200"],
  ["Juli", "Salón", "$ 4.800"],
  ["Nico", "Cocina", ""],
  ["Agus", "Barra", "$ 4.800"],
  ["Flor", "Caja", "$ 4.600"],
];

const EscenaLlenar: React.FC = () => {
  const frame = useCurrentFrame();
  const x4 = resorte(frame, s(T.llenas) + 2, 10);
  return (
    <>
      <Tarjeta top={600} alto={754}>
        <BarraExcel nombre="planilla-base.xlsx" />
        <div style={{ height: 50, background: "#F1EFF8", display: "grid", gridTemplateColumns: "300px 300px 1fr", alignItems: "center", padding: "0 36px", fontSize: 22, fontWeight: 600, color: C.muted, letterSpacing: "0.06em" }}>
          <span>NOMBRE</span>
          <span>SECTOR</span>
          <span>VALOR HORA</span>
        </div>
        {FILAS.map((fila, i) => (
          <div key={fila[0]} style={{ height: 62, display: "grid", gridTemplateColumns: "300px 300px 1fr", alignItems: "center", padding: "0 36px", borderBottom: `2px solid ${C.line}`, fontSize: 32, color: C.ink }}>
            {fila.map((t, j) => {
              const a = T.llenas + 0.05 + i * 0.08 + j * 0.025;
              return (
                <span key={j} style={{ fontFamily: j === 2 ? F.mono : F.body, fontWeight: j === 0 ? 600 : 400 }}>
                  {tipeo(frame, t, a, a + 0.08)}
                </span>
              );
            })}
          </div>
        ))}
      </Tarjeta>
      <div style={{ position: "absolute", left: 800, top: 560, display: "flex", alignItems: "center", gap: 8, background: C.ink, color: C.white, fontFamily: F.mono, fontSize: 34, fontWeight: 600, padding: "16px 26px", borderRadius: 40, transform: `scale(${x4}) rotate(${(1 - x4) * 20 + 4}deg)`, opacity: Math.min(1, x4 * 2) }}>
        <svg width={36} height={36} viewBox="0 0 24 24" fill={C.white}>
          <path d="M3 6l8 6-8 6z M12 6l8 6-8 6z" />
        </svg>
        x4
      </div>
    </>
  );
};

// E · La subís y te marca el error en la fila (con zoom a la fila de Nico)
const SUB = { top: 600, filas: 336, paso: 44 };
const FILA_NICO = 7;
const NICO_Y = SUB.top + SUB.filas + FILA_NICO * SUB.paso; // borde de arriba de la fila 8

const EscenaSubir: React.FC = () => {
  const frame = useCurrentFrame();
  const vuela = tramo(frame, s(T.subis), s(T.subis) + 10);
  const carga = tramo(frame, s(9.6), s(10.0));
  const filas = tramo(frame, s(9.95), s(10.05));
  const avisoFila = resorte(frame, s(T.fila), 12);
  const arreglado = frame >= s(11.9);
  const listo = resorte(frame, s(11.95), 12);
  const valorNico = tipeo(frame, "$ 4.800", 11.6, 11.88);
  const enFila = frame >= s(T.error) && !arreglado;
  const zoom = 1 + 0.16 * (tramo(frame, s(10.15), s(10.6)) - tramo(frame, s(11.9), s(12.3)));
  return (
    <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: `540px ${NICO_Y + 22}px` }}>
      <Tarjeta top={SUB.top} alto={870}>
        <div style={{ padding: "30px 40px 0" }}>
          <span style={{ ...display, fontSize: 42, fontWeight: 800, color: C.ink }}>Importar empleados</span>
        </div>
        <div style={{ position: "absolute", left: 40, right: 40, top: 100, height: 150, borderRadius: 26, border: `4px dashed ${vuela >= 1 ? C.violet : "#C9C3E6"}`, background: vuela >= 1 ? C.violetSoft : "transparent", display: "flex", alignItems: "center", justifyContent: "center", gap: 18, fontSize: 30, color: C.muted }}>
          {vuela < 1 ? (
            <>
              <Icono24 tam={44} color={C.muted}>
                <path d="M12 16V4M7 9l5-5 5 5M5 20h14" />
              </Icono24>
              Soltá tu planilla acá
            </>
          ) : (
            <span style={{ display: "flex", alignItems: "center", gap: 14, color: C.violet, fontWeight: 600 }}>
              <Icono24 tam={40} color={C.green}>
                <path d="M4 5h16v14H4z M4 10h16 M10 5v14" />
              </Icono24>
              planilla-base.xlsx
            </span>
          )}
        </div>
        <div style={{ position: "absolute", left: 40, right: 40, top: 270, height: 14, borderRadius: 7, background: C.line, overflow: "hidden" }}>
          <div style={{ width: `${carga * 100}%`, height: "100%", background: C.violet }} />
        </div>
        <div style={{ position: "absolute", left: 40, right: 40, top: 296, opacity: filas, fontSize: 24, fontWeight: 600, color: C.muted }}>10 filas encontradas</div>
        {FILAS.map(([n, sector, valor], i) => {
          const esNico = i === FILA_NICO;
          const mal = esNico && enFila;
          const bien = !esNico || arreglado;
          return (
            <div
              key={n}
              style={{
                position: "absolute",
                left: 40,
                right: 40,
                top: SUB.filas + i * SUB.paso,
                height: SUB.paso - 4,
                display: "grid",
                gridTemplateColumns: "70px 230px 210px 1fr 40px",
                alignItems: "center",
                padding: "0 14px",
                borderRadius: 12,
                fontSize: 28,
                color: C.ink,
                opacity: tramo(frame, s(10.0) + i, s(10.0) + i + 4),
                background: mal ? C.warnBg : esNico && arreglado ? C.okBg : "transparent",
                outline: mal ? `3px solid ${C.warn}` : "none",
              }}
            >
              <span style={{ fontFamily: F.mono, color: C.muted }}>{i + 1}</span>
              <span style={{ fontWeight: 600 }}>{n}</span>
              <span>{sector}</span>
              <span style={{ fontFamily: F.mono }}>{esNico ? valorNico || (mal ? "—" : "") : valor}</span>
              <span>
                {bien ? (
                  <Icono24 tam={28} color={C.green} grosor={3}>
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </Icono24>
                ) : (
                  <Icono24 tam={28} color={C.warn} grosor={2.6}>
                    <path d="M12 3l9.5 17h-19z M12 10v4 M12 17.5v.01" />
                  </Icono24>
                )}
              </span>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 40, right: 40, top: 790, height: 56, borderRadius: 28, background: C.okBg, color: C.ok, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontSize: 30, fontWeight: 700, transform: `scale(${0.8 + 0.2 * listo})`, opacity: Math.min(1, listo * 2) }}>
          <Icono24 tam={32} color={C.ok} grosor={3}>
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </Icono24>
          10 empleados listos
        </div>
      </Tarjeta>
      <div style={{ position: "absolute", left: 420, top: NICO_Y + SUB.paso + 12 + (1 - avisoFila) * 20, display: "flex", alignItems: "center", gap: 12, background: C.warn, color: C.white, fontSize: 28, fontWeight: 600, padding: "16px 24px", borderRadius: 22, opacity: Math.min(1, avisoFila * 2) * (arreglado ? 1 - tramo(frame, s(11.9), s(12.1)) : 1), boxShadow: "0 16px 30px -14px rgba(138, 74, 16, 0.7)" }}>
        <svg width={24} height={16} viewBox="0 0 24 16" style={{ position: "absolute", left: 250, top: -14 }}>
          <path d="M0 16 L12 0 L24 16 Z" fill={C.warn} />
        </svg>
        Fila 8 · Nico: falta el valor hora
      </div>
      <div style={{ position: "absolute", left: 390, top: 740, transform: `translate(${(1 - vuela) * 700}px, ${(1 - vuela) * -120}px) scale(${1.2 - 0.2 * vuela}) rotate(${(1 - vuela) * 14}deg)`, opacity: vuela < 1 ? 1 : 0, display: "flex", alignItems: "center", gap: 12, background: C.white, border: `3px solid ${C.green}`, borderRadius: 20, padding: "14px 20px", fontSize: 24, fontWeight: 600, color: C.ink, boxShadow: "0 20px 40px -20px rgba(23,20,43,0.5)" }}>
        <Icono24 tam={34} color={C.green}>
          <path d="M4 5h16v14H4z M4 10h16 M10 5v14" />
        </Icono24>
        planilla-base.xlsx
      </div>
      <Cursor camino={[[11.2, 900, 1480], [11.45, 690, NICO_Y + 26], [11.95, 690, NICO_Y + 26], [12.3, 860, 1460]]} clics={[11.52]} visible={[11.2, 12.3]} />
    </div>
  );
};

// F · El PDF con los PIN
const PINES = ["4815", "2093", "7731", "1264", "5508", "9172", "3349", "6620", "8057", "1436"];

const EscenaPdf: React.FC = () => {
  const frame = useCurrentFrame();
  const abre = resorte(frame, s(T.pines), 15, 110);
  return (
    <div style={{ position: "absolute", inset: 0, transform: `scale(${0.9 + 0.1 * abre})`, opacity: Math.min(1, abre * 1.5), transformOrigin: "540px 980px" }}>
      <Tarjeta top={590} alto={800} style={{ background: "#E9E7F2", overflow: "visible" }}>
        <div style={{ height: 76, borderRadius: "32px 32px 0 0", background: C.ink, display: "flex", alignItems: "center", gap: 16, padding: "0 32px", color: C.white, fontSize: 28, fontWeight: 500 }}>
          <span style={{ background: "#E5484D", color: C.white, fontSize: 20, fontWeight: 800, padding: "6px 12px", borderRadius: 8, letterSpacing: "0.05em" }}>PDF</span>
          pines-temporada.pdf
        </div>
        <div style={{ position: "absolute", left: 30, right: 30, top: 106, bottom: 30, background: C.white, borderRadius: 14, boxShadow: "0 10px 30px -18px rgba(23,20,43,0.4)", padding: "26px 28px", boxSizing: "border-box" }}>
          <div style={{ ...display, fontSize: 34, fontWeight: 800, color: C.ink, marginBottom: 18 }}>PIN de tu equipo · temporada</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
            {NOMBRES.map((n, i) => {
              const p = resorte(frame, s(T.pines) + 6 + i * 2, 13);
              const reparte = i < 3 ? tramo(frame, s(T.repartir) + i * 3, s(T.repartir) + i * 3 + 14) : 0;
              const lado = i % 2 === 0 ? -1 : 1;
              return (
                <div
                  key={n}
                  style={{
                    height: 100,
                    borderRadius: 14,
                    border: "3px dashed #C9C3E6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 22px",
                    background: C.white,
                    transform: `scale(${0.7 + 0.3 * p}) translate(${reparte * lado * 520}px, ${reparte * -260}px) rotate(${reparte * lado * 18}deg)`,
                    opacity: Math.min(1, p * 2) * (1 - reparte * 0.2),
                    boxShadow: reparte > 0 ? "0 24px 40px -20px rgba(23,20,43,0.5)" : "none",
                    zIndex: reparte > 0 ? 2 : 1,
                  }}
                >
                  <span style={{ fontSize: 30, fontWeight: 600, color: C.ink }}>{n}</span>
                  <span style={{ fontFamily: F.mono, fontSize: 46, fontWeight: 600, color: C.violet, letterSpacing: "0.08em" }}>{PINES[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Tarjeta>
    </div>
  );
};

// G · Al otro día, en la tablet de la barra
const TAB = { w: 700, h: 900, cx: 540, cy: 975, pad: 40, tecladoTop: 452, teclaH: 90, gap: 12 };
const TECLAS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "✓"];
const COL_W = (TAB.w - TAB.pad * 2 - TAB.gap * 2) / 3;
const centroTecla = (idx: number): [number, number] => [
  TAB.cx - TAB.w / 2 + TAB.pad + (idx % 3) * (COL_W + TAB.gap) + COL_W / 2,
  TAB.cy - TAB.h / 2 + TAB.tecladoTop + Math.floor(idx / 3) * (TAB.teclaH + TAB.gap) + TAB.teclaH / 2,
];
const PIN_SOFI = PINES[0].split("");
const TOQUES = [15.95, 16.15, 16.35, 16.55];
const TOQUE_OK = 16.7;
const SALUDO = 16.8;

const EscenaTablet: React.FC = () => {
  const frame = useCurrentFrame();
  const llenos = TOQUES.filter((t) => frame >= s(t)).length;
  const saludo = resorte(frame, s(SALUDO), 12);
  const activa = (idx: number) => {
    const tiempos = TOQUES.filter((_, i) => PIN_SOFI[i] === TECLAS[idx]).concat(TECLAS[idx] === "✓" ? [TOQUE_OK] : []);
    return tiempos.some((t) => frame >= s(t) && frame < s(t) + 5);
  };
  const camino: [number, number, number][] = [
    [15.7, 760, 1560],
    [15.9, ...centroTecla(TECLAS.indexOf(PIN_SOFI[0]))],
    [16.1, ...centroTecla(TECLAS.indexOf(PIN_SOFI[1]))],
    [16.3, ...centroTecla(TECLAS.indexOf(PIN_SOFI[2]))],
    [16.5, ...centroTecla(TECLAS.indexOf(PIN_SOFI[3]))],
    [16.65, ...centroTecla(TECLAS.indexOf("✓"))],
    [16.95, 920, 1560],
  ];
  const x = pista(frame, camino.map(([t, px]) => [s(t), px]));
  const y = pista(frame, camino.map(([t, , py]) => [s(t), py]));
  const presion = Math.max(0, ...[...TOQUES, TOQUE_OK].map((t) => 1 - Math.min(1, Math.abs(frame - s(t)) / 3)));
  const dedo = ventana(frame, s(15.7), s(16.9), 4);
  const entra = resorte(frame, s(T.otroDia), 15, 100);
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1420, height: 36, background: "#E8DCC6", borderTop: `6px solid ${C.violet}` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1456, bottom: 0, background: "#F3EBDD" }} />
      <div style={{ position: "absolute", left: TAB.cx - TAB.w / 2, top: TAB.cy - TAB.h / 2, width: TAB.w, height: TAB.h, borderRadius: 60, background: C.violet, fontFamily: F.body, transform: `translateY(${(1 - entra) * 120}px)`, opacity: Math.min(1, entra * 1.5), boxShadow: "0 40px 70px -40px rgba(23,20,43,0.6)" }}>
        <div style={{ position: "absolute", left: TAB.pad, right: TAB.pad, top: 38, display: "flex", justifyContent: "space-between", fontSize: 24, color: C.violetMuted }}>
          <span>Tu local</span>
          <span>Tablet de la barra</span>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 92, textAlign: "center", fontFamily: F.mono, fontSize: 116, fontWeight: 600, lineHeight: 1, color: C.white }}>08:00</div>
        <div style={{ position: "absolute", left: TAB.pad, right: TAB.pad, top: 238, height: 140 }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: C.violetMuted, opacity: 1 - Math.min(1, saludo) }}>Escribí tu PIN</div>
          <div style={{ position: "absolute", inset: 0, background: C.white, borderRadius: 30, padding: "0 30px", display: "flex", alignItems: "center", gap: 22, transform: `scale(${0.7 + 0.3 * saludo})`, opacity: Math.min(1, saludo * 2) }}>
            <Mascota width={96} color={C.violet} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ ...display, fontWeight: 800, fontSize: 52, color: C.ink }}>¡Hola, Sofi!</span>
              <span style={{ fontSize: 28, color: C.muted }}>Entrada registrada · 08:00</span>
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 402, display: "flex", justifyContent: "center", gap: 22 }}>
          {PIN_SOFI.map((_, i) => (
            <span key={i} style={{ width: 24, height: 24, borderRadius: "50%", border: `3px solid ${C.white}`, boxSizing: "border-box", background: i < llenos ? C.white : "transparent" }} />
          ))}
        </div>
        {TECLAS.map((t, idx) => {
          const on = activa(idx);
          const ok = t === "✓";
          return (
            <div key={t} style={{ position: "absolute", left: TAB.pad + (idx % 3) * (COL_W + TAB.gap), top: TAB.tecladoTop + Math.floor(idx / 3) * (TAB.teclaH + TAB.gap), width: COL_W, height: TAB.teclaH, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.mono, fontSize: 40, fontWeight: 600, background: ok || on ? C.white : "rgba(255,255,255,0.16)", color: ok || on ? C.violet : C.white, transform: `scale(${on ? 0.93 : 1})` }}>
              {t}
            </div>
          );
        })}
      </div>
      {[...TOQUES, TOQUE_OK].map((t) => {
        const i = camino.findIndex(([tc]) => tc >= t - 0.06);
        const [, px, py] = camino[Math.max(0, i)];
        return <OndaClic key={t} x={px} y={py} delay={s(t)} color={C.white} />;
      })}
      <div style={{ position: "absolute", left: x - 40, top: y - 40, width: 80, height: 80, borderRadius: "50%", background: "rgba(23, 20, 43, 0.24)", border: "4px solid rgba(255,255,255,0.92)", boxSizing: "border-box", opacity: dedo, transform: `scale(${1 - 0.18 * presion})` }} />
      <div style={{ opacity: ventana(frame, s(SALUDO), s(T.probalo) - 0.3, 4) }}>
        <Rayitas x={170} y={700} angulo={205} delay={s(SALUDO) + 2} color={C.violet} largo={55} />
        <Rayitas x={910} y={700} angulo={335} delay={s(SALUDO) + 2} color={C.violet} largo={55} />
      </div>
    </>
  );
};

// H · Logo y cierre
const EscenaLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const t0 = s(T.probalo);
  const dibujo = tramo(frame, t0 + 2, t0 + 22);
  const ojos = Math.min(1, resorte(frame, t0 + 20, 10));
  const parpadeo = interpolate(frame, [t0 + 62, t0 + 66, t0 + 70], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const texto = resorte(frame, t0 + 12, 15, 100);
  const pastilla = resorte(frame, t0 + 26, 12);
  return (
    <AbsoluteFill style={{ background: C.white, alignItems: "center", fontFamily: F.body }}>
      <div style={{ position: "absolute", top: 380, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Mascota width={420} color={C.violet} dibujo={dibujo} ojos={ojos} parpadeo={parpadeo} />
      </div>
      <Rayitas x={300} y={440} angulo={210} delay={t0 + 24} color={C.violet} largo={70} />
      <Rayitas x={780} y={440} angulo={330} delay={t0 + 24} color={C.violet} largo={70} />
      <div style={{ position: "absolute", top: 860, left: 60, right: 60, textAlign: "center", opacity: Math.min(1, texto * 1.5), transform: `translateY(${(1 - texto) * 40}px)` }}>
        <h1 style={{ ...display, fontSize: 110, lineHeight: 1, color: C.ink }}>
          Probalo <span style={{ color: C.violet }}>14 días</span>
          <br />
          gratis.
        </h1>
      </div>
      <div style={{ position: "absolute", top: 1140, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        <span style={{ background: C.violet, color: C.white, fontSize: 40, fontWeight: 700, padding: "22px 44px", borderRadius: 60, transform: `scale(${pastilla})`, opacity: Math.min(1, pastilla * 2) }}>Hasta 200 empleados de una</span>
        <span style={{ fontSize: 36, fontWeight: 600, color: C.muted, opacity: Math.min(1, pastilla * 2) }}>miteam.online</span>
      </div>
    </AbsoluteFill>
  );
};

// Texto grande de arriba, uno por escena (*palabra* = violeta)
const TITULOS: [number, number, string, string?][] = [
  [0, T.unoPorUno, "Entran *10 chicos nuevos* para la temporada 😰"],
  [T.unoPorUno, T.bajas, "¿Cargarlos *uno por uno?*"],
  [T.bajas, T.llenas, "*Bajás* la planilla"],
  [T.llenas, T.subis, "La *llenás*", "(o se la pasás al encargado)"],
  [T.subis, T.pines, "La *subís*. Si hay un error, te dice *en qué fila*"],
  [T.pines, T.otroDia, "Los PIN salen *solos*, en un PDF para repartir"],
  [T.otroDia, T.probalo, "Al otro día *ya fichan* ✅"],
];

const Titulos: React.FC = () => {
  const frame = useCurrentFrame();
  const no = resorte(frame, s(T.no), 10, 170);
  return (
    <>
      {TITULOS.map(([a, b, texto, chico]) => {
        const op = Math.min(a === 0 ? 1 : tramo(frame, s(a) - 1, s(a) + 6), 1 - tramo(frame, s(b) - 6, s(b) - 1));
        if (op <= 0.001) return null;
        const sube = a === 0 ? 1 : resorte(frame, s(a) - 1, 15, 130);
        return (
          <div key={a} style={{ position: "absolute", left: 90, right: 90, top: 220, opacity: op, transform: `translateY(${(1 - sube) * 40}px)` }}>
            <div style={{ ...display, fontSize: 86, lineHeight: 1.04, color: C.ink }}>
              {texto.split("*").map((parte, i) => (
                <span key={i} style={i % 2 ? { color: C.violet } : undefined}>{parte}</span>
              ))}
              {a === T.unoPorUno && (
                <span style={{ display: "inline-block", marginLeft: 22, color: "#E5484D", transform: `scale(${no})`, opacity: Math.min(1, no * 2) }}>No.</span>
              )}
            </div>
            {chico && <div style={{ fontFamily: F.body, fontSize: 44, fontWeight: 500, color: C.muted, marginTop: 14 }}>{chico}</div>}
          </div>
        );
      })}
    </>
  );
};

// Sonidos de uisfx (CC0): [segundo, archivo, volumen]
const SFX: [number, string, number][] = [
  ...NOMBRES.map((_, i): [number, string, number] => [T.nuevos + 0.07 + i * 0.133, "soft-typing", 0.22]),
  [3.95, "soft-select", 0.32],
  [4.55, "soft-typing", 0.2], [5.05, "soft-typing", 0.2], [5.45, "soft-typing", 0.2],
  [T.no, "soft-error", 0.4],
  [7.24, "soft-press", 0.4], [7.32, "soft-open", 0.26], [7.6, "soft-press", 0.4], [7.72, "soft-receive", 0.3],
  ...[0, 1, 2, 3, 4].map((i): [number, string, number] => [T.llenas + 0.08 + i * 0.16, "soft-typing", 0.18]),
  [T.subis + 0.3, "soft-drop", 0.36],
  [T.error, "soft-warning", 0.36],
  [11.52, "soft-press", 0.36], [11.62, "soft-typing", 0.2], [11.76, "soft-typing", 0.2],
  [11.95, "soft-success", 0.4],
  [T.pines + 0.05, "soft-open", 0.34],
  [T.repartir, "soft-swipe", 0.3], [T.repartir + 0.1, "soft-swipe", 0.26],
  ...TOQUES.map((t): [number, string, number] => [t, "soft-press", 0.36]),
  [TOQUE_OK, "soft-check", 0.38],
  [SALUDO, "soft-success", 0.42],
  [T.probalo + 0.7, "soft-wake", 0.4],
  [T.probalo + 1.0, "soft-achievement", 0.3],
];

const ESCENAS: [React.FC, number, number][] = [
  [EscenaExcel, 0, T.unoPorUno],
  [EscenaUnoPorUno, T.unoPorUno, T.bajas],
  [EscenaImportar, T.bajas, T.llenas],
  [EscenaLlenar, T.llenas, T.subis],
  [EscenaSubir, T.subis, T.pines],
  [EscenaPdf, T.pines, T.otroDia],
  [EscenaTablet, T.otroDia, T.probalo],
  [EscenaLogo, T.probalo, T.fin + 1],
];

export const ReelTemporada: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: F.body }}>
      {ESCENAS.map(([Comp, a, b], i) => {
        const p = i === 0 ? 1 : tramo(frame, s(a) - 1, s(a) + 7);
        const op = Math.min(p, 1 - tramo(frame, s(b) - 5, s(b)));
        if (op <= 0.001) return null;
        return (
          <AbsoluteFill key={i} style={{ opacity: op, transform: `translateY(${(1 - p) * 50}px)` }}>
            <Comp />
          </AbsoluteFill>
        );
      })}
      <Titulos />
      <div style={{ opacity: 1 - tramo(frame, s(T.probalo) - 6, s(T.probalo) - 1) }}>
        <Destello x={960} y={250} delay={s(T.fichando)} color={C.violet} tam={56} />
      </div>
      <Audio src={staticFile("voz-temporada.mp3")} />
      {SFX.map(([seg, archivo, volumen], i) => (
        <Sequence key={`sfx-${i}`} from={s(seg)} durationInFrames={s(2)} name={`sfx ${archivo}`}>
          <Audio src={staticFile(`sfx/uisfx/${archivo}.mp3`)} volume={volumen} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// Portada del reel: "10 nuevos → fichando mañana" (lo importante queda dentro del recorte 3:4 del perfil)
export const PortadaTemporada: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: F.body }}>
    <div style={{ position: "absolute", left: 96, top: 330 }}>
      <span style={{ fontFamily: F.mono, fontSize: 34, fontWeight: 600, letterSpacing: "0.12em", color: C.violet, background: C.violetSoft, padding: "14px 26px", borderRadius: 40 }}>TEMPORADA</span>
    </div>
    <div style={{ position: "absolute", left: 90, right: 60, top: 440, ...display, fontSize: 176, lineHeight: 0.98, color: C.ink }}>
      10 nuevos
      <div style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 10 }}>
        <svg width={150} height={110} viewBox="0 0 150 110" fill="none" stroke={C.violet} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 20 C 30 80, 80 92, 128 70" />
          <path d="M100 48 L130 69 L104 96" />
        </svg>
        <span>fichando</span>
      </div>
      <span style={{ color: C.violet }}>mañana.</span>
    </div>
    {[
      ["Sofi", PINES[0], -7, 80, 1130],
      ["Tomi", PINES[1], 6, 570, 1160],
      ["Martín", PINES[2], -2, 320, 1320],
    ].map(([n, pin, giro, x, y]) => (
      <div key={n} style={{ position: "absolute", left: Number(x), top: Number(y), width: 420, height: 130, borderRadius: 22, background: C.white, border: "4px dashed #C9C3E6", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", boxSizing: "border-box", transform: `rotate(${giro}deg)`, boxShadow: "0 30px 50px -30px rgba(23,20,43,0.45)" }}>
        <span style={{ fontSize: 40, fontWeight: 600, color: C.ink }}>{n}</span>
        <span style={{ fontFamily: F.mono, fontSize: 60, fontWeight: 600, color: C.violet, letterSpacing: "0.08em" }}>{pin}</span>
      </div>
    ))}
    <Destello x={960} y={1080} delay={-40} color={C.violet} tam={70} />
    <Destello x={150} y={1420} delay={-40} color={C.violetLight} tam={46} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1560, display: "flex", justifyContent: "center" }}>
      <Logo size={50} />
    </div>
  </AbsoluteFill>
);
