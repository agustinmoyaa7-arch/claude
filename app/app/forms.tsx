"use client";

import { useActionState } from "react";
import { agregarEmpleado, crearDispositivo, crearEmpresa } from "./actions";

const campo = "rounded border border-zinc-300 px-3 py-2";
const boton = "rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50";

function Mensaje({ error, ok }: { error?: string; ok?: string }) {
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (ok) return <p className="text-sm text-green-700">{ok}</p>;
  return null;
}

export function FormEmpresa() {
  const [s, accion, pend] = useActionState(crearEmpresa, undefined);
  return (
    <form action={accion} className="max-w-md space-y-3 rounded-lg bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Creá tu empresa</h2>
      <input name="nombre" required placeholder="Nombre del negocio" className={`${campo} w-full`} />
      <input name="slug" required placeholder="identificador (ej: bar-carlos)" className={`${campo} w-full`} />
      <Mensaje {...s} />
      <button disabled={pend} className={boton}>Crear</button>
    </form>
  );
}

export function FormEmpleado({ empresaId }: { empresaId: string }) {
  const [s, accion, pend] = useActionState(agregarEmpleado, undefined);
  return (
    <form action={accion} className="flex flex-wrap items-start gap-2">
      <input type="hidden" name="empresa_id" value={empresaId} />
      <input name="nombre" required placeholder="Nombre" className={campo} />
      <input name="codigo" placeholder="Código (opcional)" inputMode="numeric" className={campo} />
      <button disabled={pend} className={boton}>Agregar</button>
      <div className="w-full"><Mensaje {...s} /></div>
    </form>
  );
}

export function FormDispositivo({ empresaId }: { empresaId: string }) {
  const [s, accion, pend] = useActionState(crearDispositivo, undefined);
  return (
    <form action={accion} className="space-y-2">
      <input type="hidden" name="empresa_id" value={empresaId} />
      <div className="flex gap-2">
        <input name="nombre" placeholder="Nombre (ej: PC recepción)" className={campo} />
        <button disabled={pend} className={boton}>Crear código de activación</button>
      </div>
      <Mensaje error={s?.error} ok={s?.ok} />
      {s?.token && <code className="block break-all rounded bg-zinc-900 p-3 text-sm text-amber-300">{s.token}</code>}
    </form>
  );
}
