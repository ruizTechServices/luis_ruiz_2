import type { Metadata } from "next";
import About from "@/components/app/landing_page/about";

export const metadata: Metadata = {
  title: "About | Luis Ruiz",
  description:
    "Background, direction, and technical focus for Luis Ruiz and ruizTechServices.",
};

export default function AboutPage() {
  return <About />;
}
