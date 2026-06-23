import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import OllamaChatPage from "./OllamaChatClient";

export const metadata: Metadata = {
  title: "Ollama | Luis Ruiz",
  description: "Local Ollama chat surface.",
};

export default function ExperimentsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="ss-container flex flex-col gap-6 py-10">
        <section className="flex flex-col gap-4 border-b pb-6">
          <h1 className="text-3xl font-semibold tracking-normal">Ollama</h1>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/ollama/history">History</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/round-robin">Round Robin</Link>
            </Button>
          </div>
        </section>

        <OllamaChatPage />
      </div>
    </main>
  );
}
