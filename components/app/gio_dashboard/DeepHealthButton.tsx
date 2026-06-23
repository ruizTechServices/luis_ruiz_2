"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

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
        <Button type="button" onClick={run} disabled={isPending} variant="outline" size="sm">
          {isPending ? "Running Deep Checks..." : "Run Deep Checks"}
        </Button>
        {result ? (
          <span className="text-xs text-muted-foreground">
            Last run: {new Date(result.timestamp).toLocaleString()}
          </span>
        ) : null}
      </div>

      {error ? <div className="mt-2 text-xs text-muted-foreground">{error}</div> : null}

      {result ? (
        <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
          {Object.entries(result.providers).map(([name, value]) => (
            <div key={name} className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-foreground" />
              <span className="font-medium">{name}:</span>
              <span>
                {value.status}
                {typeof value.count === "number" && ` / ${value.count}`}
                {value.info ? ` / ${value.info}` : ""}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
