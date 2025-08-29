export function routeToModel(query: string): string {
    if (query.includes('math') || query.includes('calculate')) return 'claude-3-sonnet'
    if (query.includes('code')) return 'gpt-4o'
    return 'mixtral'
  }
  //This works, just needs more modifications