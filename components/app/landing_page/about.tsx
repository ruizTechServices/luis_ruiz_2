export default function About() {
  return (
    <main className="min-h-screen bg-background">
      <section className="ss-container flex flex-col gap-6 py-10">
        <h1 className="text-3xl font-semibold tracking-normal">About</h1>
        <div className="max-w-2xl rounded-md border bg-card p-6 text-sm leading-6 text-card-foreground">
          <p>Luis Giovanni Ruiz.</p>
          <p className="mt-4 text-muted-foreground">
            Full-stack software work, public projects, dashboard surfaces, and
            AI experiments.
          </p>
        </div>
      </section>
    </main>
  );
}
