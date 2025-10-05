import 'server-only';
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import { redirect } from "next/navigation";
import StatCard from "@/components/app/gio_dashboard/StatCard";
import ContentAnalyticsCard from "@/components/app/gio_dashboard/ContentAnalyticsCard";
import RecentActivityCard from "@/components/app/gio_dashboard/RecentActivityCard";
import { getCounts } from "@/lib/functions/dashboard/getCounts";
import { isOwner } from "@/lib/auth/ownership";

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
  const { posts, comments, votes, errors } = await getCounts(supabase);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-indigo-900">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome{user?.email ? `, ${user.email}` : ''}. Your personalized overview.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          <StatCard
            title="Total Posts"
            value={posts}
            icon={
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            iconBgClassName="bg-blue-100 dark:bg-blue-900"
          />
          <StatCard
            title="Comments"
            value={comments}
            icon={
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
            iconBgClassName="bg-green-100 dark:bg-green-900"
          />
          <StatCard
            title="Total Votes"
            value={votes}
            icon={
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A 2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            }
            iconBgClassName="bg-purple-100 dark:bg-purple-900"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ContentAnalyticsCard />
          <RecentActivityCard />
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

