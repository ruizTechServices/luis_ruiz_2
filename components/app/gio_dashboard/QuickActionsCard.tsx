"use client";

import { useEffect, useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";

export default function QuickActionsCard() {
  const [isPending, startTransition] = useTransition();
  const [loaded, setLoaded] = useState(false);
  const [available, setAvailable] = useState<boolean>(true);
  const [availabilityText, setAvailabilityText] = useState("Available for hire");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/site_settings/availability", { cache: "no-store" });
        if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
        const data = await res.json();
        if (!active) return;
        setAvailable(!!data.availability);
        setAvailabilityText(data.availability_text ?? "Available for hire");
        setLoaded(true);
      } catch (e) {
        setLoaded(true);
      }
    })();
    return () => { active = false };
  }, []);

  const save = (next?: { availability?: boolean; availability_text?: string }) => {
    setMessage(null);
    startTransition(async () => {
      try {
        const body = JSON.stringify({
          availability: next?.availability ?? available,
          availability_text: next?.availability_text ?? availabilityText,
        });
        const res = await fetch("/api/site_settings/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
        if (!res.ok) throw new Error(`Save failed (${res.status})`);
        setMessage("Saved");
      } catch (e) {
        setMessage(e instanceof Error ? e.message : String(e));
      }
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Quick Actions</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Create posts, moderate content, send notifications</p>
      <div className="flex gap-2 mb-4">
        <button className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-xs">New Post</button>
        <button className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full text-xs">Moderate</button>
      </div>

      {/* Availability toggle */}
      <div className="mt-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Availability</div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${available ? 'text-green-600' : 'text-red-500'}`}>{available ? 'Available' : 'Booked'}</span>
            <Switch
              checked={available}
              disabled={!loaded || isPending}
              onCheckedChange={(checked) => {
                setAvailable(checked);
                save({ availability: checked });
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-transparent text-sm"
            value={availabilityText}
            onChange={(e) => setAvailabilityText(e.target.value)}
            placeholder="Availability text"
            disabled={!loaded || isPending}
          />
          <button
            onClick={() => save()}
            disabled={!loaded || isPending}
            className="px-3 py-2 rounded-md border text-xs hover:bg-gray-50 disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
        {message && <div className="mt-2 text-xs text-gray-500">{message}</div>}
      </div>
    </div>
  );
}
