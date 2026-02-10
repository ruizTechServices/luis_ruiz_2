import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Builds a Supabase service-role client for server-side usage only.
 * Does NOT use cookies — suitable for webhook handlers, background jobs,
 * and any context where auth comes from Bearer tokens rather than cookies.
 *
 * Returns null if required environment variables are missing.
 */
export const createServiceRoleClient = (): SupabaseClient | null => {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_API_KEY ?? null;

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn("[supabase] Missing SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY for service-role client.");
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey);
};
