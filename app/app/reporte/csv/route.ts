import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { esFecha } from "@/lib/fechas";
import { cargarReporte, ETIQUETA } from "@/lib/reporte";

// Excel en español abre bien un CSV con ';' y BOM UTF-8.
const celda = (v: string | number | null) => {
  const s = v === null ? "" : String(v);
  // Evita que Excel interprete texto como fórmula (=, +, -, @)
  const seguro = /^[=+\-@]/.test(s) && typeof v === "string" ? `'${s}` : s;
  return /[;"\n]/.test(seguro) ? `"${seguro.replaceAll('"', '""')}"` : seguro;
};
const hhmm = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires", timeStyle: "short", hour12: false }).format(new Date(iso)) : "";

export async function GET(req: NextRequest) {
  const desde = req.nextUrl.searchParams.get("desde");
  const hasta = req.nextUrl.searchParams.get("hasta");
  if (!esFecha(desde) || !esFecha(hasta)) return new NextResponse("Fechas inválidas", { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("No autorizado", { status: 401 });
  const { data: empresas } = await supabase.from("empresas").select("id").order("creado_en").limit(1);
  if (!empresas?.[0]) return new NextResponse("Sin empresa", { status: 404 });

  const { filas, error } = await cargarReporte(supabase, empresas[0].id, desde, hasta);
  if (error) return new NextResponse("Error", { status: 500 });

  const enc = ["Fecha", "Empleado", "Plan entrada", "Plan salida", "Real entrada", "Real salida", "Min plan", "Min real", "Diferencia (min)", "Estado"];
  const lineas = filas.map((f) => [f.fecha, f.empleado, hhmm(f.plan_entrada), hhmm(f.plan_salida), hhmm(f.real_entrada), hhmm(f.real_salida), f.minutos_plan, f.minutos_real, f.diferencia_min, ETIQUETA[f.estado] ?? f.estado].map(celda).join(";"));
  const cuerpo = "﻿" + [enc.join(";"), ...lineas].join("\r\n");
  return new NextResponse(cuerpo, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="plan-vs-real_${desde}_${hasta}.csv"` },
  });
}
