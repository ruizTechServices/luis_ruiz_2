import "server-only";
import { ClientDashboardView } from "@/components/app/client_dashboard/ClientDashboardView";
import { isOwner } from "@/lib/auth/ownership";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = await createServerClient();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;

  if (!user) {
    redirect("/login");
  }

  if (isOwner(user.email)) {
    redirect("/gio_dash");
  }

  return <ClientDashboardView userEmail={user.email} />;
}
