import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";

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
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { url, title, description } = parsed.data;

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

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
