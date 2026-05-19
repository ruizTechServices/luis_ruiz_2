# 001 — Public Home Master Hub

## Goal

Refactor the public homepage `/` from a generic portfolio landing page into a public master hub for Gio and ruizTechServices.

This is public-facing. Do not expose private dashboard data.

## Current State

`app/page.tsx` currently composes older landing-page components:

```txt
Hero
Highlights
Quote
LatestPushesSection
TechSection
CallToAction
```

These may be kept temporarily, but the final direction is a clearer master-hub composition.

## Required Result

`app/page.tsx` should use a new home component system:

```tsx
import { MasterHero } from "@/components/app/home/MasterHero";
import { PublicStatusPanel } from "@/components/app/home/PublicStatusPanel";
import { ServiceCards } from "@/components/app/home/ServiceCards";
import { SystemsOverview } from "@/components/app/home/SystemsOverview";
import { FeaturedProjects } from "@/components/app/home/FeaturedProjects";
import { CaseStudyPreview } from "@/components/app/home/CaseStudyPreview";
import { HomeCTA } from "@/components/app/home/HomeCTA";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <MasterHero />
      <PublicStatusPanel />
      <ServiceCards />
      <SystemsOverview />
      <FeaturedProjects />
      <CaseStudyPreview />
      <HomeCTA />
    </main>
  );
}
```

Adapt styling to existing project conventions if needed.

## Files To Inspect First

```txt
app/page.tsx
app/layout.tsx
components/app/landing_page/Hero.tsx
components/app/landing_page/Highlights.tsx
components/app/landing_page/LatestPushesSection.tsx
components/app/landing_page/techSection.tsx
components/app/landing_page/CallToAction.tsx
components/app/landing_page/Navbar.tsx
components/app/landing_page/navbarItems.ts
components/app/landing_page/footer.tsx
app/projects/page.tsx
app/contact/page.tsx
```

## Files To Create

```txt
components/app/home/MasterHero.tsx
components/app/home/PublicStatusPanel.tsx
components/app/home/ServiceCards.tsx
components/app/home/SystemsOverview.tsx
components/app/home/FeaturedProjects.tsx
components/app/home/CaseStudyPreview.tsx
components/app/home/HomeCTA.tsx
```

Optional shared file:

```txt
components/app/home/home-data.ts
```

Use this if static data arrays make the components cleaner.

## Files To Modify

```txt
app/page.tsx
```

Modify navbar items only if necessary and safe.

## Content Direction

### Hero

Make the hero clear:

```txt
Luis Ruiz builds practical AI, web, and automation systems for small businesses, creators, and operators.
```

Secondary message:

```txt
Through ruizTechServices, Gio turns messy workflows into clean digital systems: dashboards, automations, AI assistants, websites, and internal tools.
```

Primary CTAs:

```txt
View Services → /services
See Projects → /projects
Contact Gio → /contact
```

If `/services` or `/systems` do not exist yet, link to `/contact` and `/projects` for now or create simple placeholder pages only if necessary.

### PublicStatusPanel

Show public-safe focus areas:

```txt
ruizTechServices
Client dashboards
AI tooling
Nucleus
Build log
```

Do not show private money/leads/decision data.

### ServiceCards

Include these service cards:

```txt
Website & App Builds
AI Chatbots & Assistants
Business Automation
Internal Dashboards
Tech Advisory
NYC On-Site Tech Support
```

### SystemsOverview

Explain the public-facing operating systems:

```txt
Project System
Client System
AI System
Content System
Revenue System
```

Keep this high-level and sales-friendly.

### FeaturedProjects

Use existing project data if there is a clean public helper available.

If using database data adds too much scope, make this a static component with links to `/projects`.

Do not introduce new database requirements in this spec.

### CaseStudyPreview

Preview proof-of-work/case-study style:

```txt
Problem
System built
Tools used
Result / current status
```

Keep claims honest. Do not make up metrics.

## UI Requirements

- responsive
- readable dark mode
- dashboard-inspired but public-friendly
- no private dashboard leak
- no giant single component
- no unsupported performance claims

## Do Not Touch

- `/gio_dash`
- `/dashboard`
- Nucleus routes
- round-robin routes
- Ollama routes
- Supabase migrations
- payment code

## Acceptance Criteria

- `/` renders with the new master-hub sections.
- Build passes or any failure is documented if unrelated.
- Existing public routes are not broken.
- No private owner/dashboard data appears on `/`.
- `context/progress-tracker.md` is updated.

## Required Checks

Run:

```bash
npm run build
```

If lint is available and not broken by existing config:

```bash
npm run lint
```

## Progress Tracker Update

After implementation, append an entry under `Latest Log` in:

```txt
context/progress-tracker.md
```

Include:

- files changed
- summary
- verification commands and results
- known issues
- next recommended spec: `002-owner-dashboard-shell.md`
