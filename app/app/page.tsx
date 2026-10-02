import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fechaHora } from "@/lib/format";
import { cerrarSesion } from "./actions";
import { FormDispositivo, FormEmpleado, FormEmpresa } from "./forms";

export default async function Panel() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS ya filtra: solo llegan las empresas de las que sos miembro.
  const { data: empresas } = await supabase.from("empresas").select("id,nombre,plan_id,estado,prueba_hasta").order("creado_en");
  const empresa = empresas?.[0];
  if (!empresa) {
    return <main className="p-6"><FormEmpresa /></main>;
  }

  const [{ data: empleados }, { data: fichajes }, { data: dispositivos }] = await Promise.all([
    supabase.from("empleados").select("id,nombre,codigo,activo").eq("empresa_id", empresa.id).order("nombre"),
    supabase.from("fichajes").select("id,tipo,momento,empleados(nombre)").eq("empresa_id", empresa.id).eq("anulado", false).order("momento", { ascending: false }).limit(20),
    supabase.from("dispositivos").select("id,nombre,ultimo_uso,activo").eq("empresa_id", empresa.id),
  ]);

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{empresa.nombre}</h1>
          <p className="text-sm text-zinc-500">
            Plan {empresa.plan_id} · {empresa.estado}
            {empresa.estado === "prueba" && empresa.prueba_hasta && ` hasta ${fechaHora(empresa.prueba_hasta)}`}
          </p>
        </div>
        <nav className="flex items-center gap-4 text-sm underline">
          <Link href="/app/horarios">Cuadro semanal</Link>
          <Link href="/app/reporte">Reporte</Link>
          <form action={cerrarSesion}><button className="underline">Salir</button></form>
        </nav>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Empleados</h2>
        <FormEmpleado empresaId={empresa.id} />
        <ul className="divide-y rounded-lg bg-white shadow-sm">
          {empleados?.map((e) => (
            <li key={e.id} className="flex justify-between p-3">
              <span>{e.nombre}</span><span className="font-mono text-zinc-500">{e.codigo}</span>
            </li>
          ))}
          {!empleados?.length && <li className="p-3 text-zinc-500">Todavía no cargaste empleados.</li>}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Kiosco (PC o tablet del local)</h2>
        <FormDispositivo empresaId={empresa.id} />
        <ul className="text-sm text-zinc-600">
          {dispositivos?.map((d) => (
            <li key={d.id}>{d.nombre} · {d.ultimo_uso ? `último uso ${fechaHora(d.ultimo_uso)}` : "sin usar"}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Últimos fichajes</h2>
        <ul className="divide-y rounded-lg bg-white shadow-sm">
          {fichajes?.map((f) => (
            <li key={f.id} className="flex justify-between p-3">
              <span>{(f.empleados as unknown as { nombre: string } | null)?.nombre}</span>
              <span>{f.tipo === "entrada" ? "🟢 Entrada" : "🔴 Salida"} · {fechaHora(f.momento)}</span>
            </li>
          ))}
          {!fichajes?.length && <li className="p-3 text-zinc-500">Sin fichajes todavía.</li>}
        </ul>
      </section>
    </main>
  );
}
