import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Solo páginas públicas e indexables. Sumar acá cada página nueva (precios, guías, etc.).
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, changeFrequency: "monthly", priority: 1 }];
}
