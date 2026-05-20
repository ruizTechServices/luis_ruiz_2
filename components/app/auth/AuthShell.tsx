import type { ReactNode } from "react";
import { Atom, Bot, LayoutDashboard, Newspaper } from "lucide-react";

export interface AuthShellProps {
  title: string;
  intro: string;
  children: ReactNode;
}

const features = [
  {
    icon: LayoutDashboard,
    title: "Client portal",
    description: "Track active engagements, deliverables, and invoices.",
  },
  {
    icon: Bot,
    title: "Ollama lab",
    description: "Saved chats, retrieval settings, model preferences.",
  },
  {
    icon: Atom,
    title: "Nucleus credits",
    description: "Bearer token, model catalog, usage logs.",
  },
  {
    icon: Newspaper,
    title: "Build-log comments",
    description: "Comment on posts under a verified identity.",
  },
];

export function AuthShell({ title, intro, children }: AuthShellProps) {
  return (
    <div
      className="relative isolate flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden px-6 py-12"
      style={{
        background:
          "radial-gradient(60% 50% at 50% 0%, rgba(56,189,248,0.10), transparent 70%), radial-gradient(60% 60% at 100% 100%, rgba(94,234,212,0.06), transparent 70%), linear-gradient(145deg, #020617 0%, #0f172a 42%, #111827 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full opacity-60 blur-3xl"
        style={{ background: "rgba(37,99,235,0.20)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-32 h-[420px] w-[420px] rounded-full opacity-60 blur-3xl"
        style={{ background: "rgba(94,234,212,0.15)" }}
      />

      <div className="relative z-10 w-full max-w-4xl">
        <div className="relative grid overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] shadow-[0_30px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] md:grid-cols-2">
          <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-300/60 to-transparent" />

          <div className="p-8 sm:p-9">
            <div className="mb-6">
              <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-slate-50">
                {title}
              </h1>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
                {intro}
              </p>
            </div>
            {children}
          </div>

          <aside className="relative hidden border-l border-white/10 p-8 sm:p-9 md:block">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(2,6,23,0.6), rgba(6,47,47,0.4)), linear-gradient(135deg, rgba(37,99,235,0.12), rgba(94,234,212,0.06))",
              }}
            />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-200">
                What you get
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50">
                One account, every surface.
              </h2>
              <p className="mt-3 text-[13px] leading-relaxed text-slate-300">
                The same login unlocks the client portal, owner command center
                (<code className="rounded bg-slate-950/60 px-1.5 py-0.5 font-mono text-[12px] text-sky-200">/gio_dash</code>{" "}
                — owner-only), the Ollama lab, and Nucleus credits.
              </p>

              <ul className="mt-6 flex flex-col gap-3">
                {features.map((feat) => {
                  const Icon = feat.icon;
                  return (
                    <li key={feat.title} className="grid grid-cols-[28px_1fr] items-start gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.06] text-sky-300">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <div className="text-[13px] font-semibold text-slate-50">{feat.title}</div>
                        <div className="mt-0.5 text-[12px] leading-relaxed text-slate-400">
                          {feat.description}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-7 rounded-2xl border border-white/10 bg-slate-950/55 p-3.5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Auth provider
                </div>
                <div className="mt-1.5 font-mono text-[12px] text-teal-300">
                  Supabase · OAuth + email/password
                </div>
              </div>
            </div>
          </aside>
        </div>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-500">
          By continuing you agree to the{" "}
          <a className="text-sky-300 hover:text-sky-200" href="/about">terms</a>{" "}
          and{" "}
          <a className="text-sky-300 hover:text-sky-200" href="/about">privacy note</a>.
          Authentication is handled by Supabase.
        </p>
      </div>
    </div>
  );
}
