import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const NUCLEUS_CORS_ORIGINS = process.env.NUCLEUS_CORS_ORIGINS || "*";

function corsHeaders(origin: string | null) {
  const allowedOrigin =
    NUCLEUS_CORS_ORIGINS === "*"
      ? "*"
      : NUCLEUS_CORS_ORIGINS.split(",")
          .map((o) => o.trim())
          .includes(origin ?? "")
        ? origin!
        : "";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CORS preflight for Nucleus API routes
  if (pathname.startsWith("/api/nucleus")) {
    const origin = request.headers.get("origin");
    const headers = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers });
    }

    // For non-preflight requests, attach CORS headers and continue
    let response = NextResponse.next({ request });
    for (const [key, value] of Object.entries(headers)) {
      if (value) response.headers.set(key, value);
    }
    return response;
  }

  // Auth cookie refresh for page routes (not API routes)
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  if (!supabaseUrl || !supabaseKey) return response;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[]
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  try {
    await supabase.auth.getUser();
  } catch (e) {
    console.error("[middleware] auth refresh failed:", e);
  }

  return response;
}

export const config = {
  matcher: [
    // Match page routes (for auth refresh) and /api/nucleus/* (for CORS)
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
