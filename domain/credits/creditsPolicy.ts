import type { CreditFeature } from './creditsTypes'

export const DEFAULT_DAILY_LIMIT = 100

export const DEFAULT_CREDIT_COSTS: Record<CreditFeature, number> = {
  email_generator: 10,
  argument_improver: 10,
  embedding_search: 1,
}

export function getLocalDateKey(timezone: string, now: Date = new Date()): string {
  const safeTimezone = resolveTimezone(timezone)
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: safeTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(now)
}

export function getRemainingCredits(used: number, limit: number): number {
  return Math.max(0, limit - used)
}

function resolveTimezone(timezone: string): string {
  try {
    Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date())
    return timezone
  } catch {
    return 'UTC'
  }
}
