import Link from "next/link";
import { cn } from "@/lib/utils";

export type LogoProps = {
  className?: string;
  compact?: boolean;
  href?: string;
};

export function Logo({ className, compact = false, href = "/" }: LogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span
        aria-hidden="true"
        className="relative grid size-10 shrink-0 place-items-center rounded-xl border bg-[var(--color-surface)] text-[var(--color-text-primary)]"
        style={{ borderColor: "var(--color-border)" }}
      >
        <span className="absolute left-1.5 top-2.5 h-5 w-0.5 rounded-full bg-[var(--color-action-primary)]" />
        <span className="pl-1 text-sm font-bold leading-none">LR</span>
      </span>
      {!compact ? (
        <span className="flex min-w-0 flex-col">
          <span className="text-sm font-bold leading-5 tracking-normal text-[var(--color-text-primary)]">
            LUIS RUIZ
          </span>
          <span className="font-technical text-[0.56rem] font-medium uppercase leading-3 tracking-[0.1em] text-[var(--color-text-secondary)]">
            Software systems / NYC
          </span>
        </span>
      ) : null}
    </span>
  );

  return (
    <Link href={href} aria-label="Luis Ruiz home" className="inline-flex rounded-xl">
      {content}
    </Link>
  );
}
