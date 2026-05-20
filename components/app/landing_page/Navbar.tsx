//C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\components\app\landing_page\Navbar.tsx
import Link from 'next/link'
import Image from 'next/image'
import { HamburgerMenu } from './hamburgerMenu'
import { SignOut } from '@/components/app/landing_page'
import { createClient as createServerSupabase } from '@/lib/clients/supabase/server'
import { isOwner } from '@/lib/auth/ownership'

export interface NavItem {
  label: string
  href: string
}

interface NavBarProps {
  items: NavItem[]
}

export default async function NavBar({ items }: NavBarProps) {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  const user = data?.user ?? null;
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const avatarUrl = typeof meta.avatar_url === 'string' ? (meta.avatar_url as string) : undefined;
  const email = user?.email ?? null;
  const owner = isOwner(email);

  // Start from provided items; hide Gio-Dash unless owner
  const base = items.filter((item) => item.href !== '/gio_dash' || owner);

  // Add a Dashboard link for any authenticated user if it's not already present
  const hasDashboard = base.some((i) => i.href === '/dashboard');
  const itemsToRender = !user || hasDashboard
    ? base
    : [...base, { label: 'Dashboard', href: '/dashboard' }];

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-slate-950/65 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-white"
        >
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-white/15 transition group-hover:ring-teal-300/40">
            <Image
              src="/images/logo_lr.png"
              alt="LR"
              width={56}
              height={56}
              priority
              className="h-7 w-7 object-contain"
            />
          </span>
          <span className="text-sm font-semibold tracking-tight text-slate-50">
            luis-ruiz.com
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {itemsToRender.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13px] font-medium text-slate-300 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth actions */}
        <div className="hidden items-center gap-3 md:flex">
          {!user ? (
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-white px-3.5 text-[13px] font-semibold text-slate-950 transition hover:bg-slate-200"
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
                  className="h-8 w-8 rounded-full ring-1 ring-white/15"
                />
              ) : null}
              <span className="max-w-[180px] truncate text-[12px] text-slate-400">
                {email}
              </span>
              <SignOut />
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <HamburgerMenu
          items={itemsToRender}
          isAuthenticated={!!user}
          avatarUrl={avatarUrl}
          email={email ?? undefined}
        />
      </div>
    </header>
  )
}
