// TODO: Replace this hardcoded stub with a proper model routing strategy.
// Options to consider:
// - Use the existing provider routing in lib/nucleus/pricing.ts
// - Implement classifier-based routing (e.g., analyze query intent)
// - Use user preferences or session context to select models
//
// This function is not currently called anywhere in production code.
// It was created as a proof-of-concept for intelligent model routing.
export function routeToModel(query: string): string {
  if (query.includes('math') || query.includes('calculate')) return 'claude-3-sonnet';
  if (query.includes('code')) return 'gpt-4o';
  return 'mixtral';
}
