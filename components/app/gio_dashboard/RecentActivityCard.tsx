const MOCK_ACTIVITY = [
  {
    title: "Homepage latest-pushes section updated",
    meta: "UI refinement · mock timeline",
  },
  {
    title: "Contacts inbox typing pass completed",
    meta: "Admin workflow · recent dev work",
  },
  {
    title: "Notion build-log sync scaffolded",
    meta: "Automation · pending cron finalization",
  },
];

export default function RecentActivityCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Recent Activity</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Mock activity feed for now, so the admin shows believable recent movement instead of empty filler.
          </p>
        </div>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          Mock
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {MOCK_ACTIVITY.map((item, index) => (
          <div
            key={item.title}
            className="flex gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/40 p-3"
          >
            <div className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {item.meta} · item {index + 1}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-3 text-xs leading-6 text-gray-500 dark:text-gray-400">
        Next refinement: replace this with a true activity stream from posts, contacts, project updates, and system actions.
      </div>
    </div>
  );
}
