"use client";

import { useMemo, useState, useTransition } from "react";
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
    [projects, selectedId]
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
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-white/35 bg-white/55 p-4 shadow-[0_18px_45px_rgba(148,163,184,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Projects</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pick an entry or start a new one.</p>
          </div>
          <button
            type="button"
            onClick={() => loadProject("new")}
            className="rounded-lg border border-white/40 bg-white/45 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white/70 dark:border-white/10 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/15"
          >
            New
          </button>
        </div>

        <div className="space-y-2">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => loadProject(project.id)}
              className={`w-full rounded-xl border px-4 py-3 text-left transition backdrop-blur-lg ${selectedId === project.id ? "border-sky-200/60 bg-white/75 shadow-[0_14px_30px_rgba(148,163,184,0.18)] dark:border-sky-200/20 dark:bg-white/15" : "border-white/30 bg-white/40 hover:bg-white/60 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"}`}
            >
              <div className="text-sm font-semibold text-gray-900 dark:text-white">{project.title || project.slug || project.url}</div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{project.category} • {project.status}</div>
            </button>
          ))}
          {projects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/35 bg-white/30 px-4 py-6 text-sm text-gray-500 backdrop-blur-lg dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
              No projects loaded yet.
            </div>
          ) : null}
        </div>
      </aside>

      <section className="rounded-2xl border border-white/35 bg-white/55 p-6 shadow-[0_18px_45px_rgba(148,163,184,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {selectedProject ? `Editing ${selectedProject.title || selectedProject.slug || selectedProject.url}` : "Create project case study"}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Fill this in like a case study, not marketing fluff.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="rounded-lg border border-sky-100/40 bg-white/85 px-4 py-2 text-sm font-medium text-slate-800 shadow-[0_12px_28px_rgba(148,163,184,0.18)] transition hover:bg-white disabled:opacity-50 dark:border-white/10 dark:bg-white/15 dark:text-white dark:hover:bg-white/20"
          >
            {isPending ? "Saving..." : "Save Project"}
          </button>
        </div>

        {message ? (
          <div className="mb-6 rounded-xl border border-white/35 bg-white/45 px-4 py-3 text-sm text-slate-700 backdrop-blur-lg dark:border-white/10 dark:bg-white/10 dark:text-gray-200">
            {message}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <Field label="Project URL" required>
            <input className="input" type="url" value={form.url} onChange={(e) => updateField("url", e.target.value)} />
          </Field>
          <Field label="Live URL">
            <input className="input" type="url" value={form.live_url} onChange={(e) => updateField("live_url", e.target.value)} />
          </Field>
          <Field label="Title">
            <input className="input" value={form.title} onChange={(e) => updateField("title", e.target.value)} />
          </Field>
          <Field label="Slug">
            <input className="input" value={form.slug} onChange={(e) => updateField("slug", e.target.value)} />
          </Field>
          <Field label="Status">
            <select className="input" value={form.status} onChange={(e) => updateField("status", e.target.value as ProjectStatus)}>
              {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </Field>
          <Field label="Category">
            <select className="input" value={form.category} onChange={(e) => updateField("category", e.target.value as ProjectCategory)}>
              {categoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </Field>
          <Field label="Visibility">
            <select className="input" value={form.visibility} onChange={(e) => updateField("visibility", e.target.value as ProjectVisibility)}>
              {visibilityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </Field>
          <Field label="Repo URL">
            <input className="input" type="url" value={form.repo_url} onChange={(e) => updateField("repo_url", e.target.value)} />
          </Field>
          <Field label="Featured">
            <label className="flex h-11 items-center gap-3 rounded-xl border border-gray-200 px-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-200">
              <input type="checkbox" checked={form.featured} onChange={(e) => updateField("featured", e.target.checked)} />
              Mark this as featured work
            </label>
          </Field>
          <Field label="Tech stack (comma separated)">
            <input className="input" value={form.stack} onChange={(e) => updateField("stack", e.target.value)} />
          </Field>
          <Field label="Summary" full>
            <textarea className="textarea" value={form.summary} onChange={(e) => updateField("summary", e.target.value)} />
          </Field>
          <Field label="Description" full>
            <textarea className="textarea" value={form.description} onChange={(e) => updateField("description", e.target.value)} />
          </Field>
          <Field label="Role" full>
            <textarea className="textarea" value={form.role} onChange={(e) => updateField("role", e.target.value)} />
          </Field>
          <Field label="Current status" full>
            <textarea className="textarea" value={form.current_status} onChange={(e) => updateField("current_status", e.target.value)} />
          </Field>
          <Field label="Context" full>
            <textarea className="textarea tall" value={form.context} onChange={(e) => updateField("context", e.target.value)} />
          </Field>
          <Field label="Problem" full>
            <textarea className="textarea tall" value={form.problem} onChange={(e) => updateField("problem", e.target.value)} />
          </Field>
          <Field label="Constraints" full>
            <textarea className="textarea tall" value={form.constraints} onChange={(e) => updateField("constraints", e.target.value)} />
          </Field>
          <Field label="Approach" full>
            <textarea className="textarea tall" value={form.approach} onChange={(e) => updateField("approach", e.target.value)} />
          </Field>
          <Field label="Architecture" full>
            <textarea className="textarea tall" value={form.architecture} onChange={(e) => updateField("architecture", e.target.value)} />
          </Field>
          <Field label="Key decisions" full>
            <textarea className="textarea tall" value={form.decisions} onChange={(e) => updateField("decisions", e.target.value)} />
          </Field>
          <Field label="Outcomes" full>
            <textarea className="textarea tall" value={form.outcomes} onChange={(e) => updateField("outcomes", e.target.value)} />
          </Field>
          <Field label="Cover image URL">
            <input className="input" type="url" value={form.cover_image_url} onChange={(e) => updateField("cover_image_url", e.target.value)} />
          </Field>
          <Field label="Started at">
            <input className="input" type="datetime-local" value={form.started_at} onChange={(e) => updateField("started_at", e.target.value)} />
          </Field>
          <Field label="Completed at">
            <input className="input" type="datetime-local" value={form.completed_at} onChange={(e) => updateField("completed_at", e.target.value)} />
          </Field>
        </div>

        <style jsx>{`
          .input {
            width: 100%;
            height: 2.75rem;
            border-radius: 0.75rem;
            border: 1px solid rgba(255,255,255,0.38);
            background: rgba(255,255,255,0.42);
            backdrop-filter: blur(16px);
            padding: 0.625rem 0.875rem;
            font-size: 0.875rem;
            color: rgb(30 41 59);
          }
          .textarea {
            min-height: 7rem;
            width: 100%;
            border-radius: 0.75rem;
            border: 1px solid rgba(255,255,255,0.38);
            background: rgba(255,255,255,0.42);
            backdrop-filter: blur(16px);
            padding: 0.75rem 0.875rem;
            font-size: 0.875rem;
            line-height: 1.65;
            color: rgb(30 41 59);
          }
          .textarea.tall {
            min-height: 10rem;
          }
          :global(.dark) .input,
          :global(.dark) .textarea {
            border-color: rgba(255,255,255,0.12);
            background: rgba(255,255,255,0.06);
            color: white;
          }
        `}</style>
      </section>
    </div>
  );
}

function Field({ label, children, required, full = false }: { label: string; children: React.ReactNode; required?: boolean; full?: boolean }) {
  return (
    <label className={`${full ? "lg:col-span-2" : ""} block`}>
      <div className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </div>
      {children}
    </label>
  );
}
