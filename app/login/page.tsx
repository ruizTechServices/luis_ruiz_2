// C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\login\page.tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import { createClient as createBrowserSupabase } from "@/lib/clients/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Prefer explicitly configured site URL when available; normalize 0.0.0.0 to localhost
      const envBase = process.env.NEXT_PUBLIC_SITE_URL;
      const runtimeBase = typeof window !== 'undefined' ? window.location.origin : '';
      const base = (envBase || runtimeBase || 'http://localhost:5000').replace('0.0.0.0', 'localhost');
      const redirectTo = new URL('/auth/callback', base).toString();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });
      if (error) setError(error.message);
      // Supabase will redirect; no further action needed
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setLoading(false);
    }
  }, [supabase]);

  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <p className="text-sm text-gray-600 mb-6">
        Use your Google account to continue. After authentication, you will be redirected back here.
      </p>

      <button
        onClick={signInWithGoogle}
        disabled={loading}
        className="w-full border px-4 py-2 rounded hover:bg-gray-50 disabled:opacity-60"
      >
        {loading ? "Redirecting…" : "Continue with Google"}
      </button>

      {error ? (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      ) : null}

      <p className="mt-6 text-sm text-gray-500">
        <Link className="underline" href="/">Back to home</Link>
      </p>
    </div>
  );
}