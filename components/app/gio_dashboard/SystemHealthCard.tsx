import { cookies } from "next/headers";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";

type ServiceStatus = "operational" | "down" | "not_configured";

function overallIndicator(services: Record<string, ServiceStatus>) {
  const values = Object.values(services);
  if (values.includes("down")) return { color: "bg-red-500", text: "Issues detected" };
  if (values.includes("not_configured")) return { color: "bg-yellow-500", text: "Some services not configured" };
  return { color: "bg-green-500", text: "All systems operational" };
}

export default async function SystemHealthCard() {
  // Supabase check (server-side, uses centralized client)
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const supabaseStatus: ServiceStatus = await (async () => {
    try {
      const { error } = await supabase
        .from("blog_posts")
        .select("id", { count: "exact" })
        .limit(0);
      return error ? "down" : "operational";
    } catch {
      return "down";
    }
  })();

  // Pinecone check (safe: avoids importing local client which throws if envs missing)
  const pineconeStatus: ServiceStatus = await (async () => {
    const apiKey = process.env.PINECONE_API_KEY;
    const indexName = process.env.PINECONE_INDEX;
    if (!apiKey || !indexName) return "not_configured";
    try {
      const { Pinecone } = await import("@pinecone-database/pinecone");
      const pc = new Pinecone({ apiKey });
      const index = pc.index(indexName);
      // Lightweight stats call to verify connectivity
      await index.describeIndexStats();
      return "operational";
    } catch {
      return "down";
    }
  })();

  const services: Record<string, ServiceStatus> = {
    Supabase: supabaseStatus,
    Pinecone: pineconeStatus,
  };

  const indicator = overallIndicator(services);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">System Health</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Monitor server status and performance</p>
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 ${indicator.color} rounded-full animate-pulse`}></div>
        <span className="text-gray-800 dark:text-gray-200 text-sm font-medium">{indicator.text}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
        {Object.entries(services).map(([name, status]) => (
          <div key={name} className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${
              status === "operational" ? "bg-green-500" : status === "down" ? "bg-red-500" : "bg-yellow-500"
            }`} />
            <span>{name}: {status}</span>
          </div>
        ))}
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

