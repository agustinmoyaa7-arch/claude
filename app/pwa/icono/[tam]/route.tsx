import { ImageResponse } from "next/og";
import { COLOR_FONDO, NOMBRE_APP, TAMANOS_ICONO } from "@/lib/pwa";

// Ícono provisorio (inicial sobre fondo liso) hasta tener el logo.
export function generateStaticParams() {
  return TAMANOS_ICONO.map((t) => ({ tam: String(t) }));
}
export const dynamicParams = false;

export async function GET(_req: Request, { params }: { params: Promise<{ tam: string }> }) {
  const tam = Number((await params).tam);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: COLOR_FONDO, color: "#fff", fontSize: tam * 0.55, fontWeight: 700 }}>
        {NOMBRE_APP[0]}
      </div>
    ),
    { width: tam, height: tam },
  );
}
