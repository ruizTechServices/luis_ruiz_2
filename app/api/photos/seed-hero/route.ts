import { NextResponse } from 'next/server';
import { createClient } from '@/lib/clients/supabase/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isOwner } from '@/lib/auth/ownership';
import { promises as fs } from 'fs';
import path from 'path';

// Logging helper
function log(level: 'info' | 'warn' | 'error', message: string, data?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [seed-hero] [${level.toUpperCase()}]`;
  if (data) {
    console[level](`${prefix} ${message}`, JSON.stringify(data, null, 2));
  } else {
    console[level](`${prefix} ${message}`);
  }
}

const PHOTOS_BUCKET = process.env.SUPABASE_PHOTOS_BUCKET || 'photos';

export const dynamic = 'force-dynamic';

// Create auth client (uses anon key to read session from cookies)
async function createAuthClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch { /* ignore in RSC */ }
      },
    },
  });
}

async function getSupabaseOrJsonError() {
  try {
    log('info', 'Creating Supabase client...');
    const supabase = await createClient();
    log('info', 'Supabase client created successfully');
    return { supabase };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    log('error', 'Failed to create Supabase client', { error: message });
    return {
      errorResponse: NextResponse.json(
        { error: `Supabase client not configured: ${message}` },
        { status: 500 },
      ),
    };
  }
}

async function requireOwnerClient() {
  log('info', 'Checking owner authorization...');
  
  // Use anon key client to read user session from cookies
  let authClient;
  try {
    authClient = await createAuthClient();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    log('error', 'Failed to create auth client', { error: message });
    return { errorResponse: NextResponse.json({ error: message }, { status: 500 }) };
  }

  const { data: userRes, error: userErr } = await authClient.auth.getUser();
  log('info', 'Auth getUser result', { 
    hasUser: !!userRes?.user, 
    email: userRes?.user?.email ?? null,
    error: userErr?.message ?? null 
  });
  
  if (userErr) {
    log('warn', 'Auth error', { error: userErr.message });
    return { errorResponse: NextResponse.json({ error: userErr.message }, { status: 401 }) };
  }
  const email = userRes?.user?.email;
  if (!email) {
    log('warn', 'No email found in user session');
    return { errorResponse: NextResponse.json({ error: 'Unauthorized - no user session' }, { status: 401 }) };
  }
  
  const ownerEmails = process.env.OWNER_EMAILS || '';
  log('info', 'Checking ownership', { email, ownerEmails });
  
  if (!isOwner(email)) {
    log('warn', 'User is not an owner', { email });
    return { errorResponse: NextResponse.json({ error: 'Forbidden - not an owner' }, { status: 403 }) };
  }
  
  log('info', 'Owner verified, creating service client for storage operations');
  
  // Now get the service role client for storage operations
  const { supabase, errorResponse } = await getSupabaseOrJsonError();
  if (!supabase) return { errorResponse };
  
  return { supabase };
}

// POST /api/photos/seed-hero
// Uploads all files from public/edited into Supabase Storage under prefix "hero/"
export async function POST() {
  log('info', '=== POST /api/photos/seed-hero called ===');
  
  try {
    const { supabase, errorResponse } = await requireOwnerClient();
    if (!supabase) {
      log('error', 'requireOwnerClient returned error response');
      return errorResponse!;
    }

    const root = process.cwd();
    const editedDir = path.join(root, 'public', 'edited');
    log('info', 'Reading files from directory', { editedDir });

    let entries;
    try {
      entries = await fs.readdir(editedDir, { withFileTypes: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      log('error', 'Failed to read directory', { editedDir, error: message });
      return NextResponse.json({ error: `Cannot read directory: ${message}` }, { status: 500 });
    }
    
    const files = entries.filter((e) => e.isFile()).map((e) => e.name);
    log('info', 'Found files', { count: files.length, files });

    if (files.length === 0) {
      log('warn', 'No files found in public/edited');
      return NextResponse.json({ message: 'No files found in public/edited' }, { status: 200 });
    }

    const uploaded: Array<{ name: string; path: string; url: string | null }> = [];
    const errors: Array<{ name: string; message: string }> = [];

    log('info', 'Starting upload to bucket', { bucket: PHOTOS_BUCKET });
    
    for (const name of files) {
      try {
        const abs = path.join(editedDir, name);
        log('info', `Reading file: ${name}`, { path: abs });
        const data = await fs.readFile(abs);
        const ext = path.extname(name).toLowerCase();
        const contentType =
          ext === '.png' ? 'image/png' :
          ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
          ext === '.webp' ? 'image/webp' :
          'application/octet-stream';

        const key = `hero/${name}`;
        log('info', `Uploading to storage`, { key, contentType, size: data.length });
        
        const { error: upErr } = await supabase.storage
          .from(PHOTOS_BUCKET)
          .upload(key, data, { contentType, upsert: true });
        
        if (upErr) {
          log('error', `Upload failed for ${name}`, { error: upErr.message });
          throw upErr;
        }
        log('info', `Upload successful: ${key}`);

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
        log('info', `Completed: ${name}`, { url });
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        log('error', `Failed to process ${name}`, { error: errMsg });
        errors.push({ name, message: errMsg });
      }
    }

    const status = errors.length > 0 && uploaded.length === 0 ? 500 : 200;
    log('info', 'Seed operation complete', { 
      uploadedCount: uploaded.length, 
      errorCount: errors.length, 
      status 
    });
    return NextResponse.json({ uploaded, errors }, { status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log('error', 'Unhandled error in POST handler', { error: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
