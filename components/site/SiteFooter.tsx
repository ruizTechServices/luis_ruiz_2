"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const footerLinks = [
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "Dashboard", href: "/dashboard" },
];

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname?.startsWith("/gio_dash") || pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="border-t bg-background">
      <div className="ss-container flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">Luis Ruiz</p>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-3">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="ss-container border-t py-4 text-xs text-muted-foreground">
        <span>2026 Luis Ruiz / ruizTechServices LLC</span>
      </div>
    </footer>
  );
}
