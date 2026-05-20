# CLAUDE.md

This file is retained for compatibility with Claude-style coding tools.

The canonical project instructions now live in:

```txt
Agents.md
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
2. Owner-only command center at `/gio_dash`. First shell pass implemented in `components/app/master_dashboard/*`.
3. Future client/user portal at `/dashboard`.
4. Supabase-backed data layer for dashboard projects, leads, clients, money entries, decisions, and system links.

## Existing Technical Foundation

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/Radix UI
- Supabase auth/database/storage helpers
- Zod validation
- Existing blog, project, contact, photo, Ollama, round-robin, and Nucleus systems

## Working Rule

Do not restart the repository. Refactor the existing codebase deliberately.

Preserve Nucleus, round-robin, Ollama, blog, project, contact, and photo behavior unless a feature-spec explicitly requests changes.

For implementation tasks, follow `Agents.md` and the active feature-spec.
