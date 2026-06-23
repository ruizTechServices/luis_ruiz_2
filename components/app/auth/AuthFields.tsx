"use client";

import { Eye, EyeOff } from "lucide-react";
import {
  forwardRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {label}
        {optional ? (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            (optional)
          </span>
        ) : null}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export const AuthInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function AuthInput(props, ref) {
    return <Input ref={ref} {...props} />;
  },
);

export function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <AuthInput {...props} type={shown ? "text" : "password"} className="pr-10" />
      <Button
        type="button"
        aria-label={shown ? "Hide password" : "Show password"}
        onClick={() => setShown((state) => !state)}
        className="absolute right-1 top-1/2 -translate-y-1/2"
        size="icon"
        variant="ghost"
      >
        {shown ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
      </Button>
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
    <Button
      type="submit"
      {...rest}
      disabled={rest.disabled || loading}
      className="mt-1 w-full"
    >
      {loading ? loadingLabel ?? "Working..." : children}
    </Button>
  );
}

export function GoogleButton({
  loading,
  label,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; label: string }) {
  return (
    <Button
      type="button"
      {...rest}
      disabled={rest.disabled || loading}
      className="w-full"
      variant="outline"
    >
      {loading ? "Redirecting..." : label}
    </Button>
  );
}

export function AuthDivider() {
  return (
    <div className="my-4 flex items-center gap-3">
      <Separator className="flex-1" />
      <span className="text-xs text-muted-foreground">or</span>
      <Separator className="flex-1" />
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
  return (
    <div
      className="mb-3 rounded-md border px-3.5 py-3 text-sm leading-relaxed"
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
