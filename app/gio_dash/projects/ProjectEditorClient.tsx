"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DashboardCard,
  DashboardEmptyState,
  dashboardItemClassName,
} from "@/components/design-system/DashboardPrimitives";
import { cn } from "@/lib/utils";
import type { ProjectCategory, ProjectRow, ProjectStatus, ProjectVisibility } from "@/lib/types/project";

const statusOptions: ProjectStatus[] = ["draft", "active", "complete", "archived"];
const categoryOptions: ProjectCategory[] = ["project", "product", "client", "experiment"];
const visibilityOptions: ProjectVisibility[] = ["public", "unlisted", "private"];

type ProjectFormState = {
  url: string;
  title: string;
  description: string;
  slug: string;
  summary: string;
  status: ProjectStatus;
  category: ProjectCategory;
  featured: boolean;
  visibility: ProjectVisibility;
  stack: string;
  role: string;
  context: string;
  problem: string;
  constraints: string;
  approach: string;
  architecture: string;
  decisions: string;
  outcomes: string;
  current_status: string;
  repo_url: string;
  live_url: string;
  cover_image_url: string;
  started_at: string;
  completed_at: string;
};

function emptyState(): ProjectFormState {
  return {
    url: "",
    title: "",
    description: "",
    slug: "",
    summary: "",
    status: "active",
    category: "project",
    featured: false,
    visibility: "public",
    stack: "",
    role: "",
    context: "",
    problem: "",
    constraints: "",
    approach: "",
    architecture: "",
    decisions: "",
    outcomes: "",
    current_status: "",
    repo_url: "",
    live_url: "",
    cover_image_url: "",
    started_at: "",
    completed_at: "",
  };
}

function toInputDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function fromProject(project: ProjectRow): ProjectFormState {
  return {
    url: project.url ?? "",
    title: project.title ?? "",
    description: project.description ?? "",
    slug: project.slug ?? "",
    summary: project.summary ?? "",
    status: project.status,
    category: project.category,
    featured: project.featured,
    visibility: project.visibility,
    stack: (project.stack ?? []).join(", "),
    role: project.role ?? "",
    context: project.context ?? "",
    problem: project.problem ?? "",
    constraints: project.constraints ?? "",
    approach: project.approach ?? "",
    architecture: project.architecture ?? "",
    decisions: project.decisions ?? "",
    outcomes: project.outcomes ?? "",
    current_status: project.current_status ?? "",
    repo_url: project.repo_url ?? "",
    live_url: project.live_url ?? "",
    cover_image_url: project.cover_image_url ?? "",
    started_at: toInputDateTime(project.started_at),
    completed_at: toInputDateTime(project.completed_at),
  };
}

function toPayload(state: ProjectFormState) {
  const trimmed = (value: string) => value.trim() || undefined;
  return {
    url: state.url.trim(),
    title: trimmed(state.title),
    description: trimmed(state.description),
    slug: trimmed(state.slug),
    summary: trimmed(state.summary),
    status: state.status,
    category: state.category,
    featured: state.featured,
    visibility: state.visibility,
    stack: state.stack
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    role: trimmed(state.role),
    context: trimmed(state.context),
    problem: trimmed(state.problem),
    constraints: trimmed(state.constraints),
    approach: trimmed(state.approach),
    architecture: trimmed(state.architecture),
    decisions: trimmed(state.decisions),
    outcomes: trimmed(state.outcomes),
    current_status: trimmed(state.current_status),
    repo_url: trimmed(state.repo_url),
    live_url: trimmed(state.live_url),
    cover_image_url: trimmed(state.cover_image_url),
    started_at: state.started_at ? new Date(state.started_at).toISOString() : undefined,
    completed_at: state.completed_at ? new Date(state.completed_at).toISOString() : undefined,
  };
}

async function postJson(input: RequestInfo | URL, body: unknown) {
  const res = await fetch(input, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  }
  return data;
}

export default function ProjectEditorClient({ initialProjects }: { initialProjects: ProjectRow[] }) {
  const [projects, setProjects] = useState<ProjectRow[]>(initialProjects);
  const [selectedId, setSelectedId] = useState<number | "new">(initialProjects[0]?.id ?? "new");
  const [form, setForm] = useState<ProjectFormState>(initialProjects[0] ? fromProject(initialProjects[0]) : emptyState());
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedId) ?? null,
    [projects, selectedId],
  );

  const loadProject = (value: number | "new") => {
    setSelectedId(value);
    setMessage(null);
    if (value === "new") {
      setForm(emptyState());
      return;
    }
    const project = projects.find((entry) => entry.id === value);
    setForm(project ? fromProject(project) : emptyState());
  };

  const updateField = <K extends keyof ProjectFormState>(key: K, value: ProjectFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        const payload = toPayload(form);
        if (!payload.url) {
          throw new Error("Project URL is required.");
        }
        const response = await postJson("/api/projects", payload);
        const project = response.project as ProjectRow;
        setProjects((current) => {
          const existingIndex = current.findIndex((entry) => entry.id === project.id);
          if (existingIndex >= 0) {
            const next = [...current];
            next[existingIndex] = project;
            return next;
          }
          return [project, ...current];
        });
        setSelectedId(project.id);
        setForm(fromProject(project));
        setMessage("Project saved.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : String(error));
      }
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      <DashboardCard as="aside" className="h-fit">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Projects</h2>
            <p className="text-sm text-[var(--color-text-subtle)]">Pick an entry or start a new one.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => loadProject("new")}>
            New
          </Button>
        </div>

        <div className="space-y-2">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => loadProject(project.id)}
              className={cn(
                "w-full rounded-[var(--radius-md)] border px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]",
                selectedId === project.id
                  ? "border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-card)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-raised)]",
              )}
            >
              <div className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                {project.title || project.slug || project.url}
              </div>
              <div className="mt-1 text-xs text-[var(--color-text-subtle)]">
                {project.category} / {project.status}
              </div>
            </button>
          ))}
          {projects.length === 0 ? (
            <DashboardEmptyState title="No projects loaded">
              Create the first project case-study entry.
            </DashboardEmptyState>
          ) : null}
        </div>
      </DashboardCard>

      <DashboardCard>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
              {selectedProject ? `Editing ${selectedProject.title || selectedProject.slug || selectedProject.url}` : "Create project case study"}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-subtle)]">
              Fill this in like a case study, not marketing copy.
            </p>
          </div>
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save Project"}
          </Button>
        </div>

        {message ? (
          <div className={`${dashboardItemClassName} mb-6 text-sm text-[var(--color-text-secondary)]`}>
            {message}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <Field label="Project URL" htmlFor="project-url" required>
            <Input id="project-url" type="url" value={form.url} onChange={(e) => updateField("url", e.target.value)} />
          </Field>
          <Field label="Live URL" htmlFor="project-live-url">
            <Input id="project-live-url" type="url" value={form.live_url} onChange={(e) => updateField("live_url", e.target.value)} />
          </Field>
          <Field label="Title" htmlFor="project-title">
            <Input id="project-title" value={form.title} onChange={(e) => updateField("title", e.target.value)} />
          </Field>
          <Field label="Slug" htmlFor="project-slug">
            <Input id="project-slug" value={form.slug} onChange={(e) => updateField("slug", e.target.value)} />
          </Field>
          <Field label="Status">
            <OptionSelect<ProjectStatus> value={form.status} options={statusOptions} onValueChange={(value) => updateField("status", value)} />
          </Field>
          <Field label="Category">
            <OptionSelect<ProjectCategory> value={form.category} options={categoryOptions} onValueChange={(value) => updateField("category", value)} />
          </Field>
          <Field label="Visibility">
            <OptionSelect<ProjectVisibility> value={form.visibility} options={visibilityOptions} onValueChange={(value) => updateField("visibility", value)} />
          </Field>
          <Field label="Repo URL" htmlFor="project-repo-url">
            <Input id="project-repo-url" type="url" value={form.repo_url} onChange={(e) => updateField("repo_url", e.target.value)} />
          </Field>
          <Field label="Featured">
            <label className={`${dashboardItemClassName} flex min-h-11 items-center gap-3 text-sm text-[var(--color-text-secondary)]`}>
              <Checkbox checked={form.featured} onCheckedChange={(checked) => updateField("featured", checked === true)} />
              Mark this as featured work
            </label>
          </Field>
          <Field label="Tech stack (comma separated)" htmlFor="project-stack">
            <Input id="project-stack" value={form.stack} onChange={(e) => updateField("stack", e.target.value)} />
          </Field>
          <Field label="Summary" htmlFor="project-summary" full>
            <Textarea id="project-summary" value={form.summary} onChange={(e) => updateField("summary", e.target.value)} />
          </Field>
          <Field label="Description" htmlFor="project-description" full>
            <Textarea id="project-description" value={form.description} onChange={(e) => updateField("description", e.target.value)} />
          </Field>
          <Field label="Role" htmlFor="project-role" full>
            <Textarea id="project-role" value={form.role} onChange={(e) => updateField("role", e.target.value)} />
          </Field>
          <Field label="Current status" htmlFor="project-current-status" full>
            <Textarea id="project-current-status" value={form.current_status} onChange={(e) => updateField("current_status", e.target.value)} />
          </Field>
          <Field label="Context" htmlFor="project-context" full>
            <Textarea id="project-context" className="min-h-40" value={form.context} onChange={(e) => updateField("context", e.target.value)} />
          </Field>
          <Field label="Problem" htmlFor="project-problem" full>
            <Textarea id="project-problem" className="min-h-40" value={form.problem} onChange={(e) => updateField("problem", e.target.value)} />
          </Field>
          <Field label="Constraints" htmlFor="project-constraints" full>
            <Textarea id="project-constraints" className="min-h-40" value={form.constraints} onChange={(e) => updateField("constraints", e.target.value)} />
          </Field>
          <Field label="Approach" htmlFor="project-approach" full>
            <Textarea id="project-approach" className="min-h-40" value={form.approach} onChange={(e) => updateField("approach", e.target.value)} />
          </Field>
          <Field label="Architecture" htmlFor="project-architecture" full>
            <Textarea id="project-architecture" className="min-h-40" value={form.architecture} onChange={(e) => updateField("architecture", e.target.value)} />
          </Field>
          <Field label="Key decisions" htmlFor="project-decisions" full>
            <Textarea id="project-decisions" className="min-h-40" value={form.decisions} onChange={(e) => updateField("decisions", e.target.value)} />
          </Field>
          <Field label="Outcomes" htmlFor="project-outcomes" full>
            <Textarea id="project-outcomes" className="min-h-40" value={form.outcomes} onChange={(e) => updateField("outcomes", e.target.value)} />
          </Field>
          <Field label="Cover image URL" htmlFor="project-cover-image-url">
            <Input id="project-cover-image-url" type="url" value={form.cover_image_url} onChange={(e) => updateField("cover_image_url", e.target.value)} />
          </Field>
          <Field label="Started at" htmlFor="project-started-at">
            <Input id="project-started-at" type="datetime-local" value={form.started_at} onChange={(e) => updateField("started_at", e.target.value)} />
          </Field>
          <Field label="Completed at" htmlFor="project-completed-at">
            <Input id="project-completed-at" type="datetime-local" value={form.completed_at} onChange={(e) => updateField("completed_at", e.target.value)} />
          </Field>
        </div>
      </DashboardCard>
    </div>
  );
}

function Field({
  label,
  children,
  required,
  full = false,
  htmlFor,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  full?: boolean;
  htmlFor?: string;
}) {
  return (
    <div className={cn(full ? "lg:col-span-2" : "", "min-w-0 space-y-2")}>
      <Label htmlFor={htmlFor}>
        {label} {required ? <span className="text-[var(--color-signal-danger)]">*</span> : null}
      </Label>
      {children}
    </div>
  );
}

function OptionSelect<T extends string>({
  value,
  options,
  onValueChange,
}: {
  value: T;
  options: readonly T[];
  onValueChange: (value: T) => void;
}) {
  return (
    <Select value={value} onValueChange={(next) => onValueChange(next as T)}>
      <SelectTrigger className="min-h-11 w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
