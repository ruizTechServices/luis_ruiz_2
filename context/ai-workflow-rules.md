# AI Workflow Rules — Codex Feature-Spec Loop

## Purpose

This file defines how Codex should operate in this repository when Gio gives repeated prompts like:

```txt
read `context/feature-specs/<file>.md`. update `context/progress-tracker.md` & all appropriate .md files accordingly to mark this progress after implementing exactly as specified
```

## Required Behavior

Codex must treat each feature-spec as a scoped work order.

For every work order:

1. Read context files.
2. Read the current feature-spec.
3. Inspect relevant code before editing.
4. Implement only the requested scope.
5. Run checks.
6. Update progress/context docs.
7. Stop.

## Do Not Drift

Do not decide to improve unrelated systems while implementing a feature-spec.

Examples of drift:

- rewriting Nucleus while working on the homepage
- refactoring round-robin while working on dashboard cards
- rebuilding auth while adding a lead table
- changing the entire design system because one card was requested
- deleting docs without first preserving useful context

## Implementation Granularity

Prefer small feature branches and commits.

One feature-spec should produce one coherent implementation unit.

If a feature-spec is too large, implement the smallest safe version and record remaining work in `progress-tracker.md`.

## Context Update Rules

Update context files when reality changes.

Examples:

- New route added → update `architecture-context.md` and `progress-tracker.md`.
- New dashboard card pattern created → update `ui-context.md` if the pattern becomes canonical.
- New API pattern established → update `code-standards.md` if needed.
- Feature completed → update `progress-tracker.md`.

Do not bloat context files with implementation logs. Put detailed logs in `progress-tracker.md`.

## Progress Tracker Update Format

After every task, append an entry like:

```md
## YYYY-MM-DD — SPEC-ID: Title

Status: Complete | Partial | Blocked

### Files changed
- path/to/file.tsx
- path/to/file.ts

### What changed
- Concise bullet
- Concise bullet

### Verification
- `npm run build`: pass/fail/not run
- `npm run lint`: pass/fail/not run
- `npm run test`: pass/fail/not run

### Known issues
- None, or list clearly

### Next recommended spec
- `context/feature-specs/002-owner-dashboard-shell.md`
```

## Source of Truth Rules

Use this priority order:

1. Current codebase
2. `AGENTS.md`
3. `/context/*.md`
4. active feature-spec
5. README/legacy docs

If docs conflict with code, inspect code and record the correction.

## Safety Rules

Do not expose secrets.

Do not print sensitive environment values.

Do not make destructive database migrations casually.

Do not delete files unless the feature-spec explicitly says to inspect and remove them, and only after useful content has been preserved or confirmed irrelevant.

## Verification Rule

Never claim a feature is complete without recording verification status.

If verification cannot be run, say exactly why in `progress-tracker.md`.
