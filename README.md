# Luis-ruiz.com

The personal portfolio website of **Gio (Luis Giovanni Ruiz)** - a Bronx-born, bilingual full-stack AI engineer and founder of ruizTechServices LLC (est. 2024). This Next.js-powered site showcases Gio's expertise in AI engineering, his flagship product 24Hour-AI, and his proficiency across multiple programming languages and frameworks.

## About Gio

Gio specializes in scalable AI infrastructure and enterprise-grade solutions that deliver measurable business value. His flagship product **24Hour-AI** is a high-performance LLM platform achieving:
- Sub-200ms latency
- 99.9% uptime
- 30% cost optimization
- Support for 100+ concurrent users

## Portfolio Features

- **Personal Portfolio**: Professional landing page showcasing skills and experience
- **Blog System**: Personal blog with markdown support and interactive features
- **Project Showcase**: Display of technical projects and achievements
- **Dashboard**: Administrative interface for content management
- **AI Integration**: Multiple AI provider support showcasing technical expertise
- **Contact System**: Professional contact forms and availability status
- **Skills Display**: Interactive showcase of programming languages and frameworks

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
   - Dev server runs on http://localhost:5000 (`npm run dev`).
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

- `/` - Personal portfolio landing page
- `/blog` - Personal blog and articles
- `/projects` - Project showcase and portfolio
- `/contact` - Professional contact information
- `/gio_dash` - Administrative dashboard
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

## Photos & Hero Slideshow

- `components/app/landing_page/Hero.tsx` loads slideshow images via `/api/photos?prefix=hero` with a fallback to static `public/edited/*` images.
- Requires a Supabase Storage bucket (default: `photos`, configurable via `SUPABASE_PHOTOS_BUCKET`).
- To seed images from your repo, place files under `public/edited/` and call `POST /api/photos/seed-hero`.

## Ollama

- Set `OLLAMA_BASE_URL` if your Ollama server is not at the default `http://localhost:11434`.
- The `/ollama` page stores session id locally and shows persistence status based on response headers from `/api/ollama`.
- Optional RAG context in `/api/ollama` uses RPCs `next_chat_id`, `match_gios_context` and tables `chat_messages`, `chat_embeddings`, `gios_context` when Supabase is configured.

## Auth and Redirects

- Supabase OAuth callback is handled in `app/auth/callback/route.ts` (exchanges provider code for a session).
- Set `NEXT_PUBLIC_SITE_URL` or `SITE_URL` for accurate redirects in dev/prod (defaults to `http://localhost:5000`).