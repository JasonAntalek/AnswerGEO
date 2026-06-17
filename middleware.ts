import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const isApiBusiness = request.nextUrl.pathname.startsWith("/api/businesses");

  if (!isDashboard && !isApiBusiness) {
    return response;
  }

  const hasSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  if (!hasSupabase) {
    if (isApiBusiness) {
      return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
    }
    return NextResponse.redirect(new URL("/login?error=supabase", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/businesses/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
