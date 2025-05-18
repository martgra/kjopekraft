// app/api/inflation/route.ts
import { NextResponse } from 'next/server'
import { parseJsonInflation } from '@/features/inflation/inflationParser'
import type { SsbRawResponse } from '@/lib/models/inflation'
import type { InflationDataPoint } from '@/lib/models/inflation'

export const revalidate = 86400 // ISR: regenerate every 24 h

export async function GET() {
  // 1) fetch & cache for 24 h
  const res = await fetch('https://data.ssb.no/api/v0/dataset/1086.json?lang=no', {
    next: { revalidate },
  })
  if (!res.ok) throw new Error(`SSB fetch failed (${res.status})`)

  // 2) parse
  const json = (await res.json()) as { dataset: SsbRawResponse['dataset'] }
  const data: InflationDataPoint[] = parseJsonInflation(json.dataset)

  // 3) return JSON (Next.js auto-uses `revalidate`)
  return NextResponse.json(data)
}
