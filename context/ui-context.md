# UI Context — Luis-Ruiz Master Hub

## Design Goal

The UI should feel like a serious technical operator's hub:

- polished
- sharp
- useful
- dashboard-oriented
- not childish
- not gimmicky
- not overdecorated

The site should communicate:

```txt
Gio builds practical web, AI, and automation systems for small businesses and operators.
```

## Public Homepage Direction

The public homepage should become a master hub landing page.

Recommended sections:

```txt
1. MasterHero
2. PublicStatusPanel
3. ServiceCards
4. SystemsOverview
5. FeaturedProjects
6. CaseStudyPreview
7. HomeCTA
```

### MasterHero

Purpose:

- explain who Gio is
- explain what he builds
- route visitors to services, projects, contact

Suggested copy direction:

```txt
Luis Ruiz builds practical AI, web, and automation systems for small businesses, creators, and operators.
```

Avoid unsupported claims like:

```txt
99.9% uptime
sub-200ms latency
100+ concurrent users
```

unless these are measured in production and can be defended.

### PublicStatusPanel

Purpose:

- show current focus areas without exposing private data

Example cards:

```txt
ruizTechServices
Nucleus
AI tooling
Client dashboards
Build log
```

### ServiceCards

Core services:

```txt
Website and app builds
AI chatbot implementation
Business automation
Internal dashboards
Tech advisory
NYC on-site tech support
```

### SystemsOverview

Explain the public version of Gio's systems:

```txt
Project system
Client system
AI system
Content system
Revenue system
```

Do not expose private operational records.

### FeaturedProjects

Use public projects/case studies where possible.

Show:

```txt
project name
summary
stack
status
live/repo link if available
```

### HomeCTA

Route visitors to:

```txt
/contact
/services
/projects
```

## Owner Dashboard UI Direction

`/gio_dash` should feel like a private command center.

Recommended first screen:

```txt
Gio Command Center
Today: <date>
Primary Focus: <active project>
Next Money Move: <lead/client action>
Blocked: <count>

[Revenue Snapshot] [Open Leads] [Active Projects]
[Today Focus]      [Quick Actions] [System Links]
[Decisions Log]    [Content Queue] [AI Tools]
```

## Dashboard Card Rules

Every dashboard card should answer at least one of:

```txt
What matters?
What is blocked?
What is next?
What changed recently?
What can Gio act on now?
```

Avoid cards that are only decorative.

## Dashboard Layout Rules

Use grid.

Suggested layout:

```txt
container mx-auto px-4 sm:px-6 lg:px-8 py-8
header section
metrics grid
main card grid
```

Suggested responsive grid:

```txt
grid grid-cols-1 lg:grid-cols-12 gap-6
```

Example card spans:

```txt
RevenueSnapshotCard    lg:col-span-4
OpenLeadsCard          lg:col-span-4
ActiveProjectsCard     lg:col-span-4
TodayFocusCard         lg:col-span-6
SystemLinksCard        lg:col-span-6
DecisionsLogCard       lg:col-span-6
ContentQueueCard       lg:col-span-3
AiToolsCard            lg:col-span-3
```

## Suggested Visual Style

Use:

- neutral/dark-friendly backgrounds
- subtle gradients only where useful
- clean card borders
- clear typography hierarchy
- muted metadata
- status badges
- concise action buttons

Suggested card class pattern:

```txt
rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70
```

## Status Badge Vocabulary

Projects:

```txt
idea
validated
building
testing
shipped
selling
paused
archived
```

Leads:

```txt
new
contacted
qualified
proposal_sent
deposit_paid
in_progress
delivered
lost
archived
```

Systems:

```txt
active
paused
needs_review
broken
archived
```

Decisions:

```txt
active
revisit
reversed
archived
```

## Navigation Direction

The public nav should prioritize:

```txt
Home
Services
Projects
Systems
Blog
Contact
Dashboard/Login
```

Owner dashboard sidebar should prioritize:

```txt
Overview
Projects
Leads
Clients
Money
Content
Systems
AI Tools
Notes
Settings
```

Do not overload the public nav with every experiment.

## Copy Style

Use direct, business-friendly language.

Good:

```txt
I build dashboards, automations, and AI tools that make business operations easier to run.
```

Bad:

```txt
Unlocking the infinite possibilities of tomorrow's intelligent digital transformation paradigm.
```

## Accessibility Rules

- maintain readable contrast
- use semantic headings
- use accessible button/link labels
- do not rely only on color for status
- keep tap targets usable on mobile

## Mobile Direction

Public site must be mobile-friendly.

Owner dashboard should be usable on mobile but optimized for desktop first.

Avoid horizontal overflow.
