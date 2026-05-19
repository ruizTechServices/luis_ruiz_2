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

## Existing Public Homepage

The current homepage is composition-driven and imports landing-page components from `components/app/landing_page`.

Current conceptual shape:

```txt
Hero
Highlights
Quote
LatestPushesSection
TechSection
CallToAction
```

Refactor direction:

```txt
MasterHero
PublicStatusPanel
ServiceCards
SystemsOverview
FeaturedProjects
CaseStudyPreview
HomeCTA
```

The new homepage should remain public and should not expose private operational data.

## Existing Owner Dashboard

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

Current dashboard is mostly a grid of cards:

- blog posts
- stats
- content analytics
- user management
- quick actions
- system health
- recent activity
- settings
- GitHub API tester
- contacts inbox

Refactor direction:

```txt
/gio_dash becomes Gio Command Center:
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

## Existing Client/User Dashboard

Current route:

```txt
app/dashboard/page.tsx
```

Existing behavior:

- requires signed-in user
- redirects owner to `/gio_dash`
- shows a basic user dashboard with blog updates

Preserve owner redirect behavior.

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

Add or use tables for:

```txt
dashboard_projects
dashboard_leads
dashboard_clients
dashboard_money_entries
dashboard_decisions
dashboard_system_links
```

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

Dashboard data access:

```txt
lib/functions/master-dashboard/
```

Dashboard API resources:

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
