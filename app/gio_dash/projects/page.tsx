import "server-only";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import { isOwner } from "@/lib/auth/ownership";
import { getProjects } from "@/lib/db/projects";
import { Button } from "@/components/ui/button";
import {
  DashboardPageHeader,
  DashboardPageShell,
} from "@/components/design-system/DashboardPrimitives";
import ProjectEditorClient from "./ProjectEditorClient";

export default async function ProjectAdminPage() {
  const supabase = await createServerClient();
  const { data: userRes } = await supabase.auth.getUser();
  const email = userRes?.user?.email;

  if (!email) redirect("/login");
  if (!isOwner(email)) redirect("/dashboard");

  const projects = await getProjects().catch(() => []);

  return (
    <DashboardPageShell>
      <DashboardPageHeader
        title="Project Admin"
        description="Create and edit project entries as actual case studies, not just links. This is where the richer project model becomes usable."
        actions={
          <Button asChild variant="outline">
            <Link href="/projects">View public projects page</Link>
          </Button>
        }
      />

      <ProjectEditorClient initialProjects={projects} />
    </DashboardPageShell>
  );
}
