import type { CreditFeature, CreditSpendResult } from './creditsTypes'

export const DEFAULT_DAILY_LIMIT = 10

export const DEFAULT_CREDIT_COSTS: Record<CreditFeature, number> = {
  embedding_search: 1,
  argument_improver: 1,
  email_generator: 1,
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

export function canSpendCredits(used: number, cost: number, limit: number): boolean {
  return used + cost <= limit
}

export function spendCredits(used: number, cost: number, limit: number): CreditSpendResult {
  const allowed = canSpendCredits(used, cost, limit)
  const nextUsed = allowed ? used + cost : used
  return {
    allowed,
    used: nextUsed,
    remaining: getRemainingCredits(nextUsed, limit),
    limit,
  }
}

function resolveTimezone(timezone: string): string {
  try {
    Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date())
    return timezone
  } catch {
    return 'UTC'
  }
}
