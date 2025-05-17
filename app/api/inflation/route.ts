// app/api/inflation/route.ts
import { NextResponse } from 'next/server'
import { fetchJson, SsbApiConfig } from '@/features/inflation/api/ssbClient'
import { parseJsonInflation } from '@/features/inflation/inflationParser'
import type { InflationDataPoint } from '@/lib/models/inflation'

const defaultConfig: SsbApiConfig = {
  baseUrl: 'https://data.ssb.no/api/v0/dataset/1086.json?lang=no',
}

export const revalidate = 86400
export const dynamic = 'force-dynamic'

export async function GET() {
  const raw = await fetchJson(defaultConfig)
  const data: InflationDataPoint[] = parseJsonInflation(raw)

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate=${revalidate}`,
    },
  })
}
