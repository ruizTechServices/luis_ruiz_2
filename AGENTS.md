# Agents

## Scope

This file is derived from the current codebase and SQL migrations. It describes how the system should work systemically based on the implementation in this repository.

## System Identity

This repository is a Next.js 15 application that combines these product layers inside one deployable system:

1. A public personal/business site for Luis Ruiz and ruizTechServices.
2. A public projects and case-study surface backed by Supabase.
3. A public blog/build-log surface backed by Supabase.
4. An owner-only operations dashboard under `app/gio_dash`.
5. A client/user dashboard foundation under `app/dashboard`.
6. Several AI experiment surfaces, including Ollama chat and a multi-model round-robin discussion tool.

The codebase is not a single-purpose app. It is a portfolio site, CMS, owner ops console, client portal foundation, and AI sandbox sharing one runtime and one Supabase backend.

## Primary Runtime Model

The application uses the Next.js App Router.

- Public pages are rendered from `app/*`.
- API behavior lives under `app/api/*`.
- Shared domain logic lives in `lib/*`.
- UI primitives are mostly in `components/ui/*`.
- Product-specific UI lives in `components/app/*` and `components/round-robin/*`.
- Supabase is the core persistence layer for content, auth, chat history, storage, and dashboard operations.
- External providers include OpenAI, Anthropic, Mistral, Gemini, Hugging Face, xAI, GitHub, Pinecone, and Ollama.

Systemically, the app should be understood as a set of thin route handlers and page entrypoints over a denser service layer in `lib`.

## Core Domains

### 1. Public Site Shell

The root layout in `app/layout.tsx` defines the shared shell:

- global CSS
- navbar
- footer
- analytics
- back-to-top behavior

The homepage in `app/page.tsx` is the public master hub and composes `components/app/home/*` sections: `MasterHero`, `PublicStatusPanel`, `ServiceCards`, `SystemsOverview`, `FeaturedProjects`, `CaseStudyPreview`, and `HomeCTA`.

### 2. Projects Domain

Projects are stored in Supabase and exposed publicly through `app/projects/page.tsx`.

Important characteristics:

- `lib/db/projects.ts` is the main read layer.
- Public listing is filtered to `visibility in ('public', 'unlisted')`.
- Projects have evolved beyond simple links into case-study records.
- SQL migration `20260412_195500_expand_projects_for_case_studies.sql` expands the schema into a structured narrative model.
- Projects can be linked to blog posts through `project_blog_links`.

Systemically, projects are the durable proof-of-work layer, while blog posts provide a temporal execution trail around them.

### 3. Blog Domain

Blog data lives in Supabase and is rendered through `app/blog/page.tsx` and `app/blog/[id]/page.tsx`.

Important characteristics:

- `blog_posts` is the primary table.
- `comments` and `votes` extend engagement.
- `project_blog_links` connects posts back to projects.
- `lib/db/blog.ts` centralizes admin-facing reads and write helpers.
- SQL function `get_blog_posts_with_stats()` avoids N+1 count behavior for admin views.

Systemically, the blog functions as a public build log that validates ongoing execution.

### 4. Contact / Lead Intake Domain

The contact surface is a structured lead intake system:

- UI: `components/app/contact/ContactForm.tsx`
- validation: `lib/validation/contact.ts`
- ingestion API: `app/api/contact/route.ts`
- admin access: `lib/db/contactlist.ts` and dashboard cards

Contact requests are normalized, validated with Zod, and inserted into Supabase `contactlist`.

### 5. Owner Dashboard Domain

The `gio_dash` area is the operational backend for the site.

Access model:

- `app/gio_dash/layout.tsx` requires a signed-in user.
- owner authorization is email-based via `OWNER_EMAILS`.
- `lib/auth/ownership.ts` is the canonical ownership check.
- `lib/auth/require-owner.ts` protects mutating server routes.

Capabilities present in code:

- site stats
- blog administration
- project editing
- photo management
- contact inbox access
- GitHub API testing
- system health inspection

The master dashboard has a dedicated operational data layer:

- migration: `supabase/migrations/20260519_create_master_dashboard_tables.sql`
- typed read helpers and shared types in `lib/functions/master-dashboard/`
- owner-only API foundations under `app/api/dashboard/{projects,leads,money,decisions,system-links}/route.ts`
- `/gio_dash` cards read live data through `getMasterDashboardOverview`
- read-only owner section pages at `/gio_dash/leads`, `/gio_dash/money`, `/gio_dash/systems`, and `/gio_dash/notes`

### 6. Client Dashboard Domain

The `/dashboard` route is the authenticated non-owner client portal foundation.

Access model:

- unauthenticated users redirect to `/login`
- owner users redirect to `/gio_dash`
- signed-in non-owner users render `components/app/client_dashboard/ClientDashboardView`

Current behavior:

- the shell is placeholder-only until client-specific records exist
- sections include Project Status, Recent Updates, Deliverables, Invoices / Payments, Messages, and Support / Contact Gio
- the route does not read owner-only dashboard operational tables or private owner records

### 7. Photos / Media Domain

Photos are managed via Supabase Storage:

- listing and deletion: `app/api/photos/route.ts`
- upload: `app/api/photos/upload/route.ts`
- restore: `app/api/photos/restore/route.ts`
- seed hero images: `app/api/photos/seed-hero/route.ts`
- owner UI: `app/gio_dash/photos/*`

The API generates signed URLs and falls back to public URLs where necessary.

### 8. Ollama Chat / Memory Domain

There are two Ollama-facing chat surfaces:

- simple streaming chat via `app/api/chat/route.ts`
- richer persistence/context-enabled chat via `app/api/ollama/route.ts`

The richer route streams responses from Ollama, persists user and assistant messages, generates embeddings through OpenAI, stores embeddings in `chat_embeddings`, stores contextual memory in `gios_context`, and can retrieve similar context via Supabase RPC `match_gios_context`.

### 9. Round-Robin Multi-Model Discussion Domain

The round-robin feature is a stateful orchestration system:

- UI: `app/round-robin/page.tsx`
- session create: `app/api/round-robin/route.ts`
- SSE execution: `app/api/round-robin/stream/route.ts`
- follow-up controls: `continue`, `resume`, `action`
- client state: `lib/round-robin/reducer.ts`, `useRoundRobinStream.ts`
- provider adapters: `lib/round-robin/providers/*`

Important systemic behavior:

- sessions persist to `round_robin_sessions`
- messages persist to `round_robin_messages`
- one round equals one turn per active model
- after a round completes, the session pauses into `awaiting_user`
- the stream route performs real orchestration inline
- `lib/round-robin/orchestrator.ts` and `prompt-builder.ts` are placeholders, not the real logic

## Persistence Model

Supabase is the dominant system of record.

The code indicates these main persisted domains:

- `projects`
- `blog_posts`
- `project_blog_links`
- `comments`
- `votes`
- `contactlist`
- `chat_messages`
- `chat_embeddings`
- `conversations`
- `gios_context`
- `round_robin_sessions`
- `round_robin_messages`
- `dashboard_projects`
- `dashboard_leads`
- `dashboard_clients`
- `dashboard_money_entries`
- `dashboard_decisions`
- `dashboard_system_links`

Supabase Storage is also part of the data model through the photos bucket.

The application depends on database-side helpers and policies such as `get_blog_posts_with_stats`, likely `next_chat_id`, and likely `match_gios_context`.

## Auth and Trust Boundaries

There are two active auth patterns in the codebase:

1. Cookie/session-based Supabase auth for site pages and owner areas.
2. Email allowlist owner checks via `OWNER_EMAILS`.

Owner authorization is simpler and less role-driven than a full role-management system.

## External Provider Topology

The repo integrates many providers, but they are not all used the same way.

Directly active in current flows:

- Supabase for auth, DB, and storage
- OpenAI for responses and embeddings
- Anthropic for round-robin
- Ollama for local chat
- GitHub for latest pushes and generic proxying

Integrated or partially integrated:

- Gemini
- Mistral
- Hugging Face
- xAI
- Pinecone
- Brave search

The deep health route confirms the system is intended to act as a multi-provider integration hub, not a single-model app.

## Architectural Pattern

The dominant pattern is:

1. App Router page or API route receives input.
2. Validation happens either inline or through Zod helpers.
3. Route calls shared helpers in `lib`.
4. Supabase or external provider does the durable work.
5. Route returns normalized JSON or streamed output.

The codebase is best described as a modularizing system, not a fully modular system.

## How The System Should Work End To End

If the codebase is operating as intended, the systemic behavior should be:

1. The public-facing site presents identity, capability, projects, blog activity, and conversion paths.
2. Projects and blog posts reinforce each other through shared relational data.
3. Contact submissions become structured records in Supabase for owner follow-up.
4. The owner dashboard acts as the control plane for content, media, contacts, and diagnostics.
5. Signed-in non-owner users see a client dashboard foundation without owner-private data.
6. AI experiments remain available as product demonstrations and internal tooling.
7. Ollama chat supports persistent, optionally context-aware local conversations.
8. Round-robin sessions allow model-to-model discussion with recoverable session state.
9. GitHub and health endpoints provide operational visibility into live systems and dependencies.

## Current Structural Truths

- Supabase is the backbone. If Supabase is misconfigured, large parts of the app degrade or fail.
- Service-role usage is common on the server side, so route protection matters.
- The round-robin subsystem is more stateful than most of the app and requires DB integrity plus provider availability.
- The blog/projects relationship is deliberate and should be preserved.
- Tests are lightweight smoke and helper tests, not a comprehensive regression suite.

## Highest-Leverage Improvement Directions

Based on the code as it exists, the most important architectural improvements would be:

1. Extract round-robin orchestration out of `app/api/round-robin/stream/route.ts` into the placeholder modules that already exist.
2. Standardize authorization so owner-only route protection is less duplicated.
3. Centralize provider routing and model metadata across round-robin and ad hoc AI routes.
4. Make DB contracts more explicit in code for RPCs and required tables.
5. Separate public site concerns from internal dashboard concerns more cleanly at the service boundary level.

## Working Mental Model

The best mental model for this repository is:

- frontend shell and public brand site
- content and proof-of-work CMS
- owner ops console
- client portal foundation
- AI experimentation lab

All of those are real, and the codebase only makes sense when treated as a multi-surface system rather than a normal marketing site.
