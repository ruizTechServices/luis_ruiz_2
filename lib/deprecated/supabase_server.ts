import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (uses service role for Storage ops)
// Required env vars in .env.local (never commit secrets):
// - SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY
// - SUPABASE_ANON_KEY (optional; not used here)

export const supabaseServer = () => {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to .env.local');
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
};

export const PHOTOS_BUCKET = process.env.SUPABASE_PHOTOS_BUCKET || 'photos';
