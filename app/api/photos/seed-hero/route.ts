import { NextResponse } from 'next/server';
import { createClient } from '@/lib/clients/supabase/server';
import { promises as fs } from 'fs';
import path from 'path';

const PHOTOS_BUCKET = process.env.SUPABASE_PHOTOS_BUCKET || 'photos';

export const dynamic = 'force-dynamic';

// POST /api/photos/seed-hero
// Uploads all files from public/edited into Supabase Storage under prefix "hero/"
export async function POST() {
  try {
    const root = process.cwd();
    const editedDir = path.join(root, 'public', 'edited');

    const entries = await fs.readdir(editedDir, { withFileTypes: true });
    const files = entries.filter((e) => e.isFile()).map((e) => e.name);

    if (files.length === 0) {
      return NextResponse.json({ message: 'No files found in public/edited' }, { status: 200 });
    }

    const supabase = createClient();

    const uploaded: Array<{ name: string; path: string; url: string | null }> = [];
    const errors: Array<{ name: string; message: string }> = [];

    for (const name of files) {
      try {
        const abs = path.join(editedDir, name);
        const data = await fs.readFile(abs);
        const ext = path.extname(name).toLowerCase();
        const contentType =
          ext === '.png' ? 'image/png' :
          ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
          ext === '.webp' ? 'image/webp' :
          'application/octet-stream';

        const key = `hero/${name}`;
        const { error: upErr } = await supabase.storage
          .from(PHOTOS_BUCKET)
          .upload(key, data, { contentType, upsert: true });
        if (upErr) throw upErr;

        // Signed URL OR public URL
        let url: string | null = null;
        const { data: signed, error: signedErr } = await supabase.storage
          .from(PHOTOS_BUCKET)
          .createSignedUrl(key, 3600);
        if (!signedErr && signed?.signedUrl) {
          url = signed.signedUrl;
        } else {
          const { data: pub } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(key);
          url = pub.publicUrl ?? null;
        }

        uploaded.push({ name, path: key, url });
      } catch (e) {
        errors.push({ name, message: e instanceof Error ? e.message : String(e) });
      }
    }

    const status = errors.length > 0 && uploaded.length === 0 ? 500 : 200;
    return NextResponse.json({ uploaded, errors }, { status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
