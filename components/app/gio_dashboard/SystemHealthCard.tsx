import { cookies } from "next/headers";
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import DeepHealthButton from "@/components/app/gio_dashboard/DeepHealthButton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type ServiceStatus = "operational" | "down" | "not_configured";

type Tier0Result = {
  supabase: { status: ServiceStatus; latencyMs?: number; anonLatencyMs?: number; info?: string };
  pinecone: {
    status: ServiceStatus;
    vectors?: number | null;
    ready?: boolean;
    dimension?: number | null;
    namespaces?: number | null;
    pods?: number | null;
    replicas?: number | null;
    podType?: string | null;
    driftDelta?: number | null;
  };
  ollama: { status: ServiceStatus; models?: number | null };
  routes: { embeddings: ServiceStatus; chat: ServiceStatus };
  envs: Record<string, ServiceStatus>;
};

const TTL_MS = 5 * 60 * 1000;
let cache: { ts: number; data: Tier0Result } | null = null;
let lastPineconeVectors: number | null = null;

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

// Basic classification for Supabase connectivity issues to surface actionable hints
function classifySupabaseIssueFromText(text: string): string {
  const t = (text || "").toLowerCase();
  if (t.includes("paused")) return "paused";
  if (
    t.includes("failed to fetch") ||
    t.includes("getaddrinfo") ||
    t.includes("enotfound") ||
    t.includes("timeout") ||
    t.includes("econ") ||
    t.includes("network")
  )
    return "network";
  if (t.includes("jwt") || t.includes("auth")) return "auth";
  if (t.includes("permission") || t.includes("rls")) return "rls";
  return "unknown";
}

function classifySupabaseIssue(err: unknown): string {
  if (err && typeof err === "object") {
    const maybe = err as { message?: unknown; details?: unknown; hint?: unknown; code?: unknown } | null | undefined;
    const combo = [maybe?.message, maybe?.details, maybe?.hint, maybe?.code]
      .filter((v): v is string => typeof v === "string")
      .join(" ");
    if (combo) return classifySupabaseIssueFromText(combo);
  }
  return classifySupabaseIssueFromText(err instanceof Error ? err.message : String(err ?? ""));
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

  // Supabase latency + status (service-role and anon)
  let supabaseStatus: ServiceStatus = "down";
  let dbLatencySvc: number | undefined;
  let dbLatencyAnon: number | undefined;
  let supabaseInfo: string | undefined;
  try {
    const cookieStore = await cookies();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_API_KEY;

    if (!url || (!anonKey && !svcKey)) {
      supabaseStatus = "not_configured";
    } else {
      const build = (key: string) =>
        createSupabaseServerClient(url, key, {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> | undefined }[]) {
              try {
                cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
              } catch {
                // ignore if called in a Server Component context where setting cookies is disallowed
              }
            },
          },
        });

      // Service-role check (prefer this for overall status if available)
      if (svcKey) {
        try {
          const supSvc = build(svcKey);
          const t0 = Date.now();
          const { error } = await supSvc.from("blog_posts").select("id", { count: "exact" }).limit(0);
          dbLatencySvc = Date.now() - t0;
          if (error) {
            supabaseInfo = supabaseInfo ?? classifySupabaseIssue(error);
            supabaseStatus = "down";
          } else {
            supabaseStatus = "operational";
          }
        } catch (e) {
          supabaseInfo = supabaseInfo ?? classifySupabaseIssue(e);
          supabaseStatus = "down";
        }
      }

      // Anon check (should succeed for public tables; helps detect RLS/anon issues)
      if (anonKey) {
        try {
          const supAnon = build(anonKey);
          const t0 = Date.now();
          const { error } = await supAnon.from("blog_posts").select("id", { count: "exact" }).limit(0);
          dbLatencyAnon = Date.now() - t0;
          if (error) {
            // If service is operational, keep status operational but surface note; otherwise mark down
            supabaseInfo = supabaseInfo ?? classifySupabaseIssue(error);
            if (supabaseStatus !== "operational") supabaseStatus = "down";
          }
        } catch (e) {
          supabaseInfo = supabaseInfo ?? classifySupabaseIssue(e);
          if (supabaseStatus !== "operational") supabaseStatus = "down";
        }
      }
    }
  } catch {
    supabaseStatus = "down";
    supabaseInfo = supabaseInfo ?? "unknown";
  }

  // Pinecone connectivity + vectors
  let pineconeStatus: ServiceStatus = "not_configured";
  let pineconeVectors: number | null = null;
  let pineconeReady: boolean | undefined;
  let pineconeDimension: number | null = null;
  let pineNamespacesCount: number | null = null;
  let pinePods: number | null = null;
  let pineReplicas: number | null = null;
  let pinePodType: string | null = null;
  let pineDriftDelta: number | null = null;
  const pineApi = process.env.PINECONE_API_KEY;
  const pineIdx = process.env.PINECONE_INDEX;
  if (pineApi && pineIdx) {
    try {
      const { Pinecone } = await import("@pinecone-database/pinecone");
      const pc = new Pinecone({ apiKey: pineApi });
      const index = pc.index(pineIdx);
      const stats = (await index.describeIndexStats()) as unknown;
      pineconeStatus = "operational";
      const totalRecordCount = (stats as { totalRecordCount?: unknown })?.totalRecordCount;
      if (typeof totalRecordCount === "number") {
        pineconeVectors = totalRecordCount;
      } else {
        const namespaces = (stats as { namespaces?: unknown })?.namespaces;
        if (namespaces && typeof namespaces === "object" && !Array.isArray(namespaces)) {
          pineconeVectors = Object.values(namespaces as Record<string, unknown>).reduce((acc: number, ns: unknown) => {
            if (ns && typeof ns === "object") {
              const vec = (ns as { vectorCount?: unknown }).vectorCount;
              const rec = (ns as { recordCount?: unknown }).recordCount;
              const add = typeof vec === "number" ? vec : typeof rec === "number" ? rec : 0;
              return acc + add;
            }
            return acc;
          }, 0);
        }
      }
      // namespaces count
      {
        const namespaces = (stats as { namespaces?: unknown })?.namespaces;
        if (namespaces && typeof namespaces === "object" && !Array.isArray(namespaces)) {
          pineNamespacesCount = Object.keys(namespaces as Record<string, unknown>).length;
        }
      }
      // Describe index for readiness/spec details (best-effort)
      try {
        const describeIndex = (pc as unknown as { describeIndex?: (indexName: string) => Promise<unknown> }).describeIndex;
        const desc = typeof describeIndex === "function" ? ((await describeIndex(pineIdx)) as unknown) : undefined;
        if (desc && typeof desc === "object") {
          // Dimension
          const dim = (desc as { dimension?: unknown })?.dimension ?? (desc as { spec?: { dimension?: unknown } })?.spec?.dimension ?? null;
          pineconeDimension = typeof dim === "number" ? dim : null;
          // Status / readiness
          const status = (desc as { status?: unknown })?.status;
          const statusReady = status && typeof status === "object" && typeof (status as { ready?: unknown }).ready === "boolean" ? (status as { ready: boolean }).ready : undefined;
          const indexState = (desc as { indexState?: unknown })?.indexState ?? (desc as { index_state?: unknown })?.index_state;
          const indexStateReady = indexState && typeof indexState === "object" && typeof (indexState as { ready?: unknown }).ready === "boolean" ? (indexState as { ready: boolean }).ready : undefined;
          const stateStrCandidate =
            (status && typeof status === "object" && typeof (status as { state?: unknown }).state === "string" ? (status as { state: string }).state : undefined) ??
            ((status as unknown) as string | undefined) ??
            (indexState && typeof indexState === "object" && typeof (indexState as { status?: unknown }).status === "string" ? (indexState as { status: string }).status : undefined) ??
            "";
          const statusRawStr = String(stateStrCandidate).toLowerCase();
          pineconeReady = typeof statusReady === "boolean" ? statusReady : typeof indexStateReady === "boolean" ? indexStateReady : statusRawStr.includes("ready");
          // Pods/replicas/podType
          const spec = (desc as { spec?: unknown })?.spec;
          const pods = (spec && typeof spec === "object" && typeof (spec as { pods?: unknown }).pods === "number")
            ? (spec as { pods: number }).pods
            : (typeof (desc as { pods?: unknown })?.pods === "number" ? (desc as { pods: number }).pods : null);
          pinePods = pods ?? null;
          const replicas = (spec && typeof spec === "object" && typeof (spec as { replicas?: unknown }).replicas === "number")
            ? (spec as { replicas: number }).replicas
            : (typeof (desc as { replicas?: unknown })?.replicas === "number" ? (desc as { replicas: number }).replicas : null);
          pineReplicas = replicas ?? null;
          const podType = (spec && typeof spec === "object" && typeof (spec as { podType?: unknown }).podType === "string")
            ? (spec as { podType: string }).podType
            : (spec && typeof spec === "object" && typeof (spec as { pod_type?: unknown }).pod_type === "string" ? (spec as { pod_type: string }).pod_type : null);
          pinePodType = podType ?? null;
        }
      } catch {
        // ignore describeIndex errors; keep basic stats
      }
      // Drift detection vs last reading
      if (typeof pineconeVectors === "number" && typeof lastPineconeVectors === "number") {
        pineDriftDelta = pineconeVectors - lastPineconeVectors;
      }
      if (typeof pineconeVectors === "number") {
        lastPineconeVectors = pineconeVectors;
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
      const data = (await res.json()) as unknown;
      const modelsField = (data as { models?: unknown })?.models;
      const dataField = (data as { data?: unknown })?.data;
      const list = Array.isArray(modelsField) ? modelsField : Array.isArray(dataField) ? dataField : [];
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
    supabase: { status: supabaseStatus, latencyMs: dbLatencySvc ?? dbLatencyAnon, anonLatencyMs: dbLatencyAnon, info: supabaseInfo },
    pinecone: {
      status: pineconeStatus,
      vectors: pineconeVectors,
      ready: pineconeReady,
      dimension: pineconeDimension,
      namespaces: pineNamespacesCount,
      pods: pinePods,
      replicas: pineReplicas,
      podType: pinePodType,
      driftDelta: pineDriftDelta,
    },
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
              {typeof results.supabase.anonLatencyMs === "number" && (
                <div>DB latency (anon): ~{results.supabase.anonLatencyMs} ms</div>
              )}
              {results.supabase.info && (
                <div>DB note: {results.supabase.info}</div>
              )}
              {typeof results.pinecone.vectors === "number" && (
                <div>Pinecone vectors: {results.pinecone.vectors}</div>
              )}
              {typeof results.pinecone.ready === "boolean" && (
                <div>Pinecone ready: {results.pinecone.ready ? "yes" : "no"}</div>
              )}
              {typeof results.pinecone.dimension === "number" && (
                <div>Pinecone dimension: {results.pinecone.dimension}</div>
              )}
              {typeof results.pinecone.namespaces === "number" && (
                <div>Pinecone namespaces: {results.pinecone.namespaces}</div>
              )}
              {(typeof results.pinecone.pods === "number" || typeof results.pinecone.replicas === "number" || results.pinecone.podType) && (
                <div>
                  Pinecone pods/replicas: {results.pinecone.pods ?? "?"}/{results.pinecone.replicas ?? "?"}
                  {results.pinecone.podType ? ` · ${results.pinecone.podType}` : ""}
                </div>
              )}
              {typeof results.pinecone.driftDelta === "number" && results.pinecone.driftDelta !== 0 && (
                <div>Pinecone drift: {results.pinecone.driftDelta > 0 ? "+" : ""}{results.pinecone.driftDelta}</div>
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

