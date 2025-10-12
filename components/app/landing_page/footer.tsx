import Link from "next/link";
import { items } from "./navbarItems";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} <Link href="https://ruizTechServices.com">ruizTechServices,LLC.</Link><span className="text-primary"> All rights reserved.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
