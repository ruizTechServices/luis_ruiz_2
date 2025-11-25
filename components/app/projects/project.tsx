import React from "react";

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

export default function Project({ url, title, description, reverse = false }: ProjectProps) {
  const descOrder = reverse ? "lg:order-2" : "lg:order-1";
  const frameOrder = reverse ? "lg:order-1" : "lg:order-2";
  const descAlign = reverse ? "lg:text-right" : "lg:text-left";
  const descPadding = reverse ? "lg:pl-8" : "lg:pr-8";
  const derivedTitle = title || (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  })();

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Description */}
        <div className={`order-2 ${descOrder} lg:col-span-5 ${descAlign} ${descPadding}`}>
          <h3 className="text-xl font-semibold mb-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-current hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              {derivedTitle}
            </a>
          </h3>
          {description ? (
            <p className="text-muted-foreground leading-relaxed">{description}</p>
          ) : null}
        </div>

        {/* Iframe */}
        <div className={`order-1 ${frameOrder} lg:col-span-7`}>
          <div className="relative w-full rounded-xl border bg-card shadow-sm overflow-hidden">
            {/* Maintain aspect ratio without relying on plugins */}
            <div className="w-full" style={{ aspectRatio: "16 / 9" }}>
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
        </div>
      </div>
    </section>
  );
}

