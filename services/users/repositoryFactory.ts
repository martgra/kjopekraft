import { createUserProfileRepository } from './userProfileRepository'
import type { UserProfileRepository } from './userProfileRepository'
import { getDbClient } from '@/services/db/client'
import { getDbPool } from '@/services/db/pool'

let cachedRepository: UserProfileRepository | null = null

export function getUserProfileRepository(): UserProfileRepository {
  if (!cachedRepository) {
    getDbPool()
    cachedRepository = createUserProfileRepository(getDbClient())
  }
  return cachedRepository
}
