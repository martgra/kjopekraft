import type { DbClient } from '@/services/db/types'

export interface UserProfileRow {
  userId: string
  timezone: string
  aiEnabled: boolean
}

export interface UserProfileRepository {
  getProfile(userId: string): Promise<UserProfileRow | null>
  upsertProfile(userId: string, timezone: string, aiEnabled: boolean): Promise<UserProfileRow>
  updateTimezone(userId: string, timezone: string): Promise<UserProfileRow | null>
}

export function createUserProfileRepository(db: DbClient): UserProfileRepository {
  return {
    async getProfile(userId) {
      const result = await db.query<UserProfileRow>(
        `SELECT user_id AS "userId", timezone, ai_enabled AS "aiEnabled"
         FROM user_profiles
         WHERE user_id = $1
         LIMIT 1`,
        [userId],
      )
      return result.rows[0] ?? null
    },
    async upsertProfile(userId, timezone, aiEnabled) {
      const result = await db.query<UserProfileRow>(
        `INSERT INTO user_profiles (user_id, timezone, ai_enabled)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id)
         DO UPDATE SET
           timezone = EXCLUDED.timezone,
           ai_enabled = EXCLUDED.ai_enabled,
           updated_at = now()
         RETURNING user_id AS "userId", timezone, ai_enabled AS "aiEnabled"`,
        [userId, timezone, aiEnabled],
      )
      if (!result.rows[0]) {
        throw new Error('Failed to upsert user profile.')
      }
      return result.rows[0]
    },
    async updateTimezone(userId, timezone) {
      const result = await db.query<UserProfileRow>(
        `UPDATE user_profiles
         SET timezone = $2, updated_at = now()
         WHERE user_id = $1
         RETURNING user_id AS "userId", timezone, ai_enabled AS "aiEnabled"`,
        [userId, timezone],
      )
      return result.rows[0] ?? null
    },
  }
}
