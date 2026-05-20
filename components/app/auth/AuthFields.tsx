"use client";

import { ArrowRight, Eye, EyeOff } from "lucide-react";
import {
  forwardRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

export function AuthField({
  id,
  label,
  hint,
  optional,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[12px] font-medium text-slate-300"
      >
        {label}
        {optional ? (
          <span className="ml-1 text-[11px] font-normal text-slate-500">(optional)</span>
        ) : null}
      </label>
      {children}
      {hint ? <p className="mt-1.5 text-[11px] text-slate-500">{hint}</p> : null}
    </div>
  );
}

const inputClasses =
  "w-full rounded-[10px] border border-white/10 bg-slate-950/60 px-3.5 py-2.5 text-[14px] font-medium text-slate-50 placeholder:text-slate-600 transition focus:border-blue-600 focus:bg-slate-950/85 focus:outline-none focus:ring-[3px] focus:ring-blue-600/20";

export const AuthInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function AuthInput(props, ref) {
    return <input ref={ref} {...props} className={`${inputClasses} ${props.className ?? ""}`.trim()} />;
  },
);

export function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <AuthInput {...props} type={shown ? "text" : "password"} />
      <button
        type="button"
        aria-label={shown ? "Hide password" : "Show password"}
        onClick={() => setShown((s) => !s)}
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-white/5 hover:text-slate-100"
      >
        {shown ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

export function SubmitButton({
  loading,
  loadingLabel,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: string;
}) {
  return (
    <button
      type="submit"
      {...rest}
      disabled={rest.disabled || loading}
      className="mt-1 inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-[10px] bg-blue-600 text-[14px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-progress disabled:opacity-70"
    >
      <span>{loading ? loadingLabel ?? "Working…" : children}</span>
      {!loading ? <ArrowRight className="h-3.5 w-3.5" /> : null}
    </button>
  );
}

export function GoogleButton({
  loading,
  label,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; label: string }) {
  return (
    <button
      type="button"
      {...rest}
      disabled={rest.disabled || loading}
      className="inline-flex h-[46px] w-full items-center justify-center gap-2.5 rounded-[10px] border border-black/5 bg-white text-[14px] font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-progress disabled:opacity-70"
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84c.87-2.6 3.3-4.5 6.16-4.5z" />
      </svg>
      <span>{loading ? "Redirecting…" : label}</span>
    </button>
  );
}

export function AuthDivider() {
  return (
    <div className="my-4 flex items-center gap-3">
      <hr className="flex-1 border-t border-white/10" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        or
      </span>
      <hr className="flex-1 border-t border-white/10" />
    </div>
  );
}

export function AuthAlert({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: ReactNode;
}) {
  const palette =
    tone === "error"
      ? "border-red-500/30 bg-red-500/10 text-red-300"
      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  return (
    <div
      className={`mb-3 rounded-[10px] border px-3.5 py-3 text-[12px] leading-relaxed ${palette}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
