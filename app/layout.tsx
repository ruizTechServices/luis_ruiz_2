//C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\layout.tsx
import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
