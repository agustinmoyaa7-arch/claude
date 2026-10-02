"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function guardarHorarios(_p: { error?: string; ok?: string } | undefined, fd: FormData) {
  const supabase = await createClient();
  const empresa_id = String(fd.get("empresa_id"));
  const upserts: Record<string, unknown>[] = [];
  const borrar: { empleado_id: string; dia: number }[] = [];

  for (const [clave, valor] of fd.entries()) {
    const m = /^e_([0-9a-f-]{36})_([1-7])$/.exec(clave);
    if (!m) continue;
    const [, empleado_id, dia] = m;
    const entrada = String(valor).trim();
    const salida = String(fd.get(`s_${empleado_id}_${dia}`) ?? "").trim();
    if (!entrada && !salida) { borrar.push({ empleado_id, dia: Number(dia) }); continue; }
    if (!HORA.test(entrada) || !HORA.test(salida)) return { error: "Hay un horario incompleto o inválido (usá HH:MM)." };
    if (entrada === salida) return { error: "La entrada y la salida no pueden ser iguales." };
    upserts.push({ empresa_id, empleado_id, dia_semana: Number(dia), entrada, salida });
  }

  if (upserts.length) {
    const { error } = await supabase.from("horarios").upsert(upserts, { onConflict: "empleado_id,dia_semana" });
    if (error) return { error: "No se pudo guardar el cuadro." };
  }
  for (const b of borrar) {
    const { error } = await supabase.from("horarios").delete().eq("empresa_id", empresa_id).eq("empleado_id", b.empleado_id).eq("dia_semana", b.dia);
    if (error) return { error: "No se pudo guardar el cuadro." };
  }
  revalidatePath("/app/horarios");
  return { ok: "Cuadro guardado." };
}
