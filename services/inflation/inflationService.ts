import { cache } from 'react'
import { cacheLife, cacheTag } from 'next/cache'
import { parseJsonInflation } from '@/domain/inflation'
import type { InflationDataPoint } from '@/domain/inflation'
import { SsbInflationResponseSchema } from '@/lib/schemas'
import { logger } from '@/lib/logger'

/**
 * Fetch and cache inflation data from SSB
 * Server-side only - uses Next.js cache directives
 * Includes Zod runtime validation of API response
 */
const fetchInflation = async (): Promise<InflationDataPoint[]> => {
  'use cache'
  cacheLife('inflation') // Uses custom profile from next.config.ts
  cacheTag('inflation')

  const res = await fetch('https://data.ssb.no/api/v0/dataset/1086.json?lang=no')
  if (!res.ok) throw new Error(`SSB fetch failed (${res.status})`)

  const rawJson = await res.json()

  // Validate response structure with Zod
  const parseResult = SsbInflationResponseSchema.safeParse(rawJson)
  if (!parseResult.success) {
    logger.error('SSB inflation response validation failed', parseResult.error, {
      component: 'inflationService',
    })
    throw new Error('Invalid SSB response format')
  }

  return parseJsonInflation(parseResult.data.dataset)
}

// Memoize per-request to avoid duplicate fetch/parse in the same render pass
export const getInflationData = cache(fetchInflation)
