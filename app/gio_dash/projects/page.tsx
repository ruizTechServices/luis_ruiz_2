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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-indigo-900">
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
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            View public projects page
          </Link>
        </div>

        <ProjectEditorClient initialProjects={projects} />
      </div>
    </div>
  );
}
