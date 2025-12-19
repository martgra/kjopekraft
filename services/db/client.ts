import type { DbClient } from './types'

let cachedClient: DbClient | null = null

export function setDbClient(client: DbClient) {
  cachedClient = client
}

export function getDbClient(): DbClient {
  if (!cachedClient) {
    throw new Error('Database client not configured.')
  }
  return cachedClient
}
