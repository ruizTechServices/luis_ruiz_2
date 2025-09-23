import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";

// GET: return current availability and availability_text
export async function GET() {
  try {
    const supabase = createServerClient(await cookies());

    const { data, error } = await supabase
      .from("site_settings")
      .select("id, availability, availability_text")
      .order("id", { ascending: true })
      .limit(1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (data && data.length > 0) {
      const row = data[0];
      return NextResponse.json({ availability: row.availability, availability_text: row.availability_text });
    }

    // If no row exists, return defaults without creating a row
    return NextResponse.json({ availability: true, availability_text: "Available for hire" });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: update availability and/or availability_text
export async function POST(req: Request) {
  try {
    const supabase = createServerClient(await cookies());
    const body = (await req.json()) as { availability?: boolean; availability_text?: string };

    const nextAvailability = typeof body.availability === "boolean" ? body.availability : undefined;
    const nextTextRaw = typeof body.availability_text === "string" ? body.availability_text : undefined;
    const nextText = typeof nextTextRaw === "string" ? nextTextRaw.slice(0, 200) : undefined;

    if (typeof nextAvailability === "undefined" && typeof nextText === "undefined") {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    // Find existing row
    const { data: rows, error: selErr } = await supabase
      .from("site_settings")
      .select("id")
      .order("id", { ascending: true })
      .limit(1);

    if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 });

    if (rows && rows.length > 0) {
      const id = rows[0].id as number;
      const update: Partial<{ availability: boolean; availability_text: string }> = {};
      if (typeof nextAvailability === "boolean") update.availability = nextAvailability;
      if (typeof nextText === "string") update.availability_text = nextText;

      const { error: updErr } = await supabase
        .from("site_settings")
        .update(update)
        .eq("id", id);
      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    // No row exists; insert one
    const insertPayload: { availability?: boolean; availability_text?: string } = {};
    if (typeof nextAvailability === "boolean") insertPayload.availability = nextAvailability;
    if (typeof nextText === "string") insertPayload.availability_text = nextText;

    const { error: insErr } = await supabase
      .from("site_settings")
      .insert([{ availability: true, availability_text: "Available for hire", ...insertPayload }]);
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
