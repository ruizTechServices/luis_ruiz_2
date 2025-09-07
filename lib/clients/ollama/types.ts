// lib/clients/ollama/types.ts
export type OllamaRole = "system" | "user" | "assistant";

export type OllamaMessage = {
  role: OllamaRole;
  content: string;
};

export type OllamaChatRequest = {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
  options?: {
    temperature?: number;
  };
};

export type OllamaStreamEvent = {
  message?: { content?: string; role?: OllamaRole };
  done?: boolean;
  model?: string;
  created_at?: string;
};
