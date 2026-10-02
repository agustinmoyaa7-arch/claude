import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 p-6">
      <h1 className="text-4xl font-bold">Fichaje simple para tu negocio</h1>
      <p className="text-zinc-600">
        Cada empleado ficha con su código. Vos ves las horas desde cualquier lugar.
      </p>
      <div className="flex gap-3">
        <Link href="/login" className="rounded bg-zinc-900 px-4 py-2 text-white">Ingresar</Link>
        <Link href="/kiosco" className="rounded border border-zinc-300 px-4 py-2">Abrir kiosco</Link>
      </div>
    </main>
  );
}
