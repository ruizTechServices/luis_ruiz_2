// C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\components\SignOut.tsx
"use client";

import { createClient as createBrowserSupabase } from "@/lib/clients/supabase/client";

export default function SignOut() {
  const supabase = createBrowserSupabase();

  async function handle() {
    await supabase.auth.signOut();
    // Ensure server reads cleared cookies
    window.location.replace("/");
  }

  return (
    <button onClick={handle} className="border px-3 py-1 rounded hover:bg-gray-50">
      Sign out
    </button>
  );
}
