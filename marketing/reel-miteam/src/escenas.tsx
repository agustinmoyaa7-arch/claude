import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { pop, subir, useEntrada, useTrazo } from "./anim";
import { C, Check, display, F, Icono, Logo, Mascota, SAFE } from "./brand";

export const Escena: React.FC<{ fondo: string; children: React.ReactNode }> = ({ fondo, children }) => (
  <AbsoluteFill
    style={{
      background: fondo,
      fontFamily: F.body,
      padding: `${SAFE.top}px ${SAFE.side}px ${SAFE.bottom}px`,
      boxSizing: "border-box",
    }}
  >
    {children}
  </AbsoluteFill>
);

export const Subir: React.FC<{ delay: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  delay,
  style,
  children,
}) => {
  const p = useEntrada(delay);
  return <div style={{ ...style, ...subir(p) }}>{children}</div>;
};

export const Pop: React.FC<{ delay: number; giro?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  delay,
  giro = 0,
  style,
  children,
}) => {
  const p = useEntrada(delay, 11);
  return <div style={{ ...style, ...pop(p, 0.5, giro) }}>{children}</div>;
};

export const Mano: React.FC<{ delay: number; color: string; size?: number; giro?: number; children: React.ReactNode }> = ({
  delay,
  color,
  size = 64,
  giro = -5,
  children,
}) => (
  <Pop delay={delay} giro={giro}>
    <span style={{ fontFamily: F.hand, fontSize: size, color }}>{children}</span>
  </Pop>
);

export const Chip: React.FC<{ color: string; fondo: string; children: React.ReactNode }> = ({ color, fondo, children }) => (
  <span style={{ fontSize: 30, fontWeight: 600, color, background: fondo, padding: "12px 24px", borderRadius: 40, whiteSpace: "nowrap" }}>
    {children}
  </span>
);

// 1 · Gancho
export const Gancho: React.FC = () => {
  const palabras: { t: string; color?: string }[] = [
    { t: "¿Quién" },
    { t: "llegó" },
    { t: "tarde", color: C.violetLight },
    { t: "hoy?" },
  ];
  return (
    <Escena fondo={C.dark}>
      <Logo oscuro />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 60 }}>
        <h1 style={{ ...display, fontSize: 176, lineHeight: 1.02, color: C.white, display: "flex", flexWrap: "wrap", columnGap: 40 }}>
          {palabras.map((p, i) => (
            <Pop key={p.t} delay={3 + i * 6}>
              <span style={{ color: p.color ?? C.white }}>{p.t}</span>
            </Pop>
          ))}
        </h1>
        <Pop delay={30} giro={6} style={{ alignSelf: "flex-end" }}>
          <svg width={260} height={246} viewBox="18 4 74 70" fill="none" stroke={C.violetLight} strokeLinecap="round" strokeLinejoin="round">
            <path d="M25 67 C24 53 27 41 31 33 Q33.5 28.5 37.5 31.5 C42 35 46.5 41 50 47.5 C53.5 41 58 35 62.5 31.5 Q66.5 28.5 69 33 C73 41 76 53 75 67" strokeWidth={5.6} />
            <path d="M32 60 Q39 47 46 60 M54 60 Q61 47 68 60" strokeWidth={3.4} />
            <path d="M80 9 C87 8 90 15 85 19 C82 21 82 23 82 26" strokeWidth={3.4} />
            <circle cx={82} cy={32} r={1.9} fill={C.violetLight} stroke="none" />
          </svg>
        </Pop>
      </div>
    </Escena>
  );
};

// 2 · Chau planilla, hola MiTeam
export const ChauPlanilla: React.FC = () => {
  const tachar = useTrazo(16, 30);
  return (
    <Escena fondo={C.bg}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 56 }}>
        <Pop delay={0} giro={-4} style={{ alignSelf: "flex-start" }}>
          <Icono size={230} />
        </Pop>
        <h1 style={{ ...display, fontSize: 160, lineHeight: 1, color: C.ink }}>
          <Subir delay={4}>
            Chau{" "}
            <span style={{ position: "relative", display: "inline-block" }}>
              planilla.
              <svg width="100%" height={80} viewBox="0 0 300 60" preserveAspectRatio="none" fill="none" stroke={C.violet} strokeWidth={9} strokeLinecap="round" style={{ position: "absolute", left: 0, top: 50 }}>
                <path d="M4 34 C70 22 150 30 296 14 M20 46 C100 36 190 40 280 30" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tachar} />
              </svg>
            </span>
          </Subir>
          <Subir delay={32}>
            <span style={{ color: C.violet }}>Hola, MiTeam.</span>
          </Subir>
        </h1>
        <Subir delay={46}>
          <p style={{ margin: 0, fontSize: 50, lineHeight: 1.3, color: C.muted, fontWeight: 400 }}>
            Tu equipo ficha con un PIN.
            <br />
            Vos cerrás el mes en un clic.
          </p>
        </Subir>
      </div>
    </Escena>
  );
};

// 3 · El kiosco: PIN y saludo
const PIN_TECLAS = ["4", "8", "1", "5"];
const TECLAS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "✓"];

export const Kiosco: React.FC = () => {
  const frame = useCurrentFrame();
  const inicioPin = 18;
  const paso = 7;
  const llenos = PIN_TECLAS.filter((_, i) => frame >= inicioPin + i * paso).length;
  const teclaActiva = PIN_TECLAS.findIndex((_, i) => frame >= inicioPin + i * paso && frame < inicioPin + i * paso + 5);
  const okActivo = frame >= inicioPin + 4 * paso && frame < inicioPin + 4 * paso + 6;
  const saludo = useEntrada(inicioPin + 4 * paso + 4, 11);

  return (
    <Escena fondo={C.bg}>
      <Subir delay={0}>
        <h1 style={{ ...display, fontSize: 124, lineHeight: 1.02, color: C.ink }}>
          Fichan con
          <br />
          <span style={{ color: C.violet }}>un PIN.</span>
        </h1>
      </Subir>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Pop delay={6}>
          <div style={{ width: 780, background: C.violet, color: C.white, borderRadius: 64, padding: 44, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: C.violetMuted }}>
              <span>Bodegón Los Álamos</span>
              <span>Tablet del salón</span>
            </div>
            <div style={{ textAlign: "center", fontFamily: F.mono, fontSize: 132, fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em" }}>08:59</div>
            <div style={{ height: 156, position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, color: C.violetMuted, opacity: 1 - saludo }}>
                Escribí tu PIN
              </div>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: C.white,
                  color: C.ink,
                  borderRadius: 34,
                  padding: "0 34px",
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  boxShadow: "0 30px 60px -20px rgba(17,15,28,0.45)",
                  ...pop(saludo, 0.7),
                }}
              >
                <Mascota width={104} color={C.violet} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ ...display, fontWeight: 800, fontSize: 52 }}>¡Hola, Lucía!</span>
                  <span style={{ fontSize: 32, color: C.muted }}>Entrada registrada · 08:59</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 22 }}>
              {PIN_TECLAS.map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    boxSizing: "border-box",
                    border: `3px solid ${C.white}`,
                    background: i < llenos ? C.white : "transparent",
                  }}
                />
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
              {TECLAS.map((t) => {
                const activa = (teclaActiva >= 0 && PIN_TECLAS[teclaActiva] === t) || (t === "✓" && okActivo);
                return (
                  <div
                    key={t}
                    style={{
                      height: 96,
                      borderRadius: 26,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: F.mono,
                      fontSize: 40,
                      fontWeight: 600,
                      background: t === "✓" || activa ? C.white : "rgba(255,255,255,0.16)",
                      color: t === "✓" || activa ? C.violet : C.white,
                      transform: activa ? "scale(0.92)" : "scale(1)",
                    }}
                  >
                    {t}
                  </div>
                );
              })}
            </div>
          </div>
        </Pop>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Mano delay={72} color={C.violet}>
          ¡y listo!
        </Mano>
      </div>
    </Escena>
  );
};

// 4 · Plan vs. real
const FILAS = [
  { nombre: "Lucía · Salón", horas: "09:00 → 08:59", chip: "En horario", color: C.ok, fondo: C.okBg },
  { nombre: "Martín · Cocina", horas: "08:00 → 08:14", chip: "Tarde · 14 min", color: C.warn, fondo: C.warnBg },
  { nombre: "Diego · Barra", horas: "16–24 → 00:40", chip: "Extra · 40 min", color: C.violet, fondo: C.violetSoft },
  { nombre: "Sofía · Caja", horas: "10:00 → —", chip: "Ausente", color: C.bad, fondo: C.badBg },
];

const FilaReporte: React.FC<{ fila: (typeof FILAS)[number]; delay: number; primera: boolean }> = ({ fila, delay, primera }) => {
  const p = useEntrada(delay);
  const chip = useEntrada(delay + 10, 10);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "28px 0", borderTop: primera ? "none" : `2px solid ${C.line}`, ...subir(p, 40) }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: 40, fontWeight: 600 }}>{fila.nombre}</span>
        <span style={{ fontFamily: F.mono, fontSize: 28, color: C.muted }}>{fila.horas}</span>
      </div>
      <div style={pop(chip, 0.6)}>
        <Chip color={fila.color} fondo={fila.fondo}>
          {fila.chip}
        </Chip>
      </div>
    </div>
  );
};

export const PlanVsReal: React.FC = () => (
  <Escena fondo={C.dark}>
    <Subir delay={0}>
      <h1 style={{ ...display, fontSize: 116, lineHeight: 1.02, color: C.white }}>
        Tardanzas y horas extra, <span style={{ color: C.violetLight }}>automático.</span>
      </h1>
    </Subir>
    <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
      <Pop delay={8} style={{ width: "100%" }}>
        <div style={{ background: C.white, color: C.ink, borderRadius: 48, padding: "40px 48px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12 }}>
            <span style={{ ...display, fontWeight: 800, fontSize: 46, letterSpacing: "-0.01em" }}>Plan vs. real</span>
            <span style={{ fontSize: 28, color: C.muted }}>jueves</span>
          </div>
          {FILAS.map((f, i) => (
            <FilaReporte key={f.nombre} fila={f} delay={16 + i * 9} primera={i === 0} />
          ))}
        </div>
      </Pop>
    </div>
  </Escena>
);

// 5 · Sin internet
export const SinInternet: React.FC = () => {
  const frame = useCurrentFrame();
  const temblor = frame < 24 ? Math.sin(frame * 1.6) * 6 * (1 - frame / 24) : 0;
  const tarjeta = useEntrada(30);
  const check = useTrazo(40, 52);
  return (
    <Escena fondo={C.violet}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 64 }}>
        <Pop delay={0} style={{ alignSelf: "flex-start" }}>
          <svg width={240} height={240} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${temblor}deg)` }}>
            <path d="M2 8.8a15 15 0 0 1 4.2-2.6" />
            <path d="M10.6 5.1A15 15 0 0 1 22 8.8" />
            <path d="M5 12.6a10 10 0 0 1 5.2-2.7" />
            <path d="M16.8 11.2a10 10 0 0 1 2.2 1.4" />
            <path d="M8.5 16.3a5 5 0 0 1 7 0" />
            <circle cx={12} cy={20} r={1} fill={C.white} />
            <path d="M3 3l18 18" />
          </svg>
        </Pop>
        <Subir delay={8}>
          <h1 style={{ ...display, fontSize: 140, lineHeight: 1.02, color: C.white }}>¿Se cortó internet?</h1>
        </Subir>
        <div style={{ background: C.white, borderRadius: 48, padding: "44px 48px", display: "flex", flexDirection: "column", gap: 18, ...subir(tarjeta, 60) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <Check size={72} color={C.green} progreso={check} />
            <span style={{ ...display, fontSize: 76, color: C.violet }}>Se sigue fichando.</span>
          </div>
          <span style={{ fontSize: 40, lineHeight: 1.35, color: C.muted }}>Guarda hasta 7 días y sincroniza solo cuando vuelve la conexión.</span>
        </div>
      </div>
    </Escena>
  );
};

// 6 · Cierre de mes
export const CierreMes: React.FC = () => {
  const frame = useCurrentFrame();
  const checks = [useTrazo(14, 22), useTrazo(20, 28), useTrazo(26, 34)];
  const cursor = interpolate(frame, [22, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const presion = interpolate(frame, [38, 42, 48], [1, 0.93, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const excel = useEntrada(48, 10);
  const items = ["Horas y tarifa", "Bonos y descuentos", "Total a pagar por empleado"];
  return (
    <Escena fondo={C.bg}>
      <Subir delay={0}>
        <h1 style={{ ...display, fontSize: 132, lineHeight: 1.02, color: C.ink }}>
          Fin de mes
          <br />
          en <span style={{ color: C.violet }}>un clic.</span>
        </h1>
      </Subir>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 48 }}>
        <Pop delay={6}>
          <div style={{ background: C.white, border: `2px solid ${C.line}`, borderRadius: 48, padding: 48, display: "flex", flexDirection: "column", gap: 26, position: "relative" }}>
            <span style={{ ...display, fontWeight: 800, fontSize: 46, letterSpacing: "-0.01em", color: C.ink }}>Cierre de octubre</span>
            {items.map((t, i) => (
              <div key={t} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 38, fontWeight: 500, color: C.ink, paddingBottom: 20, borderBottom: i < 2 ? `2px solid ${C.line}` : "none" }}>
                <span>{t}</span>
                <Check size={44} color={C.green} progreso={checks[i]} />
              </div>
            ))}
            <div style={{ height: 110, borderRadius: 56, background: C.violet, color: C.white, fontSize: 40, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, transform: `scale(${presion})` }}>
              <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />
              </svg>
              Cerrar mes y bajar Excel
            </div>
            <svg
              width={84}
              height={84}
              viewBox="0 0 24 24"
              fill={C.ink}
              stroke={C.white}
              strokeWidth={1.2}
              strokeLinejoin="round"
              style={{
                position: "absolute",
                right: interpolate(cursor, [0, 1], [-40, 220]),
                bottom: interpolate(cursor, [0, 1], [-140, 40]),
                opacity: interpolate(frame, [20, 26, 56, 62], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              }}
            >
              <path d="M5 3l14 8-6 1.5L10 19z" />
            </svg>
          </div>
        </Pop>
        <div style={{ display: "flex", alignItems: "center", gap: 30, ...pop(excel, 0.4) }}>
          <div style={{ width: 150, height: 186, borderRadius: 24, background: C.green, display: "flex", alignItems: "flex-end", padding: 20, boxSizing: "border-box" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 6, width: "100%" }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} style={{ height: 18, borderRadius: 4, background: i < 3 ? "#BDEBD8" : "#EAF8F2" }} />
              ))}
            </div>
          </div>
          <span style={{ fontSize: 46, fontWeight: 600, color: C.ink }}>Listo para tu contador.</span>
        </div>
      </div>
    </Escena>
  );
};

// 7 · Precios
const PLANES = [
  { nombre: "Local", tope: "Hasta 8 empleados", precio: "$18.000" },
  { nombre: "Equipo", tope: "Hasta 25 empleados", precio: "$35.000", destacado: true },
  { nombre: "Empresa", tope: "Hasta 50 empleados", precio: "$60.000" },
];

const FilaPlan: React.FC<{ plan: (typeof PLANES)[number]; delay: number }> = ({ plan, delay }) => {
  const p = useEntrada(delay);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: plan.destacado ? C.violet : C.surface,
        borderRadius: 36,
        padding: "34px 40px",
        position: "relative",
        ...subir(p, 50),
      }}
    >
      {plan.destacado && (
        <span style={{ position: "absolute", top: -22, left: 40, background: C.white, color: C.violet, fontSize: 26, fontWeight: 700, padding: "8px 18px", borderRadius: 30 }}>
          El más elegido
        </span>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ ...display, fontWeight: 800, fontSize: 54, letterSpacing: "-0.01em", color: C.white }}>{plan.nombre}</span>
        <span style={{ fontSize: 32, color: plan.destacado ? C.violetMuted : C.mutedDark }}>{plan.tope}</span>
      </div>
      <span style={{ fontFamily: F.mono, fontSize: 60, fontWeight: 600, color: C.white, letterSpacing: "-0.03em" }}>
        {plan.precio}
        <span style={{ fontFamily: F.body, fontSize: 30, fontWeight: 400, letterSpacing: 0, color: plan.destacado ? C.violetMuted : C.mutedDark }}> /mes</span>
      </span>
    </div>
  );
};

export const Precios: React.FC<{ pie?: string }> = ({ pie = "En pesos. Anual: 2 meses de regalo." }) => (
  <Escena fondo={C.dark}>
    <Subir delay={0}>
      <h1 style={{ ...display, fontSize: 132, lineHeight: 1.02, color: C.white }}>
        Gratis hasta
        <br />
        <span style={{ color: C.violetLight }}>3 empleados.</span>
      </h1>
    </Subir>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 34 }}>
      {PLANES.map((p, i) => (
        <FilaPlan key={p.nombre} plan={p} delay={14 + i * 8} />
      ))}
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Subir delay={44}>
        <span style={{ fontSize: 38, color: C.mutedDark }}>{pie}</span>
      </Subir>
    </div>
  </Escena>
);

// 8 · Cierre: probalo gratis
export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const chispas = useTrazo(10, 28);
  const parpadeo = interpolate(frame, [70, 74, 78], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Escena fondo={C.bg}>
      <Logo />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 50, textAlign: "center" }}>
        <Pop delay={0}>
          <Mascota width={520} color={C.violet} chispas={chispas} parpadeo={parpadeo} />
        </Pop>
        <Subir delay={10}>
          <h1 style={{ ...display, fontSize: 150, lineHeight: 1, color: C.ink }}>
            Probalo <span style={{ color: C.violet }}>14 días</span>
            <br />
            gratis.
          </h1>
        </Subir>
        <Subir delay={20}>
          <span style={{ fontSize: 44, color: C.muted }}>Sin tarjeta. Con todo incluido.</span>
        </Subir>
        <Pop delay={30}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, background: C.violet, color: C.white, fontFamily: F.mono, fontSize: 50, fontWeight: 600, padding: "30px 56px", borderRadius: 90 }}>
            <svg width={52} height={52} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20l1.3-3.9A8.5 8.5 0 1 1 8 19l-4 1z" />
            </svg>
            +54 9 3541 70-4884
          </div>
        </Pop>
        <Subir delay={38}>
          <span style={{ fontSize: 40, fontWeight: 500, color: C.muted }}>Por WhatsApp · miteam.online</span>
        </Subir>
      </div>
    </Escena>
  );
};
