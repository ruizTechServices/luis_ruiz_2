import { NextResponse } from "next/server";
import { createAnonServerClient } from "@/lib/clients/supabase/anon-server";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import { isOwner } from "./ownership";

/**
 * Verifies the current user is an owner and returns a service-role Supabase client.
 * Returns an error response if auth fails or user is not an owner.
 */
export async function requireOwnerClient(): Promise<
  { supabase: Awaited<ReturnType<typeof createServerClient>>; errorResponse?: never } |
  { supabase?: never; errorResponse: NextResponse }
> {
  try {
    const authClient = await createAnonServerClient();
    const { data: userRes, error: userErr } = await authClient.auth.getUser();

    if (userErr) {
      return { errorResponse: NextResponse.json({ error: userErr.message }, { status: 401 }) };
    }

    const email = userRes?.user?.email;
    if (!email) {
      return { errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }
    if (!isOwner(email)) {
      return { errorResponse: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }

    const supabase = await createServerClient();
    return { supabase };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { errorResponse: NextResponse.json({ error: message }, { status: 500 }) };
  }
}
