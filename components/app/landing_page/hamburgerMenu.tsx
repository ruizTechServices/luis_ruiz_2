'use client'

import { Button } from '@/components/ui/button'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

interface HamburgerMenuProps {
  items: { label: string; href: string }[]
}

export function HamburgerMenu({ items }: HamburgerMenuProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="default" className="md:hidden p-2" aria-label="Open menu">
          <Menu size={30} />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-3/4 sm:w-1/2">
        <SheetHeader className="m-2">
          <SheetTitle className="text-lg font-bold">
            Luis Ruiz: Full-Stack Developer
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-4 p-6">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-lg font-medium text-gray-700 hover:text-gray-900"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
