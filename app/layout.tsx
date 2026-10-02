import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fichaje · New Wave",
  description: "Fichaje digital simple para PyMEs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">{children}</body>
    </html>
  );
}
