
// https://ruiztechgroq.replit.app/
// https://ragbot.replit.app/
// https://chatbot-with-browser-and-rag.replit.app/
//https://agent-ai-practice-giovanniruiz5.replit.app/
import NavBar from "@/components/app/landing_page/Navbar";
import { items } from "@/components/app/landing_page/Navbar";

export default function ProjectsPage() {
  return (
    <>
    <NavBar items={items} />
    <main className="container mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-4">Projects</h1>
      <p className="text-gray-600">Showcase coming soon.</p>
    </main>
    </>
  );
}