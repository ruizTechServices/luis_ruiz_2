import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Async factory for a Supabase server client using the **anon key** + cookies.
 * Use this when you need to read the user's auth session from cookies but do NOT
 * need service-role privileges (e.g. checking ownership before delegating to
 * a service-role client for the actual operation).
 */
export const createAnonServerClient = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error(
      "Supabase anon-server client misconfigured: ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
    );
  }

  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called in Server Component where setting cookies may be disallowed; ignore.
        }
      },
    },
  });
};
