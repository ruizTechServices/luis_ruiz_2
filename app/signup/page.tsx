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

const strengthLabels = [
  "Add a longer password (min 6 characters)",
  "Weak",
  "Decent",
  "Strong",
  "Excellent",
];

function scorePassword(value: string) {
  let level = 0;
  if (value.length >= 6) level = 1;
  if (value.length >= 8 && /[A-Z]/.test(value)) level = 2;
  if (value.length >= 10 && /\d/.test(value)) level = 3;
  if (value.length >= 12 && /[!@#$%^&*]/.test(value)) level = 4;
  return level;
}

export default function SignupPage() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignup = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
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

        setSuccess(
          "Account created. Check your email to confirm your address, then sign in.",
        );
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    },
    [email, password, supabase, username],
  );

  const signUpWithGoogle = useCallback(async () => {
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

  const level = scorePassword(password);
  const busy = loading || googleLoading;

  return (
    <AuthShell title="Create account" intro="Email confirmation required.">
      <GoogleButton
        onClick={signUpWithGoogle}
        disabled={busy}
        loading={googleLoading}
        label="Sign up with Google"
      />

      <AuthDivider />

      {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}
      {success ? <AuthAlert tone="success">{success}</AuthAlert> : null}

      <form onSubmit={handleSignup} className="flex flex-col gap-4" noValidate>
        <AuthField id="username" label="Username" optional>
          <AuthInput
            id="username"
            name="username"
            type="text"
            placeholder="gio"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </AuthField>

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

        <AuthField id="password" label="Password" hint="Min 6 characters.">
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="mt-2 flex gap-1" aria-hidden="true">
            {[0, 1, 2, 3].map((index) => (
              <span
                key={index}
                className={`h-1 flex-1 rounded-sm ${
                  index < level ? "bg-foreground" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {strengthLabels[level]}
          </p>
        </AuthField>

        <SubmitButton loading={loading} loadingLabel="Creating account..." disabled={busy}>
          Create account
        </SubmitButton>
      </form>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold underline underline-offset-4">
          Sign in instead
        </Link>
      </p>
    </AuthShell>
  );
}
