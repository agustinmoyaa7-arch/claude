import React from "react";
import { Composition } from "remotion";
import { DURACION_PRESENTACION, Presentacion } from "./Presentacion";
import { DURACION, Reel } from "./Reel";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Lanzamiento" component={Reel} durationInFrames={DURACION} fps={30} width={1080} height={1920} />
    <Composition id="Presentacion" component={Presentacion} durationInFrames={DURACION_PRESENTACION} fps={30} width={1080} height={1920} />
  </>
);
