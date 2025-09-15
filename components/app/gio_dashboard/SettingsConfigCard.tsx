export default function SettingsConfigCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Settings & Config</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Customize your dashboard and preferences</p>
      <div className="flex gap-2">
        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="w-4 h-4 bg-blue-500 rounded"></div>
      </div>
    </div>
  );
}
