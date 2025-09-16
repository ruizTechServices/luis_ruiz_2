import { NextResponse } from "next/server";

// Import providers lazily inside the handler so dev doesn't crash when envs are missing

type ServiceStatus = "operational" | "down" | "not_configured";

type DeepResult = {
  providers: Record<string, { status: ServiceStatus; info?: string; count?: number }>;
  timestamp: number;
};

export async function GET() {
  const providers: DeepResult["providers"] = {};

  // OpenAI
  try {
    if (process.env.OPENAI_API_KEY) {
      const { default: OpenAI } = await import("openai");
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const list = await client.models.list();
      providers["OpenAI"] = { status: "operational", count: list.data?.length ?? 0 };
    } else {
      providers["OpenAI"] = { status: "not_configured" };
    }
  } catch (e) {
    providers["OpenAI"] = { status: "down", info: e instanceof Error ? e.message : String(e) };
  }

  // Anthropic
  try {
    if (process.env.ANTHROPIC_API_KEY) {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const list = await client.models.list();
      // @ts-ignore SDK types may vary
      const count = Array.isArray(list?.data) ? list.data.length : 0;
      providers["Anthropic"] = { status: "operational", count };
    } else {
      providers["Anthropic"] = { status: "not_configured" };
    }
  } catch (e) {
    providers["Anthropic"] = { status: "down", info: e instanceof Error ? e.message : String(e) };
  }

  // Mistral
  try {
    if (process.env.MISTRAL_API_KEY) {
      const { Mistral } = await import("@mistralai/mistralai");
      const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
      // @ts-ignore list models varies
      const list = await client.models.list();
      const count = Array.isArray(list?.data) ? list.data.length : 0;
      providers["Mistral"] = { status: "operational", count };
    } else {
      providers["Mistral"] = { status: "not_configured" };
    }
  } catch (e) {
    providers["Mistral"] = { status: "down", info: e instanceof Error ? e.message : String(e) };
  }

  // xAI
  try {
    if (process.env.XAI_API_KEY) {
      const { default: OpenAI } = await import("openai");
      const client = new OpenAI({ apiKey: process.env.XAI_API_KEY, baseURL: "https://api.x.ai/v1" });
      const list = await client.models.list();
      providers["xAI"] = { status: "operational", count: list.data?.length ?? 0 };
    } else {
      providers["xAI"] = { status: "not_configured" };
    }
  } catch (e) {
    providers["xAI"] = { status: "down", info: e instanceof Error ? e.message : String(e) };
  }

  // Hugging Face token check (whoami)
  try {
    if (process.env.HF_API_KEY) {
      const res = await fetch("https://huggingface.co/api/whoami-v2", {
        headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` },
        cache: "no-store",
      });
      providers["HuggingFace"] = { status: res.ok ? "operational" : "down" };
    } else {
      providers["HuggingFace"] = { status: "not_configured" };
    }
  } catch (e) {
    providers["HuggingFace"] = { status: "down", info: e instanceof Error ? e.message : String(e) };
  }

  // Google GenAI (Gemini) lightweight token usage check: instantiate
  try {
    if (process.env.GEMINI_API_KEY) {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      // Do a very light no-op by constructing a model reference; avoid chargeable calls
      client.getGenerativeModel({ model: "gemini-1.5-flash" });
      providers["Gemini"] = { status: "operational" };
    } else {
      providers["Gemini"] = { status: "not_configured" };
    }
  } catch (e) {
    providers["Gemini"] = { status: "down", info: e instanceof Error ? e.message : String(e) };
  }

  // Brave (manual-only in Tier 1): ping a super-light benign query but treat 4xx/5xx as down
  try {
    if (process.env.BRAVE_API_KEY) {
      const res = await fetch(
        `https://api.search.brave.com/res/v1/web/search?q=healthcheck`,
        {
          headers: {
            Accept: "application/json",
            "X-Subscription-Token": process.env.BRAVE_API_KEY,
          },
          cache: "no-store",
        }
      );
      providers["Brave"] = { status: res.ok ? "operational" : "down" };
    } else {
      providers["Brave"] = { status: "not_configured" };
    }
  } catch (e) {
    providers["Brave"] = { status: "down", info: e instanceof Error ? e.message : String(e) };
  }

  return NextResponse.json({ providers, timestamp: Date.now() satisfies number } satisfies DeepResult);
}
