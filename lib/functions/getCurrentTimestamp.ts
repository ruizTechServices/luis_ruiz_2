export function getCurrentTimestamp(timeZone: string = 'America/New_York'): string {
  // Stateless: derives output solely from inputs (timeZone) and current time
  const now = new Date()

  // Validate timezone; if invalid, fall back to Eastern (NYC)
  let tz = timeZone
  try {
    // This throws RangeError for invalid timeZone
    new Intl.DateTimeFormat('en-US', { timeZone: tz }).format(now)
  } catch {
    tz = 'America/New_York'
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })

  const suffix = tz === 'America/New_York' ? 'ET' : tz
  return `${formatter.format(now)} ${suffix}`
}