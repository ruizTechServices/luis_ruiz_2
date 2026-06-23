import Link from "next/link";
import { cn } from "@/lib/utils";

export type LogoProps = {
  className?: string;
  compact?: boolean;
  href?: string;
};

export function Logo({ className, compact = false, href = "/" }: LogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span aria-hidden="true" className="font-mono text-sm font-semibold">
        LR
      </span>
      {!compact ? (
        <span className="flex min-w-0 flex-col">
          <span className="text-sm font-semibold leading-5 text-foreground">
            Luis Ruiz
          </span>
        </span>
      ) : null}
    </span>
  );

  return (
    <Link href={href} aria-label="Luis Ruiz home" className="inline-flex rounded-md">
      {content}
    </Link>
  );
}
