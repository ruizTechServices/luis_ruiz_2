import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const post_id = Number(form.get("post_id"));
    const user_email = String(form.get("user_email") ?? "");
    const content = String(form.get("content") ?? "");

    if (!post_id || !user_email || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const supabase = createServerClient(await cookies());
    const { error } = await supabase.from("comments").insert({ post_id, user_email, content });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.redirect(new URL(`/blog/${post_id}`, req.url));
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
