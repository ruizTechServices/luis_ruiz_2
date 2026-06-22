# Luis-ruiz.com

The public master hub for **Gio (Luis Giovanni Ruiz)** and ruizTechServices LLC. This Next.js-powered site presents practical AI, web, automation, and support work while preserving separate public project, blog, contact, owner dashboard, client dashboard, and AI experiment surfaces.

## About Gio

Gio builds practical AI, web, and automation systems for small businesses, creators, and operators through ruizTechServices. The site is organized around services, proof-of-work, build notes, contact intake, owner operations, and AI product experiments.

## Product Surfaces

- **Public Master Hub**: Homepage for services, public systems, proof-of-work, and contact routing.
- **Blog / Build Log**: Supabase-backed public writing with interaction features.
- **Projects / Case Studies**: Public project records and proof-of-work.
- **Owner Dashboard**: Owner-only operations area under `/gio_dash` with live operational cards for projects, leads, money, system links, and decisions.
- **Client Dashboard**: Authenticated `/dashboard` foundation for future client project status, updates, deliverables, invoices, messages, and support.
- **AI Experiments**: Ollama chat and round-robin model discussion surfaces.
- **Contact System**: Structured lead intake with validation and Supabase persistence.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript.
- **Styling**: Tailwind CSS v4, shadcn/ui (Radix UI), `lucide-react`.
- **AI SDKs**: `openai`, `@anthropic-ai/sdk`, `@mistralai/mistralai`, `@google/generative-ai`, `@huggingface/inference`, xAI (OpenAI-compatible), & [new]`ollama`.
- **Vector Database**: Pinecone JS v6; configured via env (`PINECONE_API_KEY`, `PINECONE_INDEX`). No default namespace is set in code.
- **Supabase**: `@supabase/ssr` helpers (browser/server/middleware). Requires `NEXT_PUBLIC_SUPABASE_URL` and either `SUPABASE_SERVICE_ROLE_KEY` (preferred for server features) or `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Forms**: `zod` is used for validation in `app/api/projects/route.ts`; `react-hook-form` is installed and available.


## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create `.env.local` from `.env.example` and fill values. Minimum for core features:
   ```
   OPENAI_API_KEY=...                         # optional (OpenAI features/tests)
   PINECONE_API_KEY=...                       # required for Pinecone features/tests
   PINECONE_INDEX=...                         # required with PINECONE_API_KEY
   GEMINI_API_KEY=...                         # optional (Google)
   MISTRAL_API_KEY=...                        # optional
   ANTHROPIC_API_KEY=...                      # optional
   HF_API_KEY=...                             # optional
   XAI_API_KEY=...                            # optional
   NEXT_PUBLIC_SUPABASE_URL=...               # required for blog/photos/availability
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...          # required for browser Supabase
   SUPABASE_SERVICE_ROLE_KEY=...              # required for server features (photos upload, chat persistence)
   OLLAMA_BASE_URL=http://localhost:11434     # optional (defaults to localhost:11434)
   ```
   Notes:
   - Prisma is not used in this project. You can ignore `DATABASE_URL` and `DIRECT_URL` found in `.env.example`.
   - `SUPABASE_API_KEY` is supported as a server fallback, but prefer `SUPABASE_SERVICE_ROLE_KEY`. Never expose the service role key to the browser.
   - Dev server defaults to http://localhost:3000 (`npm run dev`). Use `npx next dev -p 3001` or another open port when 3000 is occupied.
   - If you use a different Supabase project, update `next.config.ts` `images.remotePatterns` host to match your project (currently `huyhgdsjpdjzokjwaspb.supabase.co`).

4. Run the development server:
   ```
   npm run dev
   ```
5. Optional tests (require corresponding API keys):
   ```
   npx tsx tests/testChunkText.ts
   npx tsx tests/testEmbeddings.ts
   npx tsx tests/testResponses.ts
   npx tsx tests/testUpsert.ts
   npx tsx tests/testQuery.ts
   npx tsx tests/testClients.ts
   ```

## Project Structure
- `/app` - Next.js app router pages
- `/components` - Reusable UI components
- `/lib` - Utility functions and API clients
- `/tests` - Test files for various functionalities

## Available Routes

- `/` - Public master hub
- `/blog` - Personal blog and articles
- `/projects` - Project showcase and portfolio
- `/contact` - Professional contact information
- `/dashboard` - Signed-in client dashboard foundation; owner users redirect to `/gio_dash`
- `/gio_dash` - Owner-only command center (Today Focus, Revenue Snapshot, Open Leads, Active Projects, System Links, and Decisions Log cards are wired to live dashboard tables)
- `/gio_dash/leads` - Owner-only read-only operational leads table
- `/gio_dash/money` - Owner-only read-only operational P&L table
- `/gio_dash/systems` - Owner-only read-only system links table
- `/gio_dash/notes` - Owner-only read-only decisions/notes list
- `/gio_dash/photos` - Photo library (Supabase Storage-backed)
- `/gio_dash/photos/upload` - Upload photos to Storage
- `/ollama` - Local Ollama chat UI (streams via API)

## Key API Endpoints

- `/api/chat` — Streams text/plain from `ollamaStream()` for a minimal chat interface.
- `/api/ollama` — Streams responses; optionally persists chat and embeddings to Supabase and can augment with retrieved context via `with_context`.
- `/api/ollama/models` and `/api/ollama/embeddings` — List local models and proxy embeddings to Ollama.
- `/api/openai/models` — Lists OpenAI models.
- `/api/embeddings` — OpenAI embeddings helper.
- `/api/photos` — `GET` list of images (signed/public URLs), `DELETE` remove by path.
- `/api/photos/upload` — `POST` multipart upload.
- `/api/photos/seed-hero` — Seeds from `public/edited` into Storage under `hero/`.
- `/api/photos/restore` — Re-upload a specific path.
- `/api/projects` — upsert project (uses `zod` validation).
- `/api/comments` and `/api/votes` — Blog interactions (comments/upvotes/downvotes).
- `/api/site_settings/availability` — Get/Set availability banner values.
- `/api/dashboard/projects` — Owner-only operational project tracker (`GET`, Zod-validated `POST`).
- `/api/dashboard/leads` — Owner-only lead pipeline (`GET`, Zod-validated `POST`).
- `/api/dashboard/money` — Owner-only money entries with income/expense summary (`GET`, Zod-validated `POST`).
- `/api/dashboard/decisions` — Owner-only decision log (`GET`, Zod-validated `POST`).
- `/api/dashboard/system-links` — Owner-only curated system/tool links (`GET`, Zod-validated `POST`).

## Photos & Legacy Hero Slideshow

- The current `/` homepage uses `components/app/home/*`.
- The legacy `components/app/landing_page/Hero.tsx` component still loads slideshow images via `/api/photos?prefix=hero` with a fallback to static `public/edited/*` images, but it is no longer rendered by `/`.
- Requires a Supabase Storage bucket (default: `photos`, configurable via `SUPABASE_PHOTOS_BUCKET`).
- To seed images from your repo, place files under `public/edited/` and call `POST /api/photos/seed-hero`.

## Ollama

- Set `OLLAMA_BASE_URL` if your Ollama server is not at the default `http://localhost:11434`.
- The `/ollama` page stores session id locally and shows persistence status based on response headers from `/api/ollama`.
- Optional RAG context in `/api/ollama` uses RPCs `next_chat_id`, `match_gios_context` and tables `chat_messages`, `chat_embeddings`, `gios_context` when Supabase is configured.

## Auth and Redirects

- Supabase OAuth callback is handled in `app/auth/callback/route.ts` (exchanges provider code for a session).
- Set `NEXT_PUBLIC_SITE_URL` or `SITE_URL` for accurate redirects in dev/prod (defaults to `http://localhost:5000`).
- `/dashboard` redirects unauthenticated users to `/login`, redirects owner users to `/gio_dash`, and renders the client portal shell for signed-in non-owner users.
