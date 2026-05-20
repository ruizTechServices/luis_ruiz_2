import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOwnerClient } from "@/lib/auth/require-owner";
import { getDashboardSystemLinks } from "@/lib/functions/master-dashboard/getDashboardSystemLinks";

export const dynamic = "force-dynamic";

const createSystemLinkSchema = z.object({
  name: z.string().trim().min(1).max(200),
  url: z.string().trim().url().max(500),
  description: z.string().trim().max(500).optional().nullable(),
  type: z.string().trim().max(50).optional(),
  status: z.string().trim().max(50).optional(),
  priority: z.number().int().min(1).max(5).optional(),
});

export async function GET(request: Request) {
  const { supabase, errorResponse } = await requireOwnerClient();
  if (!supabase) return errorResponse!;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const type = searchParams.get("type") || undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.max(1, Math.min(100, Number(limitParam))) : undefined;

    const links = await getDashboardSystemLinks({ status, type, limit });
    return NextResponse.json({ links });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { supabase, errorResponse } = await requireOwnerClient();
  if (!supabase) return errorResponse!;

  try {
    const json = await request.json();
    const parsed = createSystemLinkSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("dashboard_system_links")
      .insert(parsed.data)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ link: data }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
