"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  DashboardCard,
  DashboardStatusBadge,
  dashboardItemClassName,
} from "@/components/design-system/DashboardPrimitives";

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
      { href: "/gio_dash/projects", label: "Projects", ariaLabel: "Open project admin" },
      { href: "/gio_dash/photos", label: "Photos", ariaLabel: "List photos" },
      { href: "/gio_dash/photos/upload", label: "Upload Photos", ariaLabel: "Upload photos" },
    ],
    [],
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
    [available, availabilityText],
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
    <DashboardCard>
      <h3 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">Quick Actions</h3>
      <p className="mb-4 text-sm text-[var(--color-text-secondary)]">Create posts, moderate content, and manage common owner tasks.</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {quickLinks.map(({ href, label, ariaLabel }) => (
          <Button key={href} asChild variant="outline" size="sm">
            <Link href={href} aria-label={ariaLabel}>
              {label}
            </Link>
          </Button>
        ))}
      </div>

      <Collapsible open={availabilityOpen} onOpenChange={setAvailabilityOpen} className={`${dashboardItemClassName} mt-2`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-[var(--color-text-primary)]">Availability</div>
            <DashboardStatusBadge tone={available ? "mint" : "danger"}>
              {available ? "Available" : "Booked"}
            </DashboardStatusBadge>
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
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label={`${availabilityOpen ? "Hide" : "Show"} availability`}
              >
                {availabilityOpen ? "Hide" : "Show"}
                <ChevronDown className={`size-4 transition-transform ${availabilityOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              type="text"
              value={availabilityText}
              onChange={(e) => setAvailabilityText(e.target.value)}
              placeholder="Availability text"
              disabled={!loaded || isPending}
              className="min-h-11"
            />
            <Button type="button" variant="outline" onClick={() => save()} disabled={!loaded || isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
            {message ? <div className="text-xs text-[var(--color-text-subtle)]">{message}</div> : null}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={projectOpen} onOpenChange={setProjectOpen} className={`${dashboardItemClassName} mt-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-medium text-[var(--color-text-primary)]">Add Project</div>
          <CollapsibleTrigger asChild>
            <Button type="button" variant="outline" size="sm" aria-label={`${projectOpen ? "Hide" : "Show"} add project`}>
              {projectOpen ? "Hide" : "Show"}
              <ChevronDown className={`size-4 transition-transform ${projectOpen ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="mt-3 flex flex-col gap-2">
            <Input
              type="url"
              placeholder="https://example.com"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              disabled={isPending}
            />
            <Input
              type="text"
              placeholder="Title (optional)"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              disabled={isPending}
            />
            <Textarea
              placeholder="Description (optional)"
              className="min-h-20"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              disabled={isPending}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" onClick={submitProject} disabled={isPending || !projectUrl}>
                {isPending ? "Saving..." : "Upload Project"}
              </Button>
              {projectMsg ? <span className="text-xs text-[var(--color-text-subtle)]">{projectMsg}</span> : null}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </DashboardCard>
  );
}
