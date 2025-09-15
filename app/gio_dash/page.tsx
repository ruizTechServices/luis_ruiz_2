import 'server-only'
import NavBar, { items } from "@/components/app/landing_page/Navbar";
import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client using service role key (server-only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_API_KEY!,
  { auth: { persistSession: false } }
);

// app/gio_dash/page.tsx

export default async function GioDashboard() {
  // Fetch counts using HEAD requests for efficiency
  const [postsRes, commentsRes, votesRes] = await Promise.all([
    supabase.from('blog_posts').select('*', { head: true, count: 'exact' }),
    supabase.from('comments').select('*', { head: true, count: 'exact' }),
    supabase.from('votes').select('*', { head: true, count: 'exact' }),
  ]);

  // Handle any errors but keep UI rendering
  const errors = [postsRes.error, commentsRes.error, votesRes.error].filter(Boolean);
  if (errors.length) {
    console.error('Supabase count errors:', errors);
  }

  const postsCount = postsRes.count ?? 0;
  const commentsCount = commentsRes.count ?? 0;
  const votesCount = votesRes.count ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-indigo-900">
      <NavBar items={items} />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Gio Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Your command center for content management and analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Posts</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{postsCount}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Comments</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{commentsCount}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Votes</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{votesCount}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Content Analytics</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Track engagement, views, and performance metrics</p>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div className="w-3/4 h-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">User Management</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Manage users, roles, and permissions</p>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Quick Actions</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Create posts, moderate content, send notifications</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-xs">New Post</button>
              <button className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full text-xs">Moderate</button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">System Health</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Monitor server status and performance</p>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">All systems operational</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Recent Activity</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Latest posts, comments, and user interactions</p>
            <div className="space-y-2">
              <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="w-4/5 h-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="w-3/5 h-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Settings & Config</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Customize your dashboard and preferences</p>
            <div className="flex gap-2">
              <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-red-700 dark:text-red-300 font-medium">Encountered errors fetching counts</p>
            </div>
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">Check server logs for details</p>
          </div>
        )}
      </div>
    </div>
  );
}
