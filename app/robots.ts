import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// /app y /api no tienen contenido público (el panel pide sesión).
// /login y /kiosco quedan rastreables pero con noindex en su layout: si se
// bloquean acá, Google no llega a leer el noindex.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/app/", "/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
