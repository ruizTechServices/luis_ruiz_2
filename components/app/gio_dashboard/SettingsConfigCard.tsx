const MOCK_SETTINGS = [
  {
    label: "Admin surface mode",
    value: "Builder view",
  },
  {
    label: "Default content visibility",
    value: "Public-first",
  },
  {
    label: "Build log sync",
    value: "Enabled",
  },
];

export default function SettingsConfigCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Settings & Config</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Mock config summary for now, so this card communicates real dashboard intent instead of sitting there as dead decoration.
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
          Mock
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {MOCK_SETTINGS.map((setting) => (
          <div
            key={setting.label}
            className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/40 p-3"
          >
            <p className="text-sm text-gray-600 dark:text-gray-300">{setting.label}</p>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{setting.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="h-3 rounded-full bg-slate-300 dark:bg-slate-600" />
        <div className="h-3 rounded-full bg-slate-300 dark:bg-slate-600" />
        <div className="h-3 rounded-full bg-blue-500" />
      </div>

      <p className="mt-4 text-xs leading-6 text-gray-500 dark:text-gray-400">
        Next refinement: connect this card to actual dashboard preferences, sync settings, and feature toggles.
      </p>
    </div>
  );
}
