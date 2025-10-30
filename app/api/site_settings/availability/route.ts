import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";

export const dynamic = "force-dynamic";

// GET: return current availability and availability_text
export async function GET() {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("site_settings")
      .select("id, availability, availability_text")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (data) {
      return NextResponse.json({
        availability: data.availability,
        availability_text: data.availability_text,
      });
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
    const supabase = await createServerClient();
    const body = (await req.json()) as { availability?: unknown; availability_text?: unknown };

    const parsedAvailability = (() => {
      if (typeof body.availability === "boolean") return body.availability;
      if (typeof body.availability === "string") {
        const value = body.availability.trim().toLowerCase();
        if (["true", "1", "t", "yes", "on"].includes(value)) return true;
        if (["false", "0", "f", "no", "off"].includes(value)) return false;
      }
      return undefined;
    })();

    const parsedText =
      typeof body.availability_text === "string"
        ? body.availability_text.slice(0, 200)
        : undefined;

    if (typeof parsedAvailability === "undefined" && typeof parsedText === "undefined") {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data: existing, error: selectError } = await supabase
      .from("site_settings")
      .select("id, availability, availability_text")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (selectError) {
      return NextResponse.json({ error: selectError.message }, { status: 500 });
    }

    const availability =
      typeof parsedAvailability === "boolean"
        ? parsedAvailability
        : existing?.availability ?? true;
    const availabilityText =
      typeof parsedText === "string"
        ? parsedText
        : existing?.availability_text ?? "Available for hire";

    if (existing) {
      const { error: updateError } = await supabase
        .from("site_settings")
        .update({
          availability,
          availability_text: availabilityText,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    } else {
      const { error: insertError } = await supabase
        .from("site_settings")
        .insert([
          {
            availability,
            availability_text: availabilityText,
            updated_at: new Date().toISOString(),
          },
        ]);

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ availability, availability_text: availabilityText });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
