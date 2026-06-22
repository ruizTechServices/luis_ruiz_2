"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Code2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignalBadge, type SignalTone } from "@/components/design-system/SignalBadge";
import { StatusIndicator } from "@/components/design-system/StatusIndicator";
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

const statusTone: Record<ProjectStatus, SignalTone> = {
  draft: "warning",
  active: "orange",
  complete: "mint",
  archived: "neutral",
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

const toneColor: Record<SignalTone, string> = {
  neutral: "var(--color-text-secondary)",
  orange: "var(--color-action-primary)",
  mint: "var(--color-signal-mint)",
  violet: "var(--color-signal-violet)",
  warning: "var(--color-signal-warning)",
  danger: "var(--color-signal-danger)",
  info: "var(--color-signal-info)",
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
    { label: "Context", value: props.context, tone: "info" as const },
    { label: "Problem", value: props.problem, tone: "orange" as const },
    { label: "Constraints", value: props.constraints, tone: "warning" as const },
    { label: "Approach", value: props.approach, tone: "mint" as const },
    { label: "Architecture", value: props.architecture, tone: "violet" as const },
    { label: "Key decisions", value: props.decisions, tone: "violet" as const },
    { label: "Outcomes", value: props.outcomes, tone: "mint" as const },
  ].filter((section) => Boolean(section.value));

  return (
    <article className="ss-panel overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <SignalBadge tone={props.category === "experiment" ? "violet" : "neutral"}>
                {categoryLabel[props.category]}
              </SignalBadge>
              <StatusIndicator tone={statusTone[props.status]}>
                {statusLabel[props.status]}
              </StatusIndicator>
              {props.featured ? <SignalBadge tone="orange">Featured</SignalBadge> : null}
            </div>

            <h3 className="text-2xl font-bold tracking-normal text-[var(--color-text-primary)] sm:text-3xl">
              {derivedTitle}
            </h3>

            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
              {props.summary || props.description || "This project is live, but it still needs the case-study layer filled in with clearer context, tradeoffs, and outcomes."}
            </p>

            {props.current_status ? (
              <div className="ss-muted-panel mt-5 p-4 text-sm leading-7 text-[var(--color-text-secondary)]">
                <p className="ss-eyebrow text-[var(--color-signal-mint)]">Current state</p>
                <p className="mt-2">{props.current_status}</p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3 lg:max-w-sm lg:justify-end">
            <Button
              variant={showPreview ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>
            <Button variant="default" size="sm" asChild>
              <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                Open Live
                <ArrowUpRight className="size-4" />
              </a>
            </Button>
            {props.repo_url ? (
              <Button variant="secondary" size="sm" asChild>
                <a href={props.repo_url} target="_blank" rel="noopener noreferrer">
                  <Code2 className="size-4" />
                  View Repo
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        {stack.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {stack.map((item) => (
              <SignalBadge key={item} tone="neutral">
                {item}
              </SignalBadge>
            ))}
          </div>
        ) : null}

        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
          <div className="grid gap-4 md:grid-cols-2">
            {props.role ? (
              <section className="ss-muted-panel p-5 md:col-span-2">
                <p className="ss-eyebrow">Role</p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">{props.role}</p>
              </section>
            ) : null}

            {caseStudySections.length > 0 ? (
              caseStudySections.map((section) => (
                <section key={section.label} className="ss-muted-panel p-5">
                  <p className="ss-eyebrow" style={{ color: toneColor[section.tone] }}>
                    {section.label}
                  </p>
                  <div className="mt-2 space-y-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                    {compactParagraphs(section.value).map((paragraph, index) => (
                      <p key={`${section.label}-${index}`}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <section className="ss-muted-panel border-dashed p-5 text-sm leading-7 text-[var(--color-text-secondary)] md:col-span-2">
                This entry still needs the full case-study layer. The schema can hold it now, but the content has to be written project by project.
              </section>
            )}
          </div>

          <aside className="grid gap-4 content-start">
            {props.relatedPosts && props.relatedPosts.length > 0 ? (
              <section className="ss-muted-panel p-5">
                <p className="ss-eyebrow">Related build log posts</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {props.relatedPosts.slice(0, 4).map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.id}`}
                      className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-action-primary)]"
                    >
                      {post.title || `Post #${post.id}`}
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="ss-muted-panel p-5">
              <p className="ss-eyebrow">Evidence</p>
              <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                The point is not to show a pile of links. It is to make the work legible so a client, collaborator, or future partner can inspect what was built and why it mattered.
              </p>
            </section>
          </aside>
        </div>
      </div>

      {showPreview ? (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-raised)]">
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
      ) : null}
    </article>
  );
}
