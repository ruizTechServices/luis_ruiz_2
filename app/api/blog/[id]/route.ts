// c:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\api\blog\[id]\route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import { isOwner } from "@/lib/auth/ownership";
import { deletePost, getPostById, updatePost } from "@/lib/db/blog";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/blog/[id]
 * Admin-only: delete a blog post
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
    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    await deletePost(postId);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/blog/[id]]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/blog/[id]
 * Get a single blog post
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const post = await getPostById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (e) {
    console.error("[GET /api/blog/[id]]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/blog/[id]
 * Admin-only: update a blog post
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createServerClient();
    const { data: userRes } = await supabase.auth.getUser();
    const email = userRes?.user?.email;

    if (!email || !isOwner(email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const body = await req.json();
    const updated = await updatePost(postId, body);

    if (!updated) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (e) {
    console.error("[PATCH /api/blog/[id]]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}
