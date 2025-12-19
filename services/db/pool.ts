import { Pool } from 'pg'
import { setDbClient } from './client'

let pool: Pool | null = null

export function getDbPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set.')
    }
    pool = new Pool({ connectionString })
    setDbClient(pool)
  }
  return pool
}
