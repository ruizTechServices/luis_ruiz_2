//C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\auth\callback\route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/clients/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/";

  if (!code) {
    // If no code from provider, redirect back to login
    return NextResponse.redirect(new URL(`/login?error=missing_code`, request.url));
  }

  const supabase = createServerSupabase();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url));
  }

  return NextResponse.redirect(new URL(next, request.url));
}
//C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\auth\callback\route.ts  