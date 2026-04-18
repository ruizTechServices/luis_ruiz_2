import { NextRequest, NextResponse } from "next/server";

const NUCLEUS_CORS_ORIGINS =
  process.env.NUCLEUS_CORS_ORIGINS || "https://luis-ruiz.com,https://www.luis-ruiz.com";

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

  return NextResponse.next({
    request: { headers: request.headers },
  });
}

export const config = {
  matcher: [
    // Match page routes (for auth refresh) and /api/nucleus/* (for CORS)
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
