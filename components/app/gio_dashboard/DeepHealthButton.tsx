"use client";

import { useState, useTransition } from "react";

type ServiceStatus = "operational" | "down" | "not_configured";

type DeepResult = {
  providers: Record<
    string,
    { status: ServiceStatus; info?: string; count?: number }
  >;
  timestamp: number;
};

export default function DeepHealthButton() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<DeepResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/health/deep", {
          method: "GET",
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Deep checks failed (${res.status})`);
        const data = (await res.json()) as DeepResult;
        setResult(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  };

  return (
    <div className="border-t pt-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={run}
          disabled={isPending}
          className="px-3 py-2 rounded-md border text-xs hover:bg-gray-50 disabled:opacity-50"
        >
          {isPending ? "Running Deep Checks…" : "Run Deep Checks"}
        </button>
        {result && (
          <span className="text-xs text-gray-500">
            Last run: {new Date(result.timestamp).toLocaleString()}
          </span>
        )}
      </div>

      {error && (
        <div className="mt-2 text-xs text-red-600">{error}</div>
      )}

      {result && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {Object.entries(result.providers).map(([name, v]) => (
            <div key={name} className="flex items-center gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  v.status === "operational"
                    ? "bg-green-500"
                    : v.status === "down"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              />
              <span className="font-medium">{name}:</span>
              <span>
                {v.status}
                {typeof v.count === "number" && ` · ${v.count}`}
                {v.info ? ` · ${v.info}` : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
