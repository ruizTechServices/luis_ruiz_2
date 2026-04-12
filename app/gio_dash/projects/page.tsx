import "server-only";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import { isOwner } from "@/lib/auth/ownership";
import { getProjects } from "@/lib/db/projects";
import ProjectEditorClient from "./ProjectEditorClient";

export default async function ProjectAdminPage() {
  const supabase = await createServerClient();
  const { data: userRes } = await supabase.auth.getUser();
  const email = userRes?.user?.email;

  if (!email) redirect("/login");
  if (!isOwner(email)) redirect("/dashboard");

  const projects = await getProjects().catch(() => []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(191,219,254,0.34),_transparent_26%),linear-gradient(135deg,_#eef4f8_0%,_#dde7f0_40%,_#d6e3ec_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.16),_transparent_26%),linear-gradient(135deg,_#0f172a_0%,_#182334_42%,_#1d2938_100%)]">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Project Admin
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-gray-600 dark:text-gray-300">
              Create and edit project entries as actual case studies, not just links. This is where the richer project model becomes usable.
            </p>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center justify-center rounded-lg border border-white/30 bg-white/55 px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_16px_35px_rgba(148,163,184,0.18)] backdrop-blur-xl transition hover:bg-white/70 dark:border-white/10 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/15"
          >
            View public projects page
          </Link>
        </div>

        <ProjectEditorClient initialProjects={projects} />
      </div>
    </div>
  );
}
