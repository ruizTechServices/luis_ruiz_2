import { cookies } from "next/headers";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import DeepHealthButton from "@/components/app/gio_dashboard/DeepHealthButton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type ServiceStatus = "operational" | "down" | "not_configured";

type Tier0Result = {
  supabase: { status: ServiceStatus; latencyMs?: number };
  pinecone: { status: ServiceStatus; vectors?: number | null };
  ollama: { status: ServiceStatus; models?: number | null };
  routes: { embeddings: ServiceStatus; chat: ServiceStatus };
  envs: Record<string, ServiceStatus>;
};

const TTL_MS = 5 * 60 * 1000;
let cache: { ts: number; data: Tier0Result } | null = null;

function envConfigured(name: string, ok: boolean): ServiceStatus {
  return ok ? "operational" : "not_configured";
}

function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_URL;
  if (vercel) return vercel.startsWith("http") ? vercel : `https://${vercel}`;
  return "http://localhost:3000";
}

async function checkRoutes(): Promise<{ embeddings: ServiceStatus; chat: ServiceStatus }> {
  const base = getSiteUrl();
  async function probe(path: string): Promise<ServiceStatus> {
    try {
      const res = await fetch(`${base}${path}`, { method: "GET", cache: "no-store" });
      // 200-499 (except 404) means route exists but maybe wrong method
      if (res.status === 404) return "down";
      return "operational";
    } catch {
      return "down";
    }
  }
  const [emb, chat] = await Promise.all([probe("/api/embeddings"), probe("/api/chat")]);
  return { embeddings: emb, chat };
}

async function getTier0(): Promise<Tier0Result> {
  if (cache && Date.now() - cache.ts < TTL_MS) return cache.data;

  // Env presence (no secrets leaked)
  const envs: Record<string, ServiceStatus> = {
    "Supabase Config": envConfigured(
      "Supabase",
      !!(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_API_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY))
    ),
    "Pinecone API": envConfigured("Pinecone", !!process.env.PINECONE_API_KEY && !!process.env.PINECONE_INDEX),
    "OpenAI API": envConfigured("OpenAI", !!process.env.OPENAI_API_KEY),
    "Anthropic API": envConfigured("Anthropic", !!process.env.ANTHROPIC_API_KEY),
    "Gemini API": envConfigured("Gemini", !!process.env.GEMINI_API_KEY),
    "HuggingFace API": envConfigured("HuggingFace", !!process.env.HF_API_KEY),
    "Mistral API": envConfigured("Mistral", !!process.env.MISTRAL_API_KEY),
    "xAI API": envConfigured("xAI", !!process.env.XAI_API_KEY),
    "Brave API": envConfigured("Brave", !!process.env.BRAVE_API_KEY),
    "Ollama URL": envConfigured("Ollama", !!process.env.OLLAMA_BASE_URL),
  };

  // Supabase latency + status
  let supabaseStatus: ServiceStatus = "down";
  let dbLatency: number | undefined;
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const t0 = Date.now();
    const { error } = await supabase.from("blog_posts").select("id", { count: "exact" }).limit(0);
    dbLatency = Date.now() - t0;
    supabaseStatus = error ? "down" : "operational";
  } catch {
    supabaseStatus = "down";
  }

  // Pinecone connectivity + vectors
  let pineconeStatus: ServiceStatus = "not_configured";
  let pineconeVectors: number | null = null;
  const pineApi = process.env.PINECONE_API_KEY;
  const pineIdx = process.env.PINECONE_INDEX;
  if (pineApi && pineIdx) {
    try {
      const { Pinecone } = await import("@pinecone-database/pinecone");
      const pc = new Pinecone({ apiKey: pineApi });
      const index = pc.index(pineIdx);
      const stats: any = await index.describeIndexStats();
      pineconeStatus = "operational";
      if (typeof stats?.totalRecordCount === "number") pineconeVectors = stats.totalRecordCount;
      else if (stats?.namespaces && typeof stats.namespaces === "object") {
        pineconeVectors = Object.values(stats.namespaces).reduce((acc: number, ns: any) => acc + (ns?.vectorCount || ns?.recordCount || 0), 0);
      }
    } catch {
      pineconeStatus = "down";
    }
  }

  // Ollama reachability
  let ollamaStatus: ServiceStatus = "not_configured";
  let ollamaModels: number | null = null;
  const base = (process.env.OLLAMA_BASE_URL || "http://localhost:11434").replace(/\/+$/, "");
  try {
    const res = await fetch(`${base}/api/tags`, { cache: "no-store" });
    if (res.ok) {
      const data: any = await res.json();
      const list = Array.isArray(data?.models) ? data.models : Array.isArray(data?.data) ? data.data : [];
      ollamaModels = list.length ?? 0;
      ollamaStatus = "operational";
    } else {
      ollamaStatus = process.env.OLLAMA_BASE_URL ? "down" : "not_configured";
    }
  } catch {
    ollamaStatus = process.env.OLLAMA_BASE_URL ? "down" : "not_configured";
  }

  // App route availability
  const routes = await checkRoutes();

  const data: Tier0Result = {
    supabase: { status: supabaseStatus, latencyMs: dbLatency },
    pinecone: { status: pineconeStatus, vectors: pineconeVectors },
    ollama: { status: ollamaStatus, models: ollamaModels },
    routes,
    envs,
  };
  cache = { ts: Date.now(), data };
  return data;
}

function overallIndicator(services: Record<string, ServiceStatus>) {
  const values = Object.values(services);
  if (values.includes("down")) return { color: "bg-red-500", text: "Issues detected" };
  if (values.includes("not_configured")) return { color: "bg-yellow-500", text: "Some services not configured" };
  return { color: "bg-green-500", text: "All systems operational" };
}

export default async function SystemHealthCard() {
  const results = await getTier0();
  const services: Record<string, ServiceStatus> = {
    Supabase: results.supabase.status,
    Pinecone: results.pinecone.status,
    Ollama: results.ollama.status,
    "API /embeddings": results.routes.embeddings,
    "API /chat": results.routes.chat,
    ...Object.fromEntries(Object.entries(results.envs).map(([k, v]) => [`Env: ${k}`, v])),
  };
  const indicator = overallIndicator(services);
  const envEntries = Object.entries(results.envs);
  const envOk = envEntries.filter(([, s]) => s === "operational").length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">System Health</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Monitor server status and performance</p>
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 ${indicator.color} rounded-full animate-pulse`}></div>
        <span className="text-gray-800 dark:text-gray-200 text-sm font-medium">{indicator.text}</span>
      </div>

      {/* Minimal details with drawers */}
      <Accordion type="single" collapsible className="mt-4">
        <AccordionItem value="services">
          <AccordionTrigger className="text-sm">Core services</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
              {(["Supabase", "Pinecone", "Ollama"] as const).map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    services[key] === "operational" ? "bg-green-500" : services[key] === "down" ? "bg-red-500" : "bg-yellow-500"}
                  `} />
                  <span>{key}: {services[key]}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 space-y-1">
              {typeof results.supabase.latencyMs === "number" && (
                <div>DB latency: ~{results.supabase.latencyMs} ms</div>
              )}
              {typeof results.pinecone.vectors === "number" && (
                <div>Pinecone vectors: {results.pinecone.vectors}</div>
              )}
              {typeof results.ollama.models === "number" && (
                <div>Ollama models available: {results.ollama.models}</div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="routes">
          <AccordionTrigger className="text-sm">API routes</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
              {(["API /embeddings", "API /chat"] as const).map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    services[key] === "operational" ? "bg-green-500" : services[key] === "down" ? "bg-red-500" : "bg-yellow-500"}
                  `} />
                  <span>{key.replace("API ", "")}: {services[key]}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="envs">
          <AccordionTrigger className="text-sm">Environment config ({envOk}/{envEntries.length})</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
              {envEntries.map(([name, status]) => (
                <div key={name} className="flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    status === "operational" ? "bg-green-500" : status === "down" ? "bg-red-500" : "bg-yellow-500"}
                  `} />
                  <span>{name}: {status}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Tier 1 trigger */}
      <div className="mt-4">
        <DeepHealthButton />
      </div>
    </div>
  );
}
// I need to check the status of all systems and show a red dot if any are not operational
// I need to check the status of all systems and show a yellow dot if any issues have arisen

// TODO: Add system health checks for Supabase, Pinecone, and other service clients
// - Check Supabase connection and database status
// - Verify Pinecone vector database connectivity
// - Monitor API response times and error rates
// - Implement health check endpoints for each service
// - And MORE!!!

