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

  const data = await res.json();
  const results = data.web?.results?.slice(0, 3) ?? [];
  return results.map((r: any) => `${r.title}: ${r.url}`).join("\n");
}