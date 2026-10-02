import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { esFecha, fechaCorta, horasMin, hoyAR, lunesDe, sumarDias } from "@/lib/fechas";
import { hora } from "@/lib/format";
import { cargarReporte, ETIQUETA } from "@/lib/reporte";

export default async function Reporte({ searchParams }: { searchParams: Promise<{ desde?: string; hasta?: string }> }) {
  const sp = await searchParams;
  const lunes = lunesDe(hoyAR());
  const desde = esFecha(sp.desde) ? sp.desde : lunes;
  const hasta = esFecha(sp.hasta) ? sp.hasta : sumarDias(desde, 6);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: empresas } = await supabase.from("empresas").select("id,nombre").order("creado_en").limit(1);
  const empresa = empresas?.[0];
  if (!empresa) redirect("/app");

  const { filas, error } = await cargarReporte(supabase, empresa.id, desde, hasta);
  const resumen = new Map<string, { nombre: string; plan: number; real: number; tarde: number; ausente: number }>();
  for (const f of filas) {
    const r = resumen.get(f.empleado_id) ?? { nombre: f.empleado, plan: 0, real: 0, tarde: 0, ausente: 0 };
    r.plan += f.minutos_plan ?? 0;
    r.real += f.minutos_real ?? 0;
    if (f.estado === "tarde") r.tarde += 1;
    if (f.estado === "ausente") r.ausente += 1;
    resumen.set(f.empleado_id, r);
  }

  const ant = sumarDias(desde, -7);
  const sig = sumarDias(desde, 7);
  const href = (d: string) => `/app/reporte?desde=${d}&hasta=${sumarDias(d, 6)}`;

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plan vs. real</h1>
          <p className="text-sm text-zinc-500">{empresa.nombre} · {fechaCorta(desde)} al {fechaCorta(hasta)}</p>
        </div>
        <nav className="flex gap-4 text-sm underline"><Link href="/app">Panel</Link><Link href="/app/horarios">Cuadro</Link></nav>
      </header>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href={href(ant)} className="rounded border px-3 py-1">← Semana anterior</Link>
        <Link href={href(lunes)} className="rounded border px-3 py-1">Esta semana</Link>
        <Link href={href(sig)} className="rounded border px-3 py-1">Semana siguiente →</Link>
        <a href={`/app/reporte/csv?desde=${desde}&hasta=${hasta}`} className="ml-auto rounded bg-zinc-900 px-3 py-1 text-white">Descargar CSV</a>
      </div>

      {error && <p className="text-red-600">No se pudo cargar el reporte.</p>}

      <section className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-zinc-500"><th className="p-2">Empleado</th><th className="p-2">Plan</th><th className="p-2">Real</th><th className="p-2">Tardanzas</th><th className="p-2">Ausencias</th></tr></thead>
          <tbody>
            {[...resumen.values()].map((r) => (
              <tr key={r.nombre} className="border-b last:border-0">
                <td className="p-2 font-medium">{r.nombre}</td><td className="p-2">{horasMin(r.plan)}</td><td className="p-2">{horasMin(r.real)}</td><td className="p-2">{r.tarde}</td><td className="p-2">{r.ausente}</td>
              </tr>
            ))}
            {!resumen.size && <tr><td colSpan={5} className="p-3 text-zinc-500">Sin datos en este período. ¿Cargaste el cuadro semanal?</td></tr>}
          </tbody>
        </table>
      </section>

      <section className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full min-w-[40rem] text-sm">
          <thead><tr className="border-b text-left text-zinc-500"><th className="p-2">Día</th><th className="p-2">Empleado</th><th className="p-2">Plan</th><th className="p-2">Real</th><th className="p-2">Diferencia</th><th className="p-2">Estado</th></tr></thead>
          <tbody>
            {filas.map((f) => (
              <tr key={`${f.empleado_id}-${f.fecha}`} className="border-b last:border-0">
                <td className="p-2">{fechaCorta(f.fecha)}</td>
                <td className="p-2">{f.empleado}</td>
                <td className="p-2">{f.plan_entrada ? `${hora(f.plan_entrada)} – ${hora(f.plan_salida!)}` : "Franco"}</td>
                <td className="p-2">{f.real_entrada ? `${hora(f.real_entrada)} – ${f.real_salida ? hora(f.real_salida) : "…"}` : "–"}</td>
                <td className="p-2">{f.diferencia_min === null ? "–" : `${f.diferencia_min >= 0 ? "+" : "−"}${horasMin(f.diferencia_min)}`}</td>
                <td className="p-2">{ETIQUETA[f.estado] ?? f.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
