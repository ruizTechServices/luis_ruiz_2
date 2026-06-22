"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/design-system/Logo";

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
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-canvas)]">
      <div className="ss-container flex flex-col gap-8 py-10 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xl text-sm leading-6 text-[var(--color-text-secondary)]">
            Luis Ruiz builds practical web systems, internal tools, and private AI infrastructure through ruizTechServices LLC.
          </p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-3">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="ss-container flex flex-col gap-2 border-t border-[var(--color-border)] py-5 font-technical text-[0.6rem] uppercase tracking-[0.08em] text-[var(--color-text-subtle)] sm:flex-row sm:items-center sm:justify-between">
        <span>2026 Luis Ruiz / ruizTechServices LLC</span>
        <span>Built as a living system</span>
      </div>
    </footer>
  );
}
