import { NextResponse } from 'next/server';
import { createClient } from '@/lib/clients/supabase/server';
import { isOwner } from '@/lib/auth/ownership';

const PHOTOS_BUCKET = process.env.SUPABASE_PHOTOS_BUCKET || 'photos';

export const dynamic = 'force-dynamic';

// Supabase Storage list() item shape (subset we use)
type StorageListedItem = {
  name: string;
  created_at?: string;
  metadata?: Record<string, unknown> | null;
};

async function getSupabaseOrJsonError() {
  try {
    return { supabase: await createClient() };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return {
      errorResponse: NextResponse.json(
        { error: `Supabase client not configured: ${message}` },
        { status: 500 },
      ),
    };
  }
}

async function requireOwnerClient() {
  const { supabase, errorResponse } = await getSupabaseOrJsonError();
  if (!supabase) return { errorResponse };

  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) {
    return { errorResponse: NextResponse.json({ error: userErr.message }, { status: 401 }) };
  }
  const email = userRes?.user?.email;
  if (!email) {
    return { errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (!isOwner(email)) {
    return { errorResponse: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { supabase };
}

// GET /api/photos?prefix=hero
export async function GET(request: Request) {
  try {
    const { supabase, errorResponse } = await getSupabaseOrJsonError();
    if (!supabase) return errorResponse!;

    const { searchParams } = new URL(request.url);
    const prefix = (searchParams.get('prefix') || 'hero').replace(/^\/+|\/+$/g, '');
    const limit = Math.min(Number(searchParams.get('limit') || '50'), 100);
    const expiresIn = Math.min(Number(process.env.SUPABASE_SIGNED_URL_EXPIRES || '3600'), 60 * 60 * 24);

    // List objects in the bucket under the given prefix
    const { data: files, error: listError } = await supabase.storage.from(PHOTOS_BUCKET).list(prefix, {
      limit,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const items = files || [];

    // Generate signed URLs for each file path
    const urls = await Promise.all(
      items
        .filter((f) => f.name && !f.name.endsWith('/'))
        .map(async (f) => {
          const path = prefix ? `${prefix}/${f.name}` : f.name;
          const { data: signed, error: signedErr } = await supabase.storage
            .from(PHOTOS_BUCKET)
            .createSignedUrl(path, expiresIn);
          if (signedErr || !signed?.signedUrl) {
            // Fallback to public URL (works if bucket is public)
            const { data: pub } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path);
            return {
              name: f.name,
              path,
              url: pub.publicUrl,
              created_at: (f as StorageListedItem).created_at ?? null,
              metadata: (f as StorageListedItem).metadata ?? null,
            };
          }
          return {
            name: f.name,
            path,
            url: signed.signedUrl,
            created_at: (f as StorageListedItem).created_at ?? null,
            metadata: (f as StorageListedItem).metadata ?? null,
          };
        })
    );

    return NextResponse.json({ images: urls }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/photos?path=hero/filename.png
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    let path = url.searchParams.get('path') || '';
    if (!path) {
      try {
        const body = await request.json();
        if (body && typeof body.path === 'string') path = body.path;
      } catch {
        // ignore
      }
    }
    path = String(path).replace(/^\/+|\/+$/g, '');
    if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 });

    const { supabase, errorResponse } = await requireOwnerClient();
    if (!supabase) return errorResponse!;

    const { error } = await supabase.storage.from(PHOTOS_BUCKET).remove([path]);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, path }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
