import { MasterHero } from "@/components/app/home/MasterHero";
import { PublicStatusPanel } from "@/components/app/home/PublicStatusPanel";
import { ServiceCards } from "@/components/app/home/ServiceCards";
import { SystemsOverview } from "@/components/app/home/SystemsOverview";
import { FeaturedProjects } from "@/components/app/home/FeaturedProjects";
import { CaseStudyPreview } from "@/components/app/home/CaseStudyPreview";
import { HomeCTA } from "@/components/app/home/HomeCTA";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <MasterHero />
      <PublicStatusPanel />
      <ServiceCards />
      <SystemsOverview />
      <FeaturedProjects />
      <CaseStudyPreview />
      <HomeCTA />
    </main>
  );
}
