import React from "react";
import { Composition, Still } from "remotion";
import { DURACION_JUAN, ReelJuan } from "./Juan";
import { DURACION_PRESENTACION, Presentacion } from "./Presentacion";
import { DURACION, Reel } from "./Reel";
import { DURACION_TEMPORADA, PortadaTemporada, ReelTemporada } from "./Temporada";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Lanzamiento" component={Reel} durationInFrames={DURACION} fps={30} width={1080} height={1920} />
    <Composition id="Presentacion" component={Presentacion} durationInFrames={DURACION_PRESENTACION} fps={30} width={1080} height={1920} />
    <Composition id="Juan" component={ReelJuan} durationInFrames={DURACION_JUAN} fps={30} width={1080} height={1920} />
    <Composition id="Temporada" component={ReelTemporada} durationInFrames={DURACION_TEMPORADA} fps={30} width={1080} height={1920} />
    <Still id="PortadaTemporada" component={PortadaTemporada} width={1080} height={1920} />
  </>
);
