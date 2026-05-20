# 003 — Master Dashboard Data Layer

Status: Implemented on 2026-05-19.

Implementation notes:

- Migration `supabase/migrations/20260519_create_master_dashboard_tables.sql` creates `dashboard_projects`, `dashboard_leads`, `dashboard_clients`, `dashboard_money_entries`, `dashboard_decisions`, `dashboard_system_links`; adds a shared `public.set_updated_at()` trigger helper (no helper existed previously); attaches `updated_at` triggers to the five tables that carry that column; adds the indexes listed in the spec; and enables RLS with no permissive policies so these private tables are not directly readable from the browser.
- Typed contracts and read helpers live under `lib/functions/master-dashboard/`. Helpers use the existing async cookie-aware server Supabase client and accept narrow option objects rather than ad-hoc query plumbing.
- Owner-only API foundations exist at `app/api/dashboard/{projects,leads,money,decisions,system-links}/route.ts`. Each route uses `requireOwnerClient` for 401/403 enforcement, exposes `GET`, and exposes a Zod-validated `POST` for inserts.
- `dashboard_clients` has no API route in this pass because the spec listed routes for projects/leads/money/decisions/system-links only. The clients table is otherwise complete and readable from server-side code.
- The MasterDashboard UI shell still renders static seed data; wiring real reads into `MasterDashboardView` is intentionally deferred to `004-dashboard-projects-leads-money.md` per the spec direction "It should not redesign UI beyond wiring minimal reads if safe."
- `npm run build` passes with all five new dashboard API routes appearing in the route map.

## Goal

Create the Supabase-backed data layer for the owner command center.

This spec adds persistence. It should not redesign UI beyond wiring minimal reads if safe.

## Required Tables

Create a Supabase migration for:

```txt
dashboard_projects
dashboard_leads
dashboard_clients
dashboard_money_entries
dashboard_decisions
dashboard_system_links
```

## Migration File

Create a new migration under:

```txt
supabase/migrations/
```

Name it with the existing migration style. Example:

```txt
20260519_create_master_dashboard_tables.sql
```

Adjust timestamp if needed.

## SQL Shape

Use this as the starting point. Adapt to existing SQL conventions if needed.

```sql
create table if not exists dashboard_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  type text not null default 'internal',
  status text not null default 'idea',
  priority int not null default 3,
  repo_url text,
  live_url text,
  description text,
  next_action text,
  revenue_potential numeric default 0,
  last_touched_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists dashboard_leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  business_name text,
  email text,
  phone text,
  source text,
  problem text,
  budget numeric,
  status text not null default 'new',
  next_follow_up_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists dashboard_clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  business_name text,
  status text not null default 'active',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists dashboard_money_entries (
  id uuid primary key default gen_random_uuid(),
  entry_type text not null,
  category text not null,
  description text,
  amount numeric not null,
  occurred_on date not null default current_date,
  project_id uuid references dashboard_projects(id) on delete set null,
  client_id uuid references dashboard_clients(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists dashboard_decisions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  decision text not null,
  reason text,
  project_id uuid references dashboard_projects(id) on delete set null,
  status text not null default 'active',
  revisit_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists dashboard_system_links (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  description text,
  type text not null default 'system',
  status text not null default 'active',
  priority int not null default 3,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Add indexes for common dashboard queries:

```sql
create index if not exists dashboard_projects_status_idx on dashboard_projects(status);
create index if not exists dashboard_projects_priority_idx on dashboard_projects(priority);
create index if not exists dashboard_leads_status_idx on dashboard_leads(status);
create index if not exists dashboard_leads_next_follow_up_idx on dashboard_leads(next_follow_up_at);
create index if not exists dashboard_money_entries_occurred_on_idx on dashboard_money_entries(occurred_on);
create index if not exists dashboard_decisions_status_idx on dashboard_decisions(status);
create index if not exists dashboard_system_links_status_idx on dashboard_system_links(status);
```

If the repo already has an updated_at trigger helper, reuse it. Otherwise add a small trigger helper safely.

## RLS / Access Direction

For first implementation, owner-only server/API access is enough if that matches the current app pattern.

If enabling RLS, do not create permissive public policies.

These are private operational tables. They must not be publicly readable.

## Data Access Files To Create

```txt
lib/functions/master-dashboard/types.ts
lib/functions/master-dashboard/getDashboardProjects.ts
lib/functions/master-dashboard/getDashboardLeads.ts
lib/functions/master-dashboard/getDashboardMoney.ts
lib/functions/master-dashboard/getDashboardDecisions.ts
lib/functions/master-dashboard/getDashboardSystemLinks.ts
lib/functions/master-dashboard/getMasterDashboardOverview.ts
```

## Required Types

Create typed contracts for:

```txt
DashboardProject
DashboardLead
DashboardClient
DashboardMoneyEntry
DashboardDecision
DashboardSystemLink
MasterDashboardOverview
```

## API Routes To Create

Create owner-only route foundations:

```txt
app/api/dashboard/projects/route.ts
app/api/dashboard/leads/route.ts
app/api/dashboard/money/route.ts
app/api/dashboard/decisions/route.ts
app/api/dashboard/system-links/route.ts
```

For this spec, basic `GET` is enough. Add `POST` only if straightforward and safe.

## API Pattern

Each route must:

```txt
1. Create Supabase server client.
2. Get authenticated user.
3. Return 401 if missing.
4. Return 403 if not owner.
5. Validate input with Zod for mutation endpoints.
6. Return normalized JSON.
```

## Seed Data

Do not insert seed data in production migrations unless the project already uses seed migrations.

If temporary UI data is needed, keep it in component-local static data until real data exists.

## Do Not Touch

- Nucleus tables
- existing public `projects` table
- blog tables
- contactlist table
- round-robin tables
- chat/memory tables

## Acceptance Criteria

- Migration exists.
- Types and data helpers exist.
- Owner-only API route foundations exist.
- No private dashboard data is publicly exposed.
- Build passes or issues are documented.
- `context/progress-tracker.md` is updated.
- `context/architecture-context.md` is updated if final schema differs.

## Required Checks

Run:

```bash
npm run build
```

If tests or type checks surface issues, document them.

## Progress Tracker Update

Next recommended spec:

```txt
004-dashboard-projects-leads-money.md
```
