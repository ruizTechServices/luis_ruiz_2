# Round-Robin AI Group Chat - Architecture Documentation

> **Project:** `luis_ruiz_2`  
> **Feature:** `/round-robin`  
> **Last Updated:** December 2024  
> **Status:** MVP Complete (OpenAI only)

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Diagram](#2-architecture-diagram)
3. [Core Principles](#3-core-principles)
4. [State Shapes](#4-state-shapes)
5. [Message Schema](#5-message-schema)
6. [SSE Event Protocol](#6-sse-event-protocol)
7. [API Endpoints](#7-api-endpoints)
8. [Database Schema](#8-database-schema)
9. [Component Structure](#9-component-structure)
10. [Provider Adapters](#10-provider-adapters)
11. [Truncation Strategy](#11-truncation-strategy)
12. [Error Handling](#12-error-handling)
13. [Session Lifecycle](#13-session-lifecycle)
14. [Implementation Checklist](#14-implementation-checklist)
15. [Future Roadmap](#15-future-roadmap)

---

## 1. System Overview

The Round-Robin AI Group Chat is a multi-model discussion platform where different AI providers (OpenAI, Anthropic, Mistral, Gemini, HuggingFace, xAI) take turns responding to a user-provided topic in structured conversation rounds.

### Key Characteristics

- **Server-Driven State:** The server is the single source of truth. The frontend is stateless and syncs via Server-Sent Events (SSE).
- **User-Gated Rounds:** After all active models respond once (one complete round), the session pauses and waits for user input before continuing.
- **Topic Immutability:** Once set, the discussion topic cannot be changed mid-conversation.
- **Real-Time Streaming:** Model responses are collected in full on the server, then streamed to the client for display.

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Stateless)                           │
│                           /app/round-robin/page.tsx                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ ModelSelector│  │TurnOrderConfig│ │ TopicInput │  │   ControlPanel      │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                        ConversationThread                               │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                     │ │
│  │  │  ModelBadge  │ │TurnIndicator │ │LoadingIndicator│                   │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘                     │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                     useRoundRobinStream (SSE Hook)                      │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
         ┌──────────────────┐ ┌─────────────┐ ┌─────────────────┐
         │ POST /api/round- │ │GET /stream  │ │POST /api/round- │
         │ robin (start)    │ │ (SSE)       │ │ robin/action    │
         └────────┬─────────┘ └──────┬──────┘ └────────┬────────┘
                  │                  │                 │
                  └──────────────────┼─────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SERVER (Source of Truth)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                           ORCHESTRATOR                                  │ │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               │ │
│  │  │ Turn Manager  │  │ Prompt Builder│  │  Truncation   │               │ │
│  │  └───────────────┘  └───────────────┘  └───────────────┘               │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                        PROVIDER ADAPTERS                                │ │
│  │  ┌────────┐ ┌─────────┐ ┌────────┐ ┌───────┐ ┌───────────┐ ┌─────┐     │ │
│  │  │ OpenAI │ │Anthropic│ │Mistral │ │Gemini │ │HuggingFace│ │ xAI │     │ │
│  │  │   ✅   │ │   ❌    │ │   ❌   │ │  ❌   │ │    ❌     │ │ ❌  │     │ │
│  │  └────────┘ └─────────┘ └────────┘ └───────┘ └───────────┘ └─────┘     │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SUPABASE DATABASE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────┐    ┌───────────────────────────────────────┐ │
│  │   round_robin_sessions    │    │        round_robin_messages           │ │
│  │   (session metadata)      │◄───│        (conversation history)         │ │
│  └───────────────────────────┘    └───────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Principles

### 3.1 Server as Single Source of Truth

```
Client State = f(Server State)
```

The frontend never stores conversation state locally. On every connection:
1. Client requests current state from server
2. Server returns full session + message history
3. Client renders based on received data
4. Client subscribes to SSE for real-time updates

### 3.2 User-Gated Round System

```
Round N:
  ├── Model A responds
  ├── Model B responds
  ├── Model C responds
  └── PAUSE → Wait for user input

User provides follow-up (optional)

Round N+1:
  ├── Model A responds
  ├── ...
```

### 3.3 Stateless Frontend

- No `localStorage` for conversation data
- No `sessionStorage` for state persistence
- URL contains `sessionId` for restoration
- All state derived from API responses + SSE events

---

## 4. State Shapes

### 4.1 Session State (Server)

```typescript
// lib/round-robin/types.ts
interface RoundRobinSession {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  topic: string;
  turnOrder: string[];        // ['openai', 'anthropic', 'mistral']
  activeModels: string[];     // Models still in conversation
  currentTurnIndex: number;   // Global turn counter
  currentRound: number;       // Which round we're on
  status: 'active' | 'paused' | 'completed' | 'error' | 'awaiting_user';
  userId?: string;            // Optional auth link
  errorContext?: {
    model: string;
    error: string;
    retryCount: number;
  };
}
```

### 4.2 Client State (Page Component)

```typescript
// app/round-robin/page.tsx
interface PageState {
  sessionId: number | null;
  sessionStatus: 'idle' | 'active' | 'paused' | 'awaiting_user' | 'completed' | 'error';
  topic: string;
  selectedModels: string[];
  turnOrder: string[];
  messages: ThreadMessage[];
  currentlyStreaming: { model: string; content: string } | null;
  currentTurn: { model: string; index: number; round: number } | null;
  currentRound: number;
  errorState: { model: string; message: string; retryCount: number } | null;
  elapsedSeconds: number;
  longWaitVisible: boolean;
}
```

---

## 5. Message Schema

### 5.1 Database Schema

```sql
-- round_robin_messages table
id              BIGINT PRIMARY KEY
session_id      BIGINT REFERENCES round_robin_sessions(id)
model           TEXT NOT NULL       -- 'user' | 'openai' | 'anthropic' | etc.
role            TEXT NOT NULL       -- 'user' | 'assistant'
content         TEXT NOT NULL
turn_index      INT DEFAULT 0
token_count     INT
embedding       VECTOR(1536)        -- OpenAI embedding dimension
created_at      TIMESTAMPTZ
```

### 5.2 TypeScript Interface

```typescript
interface RoundRobinMessage {
  id: number;
  sessionId: number;
  model: string;
  role: 'user' | 'assistant';
  content: string;
  turnIndex: number;
  tokenCount?: number;
  embedding?: number[];
  createdAt: Date;
}
```

---

## 6. SSE Event Protocol

### 6.1 Server → Client Events

| Event | Data Shape | When Emitted |
|-------|------------|--------------|
| `session_init` | `{ sessionId, topic, turnOrder, activeModels }` | Stream connection established |
| `turn_start` | `{ model, turnIndex }` | Model begins generating |
| `content_chunk` | `{ model, chunk, isComplete }` | Streaming response text |
| `turn_complete` | `{ model, fullContent, tokenCount }` | Model finished responding |
| `round_complete` | `{ round, nextAction: 'awaiting_user_input' }` | All models in round finished |
| `turn_error` | `{ model, error, options: ['retry','skip','remove'] }` | Model failed |
| `long_wait` | `{ model, elapsedSeconds }` | Response taking >30 seconds |
| `session_paused` | `{ reason }` | User paused session |
| `session_resumed` | `{ currentTurn }` | Session resumed |

### 6.2 Event Serialization

```typescript
// lib/round-robin/events.ts
function serializeEvent(event: SSEEvent): string {
  return `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
}
```

---

## 7. API Endpoints

### 7.1 Endpoint Summary

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/round-robin` | Start new session |
| `GET` | `/api/round-robin/stream?sessionId=X` | SSE stream connection |
| `POST` | `/api/round-robin/action` | User interventions (pause/resume/retry/skip/remove) |
| `POST` | `/api/round-robin/continue` | Continue after round (with optional message) |
| `GET` | `/api/round-robin/resume?sessionId=X` | Restore session state |

### 7.2 Request/Response Shapes

#### POST /api/round-robin
```typescript
// Request
{ topic: string, turnOrder: string[], activeModels: string[] }

// Response
{ sessionId: number, streamUrl: string }
```

#### POST /api/round-robin/action
```typescript
// Request
{ sessionId: number, action: 'retry'|'skip'|'remove'|'pause'|'resume', model?: string }

// Response
{ success: boolean, session: RoundRobinSession }
```

#### POST /api/round-robin/continue
```typescript
// Request
{ sessionId: number, message?: string }

// Response
{ success: boolean, streamUrl: string }
```

#### GET /api/round-robin/resume
```typescript
// Response
{ session: RoundRobinSession, messages: RoundRobinMessage[] }
```

---

## 8. Database Schema

### 8.1 round_robin_sessions

```sql
CREATE TABLE round_robin_sessions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  topic TEXT NOT NULL,
  turn_order TEXT[] NOT NULL,
  active_models TEXT[] NOT NULL,
  current_turn_index INT DEFAULT 0,
  current_round INT DEFAULT 1,
  status TEXT DEFAULT 'active' 
    CHECK (status IN ('active', 'paused', 'completed', 'error', 'awaiting_user')),
  user_id UUID REFERENCES auth.users(id),
  error_context JSONB
);

CREATE INDEX idx_rrs_user_id ON round_robin_sessions(user_id);
CREATE INDEX idx_rrs_status ON round_robin_sessions(status);
```

### 8.2 round_robin_messages

```sql
CREATE TABLE round_robin_messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id BIGINT NOT NULL REFERENCES round_robin_sessions(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  turn_index INT DEFAULT 0,
  token_count INT,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rrm_session_id ON round_robin_messages(session_id);
CREATE INDEX idx_rrm_session_turn ON round_robin_messages(session_id, turn_index);
CREATE INDEX idx_rrm_embedding ON round_robin_messages 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

---

## 9. Component Structure

```
components/round-robin/
├── index.ts                 # Barrel exports
├── ModelBadge.tsx           # Visual model identifier with status
├── TurnIndicator.tsx        # Current turn/round display
├── ModelSelector.tsx        # Toggle models on/off
├── TurnOrderConfig.tsx      # Drag-drop turn order
├── TopicInput.tsx           # Topic entry textarea
├── ControlPanel.tsx         # Start/Pause/Resume/End controls
├── ConversationThread.tsx   # Message display with auto-scroll
├── FailureModal.tsx         # Retry/Skip/Remove dialog
└── LoadingIndicator.tsx     # Long wait indicator
```

### Component Props Summary

| Component | Key Props |
|-----------|-----------|
| `ModelBadge` | `model, status, size` |
| `TurnIndicator` | `currentModel, turnOrder, currentIndex, currentRound, status` |
| `ModelSelector` | `availableModels, selectedModels, onSelectionChange, disabled` |
| `TurnOrderConfig` | `models, turnOrder, onOrderChange, disabled` |
| `TopicInput` | `value, onChange, onSubmit, disabled` |
| `ControlPanel` | `sessionStatus, onStart, onPause, onResume, onEnd, onContinue, canStart` |
| `ConversationThread` | `messages, currentlyStreaming, modelsInRound` |
| `FailureModal` | `isOpen, model, error, retryCount, maxRetries, onRetry, onSkip, onRemove` |
| `LoadingIndicator` | `model, elapsedSeconds, isVisible` |

---

## 10. Provider Adapters

### 10.1 Interface

```typescript
interface ProviderAdapter {
  name: string;
  contextLimit: number;
  isAvailable: () => Promise<boolean>;
  generateResponse: (
    messages: RoundRobinMessage[],
    systemPrompt: string
  ) => Promise<{ content: string; tokenCount: number }>;
}
```

### 10.2 Implementation Status

| Provider | File | Status | Notes |
|----------|------|--------|-------|
| OpenAI | `providers/openai.ts` | ✅ Complete | GPT-4, 128K context |
| Anthropic | `providers/anthropic.ts` | ❌ Stub | Claude, 200K context |
| Mistral | `providers/mistral.ts` | ❌ Stub | 32K context |
| Gemini | `providers/gemini.ts` | ❌ Stub | 1M context |
| HuggingFace | `providers/huggingface.ts` | ❌ Stub | Zephyr-7B, 8K context |
| xAI | `providers/xai.ts` | ❌ Stub | Grok, 131K context |

### 10.3 Context Limits

```typescript
// lib/round-robin/constants.ts
export const SUPPORTED_MODELS = [
  { id: 'openai', name: 'GPT-4', contextLimit: 128000 },
  { id: 'anthropic', name: 'Claude', contextLimit: 200000 },
  { id: 'mistral', name: 'Mistral', contextLimit: 32000 },
  { id: 'gemini', name: 'Gemini', contextLimit: 1000000 },
  { id: 'huggingface', name: 'Zephyr', contextLimit: 8192 },
  { id: 'xai', name: 'Grok', contextLimit: 131072 },
] as const;
```

---

## 11. Truncation Strategy

### 11.1 Sliding Window with Anchors

**Anchors (never truncate):**
1. Original user topic (first message)
2. Each model's FIRST response (establishes their "voice")
3. Most recent N messages (default: 6)

**Sliding Window:**
When token budget exceeded:
1. Identify removable messages (non-anchors)
2. Remove oldest removable messages first
3. Generate summary of removed content via OpenAI
4. Insert summary after first user message

### 11.2 Token Budget Calculation

```typescript
const contextLimit = MODEL_CONTEXT_LIMITS[targetModel];  // e.g., 128000
const responseReserve = 2000;   // Tokens for model's response
const systemReserve = 500;      // Tokens for system prompt
const budget = contextLimit - responseReserve - systemReserve;
```

### 11.3 Token Counting

```typescript
// Approximate: ~1.3 tokens per word
function countTokens(text: string): number {
  const words = text.trim().split(/\s+/g);
  return Math.max(1, Math.ceil(words.length * 1.3));
}
```

---

## 12. Error Handling

### 12.1 Error Types

| Error | Handling |
|-------|----------|
| API timeout | Emit `long_wait` at 30s, `turn_error` at timeout |
| Empty response | Retry up to 3 times automatically |
| API failure (429, 500, etc.) | Emit `turn_error` with options |
| Invalid response format | Log and treat as empty response |
| Context window exceeded | Truncation handles automatically |

### 12.2 User Options on Error

```typescript
// Presented via FailureModal
{
  retry: 'Re-attempt this turn (max 3)',
  skip: 'Skip this model, continue to next',
  remove: 'Remove model from discussion entirely'
}
```

### 12.3 Retry Logic

```typescript
const MAX_RETRY_ATTEMPTS = 3;

// Server tracks retry count in error_context
// UI shows: "Retry (2/3)"
// Disabled when retryCount >= MAX_RETRY_ATTEMPTS
```

---

## 13. Session Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SESSION LIFECYCLE                                 │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────┐
    │  IDLE   │ ← User configures models, topic
    └────┬────┘
         │ Start Discussion
         ▼
    ┌─────────┐     Pause      ┌─────────┐
    │ ACTIVE  │◄──────────────►│ PAUSED  │
    └────┬────┘     Resume     └────┬────┘
         │                          │
         │ Round Complete           │ End Discussion
         ▼                          │
    ┌─────────────┐                 │
    │AWAITING_USER│                 │
    └──────┬──────┘                 │
           │ Continue               │
           │ (with optional msg)    │
           ▼                        ▼
    ┌─────────┐               ┌───────────┐
    │ ACTIVE  │               │ COMPLETED │
    │(Round+1)│               │  (or IDLE │
    └─────────┘               │   reset)  │
                              └───────────┘

    ┌─────────┐
    │  ERROR  │ ← Model failure during turn
    └────┬────┘
         │ Retry / Skip / Remove
         ▼
    ┌─────────┐
    │ ACTIVE  │
    └─────────┘
```

---

## 14. Implementation Checklist

### ✅ COMPLETED

#### Phase 1: Foundation
- [x] Directory structure (`app/round-robin/`, `lib/round-robin/`, `components/round-robin/`)
- [x] TypeScript types (`types.ts`)
- [x] Constants and configuration (`constants.ts`)
- [x] Supabase table: `round_robin_sessions`
- [x] Supabase table: `round_robin_messages`

#### Phase 2: Core Logic
- [x] Truncation engine (`truncation.ts`)
- [x] SSE event definitions (`events.ts`)
- [x] OpenAI provider adapter (`providers/openai.ts`)
- [x] Prompt builder (`prompt-builder.ts`)

#### Phase 3: API Routes
- [x] `POST /api/round-robin` (start session)
- [x] `GET /api/round-robin/stream` (SSE streaming)
- [x] `POST /api/round-robin/action` (pause/resume/retry/skip/remove)
- [x] `POST /api/round-robin/continue` (continue after round)
- [x] `GET /api/round-robin/resume` (restore session)

#### Phase 4: UI Components
- [x] `ModelBadge.tsx`
- [x] `TurnIndicator.tsx`
- [x] `ModelSelector.tsx`
- [x] `TurnOrderConfig.tsx` (with dnd-kit)
- [x] `TopicInput.tsx`
- [x] `ControlPanel.tsx`
- [x] `ConversationThread.tsx`
- [x] `FailureModal.tsx`
- [x] `LoadingIndicator.tsx`
- [x] `useRoundRobinStream.ts` (SSE hook)
- [x] Page orchestration (`page.tsx`)

#### Orchestration
- [x] User-gated round system
- [x] Session state management
- [x] Turn advancement logic
- [x] Pause/Resume functionality
- [x] Session restoration on refresh

---

### ❌ NOT IMPLEMENTED

#### Phase 5: Provider Adapters
- [ ] Anthropic adapter (`providers/anthropic.ts`)
- [ ] Mistral adapter (`providers/mistral.ts`)
- [ ] Gemini adapter (`providers/gemini.ts`)
- [ ] HuggingFace adapter (`providers/huggingface.ts`)
- [ ] xAI adapter (`providers/xai.ts`)
- [ ] Provider health checks (real availability status)

#### Phase 6: Validation & Quality
- [ ] Turn output validation (max tokens, empty check, relevance)
- [ ] Response sanitization (strip unwanted formatting)
- [ ] Repetition detection (model repeating itself)
- [ ] Off-topic detection

#### Phase 7: Embeddings & RAG
- [ ] Generate embeddings for each message
- [ ] Store embeddings in `round_robin_messages.embedding`
- [ ] Embedding-based context retrieval
- [ ] Summary embeddings for long conversations

#### Phase 8: Polish & Hardening
- [ ] Mobile responsive testing
- [ ] Accessibility audit
- [ ] Rate limiting
- [ ] Abuse prevention (model drift detection)
- [ ] Session cleanup (old sessions)
- [ ] Analytics/logging

---

## 15. Future Roadmap

### Near-Term (Phase 5-6)

1. **Complete Provider Adapters**
   - Implement remaining 5 providers
   - Add real health checks per provider
   - Handle provider-specific error codes

2. **Output Validation**
   - Max token enforcement
   - Empty response handling (beyond retry)
   - Basic relevance scoring

### Medium-Term (Phase 7)

3. **Embedding Integration**
   - Async embedding generation post-response
   - RAG-enhanced context for long discussions
   - Semantic search across sessions

### Long-Term (Phase 8+)

4. **Advanced Features**
   - Multi-user sessions (spectators)
   - Export conversation (Markdown/PDF)
   - Conversation branching (fork at any point)
   - Model voting/consensus mechanisms

5. **Infrastructure**
   - Background job queue for embeddings
   - Caching layer for repeated prompts
   - CDN for static assets

---

## Appendix A: File Locations

```
luis_ruiz_2/
├── app/
│   ├── round-robin/
│   │   ├── page.tsx              # Main page component
│   │   └── loading.tsx           # Loading state
│   └── api/
│       └── round-robin/
│           ├── route.ts          # POST - Start session
│           ├── stream/
│           │   └── route.ts      # GET - SSE endpoint
│           ├── action/
│           │   └── route.ts      # POST - User actions
│           ├── continue/
│           │   └── route.ts      # POST - Continue round
│           └── resume/
│               └── route.ts      # GET - Restore session
├── components/
│   └── round-robin/
│       ├── index.ts
│       ├── ModelBadge.tsx
│       ├── TurnIndicator.tsx
│       ├── ModelSelector.tsx
│       ├── TurnOrderConfig.tsx
│       ├── TopicInput.tsx
│       ├── ControlPanel.tsx
│       ├── ConversationThread.tsx
│       ├── FailureModal.tsx
│       └── LoadingIndicator.tsx
└── lib/
    └── round-robin/
        ├── types.ts
        ├── constants.ts
        ├── events.ts
        ├── truncation.ts
        ├── prompt-builder.ts
        ├── orchestrator.ts
        ├── useRoundRobinStream.ts
        └── providers/
            ├── index.ts
            ├── openai.ts         # ✅ Complete
            ├── anthropic.ts      # ❌ Stub
            ├── mistral.ts        # ❌ Stub
            ├── gemini.ts         # ❌ Stub
            ├── huggingface.ts    # ❌ Stub
            └── xai.ts            # ❌ Stub
```

---

## Appendix B: Environment Variables

```env
# Required for OpenAI (currently the only working provider)
OPENAI_API_KEY=sk-...

# Required for Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Future providers (stubs exist, adapters not implemented)
ANTHROPIC_API_KEY=sk-ant-...
MISTRAL_API_KEY=...
GEMINI_API_KEY=...
HF_API_KEY=hf_...
XAI_API_KEY=...
```

---

## Appendix C: Testing Commands

```bash
# Start new session
curl -X POST http://localhost:3000/api/round-robin \
  -H "Content-Type: application/json" \
  -d '{"topic": "What is consciousness?", "turnOrder": ["openai"], "activeModels": ["openai"]}'

# Stream session (replace <ID> with actual sessionId)
curl -N "http://localhost:3000/api/round-robin/stream?sessionId=<ID>"

# Continue with follow-up
curl -X POST http://localhost:3000/api/round-robin/continue \
  -H "Content-Type: application/json" \
  -d '{"sessionId": <ID>, "message": "Can machines be conscious?"}'

# Pause session
curl -X POST http://localhost:3000/api/round-robin/action \
  -H "Content-Type: application/json" \
  -d '{"sessionId": <ID>, "action": "pause"}'

# Resume session
curl -X POST http://localhost:3000/api/round-robin/action \
  -H "Content-Type: application/json" \
  -d '{"sessionId": <ID>, "action": "resume"}'

# Restore session (page refresh simulation)
curl "http://localhost:3000/api/round-robin/resume?sessionId=<ID>"
```

---

*Document generated for `ruizTechServices/luis_ruiz_2` round-robin feature.*