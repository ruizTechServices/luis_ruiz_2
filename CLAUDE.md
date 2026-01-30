# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Gio (Luis Giovanni Ruiz) - a Next.js 15 application showcasing AI engineering expertise. Features include a blog system, project portfolio, admin dashboard, multi-provider AI chat integrations, and the Nucleus Bot API (credit-based LLM access service).

## Development Commands

```bash
npm run dev      # Start dev server (http://localhost:5000)
npm run build    # Production build
npm run lint     # Run ESLint
npm run test     # Run all tests in tests/ directory
```

### Running Individual Tests

Tests use `tsx` and require corresponding API keys in `.env.local`:
```bash
npx tsx tests/testChunkText.ts      # Text chunking (no API key needed)
npx tsx tests/testUUID.ts           # UUID generation (no API key needed)
npx tsx tests/testEmbeddings.ts     # OpenAI embeddings (OPENAI_API_KEY)
npx tsx tests/testUpsert.ts         # Pinecone upsert (PINECONE_API_KEY, PINECONE_INDEX)
npx tsx tests/testQuery.ts          # Pinecone query (PINECONE_API_KEY, PINECONE_INDEX)
npx tsx tests/testResponses.ts      # OpenAI responses (OPENAI_API_KEY)
npx tsx tests/testClients.ts        # All AI clients (various API keys)
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
├── nucleus/               # Nucleus Bot pages
│   ├── auth/callback/    # OAuth success/error pages
│   ├── purchase/         # Credit purchase success/cancel pages
│   └── subscription/     # Subscription success/cancel pages
└── round-robin/           # Multi-model discussion UI

lib/
├── clients/               # API client initializers
│   ├── supabase/         # Browser, server, and middleware clients
│   ├── ollama/           # Ollama streaming client
│   └── [provider]/       # OpenAI, Anthropic, Mistral, Google, HuggingFace, xAI
├── nucleus/              # Nucleus Bot library
│   ├── types.ts          # TypeScript types
│   ├── pricing.ts        # Model pricing data
│   ├── credits.ts        # Credit calculation/deduction
│   ├── auth.ts           # JWT validation
│   └── rate-limit.ts     # In-memory rate limiter
├── round-robin/          # Multi-model orchestration (providers, truncation, events)
├── functions/            # Utility functions (embeddings, chunking, routing)
└── db/                   # Database access helpers (blog, chat, contacts, projects)

components/
├── ui/                   # shadcn/ui components (Radix-based)
├── app/                  # Feature-specific components
└── round-robin/          # Round-robin UI components

supabase/
└── migrations/           # SQL migrations (RLS policies for Nucleus tables)
```

### Key Systems

**Nucleus Bot API** (`lib/nucleus/`, `app/api/nucleus/`)
- Credit-based LLM access service for external applications
- Stripe integration for credit purchases and pro subscriptions
- Tiers: free, credits (pay-as-you-go), pro (subscription)
- JWT-based authentication via Supabase with configurable JWKS validation
- In-memory rate limiting (configurable via env vars, replace with Redis for scale)
- API Endpoints:
  - `/api/nucleus/llm/chat` - Main chat completion endpoint
  - `/api/nucleus/llm/models` - List available models
  - `/api/nucleus/models` - Model metadata
  - `/api/nucleus/packages` - Credit package info
  - `/api/nucleus/auth/session` - Session validation
  - `/api/nucleus/user/profile` - User profile
  - `/api/nucleus/user/usage` - Usage statistics
  - `/api/nucleus/credits/balance` - Credit balance
  - `/api/nucleus/credits/packages` - Available packages
  - `/api/nucleus/credits/purchase` - Purchase credits (Stripe checkout)
  - `/api/nucleus/subscription/plans` - Subscription plans
  - `/api/nucleus/subscription/create` - Create subscription
  - `/api/nucleus/subscription/cancel` - Cancel subscription
  - `/api/nucleus/webhooks/stripe` - Stripe webhook handler

**Round-Robin AI Chat** (`lib/round-robin/`, `app/round-robin/`)
- Multi-model discussion platform where AI providers take turns responding
- Server-driven state with SSE streaming
- User-gated rounds (pauses after each complete round)
- Currently only OpenAI adapter is complete; other providers are stubs

**Supabase Clients** (`lib/clients/supabase/`)
- `client.ts` - Browser client (anon key)
- `server.ts` - Server client (prefers service role key, async factory for Next 15)
- `middleware.ts` - Middleware client for auth refresh

**AI Provider Routing** (`lib/functions/routeToModel.ts`)
- Routes requests to appropriate provider based on model ID
- Supports OpenAI, Anthropic, Mistral, Google Gemini, HuggingFace, xAI, and Ollama

### Database (Supabase)

Key tables:
- `blog_posts`, `comments`, `votes` - Blog system
- `chat_messages`, `chat_embeddings`, `gios_context` - Chat with vector embeddings
- `contactlist` - Contact form submissions
- `projects` - Portfolio projects
- `site_settings` - Availability banner
- `round_robin_sessions`, `round_robin_messages` - Round-robin chat
- `nucleus_profiles`, `nucleus_credit_transactions`, `nucleus_usage_logs` - Nucleus Bot

RLS policies for Nucleus tables are in `supabase/migrations/`. Server-side operations use service role key (bypasses RLS); client access is read-only for user-owned data.

### Environment Variables

See `.env.example` for the full list. Key categories:

**Supabase (required):**
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_PHOTOS_BUCKET=...
```

**Nucleus Bot JWT validation:**
```
SUPABASE_JWT_ISSUER=...
SUPABASE_JWT_AUDIENCE=...
SUPABASE_JWKS_URL=...
```

**Nucleus Bot rate limiting:**
```
NUCLEUS_RATE_LIMIT_MAX=60        # requests per window (default: 60)
NUCLEUS_RATE_LIMIT_WINDOW_MS=60000  # window in ms (default: 60000)
```

**AI providers (optional):**
```
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
MISTRAL_API_KEY=...
GEMINI_API_KEY=...
HF_API_KEY=...
XAI_API_KEY=...
OLLAMA_BASE_URL=http://localhost:11434
```

**Vector database:**
```
PINECONE_API_KEY=...
PINECONE_INDEX=...
PINECONE_NAMESPACE=...
```

**Payments (Nucleus Bot):**
```
STRIPE_SECRET_KEY=...
STRIPE_PUBLISHABLE_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

**Other:**
```
BRAVE_API_KEY=...                    # Brave Search API
GOOGLE_PRODUCTION_CLIENT_ID=...      # Google OAuth
GOOGLE_PRODUCTION_CLIENT_SECRET=...
NEXT_PUBLIC_SITE_URL=...             # Public site URL
OWNER_EMAILS=...                     # Comma-separated admin emails
```

## Conventions

- Dev server runs on port 5000
- Next.js 15 App Router with React 19
- Tailwind CSS v4 with shadcn/ui components
- Zod for API validation (see `app/api/projects/route.ts`)
- Server components are async; `cookies()` must be awaited
- Service role key preferred for server-side Supabase operations
- If using different Supabase project, update `next.config.ts` `images.remotePatterns` hostname
- New components go in `components/app/{section}/{component}.tsx`
- Modularization and separation of concerns are priorities
