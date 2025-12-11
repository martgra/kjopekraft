import { unstable_cache } from 'next/cache'
import { parseJsonInflation } from '@/features/inflation/inflationParser'
import type { InflationDataPoint, SsbRawResponse } from '@/lib/models/inflation'

// Next.js 16: Cache inflation data at runtime for 24 hours
export const getInflationData = unstable_cache(
  async (): Promise<InflationDataPoint[]> => {
    const res = await fetch('https://data.ssb.no/api/v0/dataset/1086.json?lang=no')
    if (!res.ok) throw new Error(`SSB fetch failed (${res.status})`)
    const json = (await res.json()) as { dataset: SsbRawResponse['dataset'] }
    return parseJsonInflation(json.dataset)
  },
  ['inflation-data'],
  {
    revalidate: 86400, // 24 hours
    tags: ['inflation'],
  }
)
