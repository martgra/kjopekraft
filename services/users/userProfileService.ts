import { getUserProfileRepository } from './repositoryFactory'
import type { UserProfileRepository, UserProfileRow } from './userProfileRepository'

const DEFAULT_TIMEZONE = 'UTC'

export async function ensureUserProfile(
  userId: string,
  repository: UserProfileRepository = getUserProfileRepository(),
): Promise<UserProfileRow> {
  const existing = await repository.getProfile(userId)
  if (existing) return existing
  return repository.upsertProfile(userId, DEFAULT_TIMEZONE, true)
}

export async function updateUserTimezone(
  userId: string,
  timezone: string,
  repository: UserProfileRepository = getUserProfileRepository(),
): Promise<UserProfileRow | null> {
  return repository.updateTimezone(userId, timezone)
}

export async function getUserProfile(
  userId: string,
  repository: UserProfileRepository = getUserProfileRepository(),
): Promise<UserProfileRow | null> {
  return repository.getProfile(userId)
}
