import type { Metadata } from "next";

export const metadata: Metadata = { manifest: "/pwa/kiosco" };

export default function KioscoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
