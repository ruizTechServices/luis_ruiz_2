"use client";

import { useEffect, useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

export default function QuickActionsCard() {
  const [isPending, startTransition] = useTransition();
  const [loaded, setLoaded] = useState(false);
  const [available, setAvailable] = useState<boolean>(true);
  const [availabilityText, setAvailabilityText] = useState("Available for hire");
  const [message, setMessage] = useState<string | null>(null);
  // Project upload form state
  const [projectUrl, setProjectUrl] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectMsg, setProjectMsg] = useState<string | null>(null);

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
      } catch {
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

  const submitProject = () => {
    setProjectMsg(null);
    const url = projectUrl.trim();
    const title = projectTitle.trim();
    const description = projectDescription.trim();
    if (!url) {
      setProjectMsg("Please provide a URL.");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, title: title || undefined, description: description || undefined }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? `Upload failed (${res.status})`);
        setProjectMsg("Project saved");
        // Clear inputs on success
        setProjectUrl("");
        setProjectTitle("");
        setProjectDescription("");
      } catch (e) {
        setProjectMsg(e instanceof Error ? e.message : String(e));
      }
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Quick Actions</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Create posts, moderate content, send notifications</p>
      <div className="flex gap-2 mb-4">
        {/* Create a new blog post */}
        <Link href="/gio_dash/blog/new" className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-xs hover:bg-blue-200 dark:hover:bg-blue-800" aria-label="Create a new blog post">New Post</Link>
        {/* list photos */}
        <Link href="/gio_dash/photos" className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-xs hover:bg-blue-200 dark:hover:bg-blue-800" aria-label="List photos">Photos</Link>
        {/* upload photos */}
        <Link href="/gio_dash/photos/upload" className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-xs hover:bg-blue-200 dark:hover:bg-blue-800" aria-label="Upload photos">Upload Photos</Link>
        {/*  */}
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
          {message && <div className="mt-2 text-xs text-gray-500">{message}</div>}
        </div>
      </div>

      {/* Upload project button: this button takes a url, a title, and a description and submits this data to the `projects` table   */}
      <div className="mt-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Add Project</div>
        <div className="flex flex-col gap-2">
          <input
            type="url"
            placeholder="https://example.com"
            className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-transparent text-sm"
            value={projectUrl}
            onChange={(e) => setProjectUrl(e.target.value)}
            disabled={isPending}
          />
          <input
            type="text"
            placeholder="Title (optional)"
            className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-transparent text-sm"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            disabled={isPending}
          />
          <textarea
            placeholder="Description (optional)"
            className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-transparent text-sm min-h-20"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            disabled={isPending}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={submitProject}
              disabled={isPending || !projectUrl}
              className="px-3 py-2 rounded-md border text-xs hover:bg-gray-50 disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Upload Project"}
            </button>
            {projectMsg && (
              <span className="text-xs text-gray-500">{projectMsg}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
