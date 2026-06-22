# Project Overview â€” Luis-Ruiz Master Hub

## Project Identity

Repository:

```txt
ruizTechServices/luis_ruiz_2
```

Primary branch for this work:

```txt
GioClaw-Edit
```

Website:

```txt
https://luis-ruiz.com
```

Owner:

```txt
Luis Giovanni Ruiz, preferred name Gio
Founder of ruizTechServices LLC
```

## Primary Goal

Refactor `luis-ruiz.com` into Gio's master dashboard and branching hub.

This does **not** mean the public homepage becomes a private dashboard.

It means the domain becomes a layered command system:

```txt
Public site       â†’ credibility, services, portfolio, contact, proof-of-work
Owner dashboard   â†’ Gio's private operating system
Client dashboard  â†’ future customer portal foundation
Supabase          â†’ system of record
GitHub/Vercel     â†’ code and deployment pipeline
External apps     â†’ branches from the hub
```

## Product Layers

### Layer 1 â€” Public Website

Purpose:

- present Gio professionally
- sell ruizTechServices services
- display projects and case studies
- show active systems/products
- capture leads
- route visitors to contact/hire flows

Current public routes:

```txt
/
/projects
/blog
/contact
/login
```

Planned public routes:

```txt
/services
/systems
```

### Layer 2 â€” Owner-Only Master Dashboard

Purpose:

- manage projects
- manage leads
- manage clients
- track money/P&L
- track decisions
- track content
- link to active systems
- provide quick operational actions

Main route:

```txt
/gio_dash
```

The existing `/gio_dash` already protects access with Supabase auth and owner-email authorization. Preserve this pattern.

### Layer 3 â€” Client/User Dashboard

Purpose:

- future customer portal
- client project status
- deliverables
- invoices/payment state
- messages/updates

Main route:

```txt
/dashboard
```

Implemented behavior:

- unauthenticated users redirect to `/login`
- owner users redirect from `/dashboard` to `/gio_dash`
- signed-in non-owner users see the client dashboard foundation shell
- no owner-only operational records are read by `/dashboard`

## Current Repo Capabilities To Preserve

The codebase is not just a simple portfolio. It already includes:

- blog system
- project/case-study surface
- contact/lead intake
- owner dashboard
- photo/media management through Supabase Storage
- Ollama local chat
- multi-model round-robin discussion surface
- Supabase auth/database/storage
- AI provider integrations

The master-dashboard refactor should improve organization and usefulness without breaking these systems.

## Strategic Direction

The strongest business direction is:

```txt
Make ruizTechServices look real, sellable, and operational.
```

The site should help Gio move toward revenue by supporting:

- service packages
- lead capture
- case studies
- project proof
- client tracking
- operational discipline
- money tracking

## MVP Definition

The first useful version is complete when:

1. `/` looks like a public master hub, not just a generic portfolio.
2. `/gio_dash` looks and behaves like a private command center.
3. Core dashboard records can be persisted in Supabase.
4. Projects, leads, money, decisions, and system links are visible in the owner dashboard.
5. `/dashboard` provides an authenticated client portal foundation while preserving owner redirect behavior.
6. The progress tracker reflects what was implemented and verified.

Current status:

- Item 1 is implemented in `components/app/home/*`.
- Item 2 is implemented as the `/gio_dash` command-center shell in `components/app/master_dashboard/*`.
- Item 3 is implemented and applied to the live `luis-ruiz` Supabase project: `supabase/migrations/20260519_create_master_dashboard_tables.sql` adds the operational tables, and typed helpers and owner-only API foundations live under `lib/functions/master-dashboard/*` and `app/api/dashboard/*`.
- Item 4 is implemented: Active Projects, Open Leads, Revenue Snapshot, Today Focus, System Links, and Decisions Log cards read from the operational tables via `getMasterDashboardOverview`. Read-only owner section pages exist at `/gio_dash/leads`, `/gio_dash/money`, `/gio_dash/systems`, and `/gio_dash/notes`, and the live owner-only dashboard has starter system-link and decision records.
- Item 5 is implemented: `/dashboard` renders the client dashboard shell from `components/app/client_dashboard/*` for signed-in non-owner users and keeps owners redirected to `/gio_dash`.
- Item 6 is implemented: the progress tracker reflects implemented specs 001-007, and stale/conflicting legacy docs were removed or rewritten after useful facts were preserved in canonical context.

## Out of Scope For This Refactor Unless Explicitly Requested

- round-robin orchestration rewrite
- Ollama/RAG/memory rewrite
- full CRM implementation
- full accounting system
- advanced analytics
- mobile app implementation
- major auth-provider replacement
- database provider replacement

## Current Implementation Order

Follow feature-specs in this order:

```txt
001-public-home-master-hub.md
002-owner-dashboard-shell.md
003-master-dashboard-data-layer.md
004-dashboard-projects-leads-money.md
005-system-links-and-decisions.md
006-client-dashboard-foundation.md
007-cleanup-legacy-docs-context.md
```

The initial master-hub feature-spec loop is complete. Future work should be scoped as new specs based on the next operational priority rather than continuing to rely on removed legacy TODO files.
