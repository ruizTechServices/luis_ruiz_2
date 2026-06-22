# Signal & Structure Design System

## Source Of Truth

`app/globals.css` is the authored token source of truth for the current implementation. No generated `_ds_bundle.js`, token index, or compiler manifest was found during this refactor.

The semantic token roles are:

- `--color-canvas`
- `--color-surface`
- `--color-surface-raised`
- `--color-text-primary`
- `--color-text-secondary`
- `--color-text-subtle`
- `--color-border`
- `--color-border-strong`
- `--color-action-primary`
- `--color-action-on-primary`
- `--color-signal-mint`
- `--color-signal-violet`
- `--color-signal-warning`
- `--color-signal-danger`
- `--color-signal-info`

The shadcn variables in `app/globals.css` are mapped to these semantic roles so existing UI primitives keep working while public, owner, and client surfaces share one theme.

## Theme

Theme state is handled by `components/design-system/ThemeProvider.tsx` using `next-themes` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, and `disableTransitionOnChange`.

`components/design-system/ThemeToggle.tsx` is the shared toggle. It waits for mount before rendering the sun/moon icon to avoid hydration mismatch and exposes an accessible label plus tooltip.

## Component Hierarchy

Reusable design-system primitives live in `components/design-system/`:

- `Logo`
- `ThemeProvider`
- `ThemeToggle`
- `SignalBadge`
- `StatusIndicator`

The public shell lives in `components/site/`. Dashboard route shells keep their own role-aware navigation and topbars so the public header/footer do not render inside `/gio_dash` or `/dashboard`.

## Figma Node Mapping

Primary inspected nodes:

- `70:3` Codex Handoff / Signal & Structure
- `24:2` Foundations / Signal & Structure
- `19:6` Atoms
- `30:249` Homepage / Desktop / Light
- `30:1783` Case Study / Desktop / Light
- `43:2545` Daily Command Deck
- `43:1972` Client Dashboard / Desktop / Light

Figma is the visual and responsive reference. The repository remains the routing, auth, data, and production behavior source of truth.

## Boundaries

Owner dashboard data remains server-derived from `getMasterDashboardOverview()` behind `/gio_dash` owner authorization.

The client dashboard is currently a project-room shell. It does not query owner-only dashboard tables or invent insecure client data relationships. Real project-scoped data requires future schema and RLS work.
