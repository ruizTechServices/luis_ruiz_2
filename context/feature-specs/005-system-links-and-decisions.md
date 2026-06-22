# 005 â€” System Links and Decisions

Status: Implemented on 2026-05-20.

Implementation notes:

- `SystemLinksCard` now reads `overview.system_links` and renders compact active rows with name, type, status, priority, and open-link actions.
- `DecisionsLogCard` now reads `overview.decisions` and renders recent active decisions with title, summary, status, created date, and revisit date when present.
- `getMasterDashboardOverview` limits overview decisions to 5 and active system links to 8.
- `/api/dashboard/system-links` accepts spec type/status values and allows either `http(s)` URLs or internal paths beginning with `/`.
- Dashboard private table helpers and owner-only dashboard APIs now use a cookie-free service-role client after owner verification, preserving the RLS/no-public-policy boundary without breaking owner server reads.
- Read-only owner section pages exist at `/gio_dash/systems` and `/gio_dash/notes`.
- Live owner-only Supabase data was initialized idempotently with 10 active system links and 5 active decisions so `/gio_dash` shows useful rows immediately.
- `npm run build` passes with `/gio_dash/systems` and `/gio_dash/notes` in the route map.

## Goal

Add operational visibility for:

```txt
System Links
Decisions Log
```

These two systems help Gio avoid losing context and repeatedly re-deciding architecture.

## Files To Inspect First

```txt
components/app/master_dashboard/SystemLinksCard.tsx
components/app/master_dashboard/DecisionsLogCard.tsx
lib/functions/master-dashboard/getDashboardSystemLinks.ts
lib/functions/master-dashboard/getDashboardDecisions.ts
app/api/dashboard/system-links/route.ts
app/api/dashboard/decisions/route.ts
```

## System Links Requirements

System links represent important destinations Gio branches out to from `luis-ruiz.com`.

Examples:

```txt
luis-ruiz.com
ruizTechServices
GitHub repo
Supabase project
Vercel project
24HourGPT
Razzy
Chuef
Worksheet Generator
Ollama Local
Canva
Google Drive
```

Fields:

```txt
name
url
description
type
status
priority
```

Types:

```txt
website
repo
deployment
database
ai_tool
product
admin
external
```

Statuses:

```txt
active
paused
needs_review
broken
archived
```

## Decisions Log Requirements

Decisions should capture:

```txt
title
decision
reason
project/status association if available
status
revisit_at
created_at
```

Use decisions for architecture/business choices such as:

```txt
Use luis-ruiz.com as master hub
Keep /gio_dash as owner command center
Keep /dashboard for future client portal
Use Supabase as source of truth
```

## UI Requirements

### SystemLinksCard

Show compact rows:

```txt
Name | Type | Status | Priority | Open link
```

On overview page, limit to important active links.

### DecisionsLogCard

Show recent active decisions:

```txt
Title
Decision summary
Status
Created date
Revisit date if any
```

## Optional Section Pages

If time permits, create:

```txt
app/gio_dash/systems/page.tsx
app/gio_dash/notes/page.tsx
```

These should show fuller lists.

## Mutation Scope

Allowed if straightforward:

- add system link
- add decision

Not required:

- complex edit flows
- advanced tagging
- search
- filters

## Do Not Touch

- round-robin
- Ollama
- homepage
- payments

## Acceptance Criteria

- `/gio_dash` shows useful system links.
- `/gio_dash` shows recent decisions.
- APIs are owner-only.
- No private links are exposed publicly.
- Build passes or failures documented.
- `context/progress-tracker.md` updated.

## Required Checks

```bash
npm run build
```

## Progress Tracker Update

Next recommended spec:

```txt
006-client-dashboard-foundation.md
```
