const MOCK_USERS = [
  {
    name: "Luis Ruiz",
    role: "Owner",
    status: "Active",
  },
  {
    name: "Future admin seat",
    role: "Admin",
    status: "Placeholder",
  },
  {
    name: "Client portal user",
    role: "Client",
    status: "Planned",
  },
];

export default function UserManagementCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">User Management</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Mock admin placeholder for users, roles, and permissions so this slot stays intentional until the real server-side management flow is built.
          </p>
        </div>
        <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300">
          Mock
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {MOCK_USERS.map((user) => (
          <div
            key={user.name}
            className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/40 p-3"
          >
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-gray-600 shadow-sm dark:bg-gray-800 dark:text-gray-300">
              {user.status}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          <p className="text-gray-500 dark:text-gray-400">Planned roles</p>
          <p className="mt-1 font-semibold text-gray-900 dark:text-white">Owner, Admin, Client</p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          <p className="text-gray-500 dark:text-gray-400">Next step</p>
          <p className="mt-1 font-semibold text-gray-900 dark:text-white">SSR + auth-backed controls</p>
        </div>
      </div>
    </div>
  );
}
