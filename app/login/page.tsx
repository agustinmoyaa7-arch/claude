"use client";

import { useActionState } from "react";
import { ingresar, registrarse } from "./actions";

export default function Login() {
  const [estadoIngreso, accionIngreso, pendienteIngreso] = useActionState(ingresar, undefined);
  const [estadoAlta, accionAlta, pendienteAlta] = useActionState(registrarse, undefined);

  const campo = "w-full rounded border border-zinc-300 px-3 py-2";
  return (
    <main className="mx-auto grid min-h-screen max-w-3xl gap-8 p-6 md:grid-cols-2 md:items-center">
      <form action={accionIngreso} className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Ingresar</h2>
        <input name="email" type="email" required placeholder="Mail" className={campo} />
        <input name="password" type="password" required placeholder="Contraseña" className={campo} />
        {estadoIngreso?.error && <p className="text-sm text-red-600">{estadoIngreso.error}</p>}
        <button disabled={pendienteIngreso} className="w-full rounded bg-zinc-900 py-2 text-white disabled:opacity-50">
          Entrar
        </button>
      </form>
      <form action={accionAlta} className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Crear cuenta</h2>
        <p className="text-sm text-zinc-500">14 días de prueba, sin tarjeta.</p>
        <input name="email" type="email" required placeholder="Mail" className={campo} />
        <input name="password" type="password" required minLength={8} placeholder="Contraseña (8+)" className={campo} />
        {estadoAlta?.error && <p className="text-sm text-amber-700">{estadoAlta.error}</p>}
        <button disabled={pendienteAlta} className="w-full rounded border border-zinc-900 py-2 disabled:opacity-50">
          Registrarme
        </button>
      </form>
    </main>
  );
}
