
export default function RoundRobinLoading() {
  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground animate-pulse">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span>Preparing the round-robin discussion…</span>
      </div>
    </div>
  );
}

