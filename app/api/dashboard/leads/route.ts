import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOwnerClient } from "@/lib/auth/require-owner";
import { getDashboardLeads } from "@/lib/functions/master-dashboard/getDashboardLeads";

export const dynamic = "force-dynamic";

const createLeadSchema = z.object({
  name: z.string().trim().max(200).optional().nullable(),
  business_name: z.string().trim().max(200).optional().nullable(),
  email: z.string().trim().email().max(200).optional().nullable(),
  phone: z.string().trim().max(50).optional().nullable(),
  source: z.string().trim().max(100).optional().nullable(),
  problem: z.string().trim().max(2000).optional().nullable(),
  budget: z.number().nonnegative().optional().nullable(),
  status: z.string().trim().max(50).optional(),
  next_follow_up_at: z.string().datetime().optional().nullable(),
  notes: z.string().trim().max(4000).optional().nullable(),
});

export async function GET(request: Request) {
  const { supabase, errorResponse } = await requireOwnerClient();
  if (!supabase) return errorResponse!;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const openParam = searchParams.get("open");
    const openOnly = openParam === "true" || openParam === "1";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.max(1, Math.min(100, Number(limitParam))) : undefined;

    const leads = await getDashboardLeads({ status, openOnly, limit });
    return NextResponse.json({ leads });
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
    const parsed = createLeadSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("dashboard_leads")
      .insert(parsed.data)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ lead: data }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
