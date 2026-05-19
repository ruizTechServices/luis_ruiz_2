# 002 — Owner Dashboard Shell

## Goal

Refactor `/gio_dash` from a general admin-card page into Gio's private command center shell.

This spec is about layout and shell composition, not full database persistence.

## Current State

`app/gio_dash/layout.tsx` already protects the route using Supabase auth and owner authorization.

`app/gio_dash/page.tsx` currently renders:

- title/header
- blog post slideshow
- stats cards
- existing admin cards
- contacts inbox

Keep useful existing cards available, but reorganize the dashboard into a command-center layout.

## Required Result

`/gio_dash` should display a clear owner dashboard:

```txt
Gio Command Center
Today Focus
Revenue Snapshot
Open Leads
Active Projects
Quick Actions
System Links
Decisions Log
Content Queue
AI Tools
```

This first shell can use placeholder/static data where persistence does not exist yet. Real data comes in later specs.

## Files To Inspect First

```txt
app/gio_dash/layout.tsx
app/gio_dash/page.tsx
components/app/gio_dashboard/*
components/app/blog/blog_card.tsx
lib/functions/dashboard/getCounts.ts
lib/auth/ownership.ts
lib/clients/supabase/server.ts
```

## Files To Create

```txt
components/app/master_dashboard/MasterDashboardView.tsx
components/app/master_dashboard/DashboardHeader.tsx
components/app/master_dashboard/TodayFocusCard.tsx
components/app/master_dashboard/RevenueSnapshotCard.tsx
components/app/master_dashboard/OpenLeadsCard.tsx
components/app/master_dashboard/ActiveProjectsCard.tsx
components/app/master_dashboard/QuickActionsPanel.tsx
components/app/master_dashboard/SystemLinksCard.tsx
components/app/master_dashboard/DecisionsLogCard.tsx
components/app/master_dashboard/ContentQueueCard.tsx
components/app/master_dashboard/AiToolsCard.tsx
components/app/master_dashboard/types.ts
```

Optional:

```txt
components/app/master_dashboard/dashboard-seed-data.ts
```

Use this only for temporary shell/demo data.

## Files To Modify

```txt
app/gio_dash/page.tsx
```

Do not remove `app/gio_dash/layout.tsx` owner protection.

## Preferred Page Shape

`app/gio_dash/page.tsx` should become a thin server component.

Example direction:

```tsx
import "server-only";
import { MasterDashboardView } from "@/components/app/master_dashboard/MasterDashboardView";

export default async function GioDashboardPage() {
  return <MasterDashboardView />;
}
```

Because `app/gio_dash/layout.tsx` already protects the route, avoid duplicating auth checks in the page unless the current codebase requires it.

## UI Requirements

Use a serious dashboard layout:

```txt
Header
Metric cards row
Main grid
Secondary grid
```

Recommended grid:

```txt
grid grid-cols-1 lg:grid-cols-12 gap-6
```

Cards should be functional, not decorative.

## Suggested Temporary Content

### TodayFocusCard

```txt
Primary focus: Refactor luis-ruiz.com into master hub
Next action: Implement feature-spec loop
Blockers: None recorded
```

### RevenueSnapshotCard

Temporary values are okay:

```txt
Tracked revenue: $0
Open opportunity value: $0
Unpaid invoices: $0
```

Make clear these are placeholders until data layer is connected.

### OpenLeadsCard

```txt
No lead records connected yet
Next: implement dashboard_leads table
```

### ActiveProjectsCard

Seed examples:

```txt
luis-ruiz.com Master Hub
ruizTechServices
Nucleus
24HourGPT
```

### SystemLinksCard

Seed links:

```txt
luis-ruiz.com
ruizTechServices
Nucleus
GitHub repo
Supabase
Vercel
```

## Preserve Existing Cards

Do not delete old `components/app/gio_dashboard/*` components in this spec.

If some are still useful, include a "Legacy Admin Tools" or "Site Admin" section lower on the page.

Suggested preserved tools:

- QuickActionsCard
- SystemHealthCard
- ContactsInboxCard
- GithubApiTesterCard

## Do Not Touch

- database schema
- API routes
- Nucleus
- round-robin
- Ollama
- public homepage
- client dashboard

## Acceptance Criteria

- `/gio_dash` renders a clear command-center shell.
- Owner auth behavior remains intact.
- Existing useful admin tools are preserved or reachable.
- No private data is exposed outside `/gio_dash`.
- Build passes or issues are documented.
- `context/progress-tracker.md` is updated.

## Required Checks

Run:

```bash
npm run build
```

If relevant:

```bash
npm run lint
```

## Progress Tracker Update

Update:

```txt
context/progress-tracker.md
```

Next recommended spec:

```txt
003-master-dashboard-data-layer.md
```
