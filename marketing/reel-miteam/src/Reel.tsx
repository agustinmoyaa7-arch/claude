import React from "react";
import { linearTiming, TransitionSeries, type TransitionPresentation } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { CierreMes, ChauPlanilla, Cta, Gancho, Kiosco, PlanVsReal, Precios, SinInternet } from "./escenas";

const TRANSICION = 12;

// Duración de cada escena en frames (30 por segundo).
const ESCENAS = [
  { id: "gancho", Comp: Gancho, frames: 75 },
  { id: "chau-planilla", Comp: ChauPlanilla, frames: 95 },
  { id: "kiosco", Comp: Kiosco, frames: 115 },
  { id: "plan-vs-real", Comp: PlanVsReal, frames: 115 },
  { id: "sin-internet", Comp: SinInternet, frames: 85 },
  { id: "cierre-mes", Comp: CierreMes, frames: 100 },
  { id: "precios", Comp: Precios, frames: 95 },
  { id: "cta", Comp: Cta, frames: 130 },
];

// Cada transición tiene props distintas; acá solo importa que sean transiciones.
const PRESENTACIONES = [
  slide({ direction: "from-bottom" }),
  wipe({ direction: "from-left" }),
  slide({ direction: "from-right" }),
  fade(),
  slide({ direction: "from-bottom" }),
  wipe({ direction: "from-right" }),
  slide({ direction: "from-bottom" }),
] as TransitionPresentation<Record<string, unknown>>[];

export const DURACION =
  ESCENAS.reduce((total, e) => total + e.frames, 0) - TRANSICION * (ESCENAS.length - 1);

export const Reel: React.FC = () => (
  <TransitionSeries>
    {ESCENAS.flatMap(({ id, Comp, frames }, i) => {
      const escena = (
        <TransitionSeries.Sequence key={id} durationInFrames={frames}>
          <Comp />
        </TransitionSeries.Sequence>
      );
      if (i === ESCENAS.length - 1) return [escena];
      return [
        escena,
        <TransitionSeries.Transition
          key={`${id}-t`}
          presentation={PRESENTACIONES[i]}
          timing={linearTiming({ durationInFrames: TRANSICION })}
        />,
      ];
    })}
  </TransitionSeries>
);
