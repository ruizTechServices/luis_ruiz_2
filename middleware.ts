import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  return NextResponse.next({
    request: { headers: request.headers },
  });
}

export const config = {
  matcher: [
    // Match page routes for auth refresh.
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
