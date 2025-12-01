import OpenAI from "openai";

import {
  RESPONSE_TOKEN_RESERVE,
  SUPPORTED_MODELS,
  SYSTEM_PROMPT_TOKEN_RESERVE,
} from "./constants";
import type { RoundRobinMessage } from "./types";

const SUMMARY_MODEL = process.env.OPENAI_SUMMARY_MODEL ?? "gpt-4o-mini";
const RECENT_MESSAGE_COUNT = 6;
const FALLBACK_SUMMARY_CHAR_LIMIT = 800;

const openAiClient = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export const MODEL_CONTEXT_LIMITS: Record<string, number> = SUPPORTED_MODELS.reduce<Record<string, number>>(
  (acc, model) => {
    acc[model.id] = model.contextLimit;
    return acc;
  },
  {}
);

export function countTokens(text: string): number {
  if (!text) return 0;
  const words = text.trim().split(/\s+/g);
  return Math.max(1, Math.ceil(words.length * 1.3));
}

export async function truncateHistory(
  messages: RoundRobinMessage[],
  targetModel: string
): Promise<RoundRobinMessage[]> {
  const limit = MODEL_CONTEXT_LIMITS[targetModel] ?? 32_000;
  const budget = Math.max(1, limit - RESPONSE_TOKEN_RESERVE - SYSTEM_PROMPT_TOKEN_RESERVE);

  const annotated = messages.map((message, index) => ({
    message,
    index,
    tokens: message.tokenCount ?? countTokens(message.content),
    removed: false,
  }));

  let totalTokens = annotated.reduce((sum, entry) => sum + entry.tokens, 0);
  if (totalTokens <= budget) return messages;

  const anchorIndices = computeAnchorIndices(annotated.map((entry) => entry.message));
  const removableQueue = annotated.filter((entry) => !anchorIndices.has(entry.index));

  if (removableQueue.length === 0) {
    return messages;
  }

  const removedMessages: RoundRobinMessage[] = [];
  for (const entry of removableQueue) {
    if (totalTokens <= budget) break;
    entry.removed = true;
    totalTokens -= entry.tokens;
    removedMessages.push(entry.message);
  }

  let truncated = annotated.filter((entry) => !entry.removed).map((entry) => entry.message);

  if (totalTokens > budget) {
    // Nothing more can be removed without touching anchors, so return the best effort.
    return truncated;
  }

  if (removedMessages.length > 0) {
    const summaryText = await generateSummary(removedMessages);
    const trimmedSummary = summaryText.trim();
    if (trimmedSummary) {
      const summaryMessage: RoundRobinMessage = {
        id: -Date.now(),
        sessionId: removedMessages[0]?.sessionId ?? 0,
        model: "summary",
        role: "assistant",
        content: trimmedSummary,
        createdAt: new Date(),
        turnIndex: removedMessages[0]?.turnIndex ?? 0,
        tokenCount: countTokens(trimmedSummary),
      };

      if (totalTokens + (summaryMessage.tokenCount ?? 0) <= budget) {
        const firstUserIndex = truncated.findIndex((msg) => msg.role === "user");
        if (firstUserIndex >= 0) {
          truncated.splice(firstUserIndex + 1, 0, summaryMessage);
        } else {
          truncated.unshift(summaryMessage);
        }
      }
    }
  }

  return truncated;
}

function computeAnchorIndices(messages: RoundRobinMessage[]): Set<number> {
  const anchors = new Set<number>();

  const firstUserIndex = messages.findIndex((msg) => msg.role === "user");
  if (firstUserIndex >= 0) anchors.add(firstUserIndex);

  const firstResponseByModel = new Map<string, number>();
  messages.forEach((msg, index) => {
    if (msg.role === "assistant") {
      if (!firstResponseByModel.has(msg.model)) {
        firstResponseByModel.set(msg.model, index);
        anchors.add(index);
      }
    }
  });

  const startRecent = Math.max(messages.length - RECENT_MESSAGE_COUNT, 0);
  for (let i = startRecent; i < messages.length; i += 1) {
    anchors.add(i);
  }

  return anchors;
}

export async function generateSummary(messages: RoundRobinMessage[]): Promise<string> {
  if (messages.length === 0) return "";

  const joined = messages
    .map((msg) => `[${msg.role}:${msg.model}] ${msg.content}`)
    .join("\n\n");

  if (!openAiClient) {
    return fallbackSummary(joined);
  }

  try {
    const completion = await openAiClient.chat.completions.create({
      model: SUMMARY_MODEL,
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "Summarize the following excerpts from an AI group discussion. Preserve crucial facts, disagreements, and conclusions in 2-3 sentences.",
        },
        { role: "user", content: joined.slice(0, 8000) },
      ],
    });
    const content = completion.choices[0]?.message?.content?.trim();
    return content || fallbackSummary(joined);
  } catch (error) {
    console.error("[round-robin] Summary generation failed:", error);
    return fallbackSummary(joined);
  }
}

function fallbackSummary(text: string): string {
  const snippet = text.slice(0, FALLBACK_SUMMARY_CHAR_LIMIT);
  const ellipsis = text.length > FALLBACK_SUMMARY_CHAR_LIMIT ? "…" : "";
  return `Summary of earlier turns: ${snippet}${ellipsis}`;
}
