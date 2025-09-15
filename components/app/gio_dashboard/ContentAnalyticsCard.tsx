export default function ContentAnalyticsCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Content Analytics</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Track engagement, views, and performance metrics</p>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
        <div className="w-3/4 h-2 bg-blue-500 rounded-full"></div>
      </div>
    </div>
  );
}
