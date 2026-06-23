import type { ReactNode } from "react";

export interface AuthShellProps {
  title: string;
  intro: string;
  children: ReactNode;
}

export function AuthShell({ title, intro, children }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <section className="w-full max-w-md rounded-md border bg-card p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-normal text-card-foreground">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{intro}</p>
        </div>
        {children}
        <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
          Authentication is handled by Supabase.
        </p>
      </section>
    </main>
  );
}
