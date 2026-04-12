"use client";

import { useState } from "react";

import { ContactForm } from "@/components/app/contact/ContactForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type SubmissionStatus = "idle" | "success" | "error";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12 dark:from-slate-900 dark:to-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800 sm:p-12">
          <div className="mb-8 text-center">
            <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">Start a project conversation</h1>
            <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-300">
              This contact flow is for founders, small businesses, and serious collaborators who want help building a real product, AI workflow, or business system. Send the essentials first, then we can narrow scope, fit, and next steps.
            </p>
          </div>

          <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">What happens after you submit</p>
            <ul className="mt-3 space-y-2">
              <li>1. Your message lands in the admin intake queue.</li>
              <li>2. I review the project type, scope, timeline, and whether it looks like a real fit.</li>
              <li>3. If it makes sense, I follow up with next-step questions, a recommended path, or a conversation invite.</li>
            </ul>
          </div>

          <div className="space-y-6">
            {status === "success" && (
              <Alert className="border-green-200 bg-green-50 text-green-900">
                <AlertTitle>Message sent.</AlertTitle>
                <AlertDescription>
                  Your note is in the intake queue. Next step is review, then a reply with either follow-up questions or a recommended path.
                </AlertDescription>
              </Alert>
            )}

            {status === "error" && (
              <Alert variant="destructive">
                <AlertTitle>Submission failed</AlertTitle>
                <AlertDescription>{errorMessage ?? "Something went wrong. Please try again."}</AlertDescription>
              </Alert>
            )}

            <ContactForm onSuccess={handleSuccess} onFailure={handleFailure} />

            <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
              <div className="text-center text-gray-600 dark:text-gray-300">
                <p className="mb-2">Or reach out directly:</p>
                <div className="flex flex-col items-center justify-center space-y-2 sm:flex-row sm:space-x-6 sm:space-y-0">
                  <a href="mailto:ruiztechservices@gmail.com" className="flex items-center transition-colors hover:text-indigo-600">
                    <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    ruizTechServices Email
                  </a>
                  <a href="phone number" className="flex items-center transition-colors hover:text-indigo-600">
                    <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    +1 (917) 993-6701
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
