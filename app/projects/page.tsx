// https://ruiztechgroq.replit.app/
// https://ragbot.replit.app/
// https://chatbot-with-browser-and-rag.replit.app/
//https://agent-ai-practice-giovanniruiz5.replit.app/
import Project from "@/components/app/projects/project";
import { getProjects } from "@/lib/db/projects";

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <>
      <main className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold mb-2">Projects</h1>
        <p className="text-gray-600 mb-10">Interactive demos embedded below.</p>
        <hr className="mb-10 h-px border border-gray-200"/>
        <div className="space-y-6">
          {projects.map((p) => (
            <Project
              key={p.url}
              url={p.url}
              title={p.title ?? undefined}
              description={p.description ?? undefined}
            />
          ))}
        </div>
      </main>
    </>
  );
}