//C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import NavBar from "@/components/app/landing_page/Navbar";
import { NavbarSkeleton } from "@/components/app/landing_page/NavbarSkeleton";
import { items } from "@/components/app/landing_page/navbarItems";
import Footer from "@/components/app/landing_page/footer";
import { Analytics } from "@vercel/analytics/next";
import { BackToTop } from "@/components/ui/back-to-top";

export const metadata: Metadata = {
  title: "Luis Ruiz: your Tech Partner!",
  description: "A portfolio website for Luis Ruiz",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<NavbarSkeleton items={items} />}>
          <NavBar items={items} />
        </Suspense>
        {children}
        <Analytics />
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
