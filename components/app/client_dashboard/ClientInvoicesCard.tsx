import { CreditCard } from "lucide-react";

export function ClientInvoicesCard() {
  return (
    <section className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Invoices / Payments</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Invoice and payment status will appear here when billing is attached to a client project.
          </p>
        </div>
        <span className="rounded-md bg-emerald-50 p-2 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200">
          <CreditCard className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-white/15 dark:bg-white/[0.04]">
        <p className="text-sm font-semibold text-slate-950 dark:text-white">No invoices available</p>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Payment details are not connected to this dashboard yet.
        </p>
      </div>
    </section>
  );
}
