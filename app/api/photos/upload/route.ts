import { NextResponse } from 'next/server';
import { createClient } from '@/lib/clients/supabase/server';
import { isOwner } from '@/lib/auth/ownership';

const PHOTOS_BUCKET = process.env.SUPABASE_PHOTOS_BUCKET || 'photos';

export const dynamic = 'force-dynamic';

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

// POST /api/photos/upload
// Form fields:
// - prefix (optional) defaults to "hero"
// - files (one or more File inputs)
export async function POST(request: Request) {
  try {
    const { supabase, errorResponse } = await requireOwnerClient();
    if (!supabase) return errorResponse!;

    const form = await request.formData();
    const prefix = String(form.get('prefix') || 'hero').replace(/^\/+|\/+$/g, '');
    const files = form.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided (field name: files)' }, { status: 400 });
    }

    const uploaded: Array<{ name: string; path: string; url: string | null }> = [];
    const errors: Array<{ name: string; message: string }> = [];

    for (const file of files) {
      try {
        const ab = await file.arrayBuffer();
        const bytes = new Uint8Array(ab);

        const original = (file.name || 'upload');
        const ext = (original.includes('.') ? original.split('.').pop() : '') || 'bin';
        const safeExt = String(ext).slice(0, 10).replace(/[^a-zA-Z0-9]/g, '') || 'bin';
        const baseName = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
        const filename = `${baseName}.${safeExt}`;
        const path = prefix ? `${prefix}/${filename}` : filename;

        const { error: upErr } = await supabase.storage.from(PHOTOS_BUCKET).upload(path, bytes, {
          contentType: file.type || 'application/octet-stream',
          upsert: true,
        });
        if (upErr) throw upErr;

        // Try to create a signed URL; if bucket is public, also return public URL
        let url: string | null = null;
        const { data: signed, error: signedErr } = await supabase.storage.from(PHOTOS_BUCKET).createSignedUrl(path, 3600);
        if (!signedErr && signed?.signedUrl) {
          url = signed.signedUrl;
        } else {
          const { data: pub } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path);
          url = pub.publicUrl ?? null;
        }

        uploaded.push({ name: filename, path, url });
      } catch (e) {
        errors.push({ name: file.name || 'unknown', message: e instanceof Error ? e.message : String(e) });
      }
    }

    const status = errors.length > 0 && uploaded.length === 0 ? 500 : 200;
    return NextResponse.json({ uploaded, errors }, { status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
