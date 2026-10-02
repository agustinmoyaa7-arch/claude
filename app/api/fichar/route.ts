import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

// Freno básico contra adivinar códigos: 10 intentos por minuto por dispositivo.
// En memoria alcanza para arrancar; con muchas instancias conviene moverlo a la base.
const intentos = new Map<string, { n: number; desde: number }>();
const MAX = 10;
const VENTANA_MS = 60_000;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const codigo = typeof body?.codigo === "string" ? body.codigo : "";
  if (!token || !/^\d{4,6}$/.test(codigo)) {
    return NextResponse.json({ ok: false, error: "datos_invalidos" }, { status: 400 });
  }

  const ahora = Date.now();
  const clave = token.slice(0, 16);
  const previo = intentos.get(clave);
  const reg = previo && ahora - previo.desde < VENTANA_MS ? previo : { n: 0, desde: ahora };
  reg.n += 1;
  intentos.set(clave, reg);
  if (reg.n > MAX) {
    return NextResponse.json({ ok: false, error: "demasiados_intentos" }, { status: 429 });
  }

  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
  const { data, error } = await adminClient().rpc("fichar", {
    p_token: token,
    p_codigo: codigo,
    p_lat: num(body.lat),
    p_lng: num(body.lng),
  });
  if (error) return NextResponse.json({ ok: false, error: "servidor" }, { status: 500 });
  return NextResponse.json(data);
}
