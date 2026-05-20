# Progress Tracker — Luis-Ruiz Master Hub

## Current Objective

Refactor `luis-ruiz.com` into Gio's master hub:

```txt
Public website + owner command center + client dashboard foundation + Supabase-backed operating records
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

- [x] `004-dashboard-projects-leads-money.md`
- [x] Display active projects
- [x] Display open leads
- [x] Display revenue/P&L snapshot
- [x] Add basic create/update flows where specified

### Phase 5 — System Links and Decisions

- [x] `005-system-links-and-decisions.md`
- [x] Add system links dashboard card/table
- [x] Add decisions log card/table
- [x] Add quick route links to active products/tools

### Phase 6 — Client Dashboard Foundation

- [x] `006-client-dashboard-foundation.md`
- [x] Refine `/dashboard` into future client portal foundation
- [x] Preserve owner redirect to `/gio_dash`

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
- `/dashboard` now renders the client dashboard foundation for signed-in non-owner users and redirects owner users to `/gio_dash`.
- `/` now uses the public master hub composition from `components/app/home/*`.
- Existing AI/Nucleus/round-robin/Ollama systems should be preserved and not expanded during this refactor unless explicitly requested.
- `/gio_dash` cards (Today Focus, Revenue Snapshot, Open Leads, Active Projects, System Links, Decisions Log) now read from `dashboard_*` tables via `getMasterDashboardOverview`. Content Queue and AI Tools remain on static seed data pending later specs.
- Optional read-only owner section pages exist at `/gio_dash/leads`, `/gio_dash/money`, `/gio_dash/systems`, and `/gio_dash/notes`. The existing `/gio_dash/projects` route is preserved for the public-projects portfolio editor and is intentionally not replaced.
- The spec 003 dashboard migration has been applied to the live `luis-ruiz` Supabase project (`huyhgdsjpdjzokjwaspb`) as migration `20260520064736_create_master_dashboard_tables`; the six dashboard tables, RLS settings, function, and triggers were verified on 2026-05-20.
- The next roadmap item is legacy docs/context cleanup in `007-cleanup-legacy-docs-context.md`.

## Latest Log

## 2026-05-20 - 006-client-dashboard-foundation: Client Dashboard Foundation

Status: Complete

### Files changed
- `app/dashboard/page.tsx`
- `components/app/client_dashboard/ClientDashboardView.tsx`
- `components/app/client_dashboard/ClientDashboardHeader.tsx`
- `components/app/client_dashboard/ClientProjectStatusCard.tsx`
- `components/app/client_dashboard/ClientUpdatesCard.tsx`
- `components/app/client_dashboard/ClientDeliverablesCard.tsx`
- `components/app/client_dashboard/ClientInvoicesCard.tsx`
- `components/app/client_dashboard/ClientMessagesCard.tsx`
- `components/app/client_dashboard/ClientSupportCard.tsx`
- `context/architecture-context.md`
- `context/project-overview.md`
- `context/ui-context.md`
- `context/progress-tracker.md`
- `context/feature-specs/006-client-dashboard-foundation.md`
- `Agents.md`
- `CLAUDE.md`
- `README.md`

### What changed
- Replaced the old generic `/dashboard` content and blog/count reads with a clean client dashboard shell.
- Preserved the existing Supabase auth requirement and owner redirect from `/dashboard` to `/gio_dash`.
- Added client-facing placeholder cards for Project Status, Recent Updates, Deliverables, Invoices / Payments, Messages, and Support / Contact Gio.
- Kept `/dashboard` free of owner-only operational table reads and private owner data.

### Verification
- `npm run build`: pass.
- Runtime unauthenticated `/dashboard` check through `npx next start -p 3004`: pass, returned `307` redirect to `/login`.
- `git diff --check`: pass; only existing line-ending normalization warnings were printed.

### Known issues
- Client project data, deliverables, invoices, and messages are placeholders by design until a later client-data spec exists.
- Authenticated non-owner and owner browser-session checks were not performed because no signed-in test sessions were available in this environment; the redirect branches are preserved in `app/dashboard/page.tsx` and were type-checked by the build.

### Next recommended spec
- `context/feature-specs/007-cleanup-legacy-docs-context.md`

## 2026-05-20 - 005-system-links-and-decisions: System Links and Decisions

Status: Complete

### Files changed
- `components/app/master_dashboard/SystemLinksCard.tsx`
- `components/app/master_dashboard/DecisionsLogCard.tsx`
- `components/app/master_dashboard/MasterDashboardView.tsx`
- `components/app/master_dashboard/dashboard-seed-data.ts`
- `components/app/master_dashboard/types.ts`
- `lib/functions/master-dashboard/getMasterDashboardOverview.ts`
- `lib/functions/master-dashboard/getDashboardSupabase.ts`
- `lib/functions/master-dashboard/types.ts`
- `lib/auth/require-owner.ts`
- `app/api/dashboard/system-links/route.ts`
- `app/gio_dash/systems/page.tsx`
- `app/gio_dash/notes/page.tsx`
- `context/architecture-context.md`
- `context/project-overview.md`
- `context/ui-context.md`
- `context/progress-tracker.md`
- `context/feature-specs/003-master-dashboard-data-layer.md`
- `context/feature-specs/004-dashboard-projects-leads-money.md`
- `context/feature-specs/005-system-links-and-decisions.md`
- `Agents.md`
- `CLAUDE.md`
- `README.md`

### What changed
- Verified the local spec 003 migration exists, applied it to the live `luis-ruiz` Supabase project, and confirmed the six dashboard tables, RLS with zero public policies, `public.set_updated_at()`, and five `updated_at` triggers are present.
- Confirmed `dashboard_projects`, `dashboard_leads`, and `dashboard_money_entries` are empty live tables, so spec 004 cards now show true empty data rather than missing-relation failures.
- Wired `SystemLinksCard` to `overview.system_links`, showing compact active rows with name, type, status, priority, and an open-link action.
- Wired `DecisionsLogCard` to `overview.decisions`, showing recent active decisions with title, summary, status, created date, and revisit date when present.
- Updated `getMasterDashboardOverview` defaults for overview-scoped decisions and links (`5` decisions, `8` system links) and passed those limits explicitly from `MasterDashboardView`.
- Tightened `/api/dashboard/system-links` POST validation to the spec type/status values while allowing either `http(s)` URLs or internal app paths starting with `/`.
- Switched private dashboard table reads and owner-only dashboard API mutations to a cookie-free service-role client after owner verification, so RLS with zero public policies does not block owner server reads.
- Removed remaining System Links and Decisions seed data from `dashboard-seed-data.ts` and removed the unused shell-local UI types.
- Added read-only owner pages at `/gio_dash/systems` and `/gio_dash/notes` for fuller system-link and decision lists.
- Inserted an idempotent starter set into the live owner-only tables: 10 active system links and 5 active decisions from the spec examples.

### Verification
- Live Supabase schema check: pass. Migration history includes `20260520064736_create_master_dashboard_tables`.
- Live Supabase private table check: pass. All six dashboard tables have RLS enabled with zero public policies.
- Live Supabase trigger check: pass. `set_updated_at` is present and dashboard update triggers are attached where expected.
- Supabase docs check: pass. Confirmed RLS-enabled public tables with no policies are not readable through public API roles, and service-role access must stay server-only.
- Live starter data check: pass. `dashboard_system_links` has 10 rows; `dashboard_decisions` has 5 rows; projects/leads/money remain at 0 rows.
- Direct overview-table query check: pass. Active projects = 0, open leads = 0, money entries = 0, active system links = 10, active decisions = 5.
- `npm run build`: pass. Route map includes `/gio_dash/systems` and `/gio_dash/notes`.

### Known issues
- No form UI was added for system links or decisions. The spec allowed add flows if straightforward but did not require them; existing owner-only POST endpoints remain the mutation path.
- Supabase MCP reported unrelated existing RLS-disabled tables: `public.round_robin_messages`, `public.round_robin_sessions`, and `public.todos`. This spec intentionally did not touch round-robin or todos.

### Next recommended spec
- `context/feature-specs/006-client-dashboard-foundation.md`

## 2026-05-20 - 004-dashboard-projects-leads-money: Projects, Leads, and Money

Status: Complete

### Files changed
- `lib/functions/master-dashboard/types.ts`
- `lib/functions/master-dashboard/getDashboardProjects.ts`
- `lib/functions/master-dashboard/getDashboardLeads.ts`
- `lib/functions/master-dashboard/getDashboardMoney.ts`
- `lib/functions/master-dashboard/getMasterDashboardOverview.ts`
- `components/app/master_dashboard/MasterDashboardView.tsx`
- `components/app/master_dashboard/ActiveProjectsCard.tsx`
- `components/app/master_dashboard/OpenLeadsCard.tsx`
- `components/app/master_dashboard/RevenueSnapshotCard.tsx`
- `components/app/master_dashboard/TodayFocusCard.tsx`
- `components/app/master_dashboard/types.ts`
- `components/app/master_dashboard/dashboard-seed-data.ts`
- `app/gio_dash/leads/page.tsx`
- `app/gio_dash/money/page.tsx`
- `context/architecture-context.md`
- `context/project-overview.md`
- `context/progress-tracker.md`

### What changed
- Aligned the dashboard data-layer status literals with the spec: `DashboardProjectStatus` now lists `idea | validated | building | testing | shipped | selling | paused | archived`; `DashboardLeadStatus` now lists `new | contacted | qualified | proposal_sent | deposit_paid | in_progress | won | lost`.
- Added the exported `ACTIVE_PROJECT_STATUSES` constant and an `activeOnly` option to `getDashboardProjects` that filters to the spec-listed active statuses and applies the priority asc / last_touched_at desc nulls last / created_at desc sort.
- Updated `OPEN_LEAD_STATUSES` to the spec-listed open statuses; the leads helper still sorts by soonest `next_follow_up_at` then newest.
- Added `open_opportunity_value` to `MasterDashboardMoneySummary` and updated `summarizeMoneyEntries` to optionally take open leads + active projects and sum their `budget` + `revenue_potential`.
- Updated `getMasterDashboardOverview` to limit projects and leads to 5 for the overview, request active-only projects, and pass open leads + active projects into the money summary for open opportunity.
- Made `MasterDashboardView` an async server component that loads the overview once, surfaces a load-error banner if the data layer is unreachable, and passes typed props to the four spec 004 cards. Decisions Log and System Links were subsequently wired in spec 005; Content Queue and AI Tools remain static shell data.
- Rewrote `ActiveProjectsCard`, `OpenLeadsCard`, `RevenueSnapshotCard`, and `TodayFocusCard` as data-driven presentational components with useful empty states that point at the existing `/api/dashboard/*` routes.
- Removed `commandMetrics`, `activeProjects`, `MetricItem`, and the shell-local `DashboardProject` placeholder type now that nothing reads them.
- Added read-only owner section pages at `/gio_dash/leads` and `/gio_dash/money` with summary tiles and tables sourced from the same data helpers. `/gio_dash/projects` was left untouched because it is the existing public-projects portfolio editor; the operational projects feed remains the dashboard card + the existing `/api/dashboard/projects` route.

### Verification
- `npm run build`: pass (58 routes including the two new `/gio_dash/leads` and `/gio_dash/money` routes).
- `npm run lint`: not run; changes are localized to dashboard components and helpers that the build's type checker already exercised, and the spec only requires lint "if the changed files are substantial".
- The Supabase migration from 003 was later applied to the live project on 2026-05-20 before spec 005. The remaining empty states for projects, leads, and money now reflect true empty data, not missing dashboard tables.

### Known issues
- No create-form UI was added. The spec lists basic add forms as allowed but not required, and noted "Do not overbuild forms unless the API is already ready." The existing `/api/dashboard/projects|leads|money` POST endpoints remain the path for inserts.
- `app/gio_dash/projects/page.tsx` was not added/replaced. The path is already used by the public-projects portfolio editor that the spec elsewhere asks to preserve.
- Decisions Log and System Links were wired in `005-system-links-and-decisions.md`.

### Next recommended spec
- `context/feature-specs/005-system-links-and-decisions.md`

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
