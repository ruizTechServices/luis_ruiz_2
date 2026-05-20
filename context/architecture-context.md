# Architecture Context — Luis-Ruiz Master Hub

## Baseline Architecture

The repository is a Next.js App Router application using:

- Next.js 15.x
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/Radix UI primitives
- Supabase auth/database/storage
- Zod validation
- Vercel Analytics
- multiple AI provider SDKs
- Stripe for Nucleus billing

## Current Top-Level Shape

Important directories:

```txt
app/                  Next.js routes and API routes
components/           UI components
components/app/       feature-specific application UI
components/ui/        shared shadcn/Radix-style primitives
lib/                  shared logic, clients, data helpers
lib/clients/          provider clients, including Supabase
lib/db/               database access helpers
lib/functions/        reusable domain functions
supabase/migrations/  database migrations
tests/                lightweight helper/smoke tests
context/              LLM-readable project context
```

## Current Public Homepage

The current homepage is composition-driven and imports home components from `components/app/home`.

Current shape:

```txt
MasterHero
PublicStatusPanel
ServiceCards
SystemsOverview
FeaturedProjects
CaseStudyPreview
HomeCTA
```

The legacy landing-page components still exist under `components/app/landing_page`, but `/` no longer renders them.

Previous legacy shape:

```txt
Hero
Highlights
Quote
LatestPushesSection
TechSection
CallToAction
```

The new homepage should remain public and should not expose private operational data.

## Current Owner Dashboard

Current route:

```txt
app/gio_dash/page.tsx
```

Current layout guard:

```txt
app/gio_dash/layout.tsx
```

Existing access behavior:

1. Create Supabase server client.
2. Read current user.
3. Redirect unauthenticated user to `/login`.
4. Redirect non-owner user to `/dashboard`.
5. Render owner dashboard.

Preserve this behavior.

`app/gio_dash/page.tsx` also performs a small pre-render owner check before rendering `MasterDashboardView`. Keep that page-level guard unless a safer route-level auth pattern replaces it; terminal route probing showed layout-only protection can stream child content before redirect completion in this codebase.

Current dashboard route shape:

```txt
app/gio_dash/page.tsx
-> components/app/master_dashboard/MasterDashboardView
```

Current command-center shell:

```txt
- Today Focus
- Revenue Snapshot
- Open Leads
- Active Projects
- Quick Actions
- System Links
- Decisions Log
- Content Queue
- AI Tools
```

The Today Focus, Revenue Snapshot, Open Leads, Active Projects, System Links, and Decisions Log cards are wired through `getMasterDashboardOverview` to the dashboard operational tables. Content Queue and AI Tools still use static seed data until their respective specs ship. Useful legacy admin tools are preserved lower on the page under `Legacy Admin Tools`, including quick actions, system health, contacts inbox, GitHub snapshot, and content analytics.

Active project filtering uses `ACTIVE_PROJECT_STATUSES` (idea, validated, building, testing, shipped, selling) and excludes paused/archived. Open lead filtering uses `OPEN_LEAD_STATUSES` (new, contacted, qualified, proposal_sent, deposit_paid, in_progress). The revenue snapshot computes `open_opportunity_value` from open lead budgets plus active project `revenue_potential`.

Optional read-only owner section pages live at `app/gio_dash/leads/page.tsx`, `app/gio_dash/money/page.tsx`, `app/gio_dash/systems/page.tsx`, and `app/gio_dash/notes/page.tsx`. The pre-existing `app/gio_dash/projects/page.tsx` is the public-projects (portfolio) editor and remains untouched; the operational `dashboard_projects` table is surfaced through the dashboard cards and the `/api/dashboard/projects` route.

## Current Client/User Dashboard

Current route:

```txt
app/dashboard/page.tsx
```

Current behavior:

- requires signed-in user
- redirects unauthenticated users to `/login`
- redirects owner users to `/gio_dash`
- renders `components/app/client_dashboard/ClientDashboardView` for signed-in non-owner users
- shows placeholder client-facing cards for Project Status, Recent Updates, Deliverables, Invoices / Payments, Messages, and Support / Contact Gio

The route does not read owner-only dashboard operational tables or private owner records.

Future direction:

- client-specific projects
- deliverables
- invoices/payment status
- messages/updates

## Existing Supabase Pattern

Use existing Supabase clients under:

```txt
lib/clients/supabase/
```

The server client is async because Next.js 15 requires awaiting `cookies()`.

Do not invent a new Supabase client. Use the existing project pattern.

## Existing Owner Auth Pattern

Owner authorization is centralized in:

```txt
lib/auth/ownership.ts
```

Use this instead of duplicating owner checks.

If a helper exists for requiring owner access, use it for API routes.

## New Master Dashboard Data Model

The owner command center is backed by these dedicated operational tables:

```txt
dashboard_projects
dashboard_leads
dashboard_clients
dashboard_money_entries
dashboard_decisions
dashboard_system_links
```

These are created by `supabase/migrations/20260519_create_master_dashboard_tables.sql` together with a shared `public.set_updated_at()` trigger helper and per-table `updated_at` triggers for tables that carry that column.

Live project status: the migration has been applied to the `luis-ruiz` Supabase project (`huyhgdsjpdjzokjwaspb`) as `20260520064736_create_master_dashboard_tables`. On 2026-05-20 the live schema was verified to contain the six tables, RLS enabled with zero public policies, the trigger helper, and expected update triggers. A small owner-only starter dataset exists in `dashboard_system_links` and `dashboard_decisions`; projects, leads, and money entries remain empty until operational records are added.

Indexes added for common dashboard reads:

```txt
dashboard_projects_status_idx
dashboard_projects_priority_idx
dashboard_leads_status_idx
dashboard_leads_next_follow_up_idx
dashboard_money_entries_occurred_on_idx
dashboard_decisions_status_idx
dashboard_system_links_status_idx
```

Row-level security is enabled on all six tables with no permissive policies. They are intentionally not directly readable from the browser. All dashboard table access goes through server-side contexts after owner verification. Reads use `lib/functions/master-dashboard/getDashboardSupabase.ts`, which creates a cookie-free service-role client, and owner-only API routes use `requireOwnerClient`, which verifies the cookie session with the anon server client before returning the same cookie-free service-role client for private table mutation/query work.

Keep these separate from the existing public `projects` table unless the feature-spec explicitly instructs linking them.

Reason:

- public `projects` = portfolio/case-study proof
- `dashboard_projects` = Gio's operational project tracker

They may later be linked, but they are not the same concept.

## Recommended New Folders

Home components:

```txt
components/app/home/
```

Owner command center components:

```txt
components/app/master_dashboard/
```

Client dashboard components:

```txt
components/app/client_dashboard/
```

Dashboard data access (now present):

```txt
lib/functions/master-dashboard/types.ts
lib/functions/master-dashboard/getDashboardProjects.ts
lib/functions/master-dashboard/getDashboardLeads.ts
lib/functions/master-dashboard/getDashboardMoney.ts
lib/functions/master-dashboard/getDashboardDecisions.ts
lib/functions/master-dashboard/getDashboardSystemLinks.ts
lib/functions/master-dashboard/getMasterDashboardOverview.ts
```

Dashboard API resources (now present, owner-only via `requireOwnerClient`):

```txt
app/api/dashboard/projects/route.ts
app/api/dashboard/leads/route.ts
app/api/dashboard/money/route.ts
app/api/dashboard/decisions/route.ts
app/api/dashboard/system-links/route.ts
```

Owner dashboard sections:

```txt
app/gio_dash/projects/page.tsx
app/gio_dash/leads/page.tsx
app/gio_dash/clients/page.tsx
app/gio_dash/money/page.tsx
app/gio_dash/content/page.tsx
app/gio_dash/systems/page.tsx
app/gio_dash/ai/page.tsx
app/gio_dash/notes/page.tsx
app/gio_dash/settings/page.tsx
```

## Architecture Pattern To Use

Preferred pattern:

```txt
Route/page
→ owner/auth check if needed
→ data helper in lib/functions/master-dashboard
→ typed data contract
→ presentational component
```

Example:

```txt
app/gio_dash/page.tsx
→ getMasterDashboardOverview()
→ MasterDashboardView
→ cards/components
```

Avoid:

- giant page files
- inline SQL everywhere
- duplicate auth checks everywhere
- unrelated AI/provider refactors
- changing existing public data contracts without reason

## API Pattern To Use

For dashboard API routes:

```txt
1. Read Supabase user.
2. Require authenticated user.
3. Require owner.
4. Validate body/query with Zod.
5. Perform Supabase operation.
6. Return normalized JSON.
```

Status behavior:

```txt
401 = not signed in
403 = signed in but not owner
400 = invalid request
500 = server/database failure
```

## Database Migration Rules

Use SQL migrations in:

```txt
supabase/migrations/
```

Use explicit names like:

```txt
20260519_create_master_dashboard_tables.sql
```

Include:

- table creation
- indexes
- updated_at trigger if existing helper exists, or a simple trigger if needed
- conservative RLS policies or owner-only server-side access depending on existing project conventions

Do not hardcode generated UUIDs.

## Public vs Private Data Boundary

Public data may appear on:

```txt
/
/projects
/blog
/services
/systems
/contact
```

Private owner data may appear only on:

```txt
/gio_dash/*
/api/dashboard/*
```

Client/user data may appear only on:

```txt
/dashboard/*
```

Do not leak lead details, money details, internal decisions, or private system links to public pages.
