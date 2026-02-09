import Link from 'next/link'
import type { NavItem } from './navbarItems'

interface NavbarSkeletonProps {
  items: NavItem[]
}

export function NavbarSkeleton({ items }: NavbarSkeletonProps) {
  return (
    <header className="sticky top-0 z-20 bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center space-x-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Luis-Ruiz
        </Link>
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
        <div className="hidden md:flex items-center gap-3">
          <div className="h-9 w-16 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
    </header>
  )
}
