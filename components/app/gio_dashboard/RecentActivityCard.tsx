export default function RecentActivityCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Recent Activity</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Latest posts, comments, and user interactions</p>
      <div className="space-y-2">
        <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="w-4/5 h-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="w-3/5 h-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}
