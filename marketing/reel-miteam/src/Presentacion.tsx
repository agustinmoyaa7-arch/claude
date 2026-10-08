import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { pop, useEntrada, useTrazo } from "./anim";
import { C, Check, display, F, Mascota } from "./brand";
import { CierreMes, Escena, Kiosco, Mano, PlanVsReal, Pop, Precios, SinInternet, Subir } from "./escenas";
import { Destello, FlechaCurva, Garabato, OndaClic, Rayitas, Subrayado } from "./garabatos";

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

// Garabatos de la marca encima de cada escena (posiciones en px del cuadro de 1080×1920).
const CAPAS: Record<string, React.FC> = {
  intro: () => (
    <>
      <Rayitas x={300} y={470} angulo={215} delay={24} color={C.violet} />
      <Rayitas x={780} y={470} angulo={325} delay={24} color={C.violet} />
      <Destello x={905} y={905} delay={30} color={C.violet} tam={64} />
      <Subrayado x={200} y={1224} ancho={680} delay={56} color={C.violet} />
    </>
  ),
  rubros: () => (
    <>
      <Destello x={975} y={545} delay={64} color={C.violetLight} />
      <Garabato x={90} y={1225} ancho={280} delay={70} color={C.violetLight} />
    </>
  ),
  planilla: () => <Rayitas x={1000} y={1225} angulo={315} delay={92} color={C.violet} largo={50} grosor={9} />,
  kiosco: () => (
    <>
      <Destello x={790} y={300} delay={8} color={C.violet} tam={60} />
      <Rayitas x={180} y={770} angulo={205} delay={52} color={C.violet} />
      <Rayitas x={900} y={770} angulo={335} delay={52} color={C.violet} />
    </>
  ),
  "sin-hardware": () => (
    <>
      <Rayitas x={1000} y={975} angulo={320} delay={40} color={C.violetLight} largo={55} />
      <Destello x={95} y={960} delay={44} color={C.violetLight} tam={54} />
    </>
  ),
  "plan-vs-real": () => (
    <>
      <Subrayado x={90} y={606} ancho={620} delay={12} color={C.violetLight} />
      <Destello x={960} y={300} delay={18} color={C.violetLight} />
    </>
  ),
  "sin-internet": () => (
    <>
      <Garabato x={560} y={470} ancho={300} delay={10} color={C.white} />
      <Rayitas x={985} y={1035} angulo={320} delay={42} color={C.white} largo={55} />
    </>
  ),
  "cierre-mes": () => (
    <>
      <OndaClic x={703} y={1056} delay={40} color={C.violetLight} />
      <Rayitas x={703} y={1056} angulo={250} delay={40} color={C.violet} largo={45} grosor={8} fugaz />
      <Destello x={262} y={1215} delay={52} color={C.violet} tam={60} />
    </>
  ),
  precios: () => (
    <>
      <Subrayado x={90} y={518} ancho={720} delay={10} color={C.violetLight} />
      <Destello x={985} y={890} delay={26} color={C.white} tam={58} />
    </>
  ),
  probalo: () => (
    <>
      <Destello x={880} y={560} delay={10} color={C.violet} />
      <Destello x={150} y={700} delay={16} color={C.violet} tam={44} />
      <FlechaCurva x={40} y={1150} ancho={190} giro={-10} delay={30} color={C.violet} />
      <Rayitas x={875} y={1060} angulo={320} delay={28} color={C.violet} />
    </>
  ),
  "comenta-app": () => (
    <>
      <Rayitas x={245} y={715} angulo={215} delay={12} color={C.white} />
      <Rayitas x={835} y={715} angulo={325} delay={12} color={C.white} />
      <Destello x={870} y={1090} delay={18} color={C.white} />
      <Destello x={190} y={1080} delay={22} color={C.white} tam={44} />
    </>
  ),
  logo: () => (
    <>
      <Rayitas x={205} y={700} angulo={210} delay={26} color={C.violet} largo={80} />
      <Rayitas x={875} y={700} angulo={330} delay={26} color={C.violet} largo={80} />
      <Destello x={905} y={600} delay={34} color={C.violet} tam={60} />
    </>
  ),
};

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

// Efectos de sonido: [segundo, archivo en public/sfx, volumen]. Cada uno cae en lo que pasa en pantalla.
const SFX: [number, string, number][] = [
  // Intro: la M se dibuja, se abren los ojos, sube el nombre
  [0.0, "marcador", 0.25], [0.55, "whoosh-corto", 0.22], [0.67, "pop", 0.35], [0.8, "destello", 0.18], [1.87, "marcador", 0.18],
  // Rubros
  [4.8, "whoosh-corto", 0.3], [5.07, "pop", 0.28], [6.0, "pop", 0.28], [6.93, "pop", 0.28],
  // Planilla y cuaderno tachados
  [8.35, "whoosh-corto", 0.3], [8.7, "pop-grave", 0.22], [8.9, "pop-grave", 0.22], [9.63, "marcador", 0.3], [10.03, "marcador", 0.3], [11.23, "pop", 0.28], [11.55, "destello", 0.16],
  // Kiosco: PIN, OK y saludo
  [12.55, "whoosh", 0.32], [13.35, "tap", 0.3], [13.58, "tap", 0.3], [13.82, "tap", 0.3], [14.05, "tap", 0.3], [14.28, "tap", 0.36], [14.42, "campana", 0.3],
  // Sin relojes, sin huelleros
  [17.1, "whoosh-corto", 0.28], [17.25, "golpe", 0.35], [17.72, "golpe", 0.35], [18.25, "pop", 0.3], [18.6, "destello", 0.14],
  // Plan vs. real
  [19.72, "whoosh", 0.32], [20.3, "marcador", 0.18], [20.77, "tap", 0.2], [21.07, "tap", 0.2], [21.37, "tap", 0.2], [21.67, "tap", 0.2],
  // Sin internet
  [26.95, "whoosh-corto", 0.3], [27.1, "golpe", 0.3], [28.05, "whoosh-corto", 0.2], [28.43, "campana", 0.26],
  // Cierre de mes: checks, clic y Excel
  [30.62, "whoosh", 0.32], [31.27, "tap", 0.2], [31.47, "tap", 0.2], [31.67, "tap", 0.2], [32.07, "clic", 0.45], [32.4, "pop-grave", 0.3], [32.55, "destello", 0.18],
  // Precios
  [36.95, "whoosh-corto", 0.3], [37.43, "marcador", 0.2], [37.57, "whoosh-corto", 0.1], [37.83, "whoosh-corto", 0.1], [38.1, "whoosh-corto", 0.1], [38.0, "destello", 0.15],
  // Probalo en la web
  [41.22, "whoosh", 0.32], [41.75, "destello", 0.15], [42.2, "pop", 0.36], [42.4, "marcador", 0.2],
  // Comentá APP
  [44.6, "whoosh-corto", 0.3], [44.95, "pop-grave", 0.4], [45.1, "destello", 0.2],
  // Logo final: la M se dibuja, ojos, campana y parpadeo
  [47.75, "whoosh-largo", 0.32], [48.1, "marcador", 0.25], [48.77, "pop", 0.35], [48.95, "campana-final", 0.3], [49.83, "tap", 0.12],
];

const FUNDIDO = 8;
export const DURACION_PRESENTACION = s(51);

// Entra cada escena con un fundido corto, una leve subida y un poco de zoom, encima de la anterior.
const Entrada: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, FUNDIDO], [0, 1], { extrapolateRight: "clamp" });
  const suave = 1 - (1 - p) ** 3;
  return (
    <AbsoluteFill style={{ opacity: p, transform: `translateY(${(1 - suave) * 60}px) scale(${0.97 + 0.03 * suave})` }}>
      {children}
    </AbsoluteFill>
  );
};

export const Presentacion: React.FC = () => (
  <AbsoluteFill style={{ background: C.white }}>
    <Audio src={staticFile("voz-presentacion.mp3")} />
    {SFX.map(([seg, archivo, volumen], i) => (
      <Sequence key={`sfx-${i}`} from={s(seg)} durationInFrames={s(2.5)} name={`sfx ${archivo}`}>
        <Audio src={staticFile(`sfx/${archivo}.wav`)} volume={volumen} />
      </Sequence>
    ))}
    {ESCENAS.map(({ id, Comp, desde }, i) => {
      const inicio = s(desde);
      const fin = i < ESCENAS.length - 1 ? s(ESCENAS[i + 1].desde) + FUNDIDO : DURACION_PRESENTACION;
      return (
        <Sequence key={id} from={inicio} durationInFrames={fin - inicio} name={id}>
          <Entrada>
            <Comp />
            {CAPAS[id] && <AbsoluteFill style={{ pointerEvents: "none" }}>{React.createElement(CAPAS[id])}</AbsoluteFill>}
          </Entrada>
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
