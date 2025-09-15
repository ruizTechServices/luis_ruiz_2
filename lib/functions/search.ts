// lib/functions/search.ts
export async function runWebSearch(query: string): Promise<string> {
  const res = await fetch(
    `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`,
    { 
      headers: { 
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": process.env.BRAVE_API_KEY || ""
      } 
    }
  );

  if (!res.ok) return `Search failed (${res.status})`;

  type BraveWebResult = { title?: string; url?: string };
  type BraveWebResponse = { web?: { results?: BraveWebResult[] } };
  const data: BraveWebResponse = await res.json();
  const results = data.web?.results?.slice(0, 3) ?? [];
  return results
    .map((r) => `${r.title ?? "Untitled"}: ${r.url ?? ""}`)
    .join("\n");
}