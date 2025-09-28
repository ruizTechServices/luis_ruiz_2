// C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\components\app\landing_page\NavbarClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { HamburgerMenu } from "./hamburgerMenu";
import { Button } from "@/components/ui/button";
import SignOut from "@/app/components/SignOut";
import { createClient as createBrowserSupabase } from "@/lib/clients/supabase/client";

export interface NavItem {
  label: string;
  href: string;
}

interface NavBarProps {
  items: NavItem[];
}

export default function NavBarClient({ items }: NavBarProps) {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [email, setEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      const user = data?.user ?? null;
      setEmail(user?.email ?? null);
      setAvatarUrl((user?.user_metadata as any)?.avatar_url as string | undefined);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user ?? null;
      setEmail(user?.email ?? null);
      setAvatarUrl((user?.user_metadata as any)?.avatar_url as string | undefined);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const isSignedIn = !!email;

  return (
    <header className="sticky top-0 z-20 bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
        >
          Luis-Ruiz
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex space-x-8">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="text-gray-600 hover:text-gray-900 font-medium">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth actions */}
        <div className="hidden md:flex items-center gap-3">
          {!isSignedIn ? (
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="avatar" className="h-8 w-8 rounded-full border" />
              ) : null}
              <span className="text-sm text-gray-600">{email}</span>
              <SignOut />
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <HamburgerMenu items={items} />
      </div>
    </header>
  );
}
