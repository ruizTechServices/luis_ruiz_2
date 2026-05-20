import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOwnerClient } from "@/lib/auth/require-owner";
import { getDashboardProjects } from "@/lib/functions/master-dashboard/getDashboardProjects";

export const dynamic = "force-dynamic";

const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  type: z.string().trim().max(50).optional(),
  status: z.string().trim().max(50).optional(),
  priority: z.number().int().min(1).max(5).optional(),
  repo_url: z.string().trim().url().max(500).optional().nullable(),
  live_url: z.string().trim().url().max(500).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  next_action: z.string().trim().max(500).optional().nullable(),
  revenue_potential: z.number().nonnegative().optional(),
  last_touched_at: z.string().datetime().optional().nullable(),
});

export async function GET(request: Request) {
  const { supabase, errorResponse } = await requireOwnerClient();
  if (!supabase) return errorResponse!;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.max(1, Math.min(100, Number(limitParam))) : undefined;

    const projects = await getDashboardProjects({ status, limit });
    return NextResponse.json({ projects });
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
    const parsed = createProjectSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("dashboard_projects")
      .insert(parsed.data)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ project: data }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
