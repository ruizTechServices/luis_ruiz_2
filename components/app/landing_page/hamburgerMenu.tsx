'use client'

import { Button } from '@/components/ui/button'
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet'
import { Menu, X } from 'lucide-react'

interface HamburgerMenuProps {
  items: { label: string; href: string }[]
}

export function HamburgerMenu({ items }: HamburgerMenuProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden p-2" aria-label="Open menu">
          <Menu size={24} />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-3/4 sm:w-1/2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">24Hour-AI</h2>
          <SheetTrigger asChild>
            <Button variant="ghost" aria-label="Close menu">
              <X size={24} />
            </Button>
          </SheetTrigger>
        </div>
        <nav className="flex flex-col space-y-4">
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
