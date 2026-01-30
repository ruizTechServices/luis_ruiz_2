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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 sm:p-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Get In Touch</h1>
            <p className="text-gray-600 dark:text-gray-300">
              We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
            </p>
          </div>

          <div className="space-y-6">
            {status === "success" && (
              <Alert className="border-green-200 bg-green-50 text-green-900">
                <AlertTitle>Message sent!</AlertTitle>
                <AlertDescription>
                  Thanks for reaching out. We&apos;ll review your note and respond shortly.
                </AlertDescription>
              </Alert>
            )}

            {status === "error" && (
              <Alert variant="destructive">
                <AlertTitle>Submission failed</AlertTitle>
                <AlertDescription>{errorMessage ?? "Something went wrong. Please try again."}</AlertDescription>
              </Alert>
            )}

            <ContactForm
              onSuccess={handleSuccess}
              onFailure={handleFailure}
            />

            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center text-gray-600 dark:text-gray-300">
                <p className="mb-2">Or reach us directly:</p>
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6">
                  <a href="mailto:hello@example.com" className="flex items-center hover:text-indigo-600 transition-colors">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    hello@example.com
                  </a>
                  <a href="tel:+1555123456" className="flex items-center hover:text-indigo-600 transition-colors">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    +1 (347) 901-3772
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
