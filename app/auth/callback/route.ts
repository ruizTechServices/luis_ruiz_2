//C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\auth\callback\route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { isOwner } from "@/lib/auth/ownership";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/";

  if (!code) {
    return NextResponse.redirect(new URL(`/login?error=missing_code`, request.url));
  }

  // Prepare a mutable response so Supabase can attach Set-Cookie headers to it
  const response = NextResponse.redirect(new URL(`/`, request.url));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(new URL(`/login?error=server_misconfigured`, request.url));
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url));
  }

  // Decide destination based on user ownership if next wasn't explicitly provided
  let resolvedNext = next;
  if (!url.searchParams.has("next") || next === "/") {
    const { data: userRes } = await supabase.auth.getUser();
    const email = userRes?.user?.email;
    if (email) {
      resolvedNext = isOwner(email) ? "/gio_dash" : "/dashboard";
    }
  }

  // Always derive base from the current request origin to avoid localhost mismatches in production
  const origin = new URL(request.url).origin;
  const destination = resolvedNext.startsWith("http") ? resolvedNext : new URL(resolvedNext, origin).toString();

  response.headers.set("Location", destination);
  return response;
}