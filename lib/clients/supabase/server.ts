//C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\lib\clients\supabase\server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
// Prefer service role on server if available (never expose to browser)
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_API_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase server client misconfigured: ensure NEXT_PUBLIC_SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY (preferred), SUPABASE_API_KEY, or NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
  );
}

// Minimal cookie options compatible with Next.js setter
export const createClient = () => {
  const cookieStore = cookies() as unknown as {
    getAll: () => Array<{ name: string; value: string }>;
    set: (name: string, value: string, options?: Record<string, unknown>) => void;
  };
  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called in Server Component where setting cookies may be disallowed; ignore.
          }
        },
      },
    },
  );
};
