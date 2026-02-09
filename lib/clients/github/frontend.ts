export type GithubProxyOptions = {
  path: string;
  method?: string;
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
  raw?: boolean;
  proxySecret?: string;
  baseUrl?: string;
  signal?: AbortSignal;
};

export async function githubProxyFetch<T = unknown>(
  options: GithubProxyOptions,
): Promise<T> {
  const {
    path,
    method,
    query,
    body,
    headers,
    raw,
    proxySecret,
    baseUrl = "/api/github",
    signal,
  } = options;

  const httpMethod = (method ?? (body ? "POST" : "GET")).toUpperCase();
  const isRead = httpMethod === "GET" || httpMethod === "HEAD";
  const url = buildProxyUrl(baseUrl, path, query, raw);

  const requestHeaders: Record<string, string> = {};
  if (proxySecret) {
    requestHeaders["x-github-proxy-secret"] = proxySecret;
  }
  if (!isRead) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const payload = isRead
    ? undefined
    : JSON.stringify({ path, query, body, headers, raw });

  const response = await fetch(url, {
    method: httpMethod,
    headers: requestHeaders,
    body: payload,
    signal,
  });

  if (!response.ok) {
    const message = await safeRead(response);
    const suffix = message ? `: ${message}` : "";
    throw new Error(
      `GitHub proxy request failed (${response.status} ${response.statusText})${suffix}`,
    );
  }

  if (raw) {
    return (await response.text()) as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return (await response.text()) as T;
  }

  return (await response.json()) as T;
}

function buildProxyUrl(
  baseUrl: string,
  path: string,
  query?: Record<string, string | number | boolean | null | undefined>,
  raw?: boolean,
): string {
  const [basePath, baseQuery] = baseUrl.split("?", 2);
  const params = new URLSearchParams(baseQuery ?? "");
  params.set("path", path);

  if (raw) {
    params.set("raw", "1");
  }

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      params.set(key, String(value));
    }
  }

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

async function safeRead(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "";
  }
}
