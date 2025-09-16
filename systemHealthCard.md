# System Health Monitoring Recommendations

Gio, here's what I, Ada, found and what I recommend you add to your systemic health checks.

## Current Findings

### SystemHealthCard Baseline Checks
- **Environment presence checks** in `components/app/gio_dashboard/SystemHealthCard.tsx` (lines 50–65)
- **Supabase read/latency** using blog_posts (lines 67–79)
- **Pinecone describeIndexStats()** (lines 81–100)
- **Ollama GET /api/tags** (lines 102–118)
- **API route existence probe** via GET to `/api/embeddings` and `/api/chat` (lines 31–45, 120–132)
- **5-minute in-memory TTL cache** (lines 16–18, 130–131)

### Deep Health API Coverage
- `app/api/health/deep/route.ts` checks LLM/search providers (OpenAI, Anthropic, Mistral, xAI, HuggingFace, Gemini, Brave)
- **Missing in deep health**: Supabase, Pinecone, Ollama, Next runtime/memory/event loop

### Supabase Client Import Hazard
- `lib/clients/supabase/server.ts` throws at import time if envs are missing
- Since `SystemHealthCard.tsx` imports it at the top, the card can crash page rendering when envs aren't configured
- Deep health's lazy import comment suggests you intended to avoid this pattern there

## Recommended System Health Observability

### Tier 0: Always-on, Lightweight Dashboard Signals    

#### Supabase
- Connection/read health using both anon and service-role contexts
- Try a 0-row select and a tiny count; record latency and error
- **RLS sanity check** (optional): attempt a read as anon to a protected table and ensure it's denied, then a read with service role succeeds
- **Quota "pulse"**: surface "project paused" or connection errors distinctly to guide action

#### Pinecone
- **Index health**: status ready/not-ready, dimension and pod/replica config, namespace count
- **Total vectors** (you already have) + drift detection: sudden drops vs last reading

#### Ollama
- **Required model presence** for your chat route (confirm your default model for ollamaStream exists locally)
- Count is good, but model-by-name presence is more actionable

#### Next.js Runtime
- **Event loop lag and heap usage**:
  - Event loop delay p95 over last N seconds (perf_hooks monitor)
  - `process.memoryUsage().heapUsed` and rss; warn near thresholds

#### API Routes
- p95 latency and error rate for `/api/chat`, `/api/embeddings`, `/api/comments`
- Distinguish 4xx vs 5xx; alert only on sustained 5xx

#### Environment Configuration Quality
- Validate URL formats (e.g., `NEXT_PUBLIC_SUPABASE_URL`, `OLLAMA_BASE_URL`)
- Show "invalid format" separately from "not configured"

### Tier 1: Manual or Cron-triggered Deeper Checks

#### Supabase Deeper Checks
- Write-read path on a tiny `health_checks` table with TTL or auto-cleanup
- Verify insert+select works and round-trip latency stays in range
- Surface foreign-key or RLS errors
- **Migration sanity**: query `supabase_migrations.schema_migrations` for drift

#### Pinecone Deeper Checks
- Test a single upsert+query round-trip in a "health" namespace to validate end-to-end vector path

#### Ollama Deeper Checks
- Simple non-billable/low-cost prompt to a small local model to ensure generation works, not just tags list

#### External APIs
- Rate limit headers sampling (OpenAI/Anthropic/Mistral/xAI) to show "headroom" if available

#### System Resources
- 60-second sampling of event loop delay p95/p99 + heap usage trends to catch leaks/regressions

### Tier 2: Synthetic End-to-End Flows

#### Chat Path
- Minimal message → stream → completion success within SLO threshold (e.g., p95 < 4s)

#### Embeddings + Vector Path
- Generate embedding → upsert into Pinecone → query top-1 → validate vector round-trip

#### Comments Path
- POST → Supabase write → read blog page → verify presence or at least insert success + row count increases

## Observability Storage and SLOs

### Persist Metrics to Supabase
- **Tables**: 
  - `health_checks` (overall snapshot)
  - `api_metrics` (route, ts, latency, statusCode)
  - `provider_metrics` (provider, ts, status, latency, quota headroom if available)
  - `runtime_metrics` (eventLoopDelay, heapUsed)
- Aggregate daily/hourly rollups for dashboard sparklines and trends (degrade detection)

### SLOs and Alerts
- Define SLOs per route (e.g., p95 latency, error budget)
- **Thresholds for alerts**: 
  - 5xx > 2% for 5 minutes
  - Pinecone not-ready
  - Supabase connection errors
  - Ollama required model missing
- Wire to email/Slack/Webhook using a simple Supabase function or Vercel Cron + webhook

## Implementation Notes and Quick Wins

### Avoid Import-time Crashes in Health Views
- Move `createServerClient` import in `components/app/gio_dashboard/SystemHealthCard.tsx` into the try block inside `getTier0()`
- Or make `lib/clients/supabase/server.ts` return a safe stub when envs are missing instead of throwing
- This matches your lazy import approach in `app/api/health/deep/route.ts`

### Expand Deep Health to Core Infrastructure
- Add Supabase, Pinecone, and Ollama checks to `app/api/health/deep/route.ts`
- So your DeepHealthButton covers all main dependencies (not just LLM providers)

### Add Runtime Metrics
- Create a tiny `app/api/health/runtime/route.ts` that returns event loop delay stats and memory usage
- Include these in the dashboard and optionally in deep health

### Capture API Metrics
- Wrap API handlers (chat, embeddings, comments) with a lightweight timing/error capture
- Write to a Supabase `api_metrics` table
- Show p95 and error rate in the UI next to each route status

### Rate-limit the DeepHealthButton
- Add a minimal server-side throttle to avoid spamming provider APIs in dev or during incidents

### Scheduled Snapshots
- Vercel Cron to call deep health every N minutes, persist to Supabase
- Let the UI show trendline rather than just point-in-time

## Optional Future Coverage

### NextAuth Health (when you add NextAuth)
- Provider discovery check(s)
- Session retrieval (server+client) latency and success rate
- Token refresh path simulation (if using OAuth providers)

### Security Checks
- RLS policy lint/smoke checks (ensure anon denied where expected)
- "Secrets sanity" – check for missing but referenced envs

### Frontend UX
- Basic Web Vitals trend capture (e.g., CLS/LCP)
- Error tracking if you add Sentry or Axiom later

## UI Integration Points

### `components/app/gio_dashboard/SystemHealthCard.tsx`
- Add lines for event loop delay and heap used
- Show API p95/error-rate next to the route dots
- Add "required model missing" warning for Ollama

### `components/app/gio_dashboard/DeepHealthButton.tsx`
- Include Supabase/Pinecone/Ollama in the results grid
- Show last run timestamp and allow quick compare with previous snapshot (store last N runs in Supabase)

## TODO List

### Tier 0 — Always-on Dashboard Signals
- [x] Supabase: Add anon + service-role read checks (0-row select + tiny count); record latency and distinguish paused vs network errors.
- [x] Pinecone: Display index ready/not-ready, dimension, pod/replica config, namespace count; keep total vectors and add drift detection vs last reading.
- [ ] Ollama: Validate required chat model presence (by name); continue to show model count from `/api/tags`.
- [ ] Next.js runtime: Surface event loop delay p95 and memory usage (heapUsed, rss) in SystemHealthCard.
- [ ] API routes: Track and display p95 latency and error rate for `/api/chat`, `/api/embeddings`, `/api/comments` (separate 4xx vs 5xx).
- [ ] Environment quality: Validate URL formats (e.g., `NEXT_PUBLIC_SUPABASE_URL`, `OLLAMA_BASE_URL`) and show “invalid format” vs “not configured”.

### Tier 1 — Manual/Cron Deep Checks
- [ ] Supabase deep path: Create small `health_checks` table (TTL/auto-cleanup); verify insert + select round-trip and capture latency; surface RLS/FK errors.
- [ ] Migration sanity: Query `supabase_migrations.schema_migrations` to detect drift and report in deep health.
- [ ] Pinecone deep path: Perform upsert + query round-trip in a `health` namespace and validate results; clean up if needed.
- [ ] Ollama deep path: Run a tiny prompt against a small local model to confirm generation (not only tags list).
- [ ] External APIs: Sample rate-limit headroom when providers expose relevant headers.
- [ ] System resources: Add 60s sampling for event loop delay p95/p99 and memory trend to catch leaks.

### Tier 2 — Synthetic End-to-End Flows
- [ ] Chat path: Minimal message → streamed completion success under SLO (e.g., p95 < 4s).
- [ ] Embeddings → Vector path: Generate embedding → upsert into Pinecone → query top-1 → validate round-trip.
- [ ] Comments path: POST comment → Supabase write → verify presence/read or row count increase.

### Telemetry, Storage, and Scheduling
- [ ] Supabase tables: `health_checks`, `api_metrics` (route, ts, latency, statusCode), `provider_metrics` (provider, ts, status, latency, quota headroom), `runtime_metrics` (eventLoopDelay, heapUsed).
- [ ] Rollups: Implement hourly/daily rollups or SQL views for p95/error-rate trendlines and degradations.
- [ ] Vercel Cron: Schedule deep health snapshots; persist to Supabase for trends.

### Stability and Safety
- [ ] Make Supabase server client import safe in `components/app/gio_dashboard/SystemHealthCard.tsx` (move dynamic import into `getTier0()` try-block, or export safe stub from `lib/clients/supabase/server.ts`).
- [ ] Add server-side throttle to `/api/health/deep` to avoid provider spam during incidents.

### UI Integration
- [ ] SystemHealthCard: Add event loop delay + memory; show route p95/error-rate; warn when required Ollama model is missing.
- [ ] DeepHealthButton: Include Supabase/Pinecone/Ollama in results; show last run timestamp (already) and optionally compare with previous snapshot if persisted.

### Quality and Security
- [ ] Add unit/integration tests for runtime health route, deep health route, and API metrics wrapper; avoid mocks in dev/prod.
- [ ] RLS smoke checks: Ensure anon is denied where expected; service-role used only for administrative checks.
- [ ] Secrets sanity: Detect missing-but-referenced envs and report distinctly.

### Optional / Future
- [ ] NextAuth health (when adopted): provider discovery, session retrieval latency, token refresh simulation.

## Next Steps

Would you like me to implement:

1. A safe Supabase import pattern in `SystemHealthCard.tsx`
2. Deep health additions for Supabase/Pinecone/Ollama
3. A runtime metrics endpoint and minimal api_metrics persistence
4. A Vercel cron + Supabase schema for health snapshots

If you confirm, I'll stage the schema (via Supabase MCP), add the routes and telemetry wrapper, and wire the UI updates in small, testable steps.