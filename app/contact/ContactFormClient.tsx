"use client";

import { useState } from "react";
import { ContactForm } from "@/components/app/contact/ContactForm";

type SubmissionStatus = "idle" | "success" | "error";

const metaItems = [
  {
    label: "Email",
    value: "ruiztechservices@gmail.com",
    href: "mailto:ruiztechservices@gmail.com",
  },
  {
    label: "Phone",
    value: "email for number",
    href: "mailto:ruiztechservices@gmail.com",
  },
  {
    label: "Based in",
    value: "New York, NY / remote",
  },
  {
    label: "GitHub",
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
    <main className="min-h-screen bg-background">
      <div className="ss-container grid items-start gap-8 py-10 lg:grid-cols-[18rem_1fr]">
        <aside className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold tracking-normal">Contact</h1>
          <ul className="flex flex-col gap-3">
            {metaItems.map((item) => (
              <li key={item.label} className="rounded-md border p-3">
                <div className="text-xs font-medium text-muted-foreground">
                  {item.label}
                </div>
                <div className="mt-1 text-sm">
                  {item.href ? (
                    <a className="underline underline-offset-4" href={item.href}>
                      {item.value}
                    </a>
                  ) : (
                    item.value
                  )}
                </div>
              </li>
            ))}
          </ul>
        </aside>

        <section className="rounded-md border bg-card p-6">
          <h2 className="text-xl font-semibold tracking-normal">Project inquiry</h2>

          {status === "success" ? (
            <div className="mt-5 rounded-md border px-4 py-3 text-sm leading-relaxed" role="status">
              <strong className="font-semibold">Message sent.</strong> Your note is
              in the intake queue.
            </div>
          ) : null}

          {status === "error" ? (
            <div className="mt-5 rounded-md border px-4 py-3 text-sm leading-relaxed" role="alert">
              <strong className="font-semibold">Submission failed.</strong>{" "}
              {errorMessage ?? "Something went wrong. Please try again."}
            </div>
          ) : null}

          <div className="mt-6">
            <ContactForm onSuccess={handleSuccess} onFailure={handleFailure} />
          </div>
        </section>
      </div>
    </main>
  );
}
