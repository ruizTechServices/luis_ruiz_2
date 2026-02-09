"use client";

import { useMemo, useState, useTransition } from "react";
import { githubProxyFetch } from "@/lib/clients/github";

type ResponseState = {
  status: "idle" | "loading" | "success" | "error";
  statusCode?: number;
  body?: string;
  error?: string;
};

const METHOD_OPTIONS = ["GET", "POST", "PATCH", "PUT", "DELETE"] as const;

type MethodOption = (typeof METHOD_OPTIONS)[number];

const DEFAULT_PATH = "/users/ruizTechServices";
const DEFAULT_QUERY = "";

export default function GithubApiTesterCard() {
  const [method, setMethod] = useState<MethodOption>("GET");
  const [path, setPath] = useState(DEFAULT_PATH);
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [bodyInput, setBodyInput] = useState("");
  const [proxySecret, setProxySecret] = useState("");
  const [raw, setRaw] = useState(false);
  const [response, setResponse] = useState<ResponseState>({ status: "idle" });
  const [isPending, startTransition] = useTransition();

  const canSend = useMemo(() => path.trim().length > 0, [path]);

  const submit = () => {
    const trimmedPath = path.trim();
    if (!trimmedPath) {
      setResponse({ status: "error", error: "Path is required." });
      return;
    }

    let parsedBody: unknown = undefined;
    const bodyText = bodyInput.trim();
    if (bodyText) {
      try {
        parsedBody = JSON.parse(bodyText);
      } catch (error) {
        setResponse({
          status: "error",
          error: error instanceof Error ? error.message : "Invalid JSON body.",
        });
        return;
      }
    }

    const parsedQuery = parseQuery(query);

    setResponse({ status: "loading" });
    startTransition(async () => {
      try {
        const data = await githubProxyFetch({
          path: trimmedPath,
          method,
          query: parsedQuery,
          body: parsedBody,
          raw,
          proxySecret: proxySecret.trim() || undefined,
        });

        const bodyString = typeof data === "string" ? data : JSON.stringify(data, null, 2);
        setResponse({ status: "success", body: bodyString });
      } catch (error) {
        setResponse({
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">GitHub API Tester</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Run quick GitHub REST calls through the /api/github proxy
          </p>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">Owner only</span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
          Method
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as MethodOption)}
            className="mt-1 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
          >
            {METHOD_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
          Path
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/users/ruizTechServices"
            className="mt-1 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
          />
        </label>

        <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
          Query (optional)
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="per_page=5&sort=updated"
            className="mt-1 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
          />
        </label>

        <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
          JSON Body (optional)
          <textarea
            value={bodyInput}
            onChange={(e) => setBodyInput(e.target.value)}
            placeholder='{"name":"new-repo","private":false}'
            className="mt-1 min-h-24 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
          />
        </label>

        <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
          Proxy Secret (required for write actions)
          <input
            type="password"
            value={proxySecret}
            onChange={(e) => setProxySecret(e.target.value)}
            placeholder="GITHUB_PROXY_SECRET"
            className="mt-1 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
          />
        </label>

        <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
          <input
            type="checkbox"
            checked={raw}
            onChange={(e) => setRaw(e.target.checked)}
            className="h-4 w-4"
          />
          Return raw response text
        </label>

        <div className="flex items-center gap-2">
          <button
            onClick={submit}
            disabled={!canSend || isPending}
            className="px-4 py-2 rounded-md border text-xs hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            {isPending ? "Sending..." : "Send"}
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Paths only (no full URLs)
          </span>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/30 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Response</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {response.status === "loading" ? "Loading" : response.status}
            </span>
          </div>
          <pre className="mt-2 max-h-64 overflow-auto text-xs text-gray-700 dark:text-gray-200">
            {response.error
              ? response.error
              : response.body || "Run a request to see output."}
          </pre>
        </div>
      </div>
    </div>
  );
}

function parseQuery(input: string): Record<string, string> | undefined {
  const trimmed = input.trim();
  if (!trimmed) return undefined;

  const normalized = trimmed.startsWith("?") ? trimmed.slice(1) : trimmed;
  const params = new URLSearchParams(normalized);
  const query: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    query[key] = value;
  }
  return Object.keys(query).length ? query : undefined;
}
