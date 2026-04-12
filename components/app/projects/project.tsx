"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowTopRightOnSquareIcon, PlayIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

type ProjectProps = {
  url: string;
  title?: string;
  description?: string;
  relatedPosts?: { id: number; title: string | null; created_at: string }[];
  /**
   * When true, places the description on the right on large screens.
   * On small screens the layout stacks with the iframe first, description second.
   */
  reverse?: boolean;
};

export default function Project({ url, title, description, relatedPosts }: ProjectProps) {
  const [showPreview, setShowPreview] = useState(false);
  
  const derivedTitle = title || (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  })();

  return (
    <section className="w-full">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-sm backdrop-blur-sm transition-all hover:border-violet-400/20 hover:bg-white/[0.06] hover:shadow-xl">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-slate-300">
                Live project
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-current transition-colors hover:text-violet-200"
                >
                  {derivedTitle}
                  <ArrowTopRightOnSquareIcon className="h-5 w-5 opacity-70" />
                </a>
              </h3>
              <p className={cn("max-w-3xl leading-7 text-slate-300", !description && "italic text-slate-400")}>
                {description || "Public project entry is live, but this item still needs stronger narrative framing, outcome details, and richer metadata."}
              </p>

              {relatedPosts && relatedPosts.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {relatedPosts.slice(0, 3).map((post) => (
                    <a
                      key={post.id}
                      href={`/blog/${post.id}`}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-violet-200 transition hover:border-violet-400/30 hover:bg-white/10"
                    >
                      Blog / Build Log: {post.title || `Post #${post.id}`}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Button
                variant={showPreview ? "secondary" : "default"}
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2"
              >
                {showPreview ? (
                  <>
                    <XMarkIcon className="h-4 w-4" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4" />
                    Show Preview
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={url} target="_blank" rel="noopener noreferrer" className="gap-2">
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  Open in New Tab
                </a>
              </Button>
            </div>
          </div>
        </div>

        {showPreview && (
          <div className="border-t border-white/10 bg-slate-950/40">
            <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
              <iframe
                src={url}
                title={derivedTitle}
                loading="lazy"
                referrerPolicy="no-referrer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; microphone; camera; display-capture"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                className="h-full w-full bg-white"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

