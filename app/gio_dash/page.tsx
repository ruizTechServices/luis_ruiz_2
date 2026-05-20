import "server-only";
import { MasterDashboardView } from "@/components/app/master_dashboard/MasterDashboardView";
import { isOwner } from "@/lib/auth/ownership";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import { redirect } from "next/navigation";

export default async function GioDashboardPage() {
  const supabase = await createServerClient();
  const { data: userRes } = await supabase.auth.getUser();
  const email = userRes?.user?.email;

  if (!email) {
    redirect("/login");
  }
  if (!isOwner(email)) {
    redirect("/dashboard");
  }

  return <MasterDashboardView />;
}
