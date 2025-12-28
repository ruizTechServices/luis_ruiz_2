import 'server-only';
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import SystemHealthCard from "@/components/app/gio_dashboard/SystemHealthCard";
import ContentAnalyticsCard from "@/components/app/gio_dashboard/ContentAnalyticsCard";
import UserManagementCard from "@/components/app/gio_dashboard/UserManagementCard";
import QuickActionsCard from "@/components/app/gio_dashboard/QuickActionsCard";
import RecentActivityCard from "@/components/app/gio_dashboard/RecentActivityCard";
import SettingsConfigCard from "@/components/app/gio_dashboard/SettingsConfigCard";
import StatCard from "@/components/app/gio_dashboard/StatCard";
import { getCounts } from "@/lib/functions/dashboard/getCounts";
import { BlogCard } from "@/components/app/blog/blog_card"; // slideshow component

export default async function GioDashboard() {
  const supabase = await createServerClient();

  const { posts: postsCount, comments: commentsCount, votes: votesCount, errors } =
    await getCounts(supabase);
  if (errors.length) console.error("Supabase count errors:", errors);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-indigo-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Gio Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Your command center for ruizTechServices and luis-ruiz.com
          </p>
        </div>

        {/* Blog posts */}
        <div className="mt-6 w-1/2">
          <h2 className="text-2xl font-bold mb-4">Blog Posts</h2>
          <BlogCard />
        </div>

        {/* Stats Cards */}
        <div className="my-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="text-2xl font-bold">Stats</h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">Live snapshot of site activity</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Posts"
              value={postsCount}
              icon={
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              iconBgClassName="bg-blue-100 dark:bg-blue-900"
            />
            <StatCard
              title="Comments"
              value={commentsCount}
              icon={
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              }
              iconBgClassName="bg-green-100 dark:bg-green-900"
            />
            <StatCard
              title="Total Votes"
              value={votesCount}
              icon={
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              }
              iconBgClassName="bg-purple-100 dark:bg-purple-900"
            />
          </div>
        </div>
        
        <div className="my-10"><hr /></div>
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <ContentAnalyticsCard />
          <UserManagementCard />
          <QuickActionsCard />
          <SystemHealthCard />
          <RecentActivityCard />
          <SettingsConfigCard />
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-red-700 dark:text-red-300 font-medium">
                Encountered errors fetching counts
              </p>
            </div>
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">
              Check server logs for details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
