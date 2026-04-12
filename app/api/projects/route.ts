import { NextResponse } from "next/server";
import { z } from "zod";
import { createAnonServerClient } from "@/lib/clients/supabase/anon-server";
import { createClient as createServiceClient } from "@/lib/clients/supabase/server";
import { isOwner } from "@/lib/auth/ownership";
import type { ProjectCategory, ProjectStatus, ProjectVisibility } from "@/lib/types/project";

const projectStatus = ["draft", "active", "complete", "archived"] as const satisfies readonly ProjectStatus[];
const projectCategory = ["project", "product", "client", "experiment"] as const satisfies readonly ProjectCategory[];
const projectVisibility = ["public", "unlisted", "private"] as const satisfies readonly ProjectVisibility[];

const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined));

const bodySchema = z.object({
  url: z.string().url(),
  title: optionalTrimmed(200),
  description: optionalTrimmed(2000),
  slug: optionalTrimmed(200),
  summary: optionalTrimmed(500),
  status: z.enum(projectStatus).optional(),
  category: z.enum(projectCategory).optional(),
  featured: z.boolean().optional(),
  visibility: z.enum(projectVisibility).optional(),
  stack: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
  role: optionalTrimmed(300),
  context: optionalTrimmed(4000),
  problem: optionalTrimmed(4000),
  constraints: optionalTrimmed(4000),
  approach: optionalTrimmed(4000),
  architecture: optionalTrimmed(4000),
  decisions: optionalTrimmed(4000),
  outcomes: optionalTrimmed(4000),
  current_status: optionalTrimmed(1000),
  repo_url: z.string().url().optional(),
  live_url: z.string().url().optional(),
  cover_image_url: z.string().url().optional(),
  started_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().optional(),
});

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join("; ") || "Invalid input";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const data = parsed.data;

    const supabaseAuth = await createAnonServerClient();
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Sign in required to add a project." }, { status: 401 });
    }

    if (!isOwner(userData.user.email)) {
      return NextResponse.json({ error: "You are not allowed to add projects." }, { status: 403 });
    }

    const supabase = await createServiceClient();
    const fallbackSlugSource = data.slug || data.title || data.url;
    const slug = slugify(fallbackSlugSource);

    const payload = {
      url: data.url,
      title: data.title ?? null,
      description: data.description ?? null,
      slug,
      summary: data.summary ?? null,
      status: data.status ?? "active",
      category: data.category ?? "project",
      featured: data.featured ?? false,
      visibility: data.visibility ?? "public",
      stack: data.stack ?? [],
      role: data.role ?? null,
      context: data.context ?? null,
      problem: data.problem ?? null,
      constraints: data.constraints ?? null,
      approach: data.approach ?? null,
      architecture: data.architecture ?? null,
      decisions: data.decisions ?? null,
      outcomes: data.outcomes ?? null,
      current_status: data.current_status ?? null,
      repo_url: data.repo_url ?? null,
      live_url: data.live_url ?? null,
      cover_image_url: data.cover_image_url ?? null,
      started_at: data.started_at ?? null,
      completed_at: data.completed_at ?? null,
    };

    const { data: project, error } = await supabase
      .from("projects")
      .upsert([payload], { onConflict: "url" })
      .select(`
        id,
        url,
        title,
        description,
        slug,
        summary,
        status,
        category,
        featured,
        visibility,
        stack,
        role,
        context,
        problem,
        constraints,
        approach,
        architecture,
        decisions,
        outcomes,
        current_status,
        repo_url,
        live_url,
        cover_image_url,
        started_at,
        completed_at,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
