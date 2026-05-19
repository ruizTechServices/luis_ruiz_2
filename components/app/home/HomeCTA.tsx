import Link from "next/link";
import { ArrowRight, MessageSquareText } from "lucide-react";

export function HomeCTA() {
  return (
    <section className="bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_42%,#fff7ed_100%)] py-16 dark:bg-[linear-gradient(135deg,#062f2f_0%,#09090b_46%,#2f1b06_100%)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-8 rounded-2xl border border-slate-200 bg-white/85 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800 dark:border-teal-200/20 dark:bg-teal-300/10 dark:text-teal-200">
              <MessageSquareText className="h-4 w-4" />
              Practical systems, scoped clearly
            </div>
            <h2 className="max-w-4xl text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Bring Gio a messy workflow, unclear web presence, or AI idea that
              needs to become useful.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
              Start with the contact intake, inspect public projects, or follow
              the build log to see how the work is moving.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href="/contact"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Contact Gio
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/projects"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              See Projects
            </Link>
            <Link
              href="/blog"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Read Build Log
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
