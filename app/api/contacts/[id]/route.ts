// c:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\api\contacts\[id]\route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import { isOwner } from "@/lib/auth/ownership";
import { deleteContact, getContactById } from "@/lib/db/contactlist";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/contacts/[id]
 * Admin-only: delete a contact by ID
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createServerClient();
    const { data: userRes } = await supabase.auth.getUser();
    const email = userRes?.user?.email;

    if (!email || !isOwner(email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const contactId = parseInt(id, 10);
    if (isNaN(contactId)) {
      return NextResponse.json({ error: "Invalid contact ID" }, { status: 400 });
    }

    await deleteContact(contactId);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/contacts/[id]]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/contacts/[id]
 * Admin-only: get a single contact
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createServerClient();
    const { data: userRes } = await supabase.auth.getUser();
    const email = userRes?.user?.email;

    if (!email || !isOwner(email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const contactId = parseInt(id, 10);
    if (isNaN(contactId)) {
      return NextResponse.json({ error: "Invalid contact ID" }, { status: 400 });
    }

    const contact = await getContactById(contactId);
    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json(contact);
  } catch (e) {
    console.error("[GET /api/contacts/[id]]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}
