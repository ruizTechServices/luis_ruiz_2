const MOCK_METRICS = [
  {
    label: "Weekly page views",
    value: "1,284",
    delta: "+12%",
    tone: "text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "Avg. blog read depth",
    value: "63%",
    delta: "+4%",
    tone: "text-blue-600 dark:text-blue-400",
  },
  {
    label: "Contact conversion",
    value: "3.8%",
    delta: "mock",
    tone: "text-violet-600 dark:text-violet-400",
  },
];

export default function ContentAnalyticsCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Content Analytics</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Mock performance snapshot for now, so this card stays useful while the real analytics layer is still being wired.
          </p>
        </div>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
          Mock
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {MOCK_METRICS.map((metric) => (
          <div key={metric.label} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50/80 dark:bg-gray-900/40">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{metric.label}</p>
              <span className={`text-xs font-semibold ${metric.tone}`}>{metric.delta}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-3 text-xs leading-6 text-gray-500 dark:text-gray-400">
        Next refinement: connect this card to real blog views, project clicks, and contact conversion events.
      </div>
    </div>
  );
}
