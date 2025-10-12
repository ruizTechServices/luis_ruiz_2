export type OllamaHealth = { online: boolean; baseUrl?: string };

export async function checkOllamaOnline(timeoutMs = 2000): Promise<OllamaHealth> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch("/api/ollama/health", { cache: "no-store", signal: controller.signal });
    if (!res.ok) return { online: false };
    const json = (await res.json()) as Partial<OllamaHealth>;
    return { online: Boolean(json.online), baseUrl: json.baseUrl };
  } catch {
    return { online: false };
  } finally {
    clearTimeout(timer);
  }
}
