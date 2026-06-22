import Link from "next/link";
import { Bot, ExternalLink } from "lucide-react";
import { aiTools } from "./dashboard-seed-data";

export function AiToolsCard() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">AI Tools</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Routes into the local model lab and multi-model discussion tool.
          </p>
        </div>
        <span className="rounded-md bg-violet-50 p-2 text-violet-800 dark:bg-violet-400/10 dark:text-violet-200">
          <Bot className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {aiTools.map((tool) => (
          <Link
            key={tool.name}
            href={tool.href}
            className="block rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-violet-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-violet-200/40 dark:hover:bg-white/[0.07]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{tool.name}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">{tool.description}</p>
              </div>
              <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                {tool.status}
              </span>
            </div>
            <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-violet-700 dark:text-violet-200">
              Open tool
              <ExternalLink className="h-3.5 w-3.5" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
