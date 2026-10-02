"use server";

import { createHash, randomBytes, randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Estado = { error?: string; ok?: string };

export async function crearEmpresa(_p: Estado | undefined, fd: FormData): Promise<Estado> {
  const supabase = await createClient();
  const nombre = String(fd.get("nombre") ?? "").trim();
  const slug = String(fd.get("slug") ?? "").trim().toLowerCase();
  if (!nombre) return { error: "Poné el nombre del negocio." };
  const { error } = await supabase.rpc("crear_empresa", { p_nombre: nombre, p_slug: slug });
  if (error) {
    return { error: error.code === "23505" ? "Ese identificador ya está en uso." : "Identificador inválido (minúsculas, números y guiones, 3 a 40)." };
  }
  revalidatePath("/app");
  return { ok: "Empresa creada." };
}

export async function agregarEmpleado(_p: Estado | undefined, fd: FormData): Promise<Estado> {
  const supabase = await createClient();
  const empresa_id = String(fd.get("empresa_id"));
  const nombre = String(fd.get("nombre") ?? "").trim();
  const codigo = String(fd.get("codigo") ?? "").trim();
  if (!nombre) return { error: "Falta el nombre." };
  if (codigo && !/^\d{4,6}$/.test(codigo)) return { error: "El código tiene 4 a 6 números." };

  // Sin código → se genera uno de 4 dígitos que no esté repetido en la empresa.
  for (let i = 0; i < 8; i++) {
    const c = codigo || String(randomInt(0, 10000)).padStart(4, "0");
    const { error } = await supabase.from("empleados").insert({ empresa_id, nombre, codigo: c });
    if (!error) { revalidatePath("/app"); return { ok: `${nombre} cargado. Código: ${c}` }; }
    if (error.message.includes("limite_plan")) return { error: "Llegaste al límite de empleados de tu plan." };
    if (error.code !== "23505" || codigo) return { error: error.code === "23505" ? "Ese código ya lo usa otro empleado." : "No se pudo guardar." };
  }
  return { error: "No se pudo generar un código libre." };
}

export async function crearDispositivo(_p: (Estado & { token?: string }) | undefined, fd: FormData) {
  const supabase = await createClient();
  const empresa_id = String(fd.get("empresa_id"));
  const nombre = String(fd.get("nombre") ?? "").trim() || "PC del local";
  const token = randomBytes(24).toString("base64url");
  // Se guarda solo el hash (sha256 hex): el token se muestra una vez.
  const token_hash = createHash("sha256").update(token).digest("hex");
  const { error } = await supabase.from("dispositivos").insert({ empresa_id, nombre, token_hash });
  if (error) return { error: "No se pudo crear el dispositivo." };
  revalidatePath("/app");
  return { ok: "Dispositivo creado. Copiá el código de activación: no se vuelve a mostrar.", token };
}

export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
