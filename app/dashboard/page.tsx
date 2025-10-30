  //C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\dashboard\page.tsx
  import 'server-only';
  import { createClient as createServerClient } from "@/lib/clients/supabase/server";
  import { redirect } from "next/navigation";
  import { getCounts } from "@/lib/functions/dashboard/getCounts";
  import { isOwner } from "@/lib/auth/ownership";
  import BlogUpdates from "@/components/app/user_dash/blog_updates";

  export default async function Dashboard() {
    const supabase = await createServerClient();
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;

    if (!user) {
      redirect("/login");
    }

    // Route owner to Gio-only dashboard
    if (isOwner(user.email)) {
      redirect("/gio_dash");
    }

    // Fetch counts (can be further scoped per-tenant using user.id/org later)
    const { errors } = await getCounts(supabase);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-indigo-900">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Welcome userName{user?.email ? `, ${user.email}` : ''}. Your personalized overview.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            {/* put stuff here this is the header */}
             <BlogUpdates limit={10} />

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* put stuff here this is the body */}
          </div>

          {errors.length > 0 && (
            <div className="mt-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <p className="text-red-700 dark:text-red-300 font-medium">Encountered errors fetching counts</p>
            </div>
          )}
        </div>
      </div>
    );
  }
