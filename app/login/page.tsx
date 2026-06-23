"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient as createBrowserSupabase } from "@/lib/clients/supabase/client";
import { AuthShell } from "@/components/app/auth/AuthShell";
import {
  AuthAlert,
  AuthDivider,
  AuthField,
  AuthInput,
  GoogleButton,
  PasswordInput,
  SubmitButton,
} from "@/components/app/auth/AuthFields";

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

      const base = (envBase || fallback).replace("0.0.0.0", "localhost");
      const redirectTo = new URL("/auth/callback", base).toString();

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

        window.location.href = "/dashboard";
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
        setPasswordLoading(false);
      }
    },
    [email, password, supabase],
  );

  const busy = googleLoading || passwordLoading;

  return (
    <AuthShell title="Sign in" intro="Use Google or email/password.">
      <GoogleButton
        onClick={signInWithGoogle}
        disabled={busy}
        loading={googleLoading}
        label="Continue with Google"
      />

      <AuthDivider />

      {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}

      <form onSubmit={signInWithPassword} className="flex flex-col gap-4" noValidate>
        <AuthField id="email" label="Email">
          <AuthInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </AuthField>

        <AuthField id="password" label="Password">
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </AuthField>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              defaultChecked
              className="size-3.5 rounded border"
            />
            Remember me
          </label>
          <Link href="/about" className="font-medium underline underline-offset-4">
            Forgot password?
          </Link>
        </div>

        <SubmitButton loading={passwordLoading} loadingLabel="Signing in..." disabled={busy}>
          Sign in with email
        </SubmitButton>
      </form>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        New here?{" "}
        <Link href="/signup" className="font-semibold underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
