import type { InflationDataPoint, SsbRawResponse } from './inflationTypes'

/**
 * Parse SSB inflation data from JSON-stat 2 (PxWebApi 2.0).
 *
 * Assumes the response was filtered to a single metric (`Tolvmanedersendring`,
 * the 12-month % change), so the value array is one number per month.
 * For each calendar year we keep December — or the last published month if December is missing.
 */
export function parseJsonInflation(ds: SsbRawResponse): InflationDataPoint[] {
  const timeIdxMap = ds.dimension.Tid.category.index
  const values = ds.value
  if (!values.length) {
    throw new Error('parseJsonInflation: empty value array')
  }

  // Sort months chronologically so December always wins last-write within a year.
  const times = Object.entries(timeIdxMap).sort(([, a], [, b]) => a - b)

  const yearMap = new Map<number, number>()
  for (const [monthKey, idx] of times) {
    const rawVal = values[idx]
    if (rawVal == null || Number.isNaN(rawVal)) continue

    const year = parseInt(monthKey.slice(0, 4), 10)
    const monthNum = parseInt(monthKey.slice(5), 10)
    if (Number.isNaN(year)) continue

    if (monthNum === 12 || !yearMap.has(year)) {
      yearMap.set(year, rawVal)
    }
  }

  return Array.from(yearMap.entries())
    .map(([year, inflation]) => ({ year, inflation }))
    .sort((a, b) => a.year - b.year)
}
