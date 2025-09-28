Gio — got you. Let’s stay **exactly** on your codebase and only add what’s needed. I’ll keep the **full Windows path** comment at the top of **every** file.

Below are **surgical edits** that:

1. keep your existing `metadata` and layout structure,
2. fetch the logged-in user server-side,
3. show their email/avatar in the header,
4. add Google OAuth login + callback,
5. add a SignOut button,
6. wire your existing middleware helper.

No assumptions beyond what you’ve shown. If I’m unsure, I’ll say “I don’t know.”

---

# 1) Replace your layout with this (keeps your metadata)

```tsx
// C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\layout.tsx
import type { Metadata } from "next";
import "./globals.css";

import Link from "next/link";
import { cookies } from "next/headers";
import { createClient as createServerSupabase } from "@/lib/clients/supabase/server";
import SignOut from "@/app/components/SignOut"; // added client island

export const metadata: Metadata = {
  title: "Luis Ruiz: your Tech Partner!",
  description: "A portfolio website for Luis Ruiz",
};

// While testing auth, keep dynamic to avoid any static caching edge-cases
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = cookies();
  const supabase = createServerSupabase(cookieStore);

  // Get the current user from Supabase (server-side)
  const { data, error } = await supabase.auth.getUser();

  // If there's an auth error here, it often just means "no session"
  // We won't blow up the page — just treat as signed-out
  const user = data?.user ?? null;

  const avatarUrl = (user?.user_metadata as any)?.avatar_url as string | undefined;
  const email = user?.email ?? null;

  return (
    <html lang="en">
      <body>
        <header className="w-full border-b">
          <div className="mx-auto max-w-5xl flex items-center justify-between p-4">
            <Link href="/" className="font-semibold">
              RuizTech
            </Link>

            {!user ? (
              <Link
                href="/login"
                className="border px-3 py-1 rounded hover:bg-gray-50"
              >
                Sign in
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="h-8 w-8 rounded-full border"
                  />
                ) : null}
                <span className="text-sm">{email}</span>
                <SignOut />
              </div>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-5xl p-6">{children}</main>
      </body>
    </html>
  );
}
```

**Why these choices (precise):**

* Uses **your** server client: `createClient(cookieStore)` from `@/lib/clients/supabase/server`.
* Preserves your `metadata`.
* Adds a very small header that conditionally shows “Sign in” or the user block.
* `dynamic = "force-dynamic"` during testing avoids stale cache surprises. Remove later if you want.

---

# 2) Add a tiny SignOut client component

```tsx
// C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\components\SignOut.tsx
"use client";

import { createClient as createBrowserSupabase } from "@/lib/clients/supabase/client";

export default function SignOut() {
  const supabase = createBrowserSupabase();

  async function handle() {
    await supabase.auth.signOut();
    // Hard reload to ensure server layout/middleware see the new (signed-out) cookies
    window.location.replace("/");
  }

  return (
    <button onClick={handle} className="border px-3 py-1 rounded hover:bg-gray-50">
      Sign out
    </button>
  );
}
```

No assumptions: uses **your** browser client factory.

---

# 3) Minimal home page (unchanged if you already have one)

```tsx
// C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\page.tsx
export default function Page() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Home</h1>
      <p>If you’re logged in, your email shows in the header; otherwise you’ll see “Sign in”.</p>
    </div>
  );
}
```

If you already have an `app/page.tsx`, you can keep it; this is just for visual confirmation.

---

# 4) Login page with **Google OAuth only** (as requested)

```tsx
// C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\login\page.tsx
"use client";

import { useState } from "react";
import { createClient as createBrowserSupabase } from "@/lib/clients/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserSupabase();

  async function signInWithGoogle() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/auth/callback`,
          // If you need scopes: scopes: "email profile openid"
        },
      });
      if (error) {
        // This usually logs to console — visible in devtools
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm p-6 border rounded space-y-4">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <button
        onClick={signInWithGoogle}
        disabled={loading}
        className="w-full border px-3 py-2 rounded hover:bg-gray-50"
      >
        {loading ? "Redirecting…" : "Continue with Google"}
      </button>
    </div>
  );
}
```

**I don’t know** if you have already enabled Google in your Supabase project or whitelisted the callback URL. If not: enable **Google** provider in Supabase Auth and allow `http://localhost:3000/auth/callback` (and your production URL later).

---

# 5) OAuth callback to **exchange the code for a session** (server route)

```ts
// C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\auth\callback\route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient as createServerSupabase } from "@/lib/clients/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const redirect = new URL("/", url.origin);

  const cookieStore = cookies();
  const supabase = createServerSupabase(cookieStore);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // You can pass this to UI if you want
      redirect.searchParams.set("error", "oauth_failed");
    }
  }

  return NextResponse.redirect(redirect);
}
```

This writes the session cookies so your `layout.tsx` can see the logged-in user.

---

# 6) Use your existing middleware helper to keep sessions fresh

```ts
// C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\middleware.ts
import { type NextRequest } from "next/server";
import { createClient as createMiddlewareSupabase } from "@/lib/clients/supabase/middleware";

// This pass-through keeps Supabase auth cookies refreshed for SSR.
// It does not block any route yet.
export async function middleware(request: NextRequest) {
  return createMiddlewareSupabase(request);
}

// Adjust matcher if needed. For initial testing, refresh on (almost) all routes.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

This uses **your** `lib/clients/supabase/middleware.ts` verbatim, only calling it from root `middleware.ts`.

---

## Test Checklist (repeatable, visual)

1. `npm run dev`
2. Visit `http://localhost:3000/` → header shows **Sign in**.
3. Click **Sign in** → `/login` → click **Continue with Google**.
4. Finish Google → you’re redirected to `/`.
5. Header shows **your avatar (if Google gives one) + your email + Sign out**.
6. Click **Sign out** → back to anonymous header.

If any step fails, tell me **which step number** and the exact message/URL you see. If the Google button loops or errors, it’s almost always the **redirect URL not whitelisted** in Supabase or Google console.

---

## Precise notes vs assumptions

* ✅ I used **your** server/browser/middleware client factories and paths.
* ✅ I preserved **your** layout metadata and only added header + user detection.
* ✅ I limited auth to **Google OAuth only** (as you asked).
* ❓ I don’t know if Google is already configured in your Supabase project. If not, enable it and add `http://localhost:3000/auth/callback` to allowed redirects.
* ❓ I don’t know your Tailwind setup; I used plain classes that won’t break if Tailwind isn’t present.
* ❓ I don’t know if you plan to guard `/app/*` yet; this middleware only refreshes sessions (no blocking).

---

## Next tiny step (only after this works)

* Gate `/app/*` and redirect anonymous users to `/login`.
* Then add your **first RLS table** with `user_id uuid default auth.uid()` and owner-only policies.

---

## TL;DR

* I merged auth state into **your** layout, kept metadata, and added a minimal header.
* Added **/login** with **Google OAuth** only, **/auth/callback** to store session, and a **SignOut** component.
* Wired your middleware helper to keep sessions refreshed.
* Run the 6-step test; if it passes, your Supabase Auth loop is solid.

Two quick clarifiers for you, Gio:

1. Is Google provider already enabled + `http://localhost:3000/auth/callback` whitelisted in your Supabase project?
2. Do you want me to lock down `/app/*` next, or add the first RLS table/policies?
