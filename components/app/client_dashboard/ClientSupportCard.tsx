import Link from "next/link";
import { ArrowUpRight, LifeBuoy } from "lucide-react";

export function ClientSupportCard() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <span className="rounded-md bg-slate-950 p-2 text-white dark:bg-white dark:text-slate-950">
            <LifeBuoy className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Support / Contact Gio</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Need help now? Use the contact form and include the email tied to this dashboard.
            </p>
          </div>
        </div>

        <Link
          href="/contact"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          Contact Gio
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
