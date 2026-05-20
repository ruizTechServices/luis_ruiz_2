import { MessageSquare } from "lucide-react";

export function ClientMessagesCard() {
  return (
    <section className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Messages</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Client messages and replies will appear here when secure messaging is connected.
          </p>
        </div>
        <span className="rounded-md bg-amber-50 p-2 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
          <MessageSquare className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-white/15 dark:bg-white/[0.04]">
        <p className="text-sm font-semibold text-slate-950 dark:text-white">No messages yet</p>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Use the contact path below for now.
        </p>
      </div>
    </section>
  );
}
