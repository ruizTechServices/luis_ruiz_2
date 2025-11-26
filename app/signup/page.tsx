"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient as createBrowserSupabase } from "@/lib/clients/supabase/client";

export default function SignupPage() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignup = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.trim() ? username.trim() : null,
          },
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSuccess("Account created. Check your email to confirm your address, then sign in.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [email, password, supabase, username]);

  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-semibold mb-4">Create account</h1>
      <p className="text-sm text-gray-600 mb-6">
        Sign up with email and password. If email confirmation is enabled, verify your inbox before signing in.
      </p>

      <form className="space-y-4" onSubmit={handleSignup}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
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
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 6 characters.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">
            Username (optional)
          </label>
          <input
            id="username"
            name="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full border px-4 py-2 rounded hover:bg-gray-50 disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>

      {error ? (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      ) : null}
      {success ? (
        <p className="mt-3 text-sm text-green-600">{success}</p>
      ) : null}

      <p className="mt-6 text-sm text-gray-500">
        <Link className="underline" href="/login">Already have an account? Sign in</Link>
      </p>
    </div>
  );
}
