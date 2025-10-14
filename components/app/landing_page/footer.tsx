import Link from "next/link";
import { items } from "./navbarItems";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
        <div className="flex flex-col gap-6 sm:gap-8 md:flex-row md:items-center md:justify-between">
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-3 sm:gap-x-6 text-sm sm:text-base text-muted-foreground order-2 md:order-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground active:text-foreground touch-manipulation min-h-[44px] flex items-center"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs sm:text-sm text-muted-foreground text-center md:text-right order-1 md:order-2">
            &copy; {new Date().getFullYear()}{" "}
            <Link 
              href="https://ruizTechServices.com"
              className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              ruizTechServices, LLC.
            </Link>
            <span className="text-primary"> All rights reserved.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
