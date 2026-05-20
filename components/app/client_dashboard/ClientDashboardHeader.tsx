import { CheckCircle2, LayoutDashboard } from "lucide-react";

export type ClientDashboardHeaderProps = {
  userEmail?: string | null;
};

export function ClientDashboardHeader({ userEmail }: ClientDashboardHeaderProps) {
  return (
    <header className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-slate-950/70 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-800 dark:border-sky-300/20 dark:bg-sky-400/10 dark:text-sky-200">
            <LayoutDashboard className="h-4 w-4" />
            Client portal
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
            Client Dashboard
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Welcome. This area will track your project status, deliverables,
            updates, and communication with Gio/ruizTechServices.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-200" />
            Signed in
          </div>
          <p className="mt-1 max-w-[16rem] truncate text-sm text-slate-600 dark:text-slate-300">
            {userEmail ?? "Client account"}
          </p>
        </div>
      </div>
    </header>
  );
}
