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
    <button onClick={handle} className={cn("border px-3 py-1 rounded hover:bg-gray-50", className)}>
      {children ?? "Sign out"}
    </button>
  );
}
