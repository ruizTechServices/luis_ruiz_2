export function parseError(error: unknown): string {
    if (typeof error === 'string') return error
    if (error instanceof Error) return error.message
    return 'An unknown error occurred'
  }
  

//Must optimize this function
//I need it to pick up errors for all possible cases
// I need it to be stateless
// I need it to be type safe
