import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { createClient as createServiceClient } from "@/lib/clients/supabase/server";
import { createServerClient as createSsrClient } from "@supabase/ssr";

const bodySchema = z.object({
  url: z.string().url(),
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().min(1).max(2000).optional(),
});

const ALLOWED_EMAIL = "giosterr44@gmail.com";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join("; ") || "Invalid input";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const { url, title, description } = parsed.data;

    // Gate by signed-in user email
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: "Server misconfigured: missing Supabase env vars." }, { status: 500 });
    }

    const cookieStore = await cookies();
    const supabaseAuth = createSsrClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {
            /* no-op for API route auth check */
          },
        },
      },
    );

    const { data: userData, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Sign in required to add a project." }, { status: 401 });
    }

    if ((userData.user.email ?? "").toLowerCase() !== ALLOWED_EMAIL) {
      return NextResponse.json({ error: "You are not allowed to add projects." }, { status: 403 });
    }

    // Use service role to bypass RLS once authorized
    const supabase = await createServiceClient();

    const { data, error } = await supabase
      .from("projects")
      .upsert(
        [{ url, title: title ?? null, description: description ?? null }],
        { onConflict: "url" }
      )
      .select("id, url, title, description, created_at, updated_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
