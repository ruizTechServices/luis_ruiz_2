//C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\components\app\landing_page\hamburgerMenu.tsx
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { SignOut } from '@/components/app/landing_page'

interface HamburgerMenuProps {
  items: { label: string; href: string }[]
  isAuthenticated: boolean
  avatarUrl?: string
  email?: string
}

export function HamburgerMenu({ items, isAuthenticated, avatarUrl, email }: HamburgerMenuProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="default" className="md:hidden p-2" aria-label="Open menu">
          <Menu size={30} />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="sm:w-1/2">
        <SheetHeader className="m-2">
          <SheetTitle className="text-lg font-bold">
            Luis Ruiz: Full-Stack Developer
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col justify-between">
          <nav className="flex flex-col space-y-4 px-6 py-6">
            {items.map((item) => (
              <SheetClose asChild key={item.href}>
                <Link
                  href={item.href}
                  className="text-lg font-medium text-gray-700 hover:text-gray-900"
                >
                  {item.label}
                </Link>
              </SheetClose>
            ))}
          </nav>

          <div className="border-t border-gray-200 px-6 py-4">
            {!isAuthenticated ? (
              <Button asChild className="w-full">
                <Link href="/login">Sign in</Link>
              </Button>
            ) : (
              <div className="flex flex-col gap-3">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="avatar" className="h-10 w-10 rounded-full border" />
                ) : null}
                {email ? <span className="text-sm text-gray-600">{email}</span> : null}
                <SignOut className="w-full" />
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
