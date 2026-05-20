import Link from 'next/link'
import Image from 'next/image'
import type { NavItem } from './navbarItems'

interface NavbarSkeletonProps {
  items: NavItem[]
}

export function NavbarSkeleton({ items }: NavbarSkeletonProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-slate-950/65 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-white">
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-white/15">
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
        <nav className="hidden items-center gap-7 md:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13px] font-medium text-slate-300 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <div className="h-9 w-20 animate-pulse rounded-md bg-white/10" />
        </div>
      </div>
    </header>
  )
}
