# 006 — Client Dashboard Foundation

## Goal

Refine `/dashboard` into a clean foundation for future clients/users while preserving the current owner redirect to `/gio_dash`.

This is not a full client portal yet.

## Current State

`app/dashboard/page.tsx`:

- requires authenticated user
- redirects owner users to `/gio_dash`
- shows a basic personalized overview and blog updates

Preserve owner redirect behavior.

## Required Result

`/dashboard` should become a simple future client portal shell.

Recommended sections:

```txt
Client Dashboard
Project Status
Recent Updates
Deliverables
Invoices / Payments
Messages
Support / Contact Gio
```

For now these can be placeholder cards unless real client data exists.

## Files To Inspect First

```txt
app/dashboard/page.tsx
components/app/user_dash/*
lib/auth/ownership.ts
lib/clients/supabase/server.ts
```

## Files To Create

```txt
components/app/client_dashboard/ClientDashboardView.tsx
components/app/client_dashboard/ClientDashboardHeader.tsx
components/app/client_dashboard/ClientProjectStatusCard.tsx
components/app/client_dashboard/ClientUpdatesCard.tsx
components/app/client_dashboard/ClientDeliverablesCard.tsx
components/app/client_dashboard/ClientInvoicesCard.tsx
components/app/client_dashboard/ClientMessagesCard.tsx
components/app/client_dashboard/ClientSupportCard.tsx
```

## Files To Modify

```txt
app/dashboard/page.tsx
```

## Behavior Requirements

- unauthenticated user redirects to `/login`
- owner user redirects to `/gio_dash`
- normal authenticated user sees client dashboard shell
- no owner-only private data appears here

## Copy Direction

Use simple client-facing copy:

```txt
Welcome. This area will track your project status, deliverables, updates, and communication with Gio/ruizTechServices.
```

## Do Not Touch

- `/gio_dash`
- dashboard operational tables unless needed only for future-safe typing
- Nucleus
- round-robin
- Ollama
- billing

## Acceptance Criteria

- `/dashboard` renders cleanly for non-owner authenticated users.
- owner redirect to `/gio_dash` still works.
- private owner data is not visible.
- Build passes or issues documented.
- `context/progress-tracker.md` updated.

## Required Checks

```bash
npm run build
```

## Progress Tracker Update

Next recommended spec:

```txt
007-cleanup-legacy-docs-context.md
```
