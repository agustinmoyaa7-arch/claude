"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function ingresar(_prev: { error?: string } | undefined, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });
  if (error) return { error: "Mail o contraseña incorrectos." };
  redirect("/app");
}

export async function registrarse(_prev: { error?: string } | undefined, formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });
  if (error) return { error: error.message };
  // Si el proyecto exige confirmar el mail, no hay sesión todavía.
  if (!data.session) return { error: "Te mandamos un mail para confirmar la cuenta." };
  redirect("/app");
}
