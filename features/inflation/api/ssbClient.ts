// features/inflation/api/ssbClient.ts
import { SsbRawResponse } from './ssbClient.types'

export interface SsbApiConfig {
  baseUrl: string
}

export async function fetchJson(config: SsbApiConfig): Promise<SsbRawResponse['dataset']> {
  if (!config.baseUrl) {
    throw new Error('SSB JSON fetch failed: NEXT_PUBLIC_SSB_API_URL is not set')
  }

  const res = await fetch(config.baseUrl, {
    next: { revalidate: 60 * 60 * 24 }, // 24 h cache
  })
  if (!res.ok) {
    throw new Error(`SSB JSON fetch failed: ${res.status}`)
  }

  const json = await res.json()
  if (!json.dataset) {
    throw new Error('SSB JSON fetch failed: missing dataset in response')
  }

  // dataset.dimension.size is where the counts actually live
  const ds = json.dataset as SsbRawResponse['dataset']
  const dimSize = ds.dimension.size

  if (!Array.isArray(dimSize) || dimSize.length < 3 || dimSize.some(n => typeof n !== 'number')) {
    throw new Error(
      `SSB JSON fetch failed: invalid dataset.dimension.size – expected [grpCount, timeCount, metricCount], got ${JSON.stringify(
        dimSize,
      )}`,
    )
  }

  return ds
}
