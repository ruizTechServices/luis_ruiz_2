"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowTopRightOnSquareIcon, PlayIcon, XMarkIcon } from "@heroicons/react/24/outline";

type ProjectProps = {
  url: string;
  title?: string;
  description?: string;
  /**
   * When true, places the description on the right on large screens.
   * On small screens the layout stacks with the iframe first, description second.
   */
  reverse?: boolean;
};

export default function Project({ url, title, description }: ProjectProps) {
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
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden transition-all hover:shadow-md">
        {/* Card Header */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-current hover:text-primary transition-colors inline-flex items-center gap-2"
                >
                  {derivedTitle}
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 opacity-50" />
                </a>
              </h3>
              {description && (
                <p className="text-muted-foreground leading-relaxed">{description}</p>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
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

        {/* Collapsible Iframe Preview */}
        {showPreview && (
          <div className="border-t bg-muted/30">
            <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
              <iframe
                src={url}
                title={derivedTitle}
                loading="lazy"
                referrerPolicy="no-referrer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; microphone; camera; display-capture"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                className="h-full w-full"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

