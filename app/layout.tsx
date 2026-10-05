import type { Metadata, Viewport } from "next";
import { COLOR_FONDO, NOMBRE_APP } from "@/lib/pwa";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fichaje · New Wave",
  description: "Fichaje digital simple para PyMEs.",
  manifest: "/pwa/panel",
  appleWebApp: { capable: true, title: NOMBRE_APP, statusBarStyle: "default" },
  icons: { apple: "/pwa/icono/192" },
};

export const viewport: Viewport = { themeColor: COLOR_FONDO };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">{children}</body>
    </html>
  );
}
