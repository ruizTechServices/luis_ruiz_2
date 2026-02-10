import { NextResponse } from "next/server";

import { buildContactInsertPayload, contactFormSchema } from "@/lib/validation/contact";
import { createServiceRoleClient } from "@/lib/clients/supabase/service-role";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parseResult = contactFormSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.format() }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase client not configured" }, { status: 500 });
    }

    const payload = buildContactInsertPayload(parseResult.data);

    const { error } = await supabase.from("contactlist").insert(payload);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
