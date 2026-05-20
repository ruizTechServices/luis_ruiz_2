import { createServiceRoleClient } from "@/lib/clients/supabase/service-role";

export function getDashboardSupabase() {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    throw new Error(
      "Dashboard Supabase client misconfigured: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_API_KEY is required for private dashboard tables."
    );
  }
  return supabase;
}
