# CLAUDE.md

This file is retained for compatibility with Claude-style coding tools.

The canonical project instructions now live in:

```txt
AGENTS.md
context/project-overview.md
context/architecture-context.md
context/code-standards.md
context/ui-context.md
context/ai-workflow-rules.md
context/progress-tracker.md
context/feature-specs/
```

## Current Project Direction

`luis-ruiz.com` is being refactored from a portfolio-heavy site into Gio's master hub:

1. Public master hub at `/` for credibility, services, proof-of-work, and lead capture. First pass implemented in `components/app/home/*`.
2. Owner-only command center at `/gio_dash`. Shell implemented in `components/app/master_dashboard/*`; Today Focus, Revenue Snapshot, Open Leads, Active Projects, System Links, and Decisions Log cards now read live data through `getMasterDashboardOverview`. Read-only owner section pages live at `/gio_dash/leads`, `/gio_dash/money`, `/gio_dash/systems`, and `/gio_dash/notes`.
3. Client/user portal foundation at `/dashboard`, implemented in `components/app/client_dashboard/*`; signed-in non-owner users see placeholder client cards and owner users still redirect to `/gio_dash`.
4. Supabase-backed data layer for dashboard projects, leads, clients, money entries, decisions, and system links. Migration, typed helpers, and owner-only API foundations live under `supabase/migrations/`, `lib/functions/master-dashboard/`, and `app/api/dashboard/`.

## Existing Technical Foundation

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/Radix UI
- Supabase auth/database/storage helpers
- Zod validation
- Existing blog, project, contact, photo, Ollama, and round-robin systems

## Working Rule

Do not restart the repository. Refactor the existing codebase deliberately.

Preserve round-robin, Ollama, blog, project, contact, and photo behavior unless a feature-spec explicitly requests changes.

For implementation tasks, follow `AGENTS.md` and the active feature-spec.
