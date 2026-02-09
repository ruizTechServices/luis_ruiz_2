import { NextResponse } from "next/server";
import { z } from "zod";
import { createAnonServerClient } from "@/lib/clients/supabase/anon-server";
import { createClient as createServiceClient } from "@/lib/clients/supabase/server";
import { isOwner } from "@/lib/auth/ownership";

const bodySchema = z.object({
  url: z.string().url(),
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().min(1).max(2000).optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join("; ") || "Invalid input";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const { url, title, description } = parsed.data;

    const supabaseAuth = await createAnonServerClient();
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Sign in required to add a project." }, { status: 401 });
    }

    if (!isOwner(userData.user.email)) {
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
