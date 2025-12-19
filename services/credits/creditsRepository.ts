import type { CreditFeature, DailyCredits } from '@/domain/credits'
import type { DbClient } from '@/services/db/types'

export interface CreditsRepository {
  getDailyCredits(userId: string, dateKey: string): Promise<DailyCredits | null>
  trySpendCredits(
    userId: string,
    dateKey: string,
    cost: number,
    limit: number,
  ): Promise<DailyCredits | null>
  insertLedgerEntry(
    userId: string,
    dateKey: string,
    feature: CreditFeature,
    cost: number,
    requestId?: string,
  ): Promise<void>
}

export function createCreditsRepository(db: DbClient): CreditsRepository {
  return {
    async getDailyCredits(userId, dateKey) {
      const result = await db.query<DailyCredits>(
        `SELECT date_key AS "dateKey", used, "limit"
         FROM credits_daily
         WHERE user_id = $1 AND date_key = $2
         LIMIT 1`,
        [userId, dateKey],
      )
      return result.rows[0] ?? null
    },
    async trySpendCredits(userId, dateKey, cost, limit) {
      const result = await db.query<DailyCredits>(
        `INSERT INTO credits_daily (user_id, date_key, used, "limit")
         SELECT $1, $2, $3, $4
         WHERE $3 <= $4
         ON CONFLICT (user_id, date_key)
         DO UPDATE SET used = credits_daily.used + EXCLUDED.used
         WHERE credits_daily.used + EXCLUDED.used <= credits_daily."limit"
         RETURNING date_key AS "dateKey", used, "limit"`,
        [userId, dateKey, cost, limit],
      )
      return result.rows[0] ?? null
    },
    async insertLedgerEntry(userId, dateKey, feature, cost, requestId) {
      await db.query(
        `INSERT INTO credits_ledger (user_id, date_key, feature, cost, request_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, dateKey, feature, cost, requestId ?? null],
      )
    },
  }
}
