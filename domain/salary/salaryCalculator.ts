import type { PayPoint, SalaryDataPoint, SalaryStatistics, YearRange } from './salaryTypes'
import type { InflationDataPoint } from '@/domain/inflation'

/**
 * Build a per-year salary series (actual vs. inflation) starting from the earliest pay point,
 * scaling the initial salary forward by CPI alone.
 */
export function adjustSalaries(
  payPoints: PayPoint[],
  inflation: InflationDataPoint[],
): SalaryDataPoint[] {
  if (!payPoints.length || !inflation.length) return []

  // Sort payPoints and inflation data by year
  const pts = [...payPoints].sort((a, b) => a.year - b.year)
  const cpi = [...inflation].sort((a, b) => a.year - b.year)

  // Determine base salary (earliest point) and base year
  const baseYear = pts[0].year
  const baseSalary = pts[0].pay

  // Build a map of year → CPI cumulative index relative to baseYear
  const rateMap = new Map<number, number>(cpi.map(d => [d.year, d.inflation / 100]))
  const indexMap = new Map<number, number>()
  let idx = 1
  indexMap.set(baseYear, idx)
  for (let y = baseYear + 1; y <= pts[pts.length - 1].year; y++) {
    const r = rateMap.get(y) ?? 0
    idx *= 1 + r
    indexMap.set(y, idx)
  }

  // Interpolate actual salary per year between payPoints
  const salaryMap = new Map<number, number>()
  for (let i = 0; i < pts.length - 1; i++) {
    const { year: y0, pay: p0 } = pts[i]
    const { year: y1, pay: p1 } = pts[i + 1]
    for (let y = y0; y <= y1; y++) {
      const t = (y - y0) / (y1 - y0)
      salaryMap.set(y, p0 + t * (p1 - p0))
    }
  }

  // Build output series: actual (interpolated) vs. inflation growth of baseSalary
  const result: SalaryDataPoint[] = []
  for (let y = baseYear; y <= pts[pts.length - 1].year; y++) {
    const actual = salaryMap.get(y) ?? baseSalary
    const factor = indexMap.get(y) ?? 1
    result.push({
      year: y,
      actualPay: actual,
      // Use *baseSalary* multiplied by CPI index only
      inflationAdjustedPay: Math.round(baseSalary * factor),
      inflationRate: (rateMap.get(y) ?? 0) * 100,
      isInterpolated: !pts.some(pt => pt.year === y),
    })
  }
  return result
}

/**
 * Compute key summary statistics from a per-year salary series
 */
export function computeStatistics(series: SalaryDataPoint[]): SalaryStatistics {
  if (!series.length) {
    return {
      startingPay: NaN,
      latestPay: NaN,
      inflationAdjustedPay: NaN,
      gapPercent: NaN,
      startingYear: NaN,
      latestYear: NaN,
    }
  }
  const start = series[0].actualPay
  const end = series[series.length - 1].actualPay
  const adj = series[series.length - 1].inflationAdjustedPay
  const gap = ((end - adj) / adj) * 100
  return {
    startingPay: start,
    latestPay: end,
    inflationAdjustedPay: adj,
    gapPercent: Math.round(gap * 10) / 10,
    startingYear: series[0].year,
    latestYear: series[series.length - 1].year,
  }
}

/**
 * Calculate year range from salary data
 */
export function calculateYearRange(salaryData: SalaryDataPoint[], currentYear: number): YearRange {
  if (!salaryData.length) {
    return { minYear: currentYear - 5, maxYear: currentYear }
  }
  const years = salaryData.map(p => p.year)
  return { minYear: Math.min(...years), maxYear: Math.max(...years) }
}

/**
 * Interpolate salary between two years
 */
export function interpolateSalary(
  year: number,
  year0: number,
  pay0: number,
  year1: number,
  pay1: number,
): number {
  if (year0 === year1) return pay0
  const t = (year - year0) / (year1 - year0)
  return pay0 + t * (pay1 - pay0)
}
