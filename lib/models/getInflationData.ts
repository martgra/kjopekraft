import { cacheLife, cacheTag } from 'next/cache'
import { parseJsonInflation } from '@/features/inflation/inflationParser'
import type { InflationDataPoint, SsbRawResponse } from '@/lib/models/inflation'

/**
 * Fetch and cache inflation data from SSB with 24h server-side cache
 * Next.js 16: Uses 'use cache' directive for automatic caching
 */
export async function getInflationData(): Promise<InflationDataPoint[]> {
  'use cache'
  cacheLife('hours') // 1 hour cache
  cacheTag('inflation')

  const res = await fetch('https://data.ssb.no/api/v0/dataset/1086.json?lang=no')
  if (!res.ok) throw new Error(`SSB fetch failed (${res.status})`)
  const json = (await res.json()) as { dataset: SsbRawResponse['dataset'] }
  return parseJsonInflation(json.dataset)
}
