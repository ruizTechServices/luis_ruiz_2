"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

const AVAILABILITY_ENDPOINT = "/api/site_settings/availability";
const DEFAULT_AVAILABILITY_TEXT = "Available for hire";

type AvailabilityState = {
  availability?: boolean;
  availability_text?: string;
};

type AvailabilityResponse = AvailabilityState & {
  error?: string;
};

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  const data = (await res.json().catch(() => ({}))) as T;
  if (!res.ok) {
    const error = (data as { error?: string })?.error ?? `Request failed (${res.status})`;
    throw new Error(error);
  }
  return data;
}

async function postJson<T>(input: RequestInfo | URL, body: unknown): Promise<T> {
  return fetchJson<T>(input, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export default function QuickActionsCard() {
  const [isPending, startTransition] = useTransition();
  const [loaded, setLoaded] = useState(false);
  const [available, setAvailable] = useState(true);
  const [availabilityText, setAvailabilityText] = useState(DEFAULT_AVAILABILITY_TEXT);
  const [message, setMessage] = useState<string | null>(null);
  const [projectUrl, setProjectUrl] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectMsg, setProjectMsg] = useState<string | null>(null);
  const [availabilityOpen, setAvailabilityOpen] = useState(true);
  const [projectOpen, setProjectOpen] = useState(true);

  const quickLinks = useMemo(
    () => [
      { href: "/gio_dash/blog/new", label: "New Post", ariaLabel: "Create a new blog post" },
      { href: "/gio_dash/photos", label: "Photos", ariaLabel: "List photos" },
      { href: "/gio_dash/photos/upload", label: "Upload Photos", ariaLabel: "Upload photos" },
    ],
    []
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchJson<AvailabilityResponse>(AVAILABILITY_ENDPOINT, { cache: "no-store" });
        if (active) {
          setAvailable(Boolean(data.availability));
          setAvailabilityText(data.availability_text ?? DEFAULT_AVAILABILITY_TEXT);
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Failed to load availability", error);
        }
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const save = useCallback(
    (next?: AvailabilityState, opts?: { revertAvailabilityTo?: boolean }) => {
      setMessage(null);
      startTransition(async () => {
        try {
          const payload = {
            availability: next?.availability ?? available,
            availability_text: (next?.availability_text ?? availabilityText).trim().slice(0, 200),
          };
          const json = await postJson<AvailabilityResponse>(AVAILABILITY_ENDPOINT, payload);
          if (typeof json.availability === "boolean") setAvailable(json.availability);
          if (typeof json.availability_text === "string") setAvailabilityText(json.availability_text);
          setMessage("Saved");
        } catch (error) {
          if (typeof opts?.revertAvailabilityTo === "boolean") setAvailable(opts.revertAvailabilityTo);
          setMessage(error instanceof Error ? error.message : String(error));
        }
      });
    },
    [available, availabilityText]
  );

  const submitProject = useCallback(() => {
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
        await postJson("/api/projects", {
          url,
          title: title || undefined,
          description: description || undefined,
        });
        setProjectMsg("Project saved");
        setProjectUrl("");
        setProjectTitle("");
        setProjectDescription("");
      } catch (error) {
        const msg = error instanceof Error ? error.message : JSON.stringify(error);
        setProjectMsg(msg);
      }
    });
  }, [projectDescription, projectTitle, projectUrl]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Quick Actions</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Create posts, moderate content, send notifications</p>
      <div className="flex gap-2 mb-4">
        {quickLinks.map(({ href, label, ariaLabel }) => (
          <Link
            key={href}
            href={href}
            aria-label={ariaLabel}
            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-xs hover:bg-blue-200 dark:hover:bg-blue-800"
          >
            {label}
          </Link>
        ))}
      </div>

      <Collapsible
        open={availabilityOpen}
        onOpenChange={setAvailabilityOpen}
        className="mt-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Availability</div>
            <span className={`text-xs ${available ? "text-green-600" : "text-red-500"}`}>
              {available ? "Available" : "Booked"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={available}
              disabled={!loaded || isPending}
              onCheckedChange={(checked) => {
                const prev = available;
                setAvailable(checked);
                save({ availability: checked }, { revertAvailabilityTo: prev });
              }}
            />
            <CollapsibleTrigger
              className="text-xs text-gray-600 dark:text-gray-300 inline-flex items-center gap-1 rounded-md border border-gray-200 dark:border-gray-700 px-2 py-1 transition hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              aria-label={`${availabilityOpen ? "Hide" : "Show"} availability`}
            >
              <span>{availabilityOpen ? "Hide" : "Show"}</span>
              <ChevronDown
                className={`size-4 transition-transform ${availabilityOpen ? "rotate-180" : ""}`}
              />
            </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
          <div className="flex items-center gap-2 mt-3">
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
              {isPending ? "Saving..." : "Save"}
            </button>
            {message && <div className="text-xs text-gray-500">{message}</div>}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible
        open={projectOpen}
        onOpenChange={setProjectOpen}
        className="mt-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Add Project</div>
          <CollapsibleTrigger
            className="text-xs text-gray-600 dark:text-gray-300 inline-flex items-center gap-1 rounded-md border border-gray-200 dark:border-gray-700 px-2 py-1 transition hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            aria-label={`${projectOpen ? "Hide" : "Show"} add project`}
          >
            <span>{projectOpen ? "Hide" : "Show"}</span>
            <ChevronDown className={`size-4 transition-transform ${projectOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
          <div className="flex flex-col gap-2 mt-2">
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
                {isPending ? "Saving..." : "Upload Project"}
              </button>
              {projectMsg && <span className="text-xs text-gray-500">{projectMsg}</span>}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
