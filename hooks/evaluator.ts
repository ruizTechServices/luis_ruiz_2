import { getOpenAICompletion } from "@/lib/functions/openai/responses";

const ALLOWED_TONES = [
  'Aggressive',
  'Casual',
  'Neutral',
  'Positive',
  'Formal',
  'Urgent',
] as const;

const SYSTEM_MESSAGE = `You are an evaluator. Only analyze the given input. Use one tone label from this fixed list exactly: Aggressive, Casual, Neutral, Positive, Formal, Urgent. Reply strictly in <=150 characters using exactly: tone:{{<tone>}} analysis:{{<analysis>}}. No greetings, no extra text.`;

type Evaluation = {
  tone: string;
  analysis: string;
  raw: string;
  formatted: string;
};

const DEFAULT_MAX_CHARS = 250;

function clampToChars(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, Math.max(0, max)).trimEnd();
}

function parseEvaluation(raw: string): { tone?: string; analysis?: string } {
  const text = raw.replace(/\s+/g, ' ').trim();
  const toneMatch = text.match(/tone\s*:\s*(?:\{\{\s*)?(?:<)?([^}>]+?)(?:>)?(?:\s*\}\})?/i);
  const analysisMatch = text.match(/analysis\s*:\s*(?:\{\{\s*)?(?:<)?(.+?)(?:>)?(?:\s*\}\})?$/i);
  return {
    tone: toneMatch ? toneMatch[1].trim() : undefined,
    analysis: analysisMatch ? analysisMatch[1].trim() : undefined,
  };
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeTone(input?: string): (typeof ALLOWED_TONES)[number] {
  if (!input) return 'Neutral';
  const k = input.trim().toLowerCase();
  // Common single-letter or synonym mappings
  if (k === 'a' || k === 'aggressive' || k === 'hostile') return 'Aggressive';
  if (k === 'c' || k === 'casual' || k === 'informal') return 'Casual';
  if (k === 'n' || k === 'neutral') return 'Neutral';
  if (k === 'p' || k === 'positive' || k === 'friendly') return 'Positive';
  if (k === 'f' || k === 'formal' || k === 'professional') return 'Formal';
  if (k === 'u' || k === 'urgent' || k === 'impatient') return 'Urgent';

  const tc = titleCase(input);
  return (ALLOWED_TONES as readonly string[]).includes(tc) ? (tc as (typeof ALLOWED_TONES)[number]) : 'Neutral';
}

function buildFormatted(tone: string, analysis: string): string {
  return `tone: ${tone}  analysis: ${analysis}`;
}

export async function evaluateAnalysis(
  message: string,
  opts?: { maxChars?: number; system?: string | false; model?: string }
): Promise<Evaluation> {
  const maxChars = opts?.maxChars ?? DEFAULT_MAX_CHARS;
  const model = opts?.model ?? 'gpt-4o';
  const system = opts?.system === false ? undefined : (opts?.system ?? SYSTEM_MESSAGE);

  // Heuristic: ~3 chars per token -> cap tokens to keep responses short
  const approxMaxTokens = Math.max(16, Math.ceil(maxChars / 3));
  const callOpts = system
    ? { system, maxOutputTokens: approxMaxTokens }
    : { maxOutputTokens: approxMaxTokens } as const;

  const raw = await getOpenAICompletion(message, model, callOpts);

  const { tone: parsedTone, analysis: parsedAnalysis } = parseEvaluation(raw);
  const tone = normalizeTone(parsedTone);

  const overhead = `tone: ${tone}  analysis: `.length;
  const remaining = Math.max(0, maxChars - overhead);
  const analysis = clampToChars(parsedAnalysis || raw, remaining);

  const formatted = buildFormatted(tone, analysis);
  return { tone, analysis, raw, formatted };
}

export const evaluator = async (message: string) => {
  const { formatted } = await evaluateAnalysis(message);
  return formatted;
};
