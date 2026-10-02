import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GrillaHorarios } from "./form";

export default async function Horarios() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: empresas } = await supabase.from("empresas").select("id,nombre").order("creado_en").limit(1);
  const empresa = empresas?.[0];
  if (!empresa) redirect("/app");

  const [{ data: empleados }, { data: horarios }] = await Promise.all([
    supabase.from("empleados").select("id,nombre").eq("empresa_id", empresa.id).eq("activo", true).order("nombre"),
    supabase.from("horarios").select("empleado_id,dia_semana,entrada,salida").eq("empresa_id", empresa.id),
  ]);

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cuadro semanal</h1>
          <p className="text-sm text-zinc-500">{empresa.nombre} · el plan contra el que se compara lo que ficha cada empleado.</p>
        </div>
        <nav className="flex gap-4 text-sm underline"><Link href="/app">Panel</Link><Link href="/app/reporte">Reporte</Link></nav>
      </header>
      {empleados?.length
        ? <GrillaHorarios empresaId={empresa.id} empleados={empleados} horarios={horarios ?? []} />
        : <p className="text-zinc-500">Primero cargá empleados en el panel.</p>}
    </main>
  );
}
