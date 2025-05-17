// features/inflation/inflationParser.ts
import type { InflationDataPoint } from '@/lib/models/inflation'
import type { SsbRawResponse } from './api/ssbClient.types'

export function parseJsonInflation(ds: SsbRawResponse['dataset']): InflationDataPoint[] {
  // 1) pull out timeCount & metricCount from dimension.size
  const [, timeCount, metricCount] = ds.dimension.size

  // 2) raw values array
  const values = ds.value
  if (!values.length) {
    throw new Error(`parseJsonInflation: no numeric array at ds.value.`)
  }

  // 3) pick the “all-groups” and “12-month change” indices
  const grpIdx = ds.dimension.Konsumgrp.category.index.TOTAL
  const metricIdx = ds.dimension.ContentsCode.category.index.Tolvmanedersendring
  const timeIdxMap = ds.dimension.Tid.category.index

  // 4) sort timestamps by their numeric index
  const times = Object.entries(timeIdxMap).sort(([, a], [, b]) => a - b)

  // 5) pick one value per year (prefer December)
  const yearMap = new Map<number, number>()
  for (const [monthKey, t] of times as [string, number][]) {
    const offset = grpIdx * timeCount * metricCount + t * metricCount + metricIdx
    const rawVal = values[offset]
    if (rawVal == null || isNaN(rawVal)) continue

    const year = parseInt(monthKey.slice(0, 4), 10)
    const monthNum = parseInt(monthKey.slice(5), 10)
    if (monthNum === 12 || !yearMap.has(year)) {
      yearMap.set(year, rawVal)
    }
  }

  // 6) build sorted array
  return Array.from(yearMap.entries())
    .map(([year, inflation]) => ({ year, inflation }))
    .sort((a, b) => a.year - b.year)
}
