# Gemini Project Configuration

This file provides project-specific context and instructions for the Gemini agent. It is the single source of truth for working on this repository.

## Project Overview

This is a Next.js 15 (React/TypeScript) application that serves as the personal portfolio for Gio (Luis Giovanni Ruiz), showcasing AI engineering expertise.

Key features include:
- A blog system with posts, comments, and voting.
- A project portfolio section.
- An admin dashboard (`/gio_dash`) for managing content (blog, photos, contacts).
- Multi-provider AI chat integrations, including a "Round-Robin" group chat UI.
- The **Nucleus Bot API**, a credit-based service providing external applications with access to multiple LLMs.

## Key Technologies

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (Radix-based)
- **Database/Auth:** Supabase
- **Vector Database:** Pinecone
- **Payments:** Stripe (for Nucleus Bot)
- **AI Integrations:** OpenAI, Anthropic, Google Gemini, Mistral, Hugging Face, xAI, Ollama
- **Schema Validation:** Zod

## Development Commands

### Primary Scripts
```bash
npm run dev      # Start dev server (http://localhost:5000)
npm run build    # Create production build
npm run start    # Start production server
npm run lint     # Run ESLint
npm run test     # Run all tests in the tests/ directory
```

### Running Individual Tests
Individual tests use `tsx` and may require corresponding API keys in `.env.local`.
```bash
# General/No API key needed
npx tsx tests/testChunkText.ts
npx tsx tests/testUUID.ts

# Requires OpenAI API Key
npx tsx tests/testEmbeddings.ts
npx tsx tests/testResponses.ts

# Requires Pinecone API Key
npx tsx tests/testUpsert.ts
npx tsx tests/testQuery.ts

# Requires multiple AI provider keys
npx tsx tests/testClients.ts
```

## Architecture

### Directory Structure
```
app/
├── api/                    # API routes
│   ├── nucleus/           # Nucleus Bot API (see endpoints below)
│   ├── round-robin/       # Multi-model AI group chat
│   ├── ollama/            # Local Ollama integration
│   └── photos/            # Supabase Storage-backed photo management
├── gio_dash/              # Admin dashboard (blog, photos, contacts, chat)
├── nucleus/               # Nucleus Bot pages (auth, purchase, subscription)
└── round-robin/           # Multi-model discussion UI

lib/
├── clients/               # API client initializers for all services
│   ├── supabase/         # Browser, server, and middleware clients
│   └── [provider]/       # OpenAI, Anthropic, Google, etc.
├── nucleus/              # Nucleus Bot library (pricing, credits, auth, rate-limiting)
├── round-robin/          # Multi-model orchestration logic
├── functions/            # Utility functions (embeddings, chunking, routing)
└── db/                   # Database access helpers

components/
├── ui/                   # shadcn/ui base components
├── app/                  # Feature-specific components (blog, dashboard, etc.)
└── round-robin/          # UI components for the Round-Robin feature

supabase/
└── migrations/           # SQL database migrations

tests/
└── *.ts                  # Test files
```

### Key Systems

- **Nucleus Bot API** (`lib/nucleus/`, `app/api/nucleus/`): A credit-based LLM access service for external apps, featuring Stripe integration, tiered access (free, credits, pro), JWT authentication, and in-memory rate limiting.
- **Round-Robin AI Chat** (`lib/round-robin/`, `app/round-robin/`): A multi-model discussion platform where different AI providers take turns responding. It uses a server-driven state with Server-Sent Events (SSE).
- **Supabase Clients** (`lib/clients/supabase/`): Provides separate clients for browser (`client.ts`), server (`server.ts`), and middleware (`middleware.ts`) contexts.
- **AI Provider Routing** (`lib/functions/routeToModel.ts`): Routes requests to the appropriate AI provider based on the requested model ID.

## Database (Supabase)

Key tables include `blog_posts`, `chat_messages`, `projects`, `round_robin_sessions`, and the `nucleus_*` tables for the bot API. For a full inventory, see `docs/table-inventory-checklist.md`.

## Environment Variables

A `.env.local` file is required for development.

### Core (Required)
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### AI Providers (Optional)
```
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
MISTRAL_API_KEY=...
GEMINI_API_KEY=...
HF_API_KEY=...
XAI_API_KEY=...
OLLAMA_BASE_URL=http://localhost:11434
```

### Vector Database (Optional)
```
PINECONE_API_KEY=...
PINECONE_INDEX=...
```

### Payments (Optional - For Nucleus Bot)
```
STRIPE_SECRET_KEY=...
STRIPE_PUBLISHABLE_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

## Instructions & Conventions

- **Agent Identity:** You are Gemini, an AI assistant.
- **Absolute Path:** Use `C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2` for all file operations.
- **Styling:** Adhere to existing coding style (TypeScript, async/await, etc.). Use `shadcn/ui` components from `components/ui` for new UI elements where possible.
- **Component Structure:** Store new feature-specific components in `components/app/{feature_name}/{ComponentName}.tsx`.
- **API Routes:** New API routes go in `app/api/`. Use Zod for validation.
- **Modularity:** Respect separation of concerns. Use the existing patterns for new integrations (AI, DB, etc.).
- **Next.js 15:** Remember that server components are async by default and `cookies()` must be awaited.
- **Supabase:** Prefer the service role key for server-side operations to bypass RLS when appropriate for admin tasks.
- **Images:** If using a different Supabase project, update the `next.config.ts` `images.remotePatterns` hostname.