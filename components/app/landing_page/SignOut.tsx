// C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\components\SignOut.tsx
"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { createClient as createBrowserSupabase } from "@/lib/clients/supabase/client";

type SignOutProps = { redirectTo?: string; className?: string; children?: ReactNode };
export default function SignOut({ redirectTo = "/", className, children }: SignOutProps) {
  const supabase = createBrowserSupabase();

  async function handle() {
    await supabase.auth.signOut();
    // Ensure server reads cleared cookies
    window.location.replace(redirectTo);
  }

  return (
    <button
      onClick={handle}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-md border border-white/15 bg-white/[0.04] px-3 text-[13px] font-medium text-slate-200 transition hover:border-white/25 hover:bg-white/[0.08] hover:text-white",
        className,
      )}
    >
      {children ?? "Sign out"}
    </button>
  );
}
