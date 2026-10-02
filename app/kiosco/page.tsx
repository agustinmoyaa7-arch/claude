"use client";

import { useRef, useState, useSyncExternalStore } from "react";

const CLAVE = "nw_kiosco_token";
const MENSAJES: Record<string, string> = {
  codigo_invalido: "Código incorrecto",
  dispositivo_invalido: "Este equipo ya no está activado",
  empresa_inactiva: "La cuenta está suspendida",
  muy_pronto: "Ya fichaste hace un momento",
  demasiados_intentos: "Demasiados intentos, esperá un minuto",
  servidor: "Error del servidor, probá de nuevo",
};

const suscribir = (cb: () => void) => {
  window.addEventListener("nw-token", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("nw-token", cb);
    window.removeEventListener("storage", cb);
  };
};
const leerToken = () => localStorage.getItem(CLAVE);

type Resultado = { ok: boolean; tipo?: string; empleado?: string; error?: string };

export default function Kiosco() {
  // localStorage como fuente externa: en el servidor devuelve undefined (sin parpadeo de hidratación).
  const token = useSyncExternalStore(suscribir, leerToken, () => undefined);
  const [borrador, setBorrador] = useState("");
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [enviando, setEnviando] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function activar() {
    const t = borrador.trim();
    if (!t) return;
    localStorage.setItem(CLAVE, t);
    window.dispatchEvent(new Event("nw-token"));
  }

  async function fichar() {
    if (!token || codigo.length < 4 || enviando) return;
    setEnviando(true);
    try {
      const r = await fetch("/api/fichar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, codigo }),
      });
      setResultado(await r.json());
    } catch {
      setResultado({ ok: false, error: "servidor" });
    }
    setEnviando(false);
    setCodigo("");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setResultado(null), 4000);
  }

  if (token === undefined) return null;

  if (token === null) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-6">
        <h1 className="text-2xl font-bold">Activar este equipo</h1>
        <p className="text-zinc-600">Pegá el código de activación que generaste en tu panel.</p>
        <input value={borrador} onChange={(e) => setBorrador(e.target.value)} className="rounded border px-3 py-2" placeholder="Código de activación" />
        <button onClick={activar} className="rounded bg-zinc-900 py-2 text-white">Activar</button>
      </main>
    );
  }

  const fondo = resultado ? (resultado.ok ? (resultado.tipo === "entrada" ? "bg-green-600" : "bg-red-600") : "bg-amber-600") : "bg-zinc-900";
  return (
    <main className={`flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-white transition-colors ${fondo}`}>
      {resultado ? (
        <div className="text-center">
          {resultado.ok ? (
            <>
              <p className="text-5xl font-bold">{resultado.tipo === "entrada" ? "ENTRADA" : "SALIDA"}</p>
              <p className="mt-2 text-3xl">{resultado.empleado}</p>
            </>
          ) : (
            <p className="text-4xl font-bold">{MENSAJES[resultado.error ?? ""] ?? "No se pudo fichar"}</p>
          )}
        </div>
      ) : (
        <>
          <p className="text-2xl">Ingresá tu código</p>
          <p className="h-12 font-mono text-5xl tracking-[0.5em]">{"•".repeat(codigo.length)}</p>
          <div className="grid grid-cols-3 gap-3">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
              <button key={n} onClick={() => codigo.length < 6 && setCodigo(codigo + n)} className="h-20 w-20 rounded-xl bg-white/10 text-3xl active:bg-white/30">{n}</button>
            ))}
            <button onClick={() => setCodigo(codigo.slice(0, -1))} className="h-20 w-20 rounded-xl bg-white/10 text-2xl">⌫</button>
            <button onClick={() => codigo.length < 6 && setCodigo(codigo + "0")} className="h-20 w-20 rounded-xl bg-white/10 text-3xl active:bg-white/30">0</button>
            <button onClick={fichar} disabled={codigo.length < 4 || enviando} className="h-20 w-20 rounded-xl bg-white text-2xl text-zinc-900 disabled:opacity-40">OK</button>
          </div>
        </>
      )}
    </main>
  );
}
