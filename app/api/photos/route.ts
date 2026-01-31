import { NextResponse } from 'next/server';
import { createClient } from '@/lib/clients/supabase/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isOwner } from '@/lib/auth/ownership';

const PHOTOS_BUCKET = process.env.SUPABASE_PHOTOS_BUCKET || 'photos';

// Logging helper
function log(level: 'info' | 'warn' | 'error', message: string, data?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [photos-api] [${level.toUpperCase()}]`;
  if (data) {
    console[level](`${prefix} ${message}`, JSON.stringify(data, null, 2));
  } else {
    console[level](`${prefix} ${message}`);
  }
}

export const dynamic = 'force-dynamic';

// Supabase Storage list() item shape (subset we use)
type StorageListedItem = {
  name: string;
  created_at?: string;
  metadata?: Record<string, unknown> | null;
};

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
    return { supabase: await createClient() };
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
    return { errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (!isOwner(email)) {
    log('warn', 'User is not an owner', { email });
    return { errorResponse: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  
  log('info', 'Owner verified, creating service client');
  const { supabase, errorResponse } = await getSupabaseOrJsonError();
  if (!supabase) return { errorResponse };
  
  return { supabase };
}

// GET /api/photos?prefix=hero&recursive=true
export async function GET(request: Request) {
  log('info', '=== GET /api/photos called ===');
  
  try {
    const { supabase, errorResponse } = await getSupabaseOrJsonError();
    if (!supabase) return errorResponse!;

    const { searchParams } = new URL(request.url);
    const prefix = (searchParams.get('prefix') || '').replace(/^\/+|\/+$/g, '');
    const limit = Math.min(Number(searchParams.get('limit') || '500'), 1000);
    const recursive = searchParams.get('recursive') !== 'false'; // default true
    const expiresIn = Math.min(Number(process.env.SUPABASE_SIGNED_URL_EXPIRES || '3600'), 60 * 60 * 24);
    
    log('info', 'GET params', { prefix, limit, recursive, bucket: PHOTOS_BUCKET });

    type ListedItemWithPath = StorageListedItem & { path: string };
    const files: ListedItemWithPath[] = [];
    const queue: string[] = [prefix];

    while (queue.length > 0 && files.length < limit) {
      const currentPrefix = queue.shift()!;
      const { data: entries, error: listError } = await supabase.storage.from(PHOTOS_BUCKET).list(currentPrefix, {
        limit: Math.min(1000, limit), // per-folder cap
        sortBy: { column: 'created_at', order: 'desc' },
      });

      if (listError) {
        log('error', 'Storage list error', { error: listError.message, prefix: currentPrefix });
        return NextResponse.json({ error: listError.message }, { status: 500 });
      }

      for (const entry of entries || []) {
        const path = currentPrefix ? `${currentPrefix}/${entry.name}` : entry.name;
        const isFolder = !entry.metadata || typeof entry.metadata.size !== 'number';

        if (isFolder) {
          if (recursive) queue.push(path);
          continue;
        }

        files.push({
          name: entry.name,
          created_at: (entry as StorageListedItem).created_at ?? undefined,
          metadata: (entry as StorageListedItem).metadata ?? undefined,
          path,
        });

        if (files.length >= limit) break;
      }
    }

    const urls = await Promise.all(
      files.map(async (f) => {
        const path = f.path;
        const { data: signed, error: signedErr } = await supabase.storage
          .from(PHOTOS_BUCKET)
          .createSignedUrl(path, expiresIn);
        if (signedErr || !signed?.signedUrl) {
          const { data: pub } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path);
          return {
            name: f.name,
            path,
            url: pub.publicUrl,
            created_at: f.created_at ?? null,
            metadata: f.metadata ?? null,
          };
        }
        return {
          name: f.name,
          path,
          url: signed.signedUrl,
          created_at: f.created_at ?? null,
          metadata: f.metadata ?? null,
        };
      })
    );

    log('info', 'GET complete', { imageCount: urls.length });
    return NextResponse.json({ images: urls }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log('error', 'GET unhandled error', { error: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/photos?path=hero/filename.png
export async function DELETE(request: Request) {
  log('info', '=== DELETE /api/photos called ===');
  
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

    log('info', 'Deleting from storage', { path, bucket: PHOTOS_BUCKET });
    const { error } = await supabase.storage.from(PHOTOS_BUCKET).remove([path]);
    if (error) {
      log('error', 'Delete failed', { error: error.message, path });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    log('info', 'Delete successful', { path });
    return NextResponse.json({ ok: true, path }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log('error', 'DELETE unhandled error', { error: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
