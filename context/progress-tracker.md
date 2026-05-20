# Progress Tracker — Luis-Ruiz Master Hub

## Current Objective

Refactor `luis-ruiz.com` into Gio's master hub:

```txt
Public website + owner command center + future client dashboard + Supabase-backed operating records
```

## Current Branch

```txt
GioClaw-Edit
```

## Baseline Context Status

The context files were created as empty placeholders and are now being populated with accurate Codex-readable implementation guidance.

## Implementation Roadmap

### Phase 0 — Context System

- [x] Create/replace Codex instruction context files
- [x] Define feature-spec loop
- [x] Define implementation order
- [x] Codex confirms context files are present in repo

### Phase 1 — Public Master Hub

- [x] `001-public-home-master-hub.md`
- [x] Replace generic landing composition with public master hub composition
- [x] Create `components/app/home/*`
- [x] Preserve existing working landing components until safely replaced or unused

### Phase 2 — Owner Dashboard Shell

- [x] `002-owner-dashboard-shell.md`
- [x] Refactor `/gio_dash` into owner command center shell
- [x] Create `components/app/master_dashboard/*`
- [x] Preserve owner auth guard

### Phase 3 — Master Dashboard Data Layer

- [x] `003-master-dashboard-data-layer.md`
- [x] Add Supabase migration for dashboard operational tables
- [x] Add typed data access helpers
- [x] Add owner-only API routes foundation

### Phase 4 — Projects, Leads, Money

- [ ] `004-dashboard-projects-leads-money.md`
- [ ] Display active projects
- [ ] Display open leads
- [ ] Display revenue/P&L snapshot
- [ ] Add basic create/update flows where specified

### Phase 5 — System Links and Decisions

- [ ] `005-system-links-and-decisions.md`
- [ ] Add system links dashboard card/table
- [ ] Add decisions log card/table
- [ ] Add quick route links to active products/tools

### Phase 6 — Client Dashboard Foundation

- [ ] `006-client-dashboard-foundation.md`
- [ ] Refine `/dashboard` into future client portal foundation
- [ ] Preserve owner redirect to `/gio_dash`

### Phase 7 — Legacy Docs/Context Cleanup

- [ ] `007-cleanup-legacy-docs-context.md`
- [ ] Inspect `/docs` and legacy agent docs
- [ ] Preserve useful facts
- [ ] Delete or archive irrelevant/conflicting docs only after review

## Current Known Repo Facts

- Next.js App Router app.
- React 19 and TypeScript.
- Tailwind CSS v4.
- Supabase is the main backend/auth/storage provider.
- `/gio_dash` already exists and is owner-only.
- `/gio_dash` now renders the owner command-center shell from `components/app/master_dashboard/*`.
- `/dashboard` exists and redirects owner users to `/gio_dash`.
- `/` now uses the public master hub composition from `components/app/home/*`.
- Existing AI/Nucleus/round-robin/Ollama systems should be preserved and not expanded during this refactor unless explicitly requested.

## Latest Log

## 2026-05-19 - 003-master-dashboard-data-layer: Master Dashboard Data Layer

Status: Complete

### Files changed
- `supabase/migrations/20260519_create_master_dashboard_tables.sql`
- `lib/functions/master-dashboard/types.ts`
- `lib/functions/master-dashboard/getDashboardProjects.ts`
- `lib/functions/master-dashboard/getDashboardLeads.ts`
- `lib/functions/master-dashboard/getDashboardMoney.ts`
- `lib/functions/master-dashboard/getDashboardDecisions.ts`
- `lib/functions/master-dashboard/getDashboardSystemLinks.ts`
- `lib/functions/master-dashboard/getMasterDashboardOverview.ts`
- `app/api/dashboard/projects/route.ts`
- `app/api/dashboard/leads/route.ts`
- `app/api/dashboard/money/route.ts`
- `app/api/dashboard/decisions/route.ts`
- `app/api/dashboard/system-links/route.ts`
- `Agents.md`
- `CLAUDE.md`
- `README.md`
- `context/architecture-context.md`
- `context/project-overview.md`
- `context/feature-specs/003-master-dashboard-data-layer.md`
- `context/progress-tracker.md`

### What changed
- Added a Supabase migration that creates the six owner-only operational tables: `dashboard_projects`, `dashboard_leads`, `dashboard_clients`, `dashboard_money_entries`, `dashboard_decisions`, and `dashboard_system_links`.
- Added a shared `public.set_updated_at()` trigger helper because no equivalent existed in earlier migrations, and wired `updated_at` triggers on all dashboard tables that carry that column.
- Added common indexes for status, priority, follow-up, and occurred-on lookups per spec.
- Enabled row-level security with no permissive policies on all six tables. These tables are private and are only intended to be read or written by server-side contexts (owner-only API routes / server components using the existing `requireOwnerClient` helper or service-role usage where appropriate).
- Created typed contracts in `lib/functions/master-dashboard/types.ts` for `DashboardProject`, `DashboardLead`, `DashboardClient`, `DashboardMoneyEntry`, `DashboardDecision`, `DashboardSystemLink`, and `MasterDashboardOverview`. These are independent from the UI shell types in `components/app/master_dashboard/types.ts`.
- Created per-resource read helpers using the cookie-aware server Supabase client: `getDashboardProjects`, `getDashboardLeads`, `getDashboardMoney` (plus `summarizeMoneyEntries`), `getDashboardDecisions`, `getDashboardSystemLinks`.
- Created `getMasterDashboardOverview` to compose the dashboard read in one call with sensible defaults.
- Created owner-only API foundations under `app/api/dashboard/` for projects, leads, money, decisions, and system-links. Each route uses `requireOwnerClient` (which returns 401 unauthenticated / 403 non-owner) and exposes `GET` and a Zod-validated `POST` for inserts.

### Verification
- `npm run build`: pass; all five new dashboard API routes appear in the route map.
- Migration was added but not applied here. The next environment that runs `supabase db push` (or equivalent) will create the new tables, the trigger helper, indexes, and RLS settings.

### Known issues
- The MasterDashboard UI shell still renders static seed data. Wiring `getMasterDashboardOverview` into `MasterDashboardView` is intentionally deferred to `004-dashboard-projects-leads-money.md` per spec direction ("It should not redesign UI beyond wiring minimal reads if safe").
- `dashboard_clients` does not yet have an API route; spec lists projects/leads/money/decisions/system-links only. Clients are reachable directly through Supabase from server-side code and will get a route when the clients UI lands.
- RLS is enabled with no policies. All access must go through the server-side service-role-capable Supabase client used by `requireOwnerClient`. Adding direct browser access would require explicit policies.

### Next recommended spec
- `context/feature-specs/004-dashboard-projects-leads-money.md`

## 2026-05-19 - 002-owner-dashboard-shell: Owner Dashboard Shell

Status: Complete

### Files changed
- `app/gio_dash/page.tsx`
- `components/app/master_dashboard/MasterDashboardView.tsx`
- `components/app/master_dashboard/DashboardHeader.tsx`
- `components/app/master_dashboard/TodayFocusCard.tsx`
- `components/app/master_dashboard/RevenueSnapshotCard.tsx`
- `components/app/master_dashboard/OpenLeadsCard.tsx`
- `components/app/master_dashboard/ActiveProjectsCard.tsx`
- `components/app/master_dashboard/QuickActionsPanel.tsx`
- `components/app/master_dashboard/SystemLinksCard.tsx`
- `components/app/master_dashboard/DecisionsLogCard.tsx`
- `components/app/master_dashboard/ContentQueueCard.tsx`
- `components/app/master_dashboard/AiToolsCard.tsx`
- `components/app/master_dashboard/types.ts`
- `components/app/master_dashboard/dashboard-seed-data.ts`
- `Agents.md`
- `CLAUDE.md`
- `README.md`
- `context/architecture-context.md`
- `context/code-standards.md`
- `context/project-overview.md`
- `context/ui-context.md`
- `context/feature-specs/002-owner-dashboard-shell.md`
- `context/progress-tracker.md`

### What changed
- Replaced the old `/gio_dash` admin-card page with a command-center page that renders `MasterDashboardView`.
- Added the command-center shell sections: dashboard header, today focus, revenue snapshot, open leads, active projects, quick actions, system links, decisions log, content queue, and AI tools.
- Added temporary seed data for dashboard shell content without introducing database schema or API changes.
- Preserved existing useful owner tools lower on the page under `Legacy Admin Tools`: quick actions, system health, contacts inbox, GitHub snapshot, and content analytics.
- Left `app/gio_dash/layout.tsx` owner protection intact and kept a small page-level owner guard because terminal route checks showed layout-only protection can stream child content before redirect completion in this codebase.

### Verification
- `npm run build`: pass
- `npm run lint`: pass; `next lint` reported deprecation notice only and no warnings/errors
- `npx next dev -p 3002`: pass
- `/gio_dash` unauthenticated route check: returned `307` redirect to `/login`; response body did not include `Gio Command Center`

### Known issues
- Revenue, leads, project operations, and decisions are static placeholders until `003-master-dashboard-data-layer.md`.
- Authenticated owner visual verification was not performed because no owner browser session was available in the terminal check.

### Next recommended spec
- `context/feature-specs/003-master-dashboard-data-layer.md`

## 2026-05-19 - 001-public-home-master-hub: Public Home Master Hub

Status: Complete

### Files changed
- `app/page.tsx`
- `components/app/home/MasterHero.tsx`
- `components/app/home/PublicStatusPanel.tsx`
- `components/app/home/ServiceCards.tsx`
- `components/app/home/SystemsOverview.tsx`
- `components/app/home/FeaturedProjects.tsx`
- `components/app/home/CaseStudyPreview.tsx`
- `components/app/home/HomeCTA.tsx`
- `components/app/home/home-data.ts`
- `Agents.md`
- `CLAUDE.md`
- `README.md`
- `context/architecture-context.md`
- `context/project-overview.md`
- `context/ui-context.md`
- `context/feature-specs/001-public-home-master-hub.md`
- `context/progress-tracker.md`

### What changed
- Replaced the old homepage composition with `MasterHero`, `PublicStatusPanel`, `ServiceCards`, `SystemsOverview`, `FeaturedProjects`, `CaseStudyPreview`, and `HomeCTA`.
- Added a static, public-safe home data layer for status areas, services, systems, featured public work, and the case-study preview.
- Kept existing landing-page components in place but unused by `/`, preserving them for safe later cleanup.
- Routed `View Services` to `/contact` because `/services` does not currently exist, which is allowed by the spec.
- Updated context/docs that described `/` as the old generic portfolio or landing-page stack.

### Verification
- `npm run build`: pass
- `npm run lint`: pass; `next lint` reported deprecation notice only and no warnings/errors
- `npx next dev -p 3001`: pass; port `3000` was already in use, so `3001` was used
- Local HTTP checks: `/`, `/projects`, and `/contact` returned `200`
- Home content checks: required hero, service, systems, case-study, and contact text were present in served HTML

### Known issues
- `/services` and `/systems` are not implemented routes yet. Homepage service CTAs use `/contact` and project/system proof links use existing public routes.
- Browser/IAB tooling was not exposed in this environment; verification used build, lint, dev server, and HTTP route/content checks.

### Next recommended spec
- `context/feature-specs/002-owner-dashboard-shell.md`

## 2026-05-19 — Context System Drafted

Status: Prepared outside repo for insertion

### Files prepared
- `AGENTS.md`
- `Agents.md`
- `CLAUDE.md`
- `context/project-overview.md`
- `context/architecture-context.md`
- `context/code-standards.md`
- `context/ui-context.md`
- `context/ai-workflow-rules.md`
- `context/progress-tracker.md`
- `context/feature-specs/README.md`
- `context/feature-specs/001-public-home-master-hub.md`
- `context/feature-specs/002-owner-dashboard-shell.md`
- `context/feature-specs/003-master-dashboard-data-layer.md`
- `context/feature-specs/004-dashboard-projects-leads-money.md`
- `context/feature-specs/005-system-links-and-decisions.md`
- `context/feature-specs/006-client-dashboard-foundation.md`
- `context/feature-specs/007-cleanup-legacy-docs-context.md`

### Verification
- `npm run build`: not run; documentation package only
- `npm run lint`: not run; documentation package only
- `npm run test`: not run; documentation package only

### Known issues
- These files must still be copied into the repo and committed.
- Codex should verify current repo state before implementing the first feature-spec.

### Next recommended spec
- `context/feature-specs/001-public-home-master-hub.md`
