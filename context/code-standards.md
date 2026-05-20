# Code Standards — Luis-Ruiz Master Hub

## Primary Principle

Modify the existing codebase deliberately. Do not create disconnected greenfield rewrites.

## Language and Framework

Use:

- TypeScript
- React 19
- Next.js App Router
- Tailwind CSS v4
- existing shadcn/Radix UI components
- existing Supabase helpers
- Zod for API validation

## Component Rules

Prefer small components with one job.

Good:

```txt
MasterDashboardView
RevenueSnapshotCard
OpenLeadsCard
ActiveProjectsCard
SystemLinksCard
```

Bad:

```txt
One 700-line dashboard page with all cards, fetching, formatting, and mutations inline.
```

## Server vs Client Components

Default to server components for pages and read-only layouts.

Use client components only when needed for:

- forms
- local state
- toggles
- interactive filters
- mutation buttons
- drag/drop
- optimistic UI

Do not add `"use client"` unless the file requires it.

## Data Access Rules

Do not query Supabase directly from many UI components.

Preferred:

```txt
app/gio_dash/page.tsx
→ lib/functions/master-dashboard/getMasterDashboardOverview.ts
→ typed return object
→ MasterDashboardView
```

For mutations, use API routes or server actions only if the repo already clearly uses that pattern. Current project heavily uses API routes, so prefer API routes for dashboard CRUD.

## Supabase Rules

Use existing Supabase clients.

Do not create a new client helper unless a feature-spec explicitly says to.

Server-side admin/dashboard operations may use the existing server client pattern, but routes must still enforce authentication and owner authorization before privileged operations.

## Auth Rules

Use existing owner logic:

```txt
lib/auth/ownership.ts
```

Do not duplicate owner-email parsing.

Do not expose owner-only data through public pages or public APIs.

For `/gio_dash`, keep the existing layout guard and the page-level pre-render guard unless a safer centralized route protection pattern replaces both. The page guard prevents owner-only child content from streaming before a redirect completes.

## Validation Rules

Use Zod for request bodies.

Example shape:

```ts
const bodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  status: z.string().trim().min(1).max(50).optional(),
});
```

Return actionable errors.

## Styling Rules

Use Tailwind classes consistent with the current project.

Favor:

- grid layouts for dashboards
- rounded-xl / rounded-2xl cards
- subtle borders
- clear spacing
- readable dark mode support
- composable utility classes

Avoid:

- novelty animations that distract from dashboard clarity
- unbounded gradients everywhere
- low-contrast text
- huge dense cards with no hierarchy
- overcomplicated motion

## Naming Rules

Use clear names.

Examples:

```txt
MasterDashboardView.tsx
TodayFocusCard.tsx
RevenueSnapshotCard.tsx
getMasterDashboardOverview.ts
DashboardProject
DashboardLead
```

Avoid vague names:

```txt
Stuff.tsx
NewCard.tsx
DataThing.ts
Dashboard2.tsx
```

## API Route Rules

For every dashboard API:

```txt
- validate request with Zod
- require auth
- require owner
- keep response JSON predictable
- do not return raw provider/database errors when they might expose sensitive details
```

## Error Handling

User-facing errors should be short and useful.

Server logs can contain more detail.

If a check fails because of existing unrelated code, record it in `context/progress-tracker.md` instead of hiding it.

## Testing and Verification

At minimum:

```bash
npm run build
```

When relevant:

```bash
npm run lint
npm run test
```

For UI work, also manually verify route rendering locally if possible:

```bash
npm run dev
```

Then check:

```txt
/
/gio_dash
/dashboard
/contact
/projects
/blog
```

## Documentation Rule

After changing architecture, routes, database tables, or workflow:

- update `context/progress-tracker.md`
- update any stale context file
- update README only if user-facing setup or route information changed

## Do Not Do

Do not:

- ask the user to add environment variables as a default response
- delete legacy systems without confirming they are unused
- rewrite the whole repo
- introduce a second UI library
- replace Supabase
- move unrelated AI code during dashboard work
- change Nucleus behavior during master-dashboard implementation
- change route names casually
- make public pages depend on private dashboard tables unless sanitized
