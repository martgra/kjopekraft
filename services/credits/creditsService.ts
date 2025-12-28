import type { CreditFeature, DailyCredits } from '@/domain/credits'
import {
  DEFAULT_CREDIT_COSTS,
  DEFAULT_DAILY_LIMIT,
  getLocalDateKey,
  getRemainingCredits,
} from '@/domain/credits'
import type { CreditsRepository } from './creditsRepository'
import { getCreditsRepository } from './repositoryFactory'

interface DailyCreditsSnapshot {
  credits: DailyCredits
  remaining: number
}

interface SpendCreditsInput {
  userId: string
  timezone: string
  feature: CreditFeature
  cost?: number
  requestId?: string
}

interface SpendCreditsResult extends DailyCreditsSnapshot {
  allowed: boolean
}

function buildCreditsSnapshot(
  dateKey: string,
  existing: DailyCredits | null,
  dailyLimit: number,
): DailyCreditsSnapshot {
  const credits = existing ?? { dateKey, used: 0, limit: dailyLimit }
  return {
    credits,
    remaining: getRemainingCredits(credits.used, credits.limit),
  }
}

export async function getDailyCreditsForUser(
  userId: string,
  timezone: string,
  repository: CreditsRepository = getCreditsRepository(),
  dailyLimit: number = DEFAULT_DAILY_LIMIT,
): Promise<DailyCreditsSnapshot> {
  const dateKey = getLocalDateKey(timezone)
  const existing = await repository.getDailyCredits(userId, dateKey)
  return buildCreditsSnapshot(dateKey, existing, dailyLimit)
}

export async function checkAndSpendCredits(
  input: SpendCreditsInput,
  repository: CreditsRepository = getCreditsRepository(),
  dailyLimit: number = DEFAULT_DAILY_LIMIT,
): Promise<SpendCreditsResult> {
  const { userId, timezone, feature, cost, requestId } = input
  const resolvedCost = cost ?? DEFAULT_CREDIT_COSTS[feature] ?? 1
  const dateKey = getLocalDateKey(timezone)
  const updated = await repository.trySpendCredits(userId, dateKey, resolvedCost, dailyLimit)

  if (updated) {
    await repository.insertLedgerEntry(userId, dateKey, feature, resolvedCost, requestId)
    return {
      allowed: true,
      credits: updated,
      remaining: getRemainingCredits(updated.used, updated.limit),
    }
  }

  const existing = await repository.getDailyCredits(userId, dateKey)
  return {
    allowed: false,
    ...buildCreditsSnapshot(dateKey, existing, dailyLimit),
  }
}
