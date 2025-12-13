import type { InflationDataPoint } from './inflationTypes'

/**
 * Build cumulative inflation index relative to a base year
 *
 * @param inflation - Array of inflation data points
 * @param baseYear - Year to use as base (index = 1.0)
 * @returns Map of year to cumulative inflation index
 */
export function buildInflationIndex(
  inflation: InflationDataPoint[],
  baseYear: number,
  endYear: number,
): Map<number, number> {
  const rateMap = new Map<number, number>(inflation.map(d => [d.year, d.inflation / 100]))
  const indexMap = new Map<number, number>()

  let idx = 1
  indexMap.set(baseYear, idx)

  for (let y = baseYear + 1; y <= endYear; y++) {
    const r = rateMap.get(y) ?? 0
    idx *= 1 + r
    indexMap.set(y, idx)
  }

  return indexMap
}

/**
 * Adjust a value for inflation from one year to another
 *
 * @param value - Original value
 * @param fromYear - Year of original value
 * @param toYear - Year to adjust to
 * @param inflation - Inflation data points
 * @returns Value adjusted for inflation
 */
export function adjustForInflation(
  value: number,
  fromYear: number,
  toYear: number,
  inflation: InflationDataPoint[],
): number {
  if (fromYear === toYear) return value

  const indexMap = buildInflationIndex(inflation, fromYear, toYear)
  const factor = indexMap.get(toYear) ?? 1

  return Math.round(value * factor)
}

/**
 * Get inflation rate for a specific year
 */
export function getInflationRate(year: number, inflation: InflationDataPoint[]): number {
  const dataPoint = inflation.find(d => d.year === year)
  return dataPoint ? dataPoint.inflation : 0
}
