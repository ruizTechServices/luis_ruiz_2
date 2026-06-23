import type { Metadata } from "next";
import Link from "next/link";
import Project from "@/components/app/projects/project";
import { getProjects } from "@/lib/db/projects";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Projects | Luis Ruiz",
  description:
    "Case-study style projects, software experiments, and proof-of-work from Luis Ruiz, founder-builder behind ruizTechServices.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  const featuredProjects = projects.filter((project) => project.featured);

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b py-10">
        <div className="ss-container">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold tracking-normal">Projects</h1>
            <p className="text-sm text-muted-foreground">
              {featuredProjects.length} featured / {projects.length} total
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href="/blog">Blog</Link>
              </Button>
              <Button asChild>
                <Link href="/contact">Contact</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="ss-container">
          {projects.length > 0 ? (
            <div className="grid gap-6">
              {projects.map((project) => (
                <Project key={project.id} {...project} />
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed p-10 text-center text-muted-foreground">
              No projects are published yet.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
