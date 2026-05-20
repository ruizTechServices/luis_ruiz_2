# 004 — Dashboard Projects, Leads, and Money

Status: Implemented on 2026-05-20.

Post-implementation note: the spec 003 live Supabase migration gap was resolved on 2026-05-20 before spec 005. The live dashboard tables now exist; projects, leads, and money entries are currently true empty datasets until operational records are added.

## Goal

Wire the owner dashboard to real operational data for:

```txt
Projects
Leads
Money / P&L snapshot
```

This builds on the data layer from spec 003.

## Files To Inspect First

```txt
app/gio_dash/page.tsx
components/app/master_dashboard/*
lib/functions/master-dashboard/*
app/api/dashboard/projects/route.ts
app/api/dashboard/leads/route.ts
app/api/dashboard/money/route.ts
```

## Required UI Updates

Update these cards to use real data:

```txt
ActiveProjectsCard
OpenLeadsCard
RevenueSnapshotCard
TodayFocusCard
```

## Data Requirements

### ActiveProjectsCard

Show:

```txt
name
status
priority
next_action
repo_url/live_url if present
last_touched_at if present
```

Sort roughly by:

```txt
priority asc, last_touched_at desc nulls last, created_at desc
```

Limit on overview page:

```txt
5 active projects
```

Statuses considered active:

```txt
idea
validated
building
testing
shipped
selling
```

Exclude:

```txt
paused
archived
```

### OpenLeadsCard

Show:

```txt
name/business_name
status
budget
next_follow_up_at
problem summary
```

Limit:

```txt
5 open leads
```

Open statuses:

```txt
new
contacted
qualified
proposal_sent
deposit_paid
in_progress
```

### RevenueSnapshotCard

Calculate from `dashboard_money_entries`:

```txt
income total
expense total
net total
expected revenue from open leads/projects if available
```

At minimum:

```txt
Total income
Total expenses
Net
Open opportunity value
```

### TodayFocusCard

Use actual data where possible:

- top priority active project
- soonest lead follow-up
- latest active decision if available

Fallback to useful empty states.

## Empty State Rules

Empty states should be useful, not dead.

Example:

```txt
No leads yet. Add leads through the dashboard API or future lead form integration.
```

## Optional Section Pages

If time permits, create read-only section pages:

```txt
app/gio_dash/projects/page.tsx
app/gio_dash/leads/page.tsx
app/gio_dash/money/page.tsx
```

These can be simple lists/tables.

Do not overbuild forms unless the API is already ready.

## Mutation Scope

If implementing create forms, keep them minimal.

Allowed:

```txt
add project
add lead
add money entry
```

Not required:

```txt
full edit modal system
bulk operations
drag/drop Kanban
advanced filtering
```

## Do Not Touch

- public homepage
- Nucleus
- round-robin
- Ollama
- payments
- auth provider logic

## Acceptance Criteria

- `/gio_dash` displays real data where available.
- Cards have useful empty states.
- No private data leaks publicly.
- API routes remain owner-only.
- Build passes or issues documented.
- `context/progress-tracker.md` updated.

## Required Checks

```bash
npm run build
```

Also run lint if the changed files are substantial:

```bash
npm run lint
```

## Progress Tracker Update

Next recommended spec:

```txt
005-system-links-and-decisions.md
```
