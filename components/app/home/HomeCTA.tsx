import Link from "next/link";
import { ArrowRight, MessageSquareText } from "lucide-react";

export function HomeCTA() {
  return (
    <section className="bg-[var(--color-canvas)] py-[var(--space-section)]">
      <div className="ss-container">
        <div className="relative grid gap-8 overflow-hidden rounded-[var(--radius-section)] bg-[var(--color-text-primary)] p-7 text-[var(--color-canvas)] sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-[10px] border border-[color-mix(in_srgb,var(--color-canvas),transparent_70%)] px-3 py-2 text-sm font-semibold text-[var(--color-canvas)]">
              <MessageSquareText className="h-4 w-4" />
              Practical systems, scoped clearly
            </div>
            <h2 className="max-w-4xl text-3xl font-bold tracking-normal">
              Bring Gio a messy workflow, unclear web presence, or AI idea that
              needs to become useful.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[color-mix(in_srgb,var(--color-canvas),transparent_20%)]">
              Start with the contact intake, inspect public projects, or follow
              the build log to see how the work is moving.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[var(--color-action-primary)] px-5 text-sm font-semibold text-[var(--color-action-on-primary)] transition hover:bg-[var(--color-action-primary-hover)]"
            >
              Contact Gio
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/projects"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-[color-mix(in_srgb,var(--color-canvas),transparent_72%)] bg-transparent px-5 text-sm font-semibold text-[var(--color-canvas)] transition hover:bg-[color-mix(in_srgb,var(--color-canvas),transparent_90%)]"
            >
              See Projects
            </Link>
            <Link
              href="/blog"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-[color-mix(in_srgb,var(--color-canvas),transparent_72%)] bg-transparent px-5 text-sm font-semibold text-[var(--color-canvas)] transition hover:bg-[color-mix(in_srgb,var(--color-canvas),transparent_90%)]"
            >
              Read Build Log
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
