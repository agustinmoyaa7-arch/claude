import "server-only";
import { createClient } from "@supabase/supabase-js";

// service_role: ignora RLS. Usar SOLO en el servidor y para tareas puntuales
// (fichar desde el kiosco, webhooks de Mercado Pago).
export function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
