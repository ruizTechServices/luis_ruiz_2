import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOwnerClient } from "@/lib/auth/require-owner";
import { getDashboardDecisions } from "@/lib/functions/master-dashboard/getDashboardDecisions";

export const dynamic = "force-dynamic";

const createDecisionSchema = z.object({
  title: z.string().trim().min(1).max(200),
  decision: z.string().trim().min(1).max(2000),
  reason: z.string().trim().max(2000).optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
  status: z.string().trim().max(50).optional(),
  revisit_at: z.string().datetime().optional().nullable(),
});

export async function GET(request: Request) {
  const { supabase, errorResponse } = await requireOwnerClient();
  if (!supabase) return errorResponse!;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.max(1, Math.min(100, Number(limitParam))) : undefined;

    const decisions = await getDashboardDecisions({ status, limit });
    return NextResponse.json({ decisions });
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
    const parsed = createDecisionSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("dashboard_decisions")
      .insert(parsed.data)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ decision: data }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
