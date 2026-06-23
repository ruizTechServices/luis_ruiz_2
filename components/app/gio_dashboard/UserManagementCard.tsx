import {
  DashboardCard,
  DashboardStatusBadge,
  dashboardItemClassName,
} from "@/components/design-system/DashboardPrimitives";

const MOCK_USERS = [
  { name: "Luis Ruiz", role: "Owner", status: "Active" },
  { name: "Future admin seat", role: "Admin", status: "Placeholder" },
  { name: "Client portal user", role: "Client", status: "Planned" },
];

export default function UserManagementCard() {
  return (
    <DashboardCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">User Management</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Mock admin placeholder for users, roles, and permissions until the real server-side flow is built.
          </p>
        </div>
        <DashboardStatusBadge tone="violet">Mock</DashboardStatusBadge>
      </div>

      <div className="mt-5 space-y-3">
        {MOCK_USERS.map((user) => (
          <div key={user.name} className={`${dashboardItemClassName} flex items-center justify-between gap-3`}>
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{user.name}</p>
              <p className="text-xs text-[var(--color-text-subtle)]">{user.role}</p>
            </div>
            <DashboardStatusBadge>{user.status}</DashboardStatusBadge>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div className={dashboardItemClassName}>
          <p className="text-[var(--color-text-subtle)]">Planned roles</p>
          <p className="mt-1 font-semibold text-[var(--color-text-primary)]">Owner, Admin, Client</p>
        </div>
        <div className={dashboardItemClassName}>
          <p className="text-[var(--color-text-subtle)]">Next step</p>
          <p className="mt-1 font-semibold text-[var(--color-text-primary)]">SSR + auth-backed controls</p>
        </div>
      </div>
    </DashboardCard>
  );
}
