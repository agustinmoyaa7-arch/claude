import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  if (!user && request.nextUrl.pathname.startsWith("/app")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return response;
}

// El kiosco y su API no pasan por acá: no usan sesión de usuario.
export const config = { matcher: ["/app/:path*", "/login"] };
