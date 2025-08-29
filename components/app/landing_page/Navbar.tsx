import Link from 'next/link'
import { HamburgerMenu } from './hamburgerMenu'
import { Button } from '@/components/ui/button'

export interface NavItem {
  label: string
  href: string
}

interface NavBarProps {
  items: NavItem[]
}

export default function NavBar({ items }: NavBarProps) {
  return (
    <header className="sticky top-0 z-20 bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
          24Hour-AI
        </Link>
        {/* I think I want to change this logo brand with the actual logo of 24hourgpt */}

        {/* Desktop nav */}
        <nav className="hidden md:flex space-x-8">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Call to action */}
        <div className="hidden md:block">
          <Button asChild>
            <Link href="/">Get Started</Link>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <HamburgerMenu items={items} />
      </div>
    </header>
  )
}
