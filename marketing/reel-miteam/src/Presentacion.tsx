import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { pop, useEntrada, useTrazo } from "./anim";
import { C, Check, display, F, Mascota } from "./brand";
import { CierreMes, Escena, Kiosco, Mano, PlanVsReal, Pop, Precios, SinInternet, Subir } from "./escenas";

const FPS = 30;
const s = (segundos: number) => Math.round(segundos * FPS);

// Escenas nuevas de este reel

const Intro: React.FC = () => {
  const dibujo = useTrazo(0, 22);
  const ojos = useEntrada(20, 10);
  return (
    <Escena fondo={C.white}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 56, textAlign: "center" }}>
        <Mascota width={460} color={C.violet} dibujo={dibujo} ojos={ojos} />
        <Subir delay={18}>
          <h1 style={{ ...display, fontSize: 170, lineHeight: 1, color: C.ink, display: "flex", alignItems: "baseline", justifyContent: "center" }}>
            MiTeam
            <span style={{ display: "inline-block", width: 40, height: 40, borderRadius: "50%", background: C.violet, marginLeft: 10 }} />
          </h1>
        </Subir>
        <Subir delay={40}>
          <p style={{ ...display, fontSize: 76, lineHeight: 1.08, fontWeight: 800, color: C.violet }}>Software de control horario</p>
        </Subir>
        <Subir delay={78}>
          <p style={{ margin: 0, fontSize: 46, lineHeight: 1.3, color: C.muted }}>para equipos que atienden al público.</p>
        </Subir>
      </div>
    </Escena>
  );
};

const Rubro: React.FC<{ delay: number; nombre: string; icono: React.ReactNode }> = ({ delay, nombre, icono }) => (
  <Pop delay={delay} style={{ width: "100%" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 34, background: C.surface, borderRadius: 40, padding: "34px 40px" }}>
      <div style={{ width: 120, height: 120, borderRadius: 32, background: C.violet, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width={72} height={72} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          {icono}
        </svg>
      </div>
      <span style={{ ...display, fontWeight: 800, fontSize: 66, color: C.white }}>{nombre}</span>
    </div>
  </Pop>
);

const Rubros: React.FC = () => (
  <Escena fondo={C.dark}>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 30 }}>
      <Rubro delay={2} nombre="Restaurantes" icono={<path d="M6 3v7a2 2 0 0 0 4 0V3 M8 10v11 M17 21V3c-2.2 0-3.5 2.5-3.5 6v4H17" />} />
      <Rubro delay={30} nombre="Comercios" icono={<path d="M5 8h14l-1 13H6z M9 8V6a3 3 0 0 1 6 0v2" />} />
      <Rubro
        delay={58}
        nombre="Locales con turnos"
        icono={
          <>
            <circle cx={12} cy={12} r={8.5} />
            <path d="M12 7.5V12l3 2" />
          </>
        }
      />
    </div>
  </Escena>
);

const Tachado: React.FC<{ desde: number; children: React.ReactNode }> = ({ desde, children }) => {
  const p = useTrazo(desde, desde + 10);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {children}
      <svg width="110%" height={70} viewBox="0 0 300 60" preserveAspectRatio="none" fill="none" stroke={C.violet} strokeWidth={10} strokeLinecap="round" style={{ position: "absolute", left: "-5%", top: "38%" }}>
        <path d="M4 34 C70 22 150 30 296 14" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      </svg>
    </span>
  );
};

const Planilla: React.FC = () => (
  <Escena fondo={C.bg}>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 60 }}>
      <Subir delay={0}>
        <h1 style={{ ...display, fontSize: 112, lineHeight: 1.08, color: C.ink }}>
          ¿Tu equipo ficha en una <Tachado desde={34}>planilla</Tachado> o en un <Tachado desde={46}>cuaderno</Tachado>?
        </h1>
      </Subir>
      <div style={{ display: "flex", gap: 28 }}>
        <Pop delay={6} giro={-4}>
          <div style={{ width: 300, height: 360, borderRadius: 30, background: C.white, border: `3px solid ${C.line}`, padding: 30, boxSizing: "border-box", display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, alignContent: "start" }}>
            {Array.from({ length: 15 }).map((_, i) => (
              <span key={i} style={{ height: 40, borderRadius: 6, background: i < 3 ? C.violetSoft : "#F1EFF8" }} />
            ))}
          </div>
        </Pop>
        <Pop delay={12} giro={5}>
          <div style={{ width: 300, height: 360, borderRadius: 30, background: "#FFF6DD", border: `3px solid #EADBB0`, padding: "40px 34px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 30 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} style={{ height: 4, borderRadius: 2, background: "#D9C690", width: `${90 - (i % 3) * 18}%` }} />
            ))}
          </div>
        </Pop>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 24 }}>
        <Mano delay={82} color={C.violet} size={88}>
          esto es para vos
        </Mano>
        <Pop delay={88}>
          <Mascota width={150} color={C.violet} />
        </Pop>
      </div>
    </div>
  </Escena>
);

const Tachito: React.FC<{ delay: number; children: React.ReactNode }> = ({ delay, children }) => {
  const p = useEntrada(delay);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 28, background: C.surface, borderRadius: 36, padding: "34px 40px", ...pop(p, 0.8) }}>
      <span style={{ width: 80, height: 80, flexShrink: 0, borderRadius: "50%", background: "#3A1E2A", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#F4A3A3" strokeWidth={3} strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </span>
      <span style={{ fontSize: 50, fontWeight: 500, color: C.mutedDark, textDecoration: "line-through", textDecorationThickness: 4 }}>{children}</span>
    </div>
  );
};

const SinHardware: React.FC = () => {
  const ok = useEntrada(30);
  const check = useTrazo(36, 46);
  return (
    <Escena fondo={C.dark}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
        <Tachito delay={0}>Reloj fichador</Tachito>
        <Tachito delay={14}>Huellero</Tachito>
        <div style={{ display: "flex", alignItems: "center", gap: 28, background: C.white, borderRadius: 36, padding: "34px 40px", ...pop(ok, 0.8) }}>
          <span style={{ width: 80, height: 80, flexShrink: 0, borderRadius: "50%", background: C.violet, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Check size={44} color={C.white} progreso={check} />
          </span>
          <span style={{ fontSize: 50, fontWeight: 600, color: C.ink }}>La tablet que ya tenés</span>
        </div>
      </div>
    </Escena>
  );
};

const ProbaloWeb: React.FC = () => (
  <Escena fondo={C.bg}>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 60, textAlign: "center" }}>
      <Subir delay={0}>
        <h1 style={{ ...display, fontSize: 160, lineHeight: 1, color: C.ink }}>
          Probalo
          <br />
          <span style={{ color: C.violet }}>14 días</span>
          <br />
          gratis.
        </h1>
      </Subir>
      <Pop delay={24}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, background: C.white, color: C.violet, fontSize: 60, fontWeight: 700, padding: "34px 60px", borderRadius: 30, boxShadow: "0 30px 60px -30px rgba(74, 38, 240, 0.55)" }}>
          <svg width={60} height={60} viewBox="0 0 24 24" fill="none" stroke={C.violet} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
            <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
          </svg>
          miteam.online
        </div>
      </Pop>
    </div>
  </Escena>
);

const ComentaApp: React.FC = () => {
  const frame = useCurrentFrame();
  const latido = 1 + Math.max(0, Math.sin((frame - 20) / 6)) * 0.04 * (frame > 20 ? 1 : 0);
  return (
    <Escena fondo={C.violet}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 50, textAlign: "center" }}>
        <Subir delay={0}>
          <span style={{ ...display, fontSize: 110, color: C.white }}>o comentá</span>
        </Subir>
        <Pop delay={6} giro={-3}>
          <div style={{ position: "relative", background: C.white, borderRadius: "70px 70px 70px 16px", padding: "50px 90px", transform: `scale(${latido})` }}>
            <span style={{ fontFamily: F.mono, fontSize: 210, fontWeight: 600, color: C.violet, letterSpacing: "0.02em" }}>APP</span>
          </div>
        </Pop>
        <Subir delay={30}>
          <span style={{ fontSize: 50, lineHeight: 1.3, color: C.violetMuted }}>y te mandamos toda la info.</span>
        </Subir>
      </div>
    </Escena>
  );
};

const LogoFinal: React.FC = () => {
  const frame = useCurrentFrame();
  const dibujo = useTrazo(0, 24);
  const ojos = useEntrada(20, 9);
  const parpadeo = interpolate(frame, [52, 56, 60], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: C.white, alignItems: "center", justifyContent: "center" }}>
      <Mascota width={640} color={C.violet} dibujo={dibujo} ojos={ojos} parpadeo={parpadeo} />
    </AbsoluteFill>
  );
};

const PreciosVoz: React.FC = () => <Precios pie="En pesos, y sin letra chica." />;

// Cada escena arranca cuando la voz dice su frase (segundos medidos en voz-presentacion.mp3).
const ESCENAS: { id: string; Comp: React.FC; desde: number }[] = [
  { id: "intro", Comp: Intro, desde: 0 }, // Somos MiTeam, el software de control horario…
  { id: "rubros", Comp: Rubros, desde: 5.0 }, // Restaurantes, comercios, locales con turnos…
  { id: "planilla", Comp: Planilla, desde: 8.5 }, // si tu equipo ficha en una planilla o en un cuaderno…
  { id: "kiosco", Comp: Kiosco, desde: 12.75 }, // Cada empleado ficha con su PIN…
  { id: "sin-hardware", Comp: SinHardware, desde: 17.25 }, // Sin relojes, sin huelleros.
  { id: "plan-vs-real", Comp: PlanVsReal, desde: 19.9 }, // Vos armás los turnos de la semana…
  { id: "sin-internet", Comp: SinInternet, desde: 27.1 }, // ¿Se cortó internet?
  { id: "cierre-mes", Comp: CierreMes, desde: 30.8 }, // Y a fin de mes, un clic…
  { id: "precios", Comp: PreciosVoz, desde: 37.1 }, // Gratis hasta tres empleados…
  { id: "probalo", Comp: ProbaloWeb, desde: 41.4 }, // Probalo catorce días gratis en miteam punto online…
  { id: "comenta-app", Comp: ComentaApp, desde: 44.75 }, // o comentá APP…
  { id: "logo", Comp: LogoFinal, desde: 48.1 }, // la M de la mascota
];

const FUNDIDO = 8;
export const DURACION_PRESENTACION = s(51);

// Entra cada escena con un fundido corto y una leve subida, encima de la anterior.
const Entrada: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, FUNDIDO], [0, 1], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: p, transform: `translateY(${(1 - p) * 40}px)` }}>{children}</AbsoluteFill>;
};

export const Presentacion: React.FC = () => (
  <AbsoluteFill style={{ background: C.white }}>
    <Audio src={staticFile("voz-presentacion.mp3")} />
    {ESCENAS.map(({ id, Comp, desde }, i) => {
      const inicio = s(desde);
      const fin = i < ESCENAS.length - 1 ? s(ESCENAS[i + 1].desde) + FUNDIDO : DURACION_PRESENTACION;
      return (
        <Sequence key={id} from={inicio} durationInFrames={fin - inicio} name={id}>
          <Entrada>
            <Comp />
          </Entrada>
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
