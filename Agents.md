# Agents

## Scope

This file is derived from the codebase and SQL migrations, not from existing Markdown documentation. It describes how the system should work systemically based on the current implementation.

## System Identity

This repository is a Next.js 15 application that combines six product layers inside one deployable system:

1. A public personal/business site for Luis Ruiz and ruizTechServices.
2. A public projects and case-study surface backed by Supabase.
3. A public blog/build-log surface backed by Supabase.
4. An owner-only operations dashboard under `app/gio_dash`.
5. Several AI experiment surfaces, including Ollama chat and a multi-model round-robin discussion tool.
6. A separately consumable API product called Nucleus with bearer-token auth, credit accounting, subscription logic, and model proxy endpoints.

The codebase is not a single-purpose app. It is a portfolio site, CMS, AI sandbox, and paid API product sharing one runtime and one Supabase backend.

## Primary Runtime Model

The application uses the Next.js App Router.

- Public pages are rendered from `app/*`.
- API behavior lives under `app/api/*`.
- Shared domain logic lives in `lib/*`.
- UI primitives are mostly in `components/ui/*`.
- Product-specific UI lives in `components/app/*` and `components/round-robin/*`.
- Supabase is the core persistence layer for content, auth, chat history, storage, and Nucleus billing state.
- External providers include OpenAI, Anthropic, Mistral, Gemini, Hugging Face, xAI, GitHub, Stripe, Pinecone, and Ollama.

Systemically, the app should be understood as a set of thin route handlers and page entrypoints over a denser service layer in `lib`.

## Core Domains

### 1. Public Site Shell

The root layout in `app/layout.tsx` defines the shared shell:

- global CSS
- navbar
- footer
- analytics
- back-to-top behavior

The homepage in `app/page.tsx` is composition-driven and built from landing-page components. This layer is mostly presentational, but it also surfaces live operational data like latest GitHub pushes.

### 2. Projects Domain

Projects are stored in Supabase and exposed publicly through `app/projects/page.tsx`.

Important characteristics:

- `lib/db/projects.ts` is the main read layer.
- Public listing is filtered to `visibility in ('public', 'unlisted')`.
- Projects have evolved beyond simple links into case-study records.
- SQL migration `20260412_195500_expand_projects_for_case_studies.sql` expands the schema into a structured narrative model:
  `summary`, `status`, `category`, `featured`, `visibility`, `stack`, `role`, `context`, `problem`, `constraints`, `approach`, `architecture`, `decisions`, `outcomes`, `current_status`, `repo_url`, `live_url`, `cover_image_url`, `started_at`, `completed_at`, `slug`.
- Projects can be linked to blog posts through `project_blog_links`.

Systemically, projects are meant to be the durable proof-of-work layer, while blog posts provide a temporal execution trail around them.

### 3. Blog Domain

Blog data lives in Supabase and is rendered through `app/blog/page.tsx` and `app/blog/[id]/page.tsx`.

Important characteristics:

- `blog_posts` is the primary table.
- `comments` and `votes` extend engagement.
- `project_blog_links` connects posts back to projects.
- `lib/db/blog.ts` centralizes admin-facing reads and write helpers.
- SQL function `get_blog_posts_with_stats()` avoids N+1 count behavior for admin views.

Systemically, the blog is not just content marketing. The implementation and copy both indicate it is meant to function as a public build log that validates ongoing execution.

### 4. Contact / Lead Intake Domain

The contact surface is a structured lead intake system:

- UI: `components/app/contact/ContactForm.tsx`
- validation: `lib/validation/contact.ts`
- ingestion API: `app/api/contact/route.ts`
- admin access: `lib/db/contactlist.ts` and dashboard cards

Contact requests are normalized, validated with Zod, and inserted into Supabase `contactlist`.

Systemically, this is the main conversion path from public traffic into business conversations.

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

Systemically, `gio_dash` is acting as a lightweight internal CMS and ops console rather than a generic admin panel.

### 6. Photos / Media Domain

Photos are managed via Supabase Storage:

- listing and deletion: `app/api/photos/route.ts`
- upload: `app/api/photos/upload/route.ts`
- restore: `app/api/photos/restore/route.ts`
- seed hero images: `app/api/photos/seed-hero/route.ts`
- owner UI: `app/gio_dash/photos/*`

The API generates signed URLs and falls back to public URLs where necessary.

Systemically, this is the media pipeline for site-controlled assets, especially dashboard-managed imagery.

### 7. Ollama Chat / Memory Domain

There are two Ollama-facing chat surfaces:

- simple streaming chat via `app/api/chat/route.ts`
- richer persistence/context-enabled chat via `app/api/ollama/route.ts`

The richer route does the following:

- streams responses from Ollama
- persists user and assistant messages to `chat_messages`
- generates embeddings through OpenAI
- stores embeddings in `chat_embeddings`
- stores contextual memory in `gios_context`
- optionally retrieves similar context via Supabase RPC `match_gios_context`

Systemically, this is a local-model chat product with optional RAG-style memory augmentation layered on top.

### 8. Round-Robin Multi-Model Discussion Domain

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

This matters: the architecture suggests planned modularity, but the live orchestration still sits inside the SSE route. Any future work on this subsystem should treat that route as the current source of truth.

### 9. Nucleus API Product Domain

Nucleus is the most productized backend surface in the repo.

Core pieces:

- auth helpers: `lib/nucleus/auth.ts`
- credit/profile logic: `lib/nucleus/credits.ts`
- pricing/config: `lib/nucleus/pricing.ts`
- rate limiting: `lib/nucleus/rate-limit.ts`
- API routes: `app/api/nucleus/*`

Nucleus provides:

- bearer-token authentication against Supabase JWTs
- user profile bootstrap in `nucleus_profiles`
- pay-as-you-go credit accounting
- subscription-aware unlimited access for pro users
- model catalog endpoints
- chat proxying to OpenAI and Anthropic
- Stripe purchase and webhook flows
- usage logging and transaction logging

Systemically, Nucleus should be understood as an API product sharing infra with the site, not as a page feature.

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
- `nucleus_profiles`
- `nucleus_credit_transactions`
- `nucleus_usage_logs`
- pricing and package tables for Nucleus

Supabase Storage is also part of the data model through the photos bucket.

The application depends heavily on database-side helpers and policies:

- `get_blog_posts_with_stats`
- `add_credits`
- `deduct_credits`
- likely `next_chat_id`
- likely `match_gios_context`

This means the system is not fully understandable from TypeScript alone; several important invariants live in SQL.

## Auth and Trust Boundaries

There are three different auth patterns in the codebase:

1. Cookie/session-based Supabase auth for site pages and owner areas.
2. Email allowlist owner checks via `OWNER_EMAILS`.
3. Bearer-token JWT auth for Nucleus API consumers.

Important implication:

- public site auth and Nucleus auth are related through Supabase, but they are not the same interaction pattern.
- owner authorization is simpler and less role-driven than the Nucleus auth model.

Middleware currently exists mainly to add CORS support for `/api/nucleus/*`.

## External Provider Topology

The repo integrates many providers, but they are not all used the same way.

Directly active in current flows:

- Supabase for auth, DB, storage
- OpenAI for responses, embeddings, and Nucleus chat
- Anthropic for Nucleus chat and round-robin
- Ollama for local chat
- GitHub for latest pushes and generic proxying
- Stripe for Nucleus billing

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

This is pragmatic and workable, but not fully uniform.

Examples of divergence:

- some routes use dedicated helpers cleanly
- some routes still contain substantial orchestration logic inline
- owner auth sometimes uses helper wrappers and sometimes repeats checks
- provider abstractions are stronger in round-robin than in other AI routes

So the codebase is best described as a modularizing system, not a fully modular system.

## How The System Should Work End To End

If the codebase is operating as intended, the systemic behavior should be:

1. The public-facing site presents identity, capability, projects, blog activity, and conversion paths.
2. Projects and blog posts reinforce each other through shared relational data.
3. Contact submissions become structured records in Supabase for owner follow-up.
4. The owner dashboard acts as the control plane for content, media, contacts, and diagnostics.
5. AI experiments remain available as product demonstrations and internal tooling.
6. Ollama chat supports persistent, optionally context-aware local conversations.
7. Round-robin sessions allow model-to-model discussion with recoverable session state.
8. Nucleus exposes a separate authenticated API product with credit/subscription enforcement and usage tracking.
9. GitHub and health endpoints provide operational visibility into live systems and dependencies.

That is the real systemic shape: one brand/site layer on top, one operations layer behind it, and several AI service layers attached to the same backend.

## Current Structural Truths

These are important to keep in mind when modifying the repo:

- Supabase is the backbone. If Supabase is misconfigured, large parts of the app degrade or fail.
- Service-role usage is common on the server side, so route protection matters.
- The round-robin subsystem is more stateful than most of the app and requires DB integrity plus provider availability.
- Nucleus has the clearest product contract in the repo and the strongest need for stable auth, pricing, and logging behavior.
- The blog/projects relationship is deliberate and should be preserved.
- Tests are lightweight smoke and helper tests, not a comprehensive regression suite.

## Highest-Leverage Improvement Directions

Based on the code as it exists, the most important architectural improvements would be:

1. Extract round-robin orchestration out of `app/api/round-robin/stream/route.ts` into the placeholder modules that already exist.
2. Standardize authorization so owner-only route protection is less duplicated.
3. Centralize provider routing and model metadata across Nucleus, round-robin, and ad hoc AI routes.
4. Make DB contracts more explicit in code for RPCs and required tables.
5. Separate “portfolio site” concerns from “API product” concerns more cleanly at the service boundary level.

## Working Mental Model

The best mental model for this repository is:

- frontend shell and public brand site
- content and proof-of-work CMS
- owner ops console
- AI experimentation lab
- monetizable API backend

All of those are real, and the codebase only makes sense when treated as a multi-surface system rather than a normal marketing site.
