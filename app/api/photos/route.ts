import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/clients/supabase/server';

const PHOTOS_BUCKET = process.env.SUPABASE_PHOTOS_BUCKET || 'photos';

export const dynamic = 'force-dynamic';

// GET /api/photos?prefix=hero
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = (searchParams.get('prefix') || 'hero').replace(/^\/+|\/+$/g, '');
    const limit = Math.min(Number(searchParams.get('limit') || '50'), 100);
    const expiresIn = Math.min(Number(process.env.SUPABASE_SIGNED_URL_EXPIRES || '3600'), 60 * 60 * 24);

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

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
              created_at: (f as any).created_at ?? null,
              metadata: f.metadata ?? null,
            };
          }
          return {
            name: f.name,
            path,
            url: signed.signedUrl,
            created_at: (f as any).created_at ?? null,
            metadata: f.metadata ?? null,
          };
        })
    );

    return NextResponse.json({ images: urls }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
