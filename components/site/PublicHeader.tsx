"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/design-system/Logo";
import { ThemeToggle } from "@/components/design-system/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const publicNav = [
  { label: "Work", href: "/projects" },
  { label: "Services", href: "/contact" },
  { label: "Writing", href: "/blog" },
  { label: "About", href: "/about" },
];

function navClass(active: boolean) {
  return cn(
    "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground",
    active && "text-foreground"
  );
}

export function PublicHeader() {
  const pathname = usePathname();

  if (pathname?.startsWith("/gio_dash") || pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <header className="border-b bg-background">
      <div className="ss-container flex min-h-14 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Primary navigation" className="hidden items-center gap-1 md:flex">
          {publicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={navClass(pathname === item.href)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open navigation menu">
                <Menu className="size-4" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile navigation" className="mt-8 grid gap-2">
                {publicNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-md border px-4 py-3 text-sm font-medium text-foreground",
                      pathname === item.href && "bg-muted"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
