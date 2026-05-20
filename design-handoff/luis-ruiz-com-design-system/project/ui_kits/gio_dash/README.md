# /gio_dash — owner command center UI kit

Hi-fi recreation of the private owner dashboard at `/gio_dash`, based on `components/app/master_dashboard/*` from [`ruizTechServices/luis_ruiz_2 @ GioClaw-Edit`](https://github.com/ruizTechServices/luis_ruiz_2/tree/GioClaw-Edit).

This kit recreates the **command-center shell**: header, 3-column KPI row, today/quick-actions row, system links + decisions, content queue + AI tools. Sidebar navigation is added on top of the live layout to demonstrate the canonical "shell" pattern documented in the design brief (`app shell + sidebar nav + top command bar`).

## Components

- `<Sidebar />` — owner navigation column
- `<TopBar />` — command-K affordance, today date, environment chip
- `<DashboardHeader />` — owner badge, h1, date card
- `<RevenueSnapshotCard />` — 3-metric stack
- `<OpenLeadsCard />` — empty-state pattern
- `<ActiveProjectsCard />` — list with status pill per row
- `<TodayFocusCard />` — primary focus / next action / blockers stack
- `<QuickActionsPanel />` — 4-up action grid
- `<SystemLinksCard />` — 2-col internal + external links
- `<DecisionsLogCard />` — decision history with status
- `<ContentQueueCard />` — blog post pipeline
- `<AiToolsCard />` — Ollama / Round-robin / Nucleus
- `<SystemHealthCard />` — per-provider status

## Sources of truth

- `components/app/master_dashboard/MasterDashboardView.tsx` (composition)
- `components/app/master_dashboard/dashboard-seed-data.ts` (seed copy)
- `components/app/master_dashboard/TodayFocusCard.tsx` etc.
