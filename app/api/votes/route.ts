import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const post_id = Number(form.get("post_id"));
    const vote_type = String(form.get("vote_type") ?? "");

    // TODO: replace with real auth-derived email when you wire auth
    const user_email = "anonymous@example.com";

    if (!post_id || (vote_type !== "up" && vote_type !== "down")) {
      return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
    }

    const supabase = createServerClient(await cookies());

    // Upsert by (post_id, user_email)
    const { error } = await supabase.from("votes").upsert(
      { post_id, user_email, vote_type },
      { onConflict: "post_id,user_email" }
    );

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.redirect(new URL(`/blog/${post_id}`, req.url));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
