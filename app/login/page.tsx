// C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\login\page.tsx
"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import { createClient as createBrowserSupabase } from "@/lib/clients/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

 const signInWithGoogle = useCallback(async () => {
  setGoogleLoading(true);
  setError(null);
  try {
    const envBase = process.env.NEXT_PUBLIC_SITE_URL;
    const runtimeBase =
      typeof window !== "undefined" ? window.location.origin : "";

    const fallback = (runtimeBase || "http://localhost:3000").replace(
      "0.0.0.0",
      "localhost",
    );

    // Prefer canonical env domain if provided; keeps prod on https://luis-ruiz.com
    const base = (envBase || fallback).replace("0.0.0.0", "localhost");

    const redirectTo = new URL("/auth/callback", base).toString();

    console.log("GOOGLE LOGIN DEBUG", { runtimeBase, envBase, base, redirectTo });

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) setError(error.message);
  } catch (e: unknown) {
    setError(e instanceof Error ? e.message : String(e));
    setGoogleLoading(false);
  }
}, [supabase]);



  const signInWithPassword = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setPasswordLoading(true);
      setError(null);
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message);
          setPasswordLoading(false);
          return;
        }

        // IMPORTANT: force a full navigation so server components (Navbar)
        // see the updated Supabase auth cookies.
        window.location.href = "/dashboard";
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
        setPasswordLoading(false);
      }
    },
    [email, password, supabase],
  );

  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <p className="text-sm text-gray-600 mb-6">
        Use your Google account to continue. After authentication, you will be
        redirected back here.
      </p>

      <button
        onClick={signInWithGoogle}
        disabled={googleLoading || passwordLoading}
        className="w-full border px-4 py-2 rounded hover:bg-gray-50 disabled:opacity-60"
      >
        {googleLoading ? "Redirecting…" : "Continue with Google"}
      </button>

      <div className="my-6 text-center text-sm text-gray-500">
        <span>or</span>
      </div>

      <form className="space-y-4" onSubmit={signInWithPassword}>
        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={passwordLoading || googleLoading}
          className="w-full border px-4 py-2 rounded hover:bg-gray-50 disabled:opacity-60"
        >
          {passwordLoading ? "Signing in…" : "Sign in with email"}
        </button>
      </form>

      {error ? (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      ) : null}

      <p className="mt-6 text-sm text-gray-500">
        <Link className="underline" href="/">
          Back to home
        </Link>
      </p>
      <p className="mt-2 text-sm text-gray-500">
        <Link className="underline" href="/signup">
          Need an account? Create one
        </Link>
      </p>
    </div>
  );
}
