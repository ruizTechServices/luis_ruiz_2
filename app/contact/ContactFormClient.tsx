"use client";

import { useState } from "react";
import { GitBranch, Mail, MapPin, Phone } from "lucide-react";

import { ContactForm } from "@/components/app/contact/ContactForm";

type SubmissionStatus = "idle" | "success" | "error";

const metaItems = [
  {
    icon: Mail,
    label: "Email",
    value: "ruiztechservices@gmail.com",
    href: "mailto:ruiztechservices@gmail.com",
  },
  {
    icon: Phone,
    label: "Phone (NYC clients)",
    value: "email for number",
    href: "mailto:ruiztechservices@gmail.com",
  },
  {
    icon: MapPin,
    label: "Based in",
    value: "New York, NY · remote globally",
  },
  {
    icon: GitBranch,
    label: "Open source",
    value: "github.com/ruizTechServices",
    href: "https://github.com/ruizTechServices",
  },
];

export default function ContactFormClient() {
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSuccess = () => {
    setStatus("success");
    setErrorMessage(null);
  };

  const handleFailure = (error: Error) => {
    setStatus("error");
    setErrorMessage(error.message ?? "Something went wrong. Please try again.");
  };

  return (
    <div
      className="relative isolate min-h-[calc(100vh-72px)] px-6 py-14 lg:px-8"
      style={{
        background:
          "radial-gradient(80% 50% at 100% 0%, rgba(56,189,248,0.08), transparent 60%), radial-gradient(60% 40% at 0% 100%, rgba(94,234,212,0.06), transparent 70%), #020617",
      }}
    >
      <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* Left rail */}
        <aside className="lg:sticky lg:top-24">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-teal-300">
            Start a project
          </p>
          <h1 className="mt-3 text-[44px] font-semibold leading-[1.1] tracking-[-0.025em] text-slate-50">
            Tell Gio what you&apos;re trying to ship.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
            One conversation, scoped honestly. No sales funnel — you&apos;ll talk to Gio
            directly. Free to discuss; quoted once we agree on the system we&apos;re
            building.
          </p>

          <div className="mt-7 flex items-center gap-3 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3.5 py-3">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(34,197,94,0.7)]" />
            </span>
            <div className="text-[13px] font-semibold text-emerald-300">
              Taking on 2 new builds this quarter
              <div className="mt-0.5 text-[12px] font-normal text-emerald-300/70">
                Most replies within 1 business day · ET (NYC)
              </div>
            </div>
          </div>

          <ul className="mt-8 flex flex-col gap-3.5">
            {metaItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label} className="grid grid-cols-[32px_1fr] items-start gap-3.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-sky-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {item.label}
                    </div>
                    <div className="mt-0.5 text-[14px] font-medium text-slate-50">
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-teal-200 transition hover:text-teal-100"
                        >
                          {item.value}
                        </a>
                      ) : (
                        item.value
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Form card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-7 shadow-[0_24px_70px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-8">
          <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-300/60 to-transparent" />

          <h2 className="text-[22px] font-semibold tracking-[-0.015em] text-slate-50">
            Send a project inquiry
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">
            Fill in the essentials. The optional scope section helps Gio reply with a real
            first call instead of a back-and-forth.
          </p>

          {status === "success" ? (
            <div className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-[13px] leading-relaxed text-emerald-300">
              <strong className="font-semibold text-emerald-200">Message sent.</strong>{" "}
              Your note is in the intake queue. Next step is review, then a reply with
              either follow-up questions or a recommended path.
            </div>
          ) : null}

          {status === "error" ? (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] leading-relaxed text-red-300">
              <strong className="font-semibold text-red-200">Submission failed.</strong>{" "}
              {errorMessage ?? "Something went wrong. Please try again."}
            </div>
          ) : null}

          <div className="mt-6">
            <ContactForm onSuccess={handleSuccess} onFailure={handleFailure} />
          </div>

          <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-500">
            Submissions are validated, stored, and routed to Gio directly.
          </p>
        </div>
      </div>
    </div>
  );
}
