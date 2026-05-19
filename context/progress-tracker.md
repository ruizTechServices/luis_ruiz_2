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
- [ ] Codex confirms context files are present in repo

### Phase 1 — Public Master Hub

- [ ] `001-public-home-master-hub.md`
- [ ] Replace generic landing composition with public master hub composition
- [ ] Create `components/app/home/*`
- [ ] Preserve existing working landing components until safely replaced or unused

### Phase 2 — Owner Dashboard Shell

- [ ] `002-owner-dashboard-shell.md`
- [ ] Refactor `/gio_dash` into owner command center shell
- [ ] Create `components/app/master_dashboard/*`
- [ ] Preserve owner auth guard

### Phase 3 — Master Dashboard Data Layer

- [ ] `003-master-dashboard-data-layer.md`
- [ ] Add Supabase migration for dashboard operational tables
- [ ] Add typed data access helpers
- [ ] Add owner-only API routes foundation

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
- `/dashboard` exists and redirects owner users to `/gio_dash`.
- `/` currently uses older landing-page components and should become the public master hub.
- Existing AI/Nucleus/round-robin/Ollama systems should be preserved and not expanded during this refactor unless explicitly requested.

## Latest Log

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
