import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/clients/supabase/server';

const PHOTOS_BUCKET = process.env.SUPABASE_PHOTOS_BUCKET || 'photos';

export const dynamic = 'force-dynamic';

// POST /api/photos/restore
// FormData fields:
// - path: full storage path including prefix and filename (e.g., hero/luis-1.png)
// - file: the image blob to upload
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const path = String(form.get('path') || '').replace(/^\/+|\/+$/g, '');
    const file = form.get('file');

    if (!path || !(file instanceof File)) {
      return NextResponse.json({ error: 'Missing path or file' }, { status: 400 });
    }

    const ab = await file.arrayBuffer();
    const bytes = new Uint8Array(ab);
    const contentType = file.type || 'application/octet-stream';

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

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
