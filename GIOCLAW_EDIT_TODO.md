# GioClaw Edit, Codebase Analysis and Execution To-Do

## Executive Summary

This document is meant to do three things:
- describe what the repo actually is today
- identify the highest-value strategic and technical corrections
- provide a realistic execution order so the project does not drift into scattered redesign work

## Intro Summary

This repository is not a simple portfolio site.

It is already a broader Next.js application with several overlapping responsibilities:
- a personal landing page for Luis Ruiz
- a blog backed by Supabase
- a projects page backed by Supabase
- a contact and lead capture system
- an owner-only admin area under `/gio_dash`
- an Ollama and multi-provider AI experimentation surface
- GitHub proxy utilities
- a round-robin multi-model experiment
- early Nucleus billing/subscription surfaces
- photo storage and hero slideshow support through Supabase Storage

That matters because the current problem is **not just copy**.
The real issue is that the repo contains **more capability than the homepage communicates**, while also containing **more product surface area than the current information architecture cleanly supports**.

The codebase already proves:
- real App Router usage
- real server/client component separation in several places
- Supabase-backed content and data flows
- auth-aware owner gating
- blog CRUD foundations
- project storage foundations
- AI/provider experimentation beyond a normal portfolio site

But it also clearly shows:
- homepage messaging lagging far behind the actual technical direction
- mixed brand identity between portfolio, founder site, AI lab, and services business
- uneven frontend quality across sections
- admin/dashboard scope that exists, but is not yet tightly modeled around actual workflows
- several places where the site still reads as a generic developer portfolio despite the repo being more founder-builder/product-system oriented

My strongest codebase-grounded conclusion:

**luis-ruiz.com should be reworked into a founder-builder gateway that proves technical capability through projects, public build activity, and selective business routing to ruizTechServices, instead of continuing as a generic full-stack portfolio.**

## Short version, what this project actually needs first

Before adding more systems, the repo needs four corrections:
1. a sharper public identity
2. a cleaner homepage information architecture
3. richer content models for projects and build-log content
4. an admin surface defined around real workflows instead of scattered utilities

If those four are handled well, the later automation ideas become assets.
If those four are not handled well, the automation ideas will amplify confusion.

---

## What the codebase currently is

## Core app structure
- Framework: Next.js 15 App Router
- React: 19.1.0
- TypeScript: 5.9.3
- Styling: Tailwind v4 + shadcn/ui + custom gradients/glassmorphism styling
- Data/backend: Supabase
- AI stack: OpenAI, Anthropic, Google, Mistral, Hugging Face, xAI, Ollama
- Billing package presence: Stripe exists in dependencies and Nucleus-related routes

## Current top-level public routes observed
- `/` homepage
- `/blog`
- `/projects`
- `/contact`
- `/about`
- `/ollama`
- `/round-robin`
- `/login`
- `/signup`
- `/dashboard`
- `/gio_dash`
- `/nucleus/...`
- `/robots.txt`
- `/sitemap.xml`

## Current homepage composition
`app/page.tsx` currently renders:
- `Hero`
- `Highlights`
- `Quote`
- `LatestPushesSection`
- `TechSection`
- `CallToAction`

This is still built from the older homepage component structure, but the messaging layer has already been materially rewritten away from a generic personal portfolio.
It is now moving toward a founder-builder gateway, even though deeper structural cleanup is still needed.

---

## Codebase-grounded findings by area

## 1. Homepage identity is currently inaccurate to the repo

### Updated status
This was one of the first major corrections already completed.

The hero no longer frames Luis as a generic "Full-Stack Developer" and has been tightened further to be faster and more direct.
It now positions the site around public execution, real software, ruizTechServices, and stronger routing toward Projects and Blog / Build Log.

### Remaining issue
The hero direction is much better, but the overall homepage still needs deeper structural tightening so the rest of the page keeps up with the improved top-of-page framing.

### Conclusion
Hero rewrite is in progress enough to count as materially completed, but homepage cohesion work is still active.

---

## 2. Highlights section is generic and likely hurting trust

`components/app/landing_page/Highlights.tsx` was already rewritten.

### Updated status
The generic freelancer metrics were removed and replaced with a more truthful founder-builder framing around:
- ruizTechServices
- Projects
- Blog / Build Log
- Current Direction

### Remaining issue
This section is directionally better, but still may need another quality pass once the broader site architecture settles.

### Conclusion
This item is materially completed at first-pass level.

---

## 3. The homepage design language is ambitious, but the content model is not coherent enough yet

### Observed strengths
- `Hero.tsx` has a visually ambitious animated background and slideshow system
- `useHeroSlides` and availability badge logic add real dynamism
- the site tries to feel premium and technically expressive

### Observed weaknesses
- several sections still use generic, resume-like copy
- visual ambition is higher than message precision
- "Tech Stack" and stats presentation feel broader than the trust story they support
- section sequencing still feels like a traditional portfolio rather than a purposeful founder/business gateway

### Conclusion
The problem is not "make it prettier."
The problem is **match the frontend narrative to the repo’s actual depth and future direction**.

---

## 4. Projects already exist, but the current model is too thin for your intended direction

### Current implementation
- `/projects` loads records from Supabase via `lib/db/projects.ts`
- current stored project shape is very minimal:
  - `url`
  - `title`
  - `description`
  - timestamps
- project create/update API exists at `/api/projects`
- owner-gated upsert is already implemented

### Current weakness
This data model is not sufficient for:
- strong case studies
- distinguishing products vs projects
- completion state
- public build status
- SEO-rich project pages
- repo-linked project automation
- image galleries / thumbnails / categories / tags / tech stack / outcomes

### Conclusion
The current projects system is real, but too shallow.
It needs a richer content model before it can support the site you described.

---

## 5. Blog foundations are stronger than the homepage currently takes advantage of

### Current implementation
- `/blog` is backed by Supabase table `blog_posts`
- pagination exists
- tag filtering exists
- admin list exists under `/gio_dash/blog`
- manual post creation exists under `/gio_dash/blog/new`
- comments and votes are implemented
- admin stats use a DB RPC `get_blog_posts_with_stats`

### Strategic significance
This is important because your desired public "build in public" direction already has a partial platform.
You are not starting from zero.

### Current weakness
The blog is currently more of a standard content system than a deliberate build-log engine.
There is no visible repo-to-blog automation pipeline yet in the code I reviewed.

### Updated status
This has been partially completed.
The public language now uses Blog / Build Log framing, the `/blog` page has been rewritten to feel more like a public execution layer, and the site now connects blog content more deliberately to projects.

### Remaining issue
The blog still needs deeper content and stronger population, but the direction and framing are no longer stuck at generic blog-CMS level.

### Conclusion
This item is in active implementation, not untouched.

---

## 6. Contact flow is functional, but not yet shaped around your desired business pipeline

### Current implementation
- contact page exists
- schema validation is solid via `zod`
- submissions go into Supabase `contactlist`
- admin contacts view exists under `/gio_dash/contacts`
- optional qualification fields already exist:
  - budget
  - timeline
  - preferred contact

### Current weakness
The copy still reads like a generic agency/freelancer contact form in parts.
There is no current booking model.
There is no current deposit flow.
There is no calendaring logic.
There is no intake state machine around leads.

### Conclusion
The contact system is a valid foundation, but it is not yet a complete business intake system.
Do not overstate it until the workflow exists.

---

## 7. Admin dashboard exists, but it needs product definition, not just UI polish

### Current implementation
`/gio_dash` includes:
- stats cards
- blog area
- contacts area
- photos management
- health/testing cards
- settings/config cards
- quick actions
- GitHub API tester card

### Good news
There is a real owner-only administrative foundation here.
This is useful.

### Problem
The dashboard currently feels like a collection of admin widgets rather than a carefully defined command center for your actual workflows.

### Based on your goals, the admin should eventually center around:
- contact lead review
- project/project-entry publishing
- blog/build-log publishing
- repo ingestion and analysis status
- content approval state
- payment/deposit tracking
- booking and availability controls
- site settings / hero content / carousel management

### Conclusion
Do not just "improve the dashboard UI."
First define what the admin is actually for.

---

## 8. There is no real customer dashboard concept yet

You mentioned customer dashboard concerns.
From the code I reviewed, the owner admin area is real, but there is not yet an obviously mature client/customer workflow surface.

### Conclusion
A customer dashboard should not be expanded until its exact use cases are defined.
Otherwise it risks becoming complexity theater.

Possible valid future uses:
- project status
- files and approvals
- invoices/deposits
- onboarding forms
- delivery links
- communication log

If those workflows are not real yet, keep this out of the first major rewrite.

---

## 9. The repo contains several side systems that increase capability, but also increase brand confusion

Observed side systems include:
- Ollama chat UI and APIs
- round-robin multi-model experimentation
- GitHub proxy route and repo helpers
- Nucleus subscription and purchase routes
- photo storage admin

### Why this matters
These prove technical breadth.
But they also create a risk:
If the public-facing site doesn’t clearly separate identity, proof, experiments, and business surfaces, the site can feel like several unrelated products bolted together.

### Conclusion
The public IA must separate:
- core identity
- projects/proof
- build log
- experiments
- business/contact routing

---

## 10. Brand architecture is currently not explicit enough

From the code and current copy, the repo still mixes these identities loosely:
- Luis Giovanni Ruiz personal portfolio
- Gio identity
- ruizTechServices business identity
- 24Hour-AI as major project/product
- broader AI experimentation identity

### Based on your stated direction, recommended architecture
- **Luis Ruiz** = primary public personal identity on this site
- **ruizTechServices** = prominently promoted business/studio layer behind the work
- **24Hour-AI** = featured product/side project, but not the whole site identity
- **Gio** = internal/personal nickname, not necessarily the primary public label on the site

### Conclusion
This should be made explicit in copy, nav, section labels, and content modeling.

---

## Corrected strategic direction for this repo

The most correct codebase-grounded direction is:

**Turn luis-ruiz.com into a founder-builder gateway with visible proof-of-work, a public build log, intentional promotion of ruizTechServices, and a cleaner separation between products, projects, and admin/business operations.**

Not:
- generic full-stack portfolio
- pure agency site
- pure AI demo site
- pure blog

## Recommended public site model

### Homepage job
The homepage should:
- establish who Luis is
- show what kind of work he is building
- prove technical seriousness quickly
- route trust toward projects, build log, and contact
- promote ruizTechServices without collapsing the whole site into a company brochure

### Supporting sections and routes
- **Projects** should show proof and completed or substantial builds
- **Build Log / Blog** should document active work and public progress
- **About** should carry the more personal story and long-term direction
- **Contact** should serve as the intake point for collaboration and client work
- **ruizTechServices** should be visible as the business layer behind the work

### Brand model
- **Luis Ruiz** = primary public identity
- **ruizTechServices** = business/studio layer
- **24Hour-AI** = featured side project or flagship experiment, not the whole site identity

---

# Detailed To-Do List

## Phase 0, establish truth before redesign

### Deliverable for this phase
A short source-of-truth planning doc that locks identity, content buckets, and nav direction before visual changes start.

- [x] Audit all current homepage copy and remove claims that are generic, inflated, or not strongly evidenced by the repo or public outputs.
- [x] Make a source-of-truth content doc for site identity:
  - public name to display
  - short positioning statement
  - one-sentence business relationship to ruizTechServices
  - role of 24Hour-AI
  - whether "Gio" appears publicly at all, and where
- [x] Define the exact public distinction between:
  - Products
  - Projects
  - Build Log
  - ruizTechServices
- [x] Decide whether `/ollama` and `/round-robin` are public proof surfaces, sandbox experiments, or things that should be de-emphasized in the main nav.

---

## Phase 1, rewrite the homepage around the actual direction

### Deliverable for this phase
A rewritten homepage with corrected hero, corrected section structure, and copy that reflects the actual repo direction.

### Hero
- [x] Replace the current "Full-Stack Developer" hero framing.
- [x] Rewrite the hero headline/subheadline around founder-builder + AI/product/systems direction.
- [x] Decide whether the primary CTA should be:
  - Contact / Work With Me
  - View Projects
  - Read Build Log
- [x] Keep the slideshow/carousel concept, but ensure it supports trust instead of feeling decorative-only.
- [x] Re-evaluate whether the availability badge text reflects actual availability and desired business positioning.

### Section architecture
- [x] Replace or rework `Highlights.tsx` entirely.
- [x] Remove generic freelancer metrics unless each one is explicitly supportable.
- [ ] Reorder homepage sections around a deliberate founder-builder sequence.
  - Current reality: homepage now includes `LatestPushesSection`, but it still renders `Quote` and `TechSection`, and does not yet have a true mini-about or selected-projects-first structure.
- [x] Decide whether `Quote` still belongs on the homepage at all.
- [ ] Re-evaluate whether `TechSection` should remain a full homepage block, be condensed, or be repositioned as proof rather than filler.
  - Current reality: it still exists as a full homepage section.
- [x] Preserve the image carousel, but give it a more intentional role in communicating proof, identity, or active work.

### Suggested first homepage rewrite scope
- [x] `Hero.tsx`
- [x] `Highlights.tsx`
- [x] `app/page.tsx`
- [x] `components/app/landing_page/Navbar.tsx`
- [x] `components/app/landing_page/navbarItems.ts`
- [x] `components/app/landing_page/CallToAction.tsx`
- [x] `app/layout.tsx` metadata

### Copy discipline
- [x] Rewrite all homepage text to reflect facts, not aspiration theater.
- [x] Remove vague phrases like:
  - next-generation digital experiences
  - scalable web experiences
  - production-ready without context
  - generic service/freelancer promises
- [x] Move more personal identity details, like Bronx-born and bilingual, into mini-about or About page rather than hero.

---

## Phase 2, redesign the information architecture

### Deliverable for this phase
A stable public structure for homepage, projects, build log, about, and contact that can absorb future automation without becoming messy.

### Navigation
- [x] Modify the navbar to reflect the real site architecture.
- [ ] Reconsider whether default public nav should be something like:
  - Home
  - Projects
  - Build Log / Blog
  - About
  - Contact
  - ruizTechServices
  - Current reality: nav is improved, but still uses `Experiments` and `Round-Robin`, and does not yet include `About` or an explicit ruizTechServices route.
- [x] Decide whether Chat and Round-Robin belong in the top-level nav or should move under an experiments/tools area.
- [x] Align nav labels with the founder-builder direction instead of portfolio-era labels.

### Public route model
- [x] Decide whether `/blog` should remain named Blog publicly or be reframed as Build Log while preserving the route.
- [ ] Decide whether `/projects` should eventually split into:
  - `/projects`
  - `/products`
  or whether one route can handle filtered categories.
- [x] Determine whether an `/about` route should be added or expanded to better hold your story and long-term vision.

---

## Phase 3, fix the data models so the site can grow correctly

### Deliverable for this phase
A content model that supports products/projects/build-log publishing, filtering, SEO, and future automation.

### Projects model
- [ ] Expand the `projects` table and related types beyond `url`, `title`, `description`.
- [ ] Add fields such as:
  - slug
  - status (`draft`, `active`, `complete`, `archived`)
  - category (`project`, `product`, `client`, `experiment`)
  - summary
  - long description / case study body
  - repo URL
  - live URL
  - featured image / cover
  - tags / stack
  - visibility
  - featured flag
  - started_at / completed_at
- [ ] Add enough metadata to power homepage cards, project pages, and automated publishing.

### Blog/build-log model
- [x] Decide whether current `blog_posts` schema is enough for build-log content.
- [x] Add fields if needed for:
  - post type (`build-log`, `essay`, `announcement`, `project-update`)
  - linked project id
  - publish status
  - canonical slug
  - SEO metadata
- [ ] Ensure blog content can support repo-generated updates without becoming junk.

Note: a structural project-to-blog relationship layer has now been added via a join table approach (`project_blog_links`), but the broader blog/project content model is still too shallow.

### Contact and lead model
- [ ] Extend contact submission handling to support lead stages, not just raw intake.
- [ ] Consider future fields for:
  - lead status
  - follow-up notes
  - estimated value
  - deposit status
  - booking status
- [ ] Keep current validation strengths while making the model business-usable.

---

## Phase 4, build the repo -> analysis -> blog pipeline correctly

### Deliverable for this phase
A trustworthy repo-ingestion and review pipeline that produces factual build-log drafts and, when appropriate, structured project entries.

This is one of the highest-leverage features you described.

### Required pipeline steps
- [ ] Define the trigger model:
  - manual trigger
  - GitHub webhook
  - scheduled polling
  - admin dashboard trigger
- [ ] Define repo analysis output schema.
- [ ] Extract factual signals such as:
  - repo name
  - stack used
  - app purpose
  - route structure
  - components/modules of note
  - architecture patterns
  - APIs/services used
  - current maturity/status
  - likely user/business use
- [ ] Feed the analysis output into a second-stage content generator for blog/build-log drafting.
- [ ] Create a human review step before publishing.
- [ ] Only publish to `/projects` when completion criteria are met.
- [ ] Create project completion criteria explicitly.

### Guardrails
- [ ] Prevent fake or generic AI writeups.
- [ ] Require repo-grounded facts.
- [ ] Avoid inflated claims about impact, usage, or architecture.
- [ ] Force editorial review for tone and correctness before publish.

### Output targets
- [ ] automatic draft to blog/build-log
- [ ] optional project record creation/update
- [ ] optional homepage "latest update" feed

---

## Phase 5, define the admin dashboard around real workflows

### Deliverable for this phase
An admin dashboard that reflects real business and publishing operations rather than miscellaneous internal tools.

### Admin should eventually manage
- [ ] contacts and lead intake
- [ ] project records
- [ ] product records
- [ ] build-log/blog drafts
- [ ] publishing workflow
- [ ] availability status
- [ ] hero carousel/images
- [ ] repo analysis jobs
- [ ] deposit/payment tracking
- [ ] booking requests

### Dashboard cleanup
- [ ] Audit each existing gio_dash card for actual usefulness.
- [ ] Remove or defer dashboard widgets that do not support a real workflow.
- [ ] Reorganize the dashboard around operational categories, not miscellaneous cards.
- [ ] Define admin homepage priorities:
  - urgent leads
  - unpublished drafts
  - recent project changes
  - system health
  - pending actions

---

## Phase 6, contact, booking, and payment system

### Deliverable for this phase
A realistic intake system: contact first, then scheduling, then deposits, each added only when the workflow is clearly defined.

### Contact
- [x] Rewrite contact page copy so it reflects your actual business and collaboration goals.
- [x] Replace placeholder direct email (`hello@example.com`) with real business contact info.
- [x] Ensure the contact form language matches Luis + ruizTechServices branding.

### Booking
- [ ] Design a scheduling concept before coding it.
- [ ] Decide whether users request time slots or book directly.
- [ ] Connect Google Calendar in a privacy-safe way that exposes availability, not raw schedule details.
- [ ] Represent unavailable periods publicly as blocked without leaking calendar metadata.

### Payments
- [ ] Define exact deposit workflow for the fixed `$50` deposit.
- [ ] Decide what the deposit means:
  - consultation reservation
  - project intake qualification
  - discovery session
  - general commitment fee
- [ ] Build Stripe integration only after that workflow is clear.
- [ ] Store payment/deposit status in admin-facing data.

---

## Phase 7, frontend quality and design system cleanup

### Deliverable for this phase
A more coherent visual system where trust, clarity, and seriousness beat decoration for decoration’s sake.

You explicitly called out current design as a weakness.
That deserves real treatment, not vague remarks.

### Frontend audit tasks
- [ ] Audit the landing page for visual consistency.
- [ ] Reduce sections that feel ornamental but low-signal.
- [ ] Improve hierarchy so technical seriousness is visible in the interface, not only implied in code.
- [ ] Re-evaluate glassmorphism, gradients, and decorative motion against clarity and trust.
- [ ] Make projects/proof visually easier to scan and understand.
- [ ] Ensure founder-builder positioning reads from layout, not just text.

### Consistency issues to review
- [ ] spacing rhythm
- [ ] section contrast and density
- [ ] CTA consistency
- [ ] heading logic
- [ ] whether some sections look more premium than others
- [ ] whether dashboard styling and public-site styling belong to the same design language

---

## Phase 8, modularity and codebase cleanup

### Deliverable for this phase
Cleaner boundaries between marketing, admin, experiments, content models, and data access.

You specifically mentioned lack of correct modularity.
That is a real concern here.

### Immediate codebase cleanup targets
- [ ] Audit public-site components for responsibilities that are too mixed.
- [ ] Identify duplicated presentation patterns across landing page sections.
- [ ] Normalize naming conventions, especially where casing/file names vary such as `techSection.tsx`.
- [ ] Review server/client boundaries for overuse of client components where not necessary.
- [ ] Review route and component organization to ensure experiments do not muddy core site architecture.
- [ ] Establish a cleaner content-domain separation, for example:
  - `marketing`
  - `blog`
  - `projects`
  - `admin`
  - `experiments`

### Backend/content cleanup
- [ ] Centralize content model types where possible.
- [ ] Formalize API contracts for projects/blog/contact/admin workflows.
- [ ] Add missing data-layer abstractions where routes are too tightly coupled to tables.

---

## Phase 9, SEO and public discoverability

### Deliverable for this phase
Accurate metadata and route-level SEO that reflect the founder-builder and ruizTechServices direction.

You explicitly want correct SEO.
Right now the base metadata is weak.

### Observed current issue
This was previously true, but has already been corrected.

`app/layout.tsx` now uses:
- title: `Luis Ruiz | Founder-Builder at ruizTechServices`
- description: `Founder-builder creating AI products, public software experiments, and practical digital systems through ruizTechServices.`

### SEO to-do
- [x] Rewrite global metadata.
- [ ] Add route-level metadata for homepage, blog, projects, contact, and future about/products pages.
  - Current reality: `about` and `projects` have explicit metadata, but this is not yet consistently done across the full public surface.
- [ ] Create proper titles/descriptions aligned with founder-builder + ruizTechServices direction.
- [ ] Add Open Graph and Twitter metadata.
- [ ] Add structured data where useful.
- [ ] Ensure blog posts and future project pages have strong metadata.
- [ ] Turn the build log into an SEO asset instead of just a content bucket.

---

## Phase 10, public proof strategy

### Deliverable for this phase
A public proof system where projects, build-log entries, and selected products reinforce one another.

Because your goal is trust, proof must become more legible.

### Proof tasks
- [x] Reframe existing projects as evidence, not just embeds.
- [ ] Add context to project cards/pages:
  - what it is
  - why it exists
  - what stack it uses
  - what problem it solves
  - whether it is active, experimental, or complete
- [ ] Decide which existing repos/builds deserve featured status.
- [ ] Explicitly distinguish polished/completed work from public in-progress work.
- [ ] Use the blog/build-log to reinforce credibility over time.

---

## Implementation sequence I recommend

## Immediate first moves
- [x] Rewrite hero and homepage framing
- [x] Replace Highlights with a truthful, founder-builder-aligned section
- [ ] Redefine navbar and homepage section order
- [x] Rewrite site metadata
- [x] Define Products vs Projects vs Build Log cleanly

## Next moves
- [ ] Expand project content model
- [x] Reframe blog into build-log strategy
- [ ] Define admin workflows and simplify dashboard purpose
- [ ] Clean contact/business intake language and admin visibility

## Later moves
- [ ] Build repo-analysis-to-blog pipeline
- [ ] Implement booking/privacy-safe calendar flow
- [ ] Implement Stripe $50 deposit flow
- [x] Evaluate whether a customer dashboard is actually needed

---

## Suggested milestone sequence

### Milestone 1, identity and homepage correction
- rewrite hero and homepage framing
- replace generic highlights
- adjust nav and metadata
- preserve carousel while giving it a clearer purpose

Status: materially underway. Core first-pass homepage, nav, metadata, carousel treatment, `/about`, `robots.txt`, and `sitemap.xml` are already implemented, but the homepage section order is still not fully aligned with the intended information architecture.

### Milestone 2, content model correction
- define Products vs Projects vs Build Log
- expand project schema
- decide whether Blog is publicly branded as Build Log

Status: partially underway. Products vs Projects vs Blog / Build Log is clearer in public framing, project-to-blog structural linking has been added, but richer schema expansion is still pending.

### Milestone 3, operational correction
- define admin workflows
- clean contact/admin pipeline
- decide what booking and deposits really mean before coding them

Status: admin blog workflow is materially improved, but the broader admin/dashboard model is still not sufficiently defined.

### Milestone 4, automation and growth systems
- repo analysis pipeline
- build-log generation workflow
- project auto-draft logic with human review

Status: not started yet beyond planning.

---

## Accuracy corrections added after QA and follow-up implementation

These were completed after the earlier planning pass and should no longer sit as implied open problems:

- [x] Add `/about` route
- [x] Add `robots.txt`
- [x] Add `sitemap.xml`
- [x] Fix homepage/global metadata away from generic portfolio language
- [x] Remove Edge-runtime Supabase middleware import path that was causing build/runtime warning pressure

These remain open because the work is still only partially done or not yet done:

- [ ] Finalize homepage section order and mini-about/proof structure
- [ ] Finish public nav architecture, including whether `Experiments` and `Round-Robin` stay top-level
- [ ] Expand project schema into a true case-study/product model
- [ ] Define actual admin workflows before further dashboard growth
- [ ] Build the repo → analysis → build-log pipeline
- [ ] Define booking/deposit workflow before implementing it

## Final blunt assessment

This repo already contains enough technical substance to support a much stronger public identity than it currently presents.

The biggest risk is not lack of capability.
The biggest risk is **identity sprawl**:
trying to be a portfolio, AI lab, founder site, services funnel, admin tool, product hub, and experiment sandbox without clearly separating those roles.

So the correct move is not to pile on more features first.
The correct move is to:
- clarify identity
- restructure public information architecture
- deepen the project/blog content model
- define admin workflows
- then automate the build-in-public pipeline on top of that stronger foundation

That sequence is the most correct one supported by the current codebase.
