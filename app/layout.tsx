//C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/app/landing_page/Navbar";
import { items } from "@/components/app/landing_page/navbarItems";
import Footer from "@/components/app/landing_page/footer";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "Luis Ruiz: your Tech Partner!",
  description: "A portfolio website for Luis Ruiz",
};

// Ensure auth-aware UI (Navbar) is rendered per-request in production
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NavBar items={items} />
        {children}
        <Analytics />
        <Footer />
      </body>
    </html>
  );
}
