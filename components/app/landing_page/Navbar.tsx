//C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\components\app\landing_page\Navbar.tsx
import Link from 'next/link'
import { HamburgerMenu } from './hamburgerMenu'
import { Button } from '@/components/ui/button'
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
    <header className="sticky top-0 z-20 bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
          Luis-Ruiz
        </Link>
        {/* I think I want to change this logo brand with the actual logo of 24hourgpt */}

        {/* Desktop nav */}
        <nav className="hidden md:flex space-x-8">
          {itemsToRender.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth actions */}
        <div className="hidden md:flex items-center gap-3">
          {!user ? (
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
