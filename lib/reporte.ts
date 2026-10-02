import type { SupabaseClient } from "@supabase/supabase-js";

export type FilaReporte = {
  fecha: string; empleado_id: string; empleado: string;
  plan_entrada: string | null; plan_salida: string | null;
  real_entrada: string | null; real_salida: string | null;
  minutos_plan: number | null; minutos_real: number | null; diferencia_min: number | null;
  estado: string;
};

export const ETIQUETA: Record<string, string> = {
  ok: "✅ En horario", tarde: "🟡 Tarde", salida_anticipada: "🟡 Salió antes", extra: "🔵 Horas extra",
  ausente: "🔴 Ausente", pendiente: "⚪ Pendiente", sin_salida: "🟠 Sin salida", en_curso: "🟢 En curso",
  franco_trabajado: "🟣 Franco trabajado",
};

export async function cargarReporte(supabase: SupabaseClient, empresaId: string, desde: string, hasta: string) {
  const { data, error } = await supabase.rpc("reporte_plan_vs_real", { p_empresa: empresaId, p_desde: desde, p_hasta: hasta });
  return { filas: (data ?? []) as FilaReporte[], error };
}
