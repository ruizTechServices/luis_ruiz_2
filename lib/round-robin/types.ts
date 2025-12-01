// types.ts
// Shared TypeScript interfaces for round-robin orchestration flows.

export interface RoundRobinSession {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  topic: string;
  turnOrder: string[];
  activeModels: string[];
  currentTurnIndex: number;
  currentRound: number;
  status: 'active' | 'paused' | 'completed' | 'error' | 'awaiting_user';
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
