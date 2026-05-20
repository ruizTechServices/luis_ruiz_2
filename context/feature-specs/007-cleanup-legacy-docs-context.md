# 007 — Cleanup Legacy Docs and Context

Status: Implemented on 2026-05-20.

Implementation notes:

- Canonical agent instructions are now tracked as `AGENTS.md`; `CLAUDE.md` is a compatibility pointer to the canonical context set.
- `/docs` now contains a short index plus the still-useful build-log sync runbook.
- Stale legacy planning docs, round-robin drafts, table inventories, and a one-off exported conversation transcript were deleted after review.
- Useful facts were preserved in `context/architecture-context.md`, `context/ui-context.md`, `context/project-overview.md`, `supabase/README.md`, and `context/progress-tracker.md`.
- `context/feature-specs/README.md` now clarifies that completed specs may retain original before-state language.
- `npm run build` passes after the cleanup.

## Goal

Review old documentation/context files and remove or rewrite irrelevant/conflicting material after useful facts have been preserved.

This is the only spec that should consider deleting docs/context files.

## User Direction

The `/docs` folder can be rewritten or deleted if irrelevant.

Do not blindly delete. Inspect first.

## Files/Folders To Inspect

```txt
docs/
Agents.md
AGENTS.md
CLAUDE.md
README.md
context/*.md
context/feature-specs/*.md
```

Also inspect any old agent-specific files if present:

```txt
gemini.md
GEMINI.md
.cursor/rules
.windsurfrules
```

## Required Cleanup Process

1. List docs files.
2. Read each doc enough to determine whether it is:
   - still accurate
   - outdated but useful
   - irrelevant
   - conflicting
3. Preserve useful facts by moving them into the correct context file.
4. Delete or archive only docs that are irrelevant/conflicting and not useful.
5. Update `README.md` only if public project instructions changed.
6. Update `progress-tracker.md`.

## Canonical Context Files

After cleanup, the canonical context set should be:

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

Optional compatibility files:

```txt
Agents.md
CLAUDE.md
```

These should point to canonical context and not conflict.

## Deletion Rules

Allowed to delete only if:

- the file is obsolete
- useful facts were preserved elsewhere
- it conflicts with the current direction
- no code/build process depends on it

Do not delete:

- README unless replacing with updated README
- migrations
- source files
- tests
- context/feature-specs currently in use

## Acceptance Criteria

- Context system is coherent.
- No duplicate contradictory agent instructions remain.
- Useful old facts are preserved in canonical context files.
- `progress-tracker.md` explains what was deleted/kept and why.
- Build is unaffected.

## Required Checks

```bash
npm run build
```

If docs-only and build is not necessary, still explain why not run in progress tracker.

## Progress Tracker Update

After this spec, recommend the next implementation focus based on remaining incomplete checkboxes.
