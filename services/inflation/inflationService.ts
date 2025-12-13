import { cacheLife, cacheTag } from 'next/cache'
import { parseJsonInflation } from '@/domain/inflation'
import type { InflationDataPoint, SsbRawResponse } from '@/domain/inflation'

/**
 * Fetch and cache inflation data from SSB
 * Server-side only - uses Next.js cache directives
 */
export async function getInflationData(): Promise<InflationDataPoint[]> {
  'use cache'
  cacheLife('inflation') // Uses custom profile from next.config.ts
  cacheTag('inflation')

  const res = await fetch('https://data.ssb.no/api/v0/dataset/1086.json?lang=no')
  if (!res.ok) throw new Error(`SSB fetch failed (${res.status})`)
  const json = (await res.json()) as { dataset: SsbRawResponse['dataset'] }
  return parseJsonInflation(json.dataset)
}
