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
  "Weak — at least 8 chars + a capital letter",
  "Decent — add a number to strengthen",
  "Strong",
  "Excellent",
];

const strengthSwatch = [
  "bg-white/10",
  "bg-red-500",
  "bg-amber-500",
  "bg-teal-300",
  "bg-emerald-500",
];

const strengthText = [
  "text-slate-400",
  "text-red-400",
  "text-amber-400",
  "text-teal-300",
  "text-emerald-400",
];

function scorePassword(v: string) {
  let lvl = 0;
  if (v.length >= 6) lvl = 1;
  if (v.length >= 8 && /[A-Z]/.test(v)) lvl = 2;
  if (v.length >= 10 && /\d/.test(v)) lvl = 3;
  if (v.length >= 12 && /[!@#$%^&*]/.test(v)) lvl = 4;
  return lvl;
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

  const lvl = scorePassword(password);
  const busy = loading || googleLoading;

  return (
    <AuthShell
      title="Create your account."
      intro="One account unlocks the client dashboard, AI lab, and any future product surfaces. Email confirmation required."
    >
      <GoogleButton
        onClick={signUpWithGoogle}
        disabled={busy}
        loading={googleLoading}
        label="Sign up with Google"
      />

      <AuthDivider />

      {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}
      {success ? <AuthAlert tone="success">{success}</AuthAlert> : null}

      <form onSubmit={handleSignup} className="flex flex-col gap-3.5" noValidate>
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
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="mt-2 flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-sm transition-colors ${
                  i < lvl ? strengthSwatch[lvl] : "bg-white/10"
                }`}
              />
            ))}
          </div>
          <p className={`mt-1 text-[11px] ${strengthText[lvl]}`}>
            {strengthLabels[lvl]}
          </p>
        </AuthField>

        <SubmitButton loading={loading} loadingLabel="Creating account…" disabled={busy}>
          Create account
        </SubmitButton>
      </form>

      <p className="mt-5 text-center text-[12px] text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-teal-200 hover:text-teal-100">
          Sign in instead
        </Link>
      </p>
    </AuthShell>
  );
}
