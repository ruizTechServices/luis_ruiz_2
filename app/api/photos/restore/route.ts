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

// POST /api/photos/restore
// FormData fields:
// - path: full storage path including prefix and filename (e.g., hero/luis-1.png)
// - file: the image blob to upload
export async function POST(request: Request) {
  try {
    const { supabase, errorResponse } = await requireOwnerClient();
    if (!supabase) return errorResponse!;

    const form = await request.formData();
    const path = String(form.get('path') || '').replace(/^\/+|\/+$/g, '');
    const file = form.get('file');

    if (!path || !(file instanceof File)) {
      return NextResponse.json({ error: 'Missing path or file' }, { status: 400 });
    }

    const ab = await file.arrayBuffer();
    const bytes = new Uint8Array(ab);
    const contentType = file.type || 'application/octet-stream';

    const { error } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .upload(path, bytes, { upsert: true, contentType });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, path }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
