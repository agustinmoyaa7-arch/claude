import Link from "next/link";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  inLanguage: "es-AR",
};

const funciones = [
  {
    titulo: "Fichaje con PIN en una tablet",
    texto:
      "Sin relojes biométricos ni hardware. Cada empleado ficha con su código de 4 a 6 dígitos desde una tablet o una PC que ya tenés en el local.",
  },
  {
    titulo: "Cuadro semanal de turnos",
    texto:
      "Cargás la entrada y la salida de cada empleado por día. Soporta turnos que cruzan la medianoche y los francos.",
  },
  {
    titulo: "Plan contra real",
    texto:
      "El reporte compara el cuadro con los fichajes: quién llegó tarde, quién salió antes, horas extra, ausencias y fichajes sin salida.",
  },
  {
    titulo: "Exportá a Excel",
    texto: "Descargás el reporte en CSV y lo abrís directo en Excel para liquidar sueldos.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-12 p-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="flex flex-col gap-5">
        <h1 className="text-4xl font-bold">App de fichaje para restaurantes y comercios</h1>
        <p className="text-lg text-zinc-600">
          Dejá la planilla. Tus empleados fichan con un PIN y vos ves, desde cualquier lugar,
          las tardanzas, las ausencias y las horas extra contra el cuadro de turnos.
        </p>
        <div className="flex gap-3">
          <Link href="/login" className="rounded bg-zinc-900 px-4 py-2 text-white">
            Probar Miteam
          </Link>
          <Link href="/kiosco" className="rounded border border-zinc-300 px-4 py-2">
            Abrir kiosco
          </Link>
        </div>
      </header>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold">Control horario simple para tu equipo</h2>
        <ul className="grid gap-6 sm:grid-cols-2">
          {funciones.map((f) => (
            <li key={f.titulo} className="flex flex-col gap-2">
              <h3 className="font-semibold">{f.titulo}</h3>
              <p className="text-zinc-600">{f.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">Hecho para PyMEs argentinas</h2>
        <p className="text-zinc-600">
          Pensado para gastronomía, hotelería y comercio de 5 a 50 empleados. Precio en pesos,
          instalación en minutos y soporte directo de quien hizo la app.
        </p>
      </section>
    </main>
  );
}
