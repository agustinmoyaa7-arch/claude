"use client";

import { useActionState } from "react";
import { DIAS } from "@/lib/fechas";
import { guardarHorarios } from "./actions";

type Emp = { id: string; nombre: string };
type Fila = { empleado_id: string; dia_semana: number; entrada: string; salida: string };

export function GrillaHorarios({ empresaId, empleados, horarios }: { empresaId: string; empleados: Emp[]; horarios: Fila[] }) {
  const [s, accion, pend] = useActionState(guardarHorarios, undefined);
  const valor = (emp: string, dia: number) => horarios.find((h) => h.empleado_id === emp && h.dia_semana === dia);
  const hhmm = (t?: string) => (t ? t.slice(0, 5) : "");

  return (
    <form action={accion} className="space-y-3">
      <input type="hidden" name="empresa_id" value={empresaId} />
      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full min-w-[56rem] text-sm">
          <thead>
            <tr className="border-b text-left text-zinc-500">
              <th className="p-2">Empleado</th>
              {DIAS.map((d) => <th key={d} className="p-2">{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {empleados.map((e) => (
              <tr key={e.id} className="border-b last:border-0 align-top">
                <td className="p-2 font-medium">{e.nombre}</td>
                {DIAS.map((_, i) => {
                  const dia = i + 1;
                  const v = valor(e.id, dia);
                  return (
                    <td key={dia} className="p-2">
                      <div className="flex flex-col gap-1">
                        <input type="time" name={`e_${e.id}_${dia}`} defaultValue={hhmm(v?.entrada)} className="rounded border px-1 py-0.5" aria-label={`${e.nombre} entrada ${DIAS[i]}`} />
                        <input type="time" name={`s_${e.id}_${dia}`} defaultValue={hhmm(v?.salida)} className="rounded border px-1 py-0.5" aria-label={`${e.nombre} salida ${DIAS[i]}`} />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-zinc-500">Dejá vacío el día de franco. Si la salida es menor que la entrada (ej. 20:00 → 02:00), el turno cruza la medianoche.</p>
      {s?.error && <p className="text-sm text-red-600">{s.error}</p>}
      {s?.ok && <p className="text-sm text-green-700">{s.ok}</p>}
      <button disabled={pend} className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50">Guardar cuadro</button>
    </form>
  );
}
