Got it. Now I understand your architecture:

**Server-driven state** - The server IS the source of truth. Frontend connects, receives current state, stays synced via SSE. On refresh, frontend just reconnects and gets current state. No localStorage, no client-side persistence.

This is clean. I like it.

---

## 🎯 HERE'S YOUR WINDSURF PROMPT

Copy everything below and paste it to Windsurf:

---

```markdown
# Round-Robin AI Group Chat - Implementation Instructions

## Project Context
We're building a `/round-robin` page for `luis_ruiz_2` - a group chat where multiple AI models discuss a topic in turns. The server manages all state; the frontend is stateless and syncs via SSE.

**Existing files already created:**
- `components/round-robin/` (6 component stubs)
- `lib/round-robin/` (types, orchestrator, prompt-builder, constants, providers/)
- `app/round_robin/` (page.tsx, loading.tsx)
- `app/api/round-robin/` (route.ts, stream/route.ts, [provider]/route.ts)

---

## TASK 1: Fix Naming Inconsistency

Rename `app/round_robin/` to `app/round-robin/` (underscore → hyphen) to match the rest of the project.

---

## TASK 2: Create Supabase Table

Use the Supabase MCP to create this table:

```sql
CREATE TABLE round_robin_sessions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  topic TEXT NOT NULL,
  turn_order TEXT[] NOT NULL,
  active_models TEXT[] NOT NULL,
  current_turn_index INT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'error')),
  user_id UUID REFERENCES auth.users(id),
  error_context JSONB
);

-- Add index for user lookups
CREATE INDEX idx_round_robin_sessions_user_id ON round_robin_sessions(user_id);

-- Add index for active sessions
CREATE INDEX idx_round_robin_sessions_status ON round_robin_sessions(status);

-- Trigger for updated_at
CREATE TRIGGER round_robin_sessions_updated_at
  BEFORE UPDATE ON round_robin_sessions
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
```

Messages will be stored in the existing `gios_context` table using:
- `session_id` → links to `round_robin_sessions.id`
- `model` → provider name ('openai', 'anthropic', 'mistral', 'gemini', 'huggingface', 'xai')
- `source` → 'round-robin' (to differentiate from regular chats)
- `role` → 'user' or 'assistant'

---

## TASK 3: Create Missing Files

### 3a. `lib/round-robin/truncation.ts`

Purpose: Manage context window limits across different models.

```typescript
/**
 * Context Window Truncation Strategy: "Sliding Window with Anchors"
 * 
 * Anchors (never truncate):
 * 1. Original user topic
 * 2. Each model's FIRST response (establishes their "voice")
 * 3. Most recent N messages
 * 
 * Middle content gets summarized when exceeding token budget.
 * 
 * Exports:
 * - MODEL_CONTEXT_LIMITS: Record<string, number> - token limits per provider
 * - countTokens(text: string): number - approximate token count
 * - truncateHistory(messages: Message[], targetModel: string): Message[]
 * - generateSummary(messages: Message[]): Promise<string> - summarize old messages
 */
```

Implement with these model limits:
- openai (gpt-4): 128000
- anthropic (claude): 200000
- mistral: 32000
- gemini: 1000000
- huggingface (zephyr-7b): 8192
- xai (grok): 131072

Reserve 2000 tokens for response, 500 for system prompt.

### 3b. `lib/round-robin/events.ts`

Purpose: Define SSE event types for client-server communication.

```typescript
/**
 * Server-Sent Event types for round-robin streaming
 * 
 * Events:
 * - session_init: { sessionId, topic, turnOrder, activeModels }
 * - turn_start: { model, turnIndex }
 * - content_chunk: { model, chunk, isComplete: false }
 * - turn_complete: { model, fullContent, tokenCount }
 * - turn_error: { model, error, options: ['retry', 'skip', 'remove'] }
 * - session_paused: { reason }
 * - session_resumed: { currentTurn }
 * - session_completed: { summary }
 * - model_status: { model, status: 'active' | 'inactive' | 'error', reason? }
 * - long_wait: { model, elapsedSeconds } - sent after 30+ seconds
 */
```

### 3c. `app/api/round-robin/action/route.ts`

Purpose: Handle user interventions during conversation.

```typescript
/**
 * POST /api/round-robin/action
 * 
 * Body: {
 *   sessionId: number,
 *   action: 'retry' | 'skip' | 'remove' | 'pause' | 'resume',
 *   model?: string (required for retry, skip, remove)
 * }
 * 
 * Actions:
 * - retry: Re-attempt the current model's turn (max 3 attempts)
 * - skip: Skip current model, advance to next
 * - remove: Remove model from active_models, advance turn
 * - pause: Set session status to 'paused'
 * - resume: Set session status to 'active', continue from current_turn_index
 * 
 * Updates round_robin_sessions table accordingly.
 * Returns updated session state.
 */
```

### 3d. `app/api/round-robin/resume/route.ts`

Purpose: Restore session state on page load/refresh.

```typescript
/**
 * GET /api/round-robin/resume?sessionId={id}
 * 
 * Returns full session state:
 * - Session metadata from round_robin_sessions
 * - All messages from gios_context WHERE session_id = {id} AND source = 'round-robin'
 * - Current turn information
 * 
 * If session is 'active', client should reconnect to /api/round-robin/stream
 */
```

### 3e. Delete `app/api/round-robin/[provider]/route.ts`

This dynamic route is unnecessary. The orchestrator calls providers directly via their SDKs, not via HTTP. Remove the entire `[provider]` folder.

### 3f. `components/round-robin/FailureModal.tsx`

```typescript
/**
 * Modal displayed when a model fails mid-turn
 * 
 * Props:
 * - isOpen: boolean
 * - model: string (which model failed)
 * - error: string (error message)
 * - onRetry: () => void
 * - onSkip: () => void  
 * - onRemove: () => void
 * - retryCount: number (show "Retry (2/3)" etc)
 * 
 * Use shadcn Dialog component
 */
```

### 3g. `components/round-robin/LoadingIndicator.tsx`

```typescript
/**
 * Shows when a model is taking longer than expected (30+ seconds)
 * 
 * Props:
 * - model: string
 * - elapsedSeconds: number
 * - isVisible: boolean
 * 
 * Display: "Claude is thinking... (45s) - This is taking longer than expected"
 */
```

### 3h. `components/round-robin/TurnOrderConfig.tsx`

```typescript
/**
 * Drag-and-drop interface for configuring turn order
 * 
 * Props:
 * - models: string[] (available models)
 * - turnOrder: string[] (current order)
 * - onOrderChange: (newOrder: string[]) => void
 * - disabled: boolean (locked after conversation starts)
 * 
 * Use @dnd-kit/core for drag-drop functionality
 * Each item shows model name + drag handle
 */
```

---

## TASK 4: Implement Core Types

Update `lib/round-robin/types.ts`:

```typescript
export interface RoundRobinSession {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  topic: string;
  turnOrder: string[];
  activeModels: string[];
  currentTurnIndex: number;
  status: 'active' | 'paused' | 'completed' | 'error';
  userId?: string;
  errorContext?: {
    model: string;
    error: string;
    retryCount: number;
  };
}

export interface RoundRobinMessage {
  id: number;
  sessionId: number;
  model: string;
  role: 'user' | 'assistant';
  content: string;
  embedding?: number[];
  createdAt: Date;
  turnIndex: number;
  tokenCount?: number;
}

export interface ProviderAdapter {
  name: string;
  contextLimit: number;
  isAvailable: () => Promise<boolean>;
  generateResponse: (
    messages: RoundRobinMessage[],
    systemPrompt: string
  ) => Promise<{
    content: string;
    tokenCount: number;
  }>;
}

export interface SSEEvent {
  type: string;
  data: Record<string, unknown>;
}

export interface TurnResult {
  success: boolean;
  content?: string;
  tokenCount?: number;
  error?: string;
}
```

---

## TASK 5: Update API Route Structure

### `app/api/round-robin/route.ts` (POST - Start new session)

```typescript
/**
 * POST /api/round-robin
 * 
 * Body: {
 *   topic: string,
 *   turnOrder: string[],
 *   activeModels: string[]
 * }
 * 
 * 1. Create new row in round_robin_sessions
 * 2. Store initial user message in gios_context with source='round-robin'
 * 3. Return { sessionId, streamUrl }
 */
```

### `app/api/round-robin/stream/route.ts` (GET - SSE endpoint)

```typescript
/**
 * GET /api/round-robin/stream?sessionId={id}
 * 
 * Server-Sent Events endpoint
 * 
 * Flow:
 * 1. Load session from round_robin_sessions
 * 2. Load message history from gios_context
 * 3. Enter orchestration loop:
 *    a. Emit 'turn_start' event
 *    b. Get current model from turnOrder[currentTurnIndex]
 *    c. Build prompt with truncated history
 *    d. Call provider adapter (full response, not streamed to provider)
 *    e. Save response to gios_context
 *    f. Generate embedding, save to gios_context
 *    g. Stream response chunks to client via 'content_chunk' events
 *    h. Emit 'turn_complete' event
 *    i. Update current_turn_index in round_robin_sessions
 *    j. If error: emit 'turn_error', wait for action via /api/round-robin/action
 *    k. If 30+ seconds: emit 'long_wait' event
 *    l. Loop to next turn until paused or completed
 */
```

---

## TASK 6: Provider Adapters Implementation

Each file in `lib/round-robin/providers/` should implement `ProviderAdapter` interface.

Reference existing SDK imports from the project:
- `openai` package for OpenAI
- `@anthropic-ai/sdk` for Anthropic  
- `@mistralai/mistralai` for Mistral
- `@google/generative-ai` for Gemini
- `@huggingface/inference` for HuggingFace
- OpenAI-compatible client for xAI

Each adapter should:
1. Check API key availability in `isAvailable()`
2. Format messages according to provider's expected format
3. Handle provider-specific errors
4. Return standardized response with content and token count

---

## TASK 7: Update `lib/round-robin/constants.ts`

```typescript
export const SUPPORTED_MODELS = [
  { id: 'openai', name: 'GPT-4', contextLimit: 128000 },
  { id: 'anthropic', name: 'Claude', contextLimit: 200000 },
  { id: 'mistral', name: 'Mistral', contextLimit: 32000 },
  { id: 'gemini', name: 'Gemini', contextLimit: 1000000 },
  { id: 'huggingface', name: 'Zephyr', contextLimit: 8192 },
  { id: 'xai', name: 'Grok', contextLimit: 131072 },
] as const;

export const DEFAULT_TURN_ORDER = ['openai', 'anthropic', 'mistral', 'gemini', 'huggingface', 'xai'];

export const RESPONSE_TOKEN_RESERVE = 2000;
export const SYSTEM_PROMPT_TOKEN_RESERVE = 500;
export const MAX_RETRY_ATTEMPTS = 3;
export const LONG_WAIT_THRESHOLD_SECONDS = 30;

export const ROUND_ROBIN_SYSTEM_PROMPT = `You are {model_name}, participating in a group discussion with other AI models.

Participants: {participant_list}

Guidelines:
- Be concise but substantive (2-4 paragraphs max)
- Build on previous responses, don't repeat
- Acknowledge others' points when relevant
- Stay on topic
- Be respectful and constructive

The discussion topic is provided below. When it's your turn, contribute meaningfully to the conversation.`;
```

---

## Architecture Summary

```
Frontend (stateless)
    │
    ├── POST /api/round-robin (start session)
    │       └── Returns sessionId
    │
    ├── GET /api/round-robin/stream?sessionId=X (SSE connection)
    │       └── Receives all events, updates UI
    │
    ├── POST /api/round-robin/action (user interventions)
    │       └── retry/skip/remove/pause/resume
    │
    └── GET /api/round-robin/resume?sessionId=X (restore on refresh)
            └── Returns full state, client reconnects to stream

Server (source of truth)
    │
    ├── round_robin_sessions (session metadata)
    └── gios_context (messages + embeddings, filtered by source='round-robin')
```

---

## Dependencies to Install

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

(For drag-and-drop turn order configuration)

---

Execute these tasks in order. After each major task, verify the changes work before proceeding.
```

---

**TL;DR:** Copy everything between the triple backticks above and paste to Windsurf. It covers: naming fix, Supabase table creation, all missing files, type definitions, API structure, provider adapters, and the full architecture explanation. The `[provider]` route gets deleted - it's unnecessary.