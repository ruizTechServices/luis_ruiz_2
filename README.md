# AI Chatbot Application

A Next.js-based AI chatbot application with vector search capabilities, built with modern web technologies and multiple AI provider integrations.

## Features

- **Provider clients prepared**: OpenAI, Anthropic, Mistral, Google (Gemini), xAI, and HuggingFace clients in `lib/clients/*`.
- **Vector search helpers**: Pinecone upsert/query in `lib/functions/pinecone/*` (index `chatbot-main-3`, namespace `first-user-1`).
- **OpenAI utilities**: Embeddings (`text-embedding-3-small`) and Responses (`gpt-4o`) in `lib/functions/openai/*`.
- **UI**: Landing page (`app/page.tsx`) and `/basic` route with `EmbedInput` placeholder; responsive navbar components.
- **Text processing**: `chunkText()` helper for splitting long text.
- **Supabase SSR helpers**: Browser/server clients and optional middleware are present, not yet wired into routes.
- **Tests**: Scripts in `tests/` for clients, embeddings, chunking, and Pinecone operations.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript.
- **Styling**: Tailwind CSS v4, shadcn/ui (Radix UI), `lucide-react`.
- **AI SDKs**: `openai`, `@anthropic-ai/sdk`, `@mistralai/mistralai`, `@google/generative-ai`, `@huggingface/inference`, xAI (OpenAI-compatible).
- **Vector Database**: Pinecone JS v6; default index `chatbot-main-3`, namespace `first-user-1`.
- **Supabase**: `@supabase/ssr` helpers (browser/server/middleware) present.
- **Forms**: `react-hook-form` and `zod` are installed; not used in UI yet.

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create `.env.local` from `.env.example` and fill values. Minimum for core features:
   ```
   OPENAI_API_KEY=...
   PINECONE_API_KEY=...
   GEMINI_API_KEY=...           # optional (Google)
   MISTRAL_API_KEY=...          # optional
   ANTHROPIC_API_KEY=...        # optional
   HF_API_KEY=...               # optional
   XAI_API_KEY=...              # optional
   NEXT_PUBLIC_SUPABASE_URL=... # optional (Supabase helpers)
   NEXT_PUBLIC_SUPABASE_ANON_KEY=... # optional
   ```
   Notes:
   - `PINECONE_INDEX` and `SUPABASE_API_KEY` exist in `.env.example` but are not used by the current code.
   - Pinecone index name is hardcoded in `lib/clients/pinecone/client.ts` as `chatbot-main-3`.
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

- `/` - Landing page
- `/basic` - Basic chatbot interface ($1 Chatbot)
