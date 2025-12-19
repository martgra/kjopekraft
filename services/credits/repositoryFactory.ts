import { createCreditsRepository } from './creditsRepository'
import type { CreditsRepository } from './creditsRepository'
import { getDbClient } from '@/services/db/client'
import { getDbPool } from '@/services/db/pool'

let cachedRepository: CreditsRepository | null = null

export function getCreditsRepository(): CreditsRepository {
  if (!cachedRepository) {
    getDbPool()
    cachedRepository = createCreditsRepository(getDbClient())
  }
  return cachedRepository
}
