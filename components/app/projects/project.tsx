"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowTopRightOnSquareIcon,
  CheckBadgeIcon,
  CodeBracketIcon,
  PlayIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import type { ProjectCategory, ProjectRow, ProjectStatus } from "@/lib/types/project";

type ProjectProps = Pick<
  ProjectRow,
  | "url"
  | "title"
  | "description"
  | "summary"
  | "status"
  | "category"
  | "featured"
  | "stack"
  | "role"
  | "context"
  | "problem"
  | "constraints"
  | "approach"
  | "architecture"
  | "decisions"
  | "outcomes"
  | "current_status"
  | "repo_url"
  | "live_url"
  | "relatedPosts"
>;

const statusTone: Record<ProjectStatus, string> = {
  draft: "border-amber-200/30 bg-white/10 text-amber-100",
  active: "border-emerald-200/30 bg-emerald-200/10 text-emerald-100",
  complete: "border-sky-200/30 bg-sky-200/10 text-sky-100",
  archived: "border-slate-200/20 bg-white/10 text-slate-200",
};

const statusLabel: Record<ProjectStatus, string> = {
  draft: "Draft",
  active: "Active",
  complete: "Complete",
  archived: "Archived",
};

const categoryLabel: Record<ProjectCategory, string> = {
  project: "Project",
  product: "Product",
  client: "Client work",
  experiment: "Experiment",
};

function compactParagraphs(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export default function Project(props: ProjectProps) {
  const [showPreview, setShowPreview] = useState(false);

  const derivedTitle = useMemo(() => {
    if (props.title) return props.title;
    try {
      return new URL(props.url).hostname.replace(/^www\./, "");
    } catch {
      return props.url;
    }
  }, [props.title, props.url]);

  const liveUrl = props.live_url || props.url;
  const stack = props.stack?.filter(Boolean) ?? [];
  const caseStudySections = [
    { label: "Context", value: props.context },
    { label: "Problem", value: props.problem },
    { label: "Constraints", value: props.constraints },
    { label: "Approach", value: props.approach },
    { label: "Architecture", value: props.architecture },
    { label: "Key decisions", value: props.decisions },
    { label: "Outcomes", value: props.outcomes },
  ].filter((section) => Boolean(section.value));

  return (
    <section className="w-full">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.08] shadow-[0_20px_50px_rgba(15,23,42,0.16)] backdrop-blur-xl transition-all hover:border-sky-200/20 hover:bg-white/[0.1] hover:shadow-[0_24px_60px_rgba(15,23,42,0.2)]">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-slate-200 backdrop-blur-md">
                  {categoryLabel[props.category]}
                </span>
                <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.22em]", statusTone[props.status])}>
                  {statusLabel[props.status]}
                </span>
                {props.featured ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-sky-200/30 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-sky-100 backdrop-blur-md">
                    <SparklesIcon className="h-3.5 w-3.5" />
                    Featured
                  </span>
                ) : null}
              </div>

              <h3 className="mb-3 text-2xl font-semibold text-white sm:text-3xl">
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-current transition-colors hover:text-sky-100"
                >
                  {derivedTitle}
                  <ArrowTopRightOnSquareIcon className="h-5 w-5 opacity-70" />
                </a>
              </h3>

              <p className={cn("max-w-3xl text-base leading-7 text-slate-300", !props.summary && !props.description && "italic text-slate-400")}>
                {props.summary || props.description || "This project is live, but it still needs the case-study layer filled in with clearer context, tradeoffs, and outcomes."}
              </p>

              {props.current_status ? (
                <div className="mt-5 rounded-2xl border border-emerald-200/20 bg-emerald-200/10 p-4 text-sm leading-7 text-emerald-50 backdrop-blur-lg">
                  <div className="mb-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100/90">
                    <CheckBadgeIcon className="h-4 w-4" />
                    Current status
                  </div>
                  {props.current_status}
                </div>
              ) : null}

              {stack.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {stack.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-100 backdrop-blur-md"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3 lg:max-w-sm lg:justify-end">
              <Button
                variant={showPreview ? "secondary" : "default"}
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2"
              >
                {showPreview ? (
                  <>
                    <XMarkIcon className="h-4 w-4" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4" />
                    Show Preview
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  Open Live
                </a>
              </Button>
              {props.repo_url ? (
                <Button variant="outline" size="sm" asChild>
                  <a href={props.repo_url} target="_blank" rel="noopener noreferrer" className="gap-2">
                    <CodeBracketIcon className="h-4 w-4" />
                    View Repo
                  </a>
                </Button>
              ) : null}
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
            <div className="space-y-4">
              {props.role ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-5 shadow-[0_16px_36px_rgba(15,23,42,0.14)] backdrop-blur-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-100/70">Role</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{props.role}</p>
                </div>
              ) : null}

              {caseStudySections.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {caseStudySections.map((section) => (
                    <div key={section.label} className="rounded-2xl border border-white/10 bg-white/[0.08] p-5 shadow-[0_16px_36px_rgba(15,23,42,0.14)] backdrop-blur-xl">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-100/70">{section.label}</p>
                      <div className="mt-2 space-y-3 text-sm leading-7 text-slate-300">
                        {compactParagraphs(section.value).map((paragraph, index) => (
                          <p key={`${section.label}-${index}`}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.06] p-5 text-sm leading-7 text-slate-300 backdrop-blur-lg">
                  This entry still needs the full case-study layer. The schema can hold it now, but the content has to be written project by project.
                </div>
              )}
            </div>

            <div className="space-y-4">
              {props.relatedPosts && props.relatedPosts.length > 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-5 shadow-[0_16px_36px_rgba(15,23,42,0.14)] backdrop-blur-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-100/70">Related build log posts</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {props.relatedPosts.slice(0, 4).map((post) => (
                      <a
                        key={post.id}
                        href={`/blog/${post.id}`}
                        className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-sky-100 backdrop-blur-md transition hover:border-sky-200/30 hover:bg-white/[0.14]"
                      >
                        {post.title || `Post #${post.id}`}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-5 shadow-[0_16px_36px_rgba(15,23,42,0.14)] backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-100/70">Why this matters</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  The point is not to show a pile of links. It is to make the work legible, so a client, collaborator, or future partner can see what was built, why it mattered, and how decisions were made.
                </p>
              </div>
            </div>
          </div>
        </div>

        {showPreview && (
          <div className="border-t border-white/10 bg-slate-950/25 backdrop-blur-xl">
            <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
              <iframe
                src={liveUrl}
                title={derivedTitle}
                loading="lazy"
                referrerPolicy="no-referrer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; microphone; camera; display-capture"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                className="h-full w-full bg-white"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
