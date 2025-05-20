import { parseJsonInflation } from '@/features/inflation/inflationParser'
import type { InflationDataPoint, SsbRawResponse } from '@/lib/models/inflation'

export async function getInflationData(): Promise<InflationDataPoint[]> {
  // Fetch and parse inflation data from SSB
  const res = await fetch('https://data.ssb.no/api/v0/dataset/1086.json?lang=no', {
    cache: 'force-cache',
  })
  if (!res.ok) throw new Error(`SSB fetch failed (${res.status})`)
  const json = (await res.json()) as { dataset: SsbRawResponse['dataset'] }
  return parseJsonInflation(json.dataset)
}
