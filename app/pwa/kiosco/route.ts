import { respuestaManifiesto } from "@/lib/pwa";

export const dynamic = "force-static";

export function GET() {
  return respuestaManifiesto("kiosco");
}
