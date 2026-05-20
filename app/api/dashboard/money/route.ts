import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOwnerClient } from "@/lib/auth/require-owner";
import {
  getDashboardMoney,
  summarizeMoneyEntries,
} from "@/lib/functions/master-dashboard/getDashboardMoney";

export const dynamic = "force-dynamic";

const createMoneyEntrySchema = z.object({
  entry_type: z.enum(["income", "expense"]),
  category: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional().nullable(),
  amount: z.number().finite(),
  occurred_on: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "occurred_on must be YYYY-MM-DD")
    .optional(),
  project_id: z.string().uuid().optional().nullable(),
  client_id: z.string().uuid().optional().nullable(),
});

export async function GET(request: Request) {
  const { supabase, errorResponse } = await requireOwnerClient();
  if (!supabase) return errorResponse!;

  try {
    const { searchParams } = new URL(request.url);
    const entryType = searchParams.get("type") || undefined;
    const since = searchParams.get("since") || undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.max(1, Math.min(500, Number(limitParam))) : undefined;

    const entries = await getDashboardMoney({ entryType, since, limit });
    const summary = summarizeMoneyEntries(entries);
    return NextResponse.json({ entries, summary });
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
    const parsed = createMoneyEntrySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("dashboard_money_entries")
      .insert(parsed.data)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ entry: data }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
