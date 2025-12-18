import type {
  PayChangeReason,
  PayPoint,
  SalaryDataPoint,
  SalaryStatistics,
  YearRange,
} from './salaryTypes'
import type { InflationDataPoint } from '@/domain/inflation'

const SIGNIFICANT_REASONS: PayChangeReason[] = ['promotion', 'newJob']

function clampYear(year: number, startYear: number, endYear: number): number {
  return Math.min(Math.max(year, startYear), endYear)
}

export function resolvePurchasingPowerBaseYear(
  payPoints: PayPoint[],
  _currentYear?: number,
  baseYearOverride?: number,
): number | null {
  if (!payPoints.length) return null

  const pts = [...payPoints].sort((a, b) => a.year - b.year)
  const startYear = pts[0]?.year
  const endYear = pts[pts.length - 1]?.year
  if (startYear == null || endYear == null) return null

  if (baseYearOverride != null && Number.isFinite(baseYearOverride)) {
    return clampYear(Math.round(baseYearOverride), startYear, endYear)
  }

  const significant = pts.filter(point => SIGNIFICANT_REASONS.includes(point.reason))
  if (!significant.length) return startYear

  const nonLatest = significant.filter(point => point.year < endYear)
  if (nonLatest.length) {
    return nonLatest[nonLatest.length - 1]?.year ?? startYear
  }

  return startYear
}

/**
 * Build a per-year salary series (actual vs. inflation) using the last significant change
 * (promotion/new job) as the inflation baseline.
 */
export function adjustSalaries(
  payPoints: PayPoint[],
  inflation: InflationDataPoint[],
  currentYear?: number,
  baseYearOverride?: number,
): SalaryDataPoint[] {
  if (!payPoints.length || !inflation.length) return []

  // Sort payPoints and inflation data by year
  const pts = [...payPoints].sort((a, b) => a.year - b.year)
  const cpi = [...inflation].sort((a, b) => a.year - b.year)

  const firstPt = pts[0]
  const lastPt = pts[pts.length - 1]
  if (!firstPt || !lastPt) return []

  const startYear = firstPt.year
  const endYear = lastPt.year

  // Interpolate actual salary per year between payPoints
  const salaryMap = new Map<number, number>()
  for (let i = 0; i < pts.length - 1; i++) {
    const pt0 = pts[i]
    const pt1 = pts[i + 1]
    if (!pt0 || !pt1) continue
    const { year: y0, pay: p0 } = pt0
    const { year: y1, pay: p1 } = pt1
    for (let y = y0; y <= y1; y++) {
      const t = (y - y0) / (y1 - y0)
      salaryMap.set(y, p0 + t * (p1 - p0))
    }
  }

  // Determine base salary and base year from last significant change (with current-year fallback)
  const baseYear = resolvePurchasingPowerBaseYear(pts, currentYear, baseYearOverride) ?? startYear
  const baseSalary = salaryMap.get(baseYear) ?? pts[0]?.pay ?? 0

  // Build a map of year → CPI cumulative index relative to baseYear
  const rateMap = new Map<number, number>(cpi.map(d => [d.year, d.inflation / 100]))
  const indexMap = new Map<number, number>()
  let idx = 1
  indexMap.set(baseYear, idx)
  for (let y = baseYear + 1; y <= endYear; y++) {
    const r = rateMap.get(y) ?? 0
    idx *= 1 + r
    indexMap.set(y, idx)
  }
  idx = 1
  for (let y = baseYear - 1; y >= startYear; y--) {
    const r = rateMap.get(y + 1) ?? 0
    idx /= 1 + r
    indexMap.set(y, idx)
  }

  // Build output series: actual (interpolated) vs. inflation growth of baseSalary
  const result: SalaryDataPoint[] = []
  for (let y = startYear; y <= endYear; y++) {
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
  const first = series[0]
  const last = series[series.length - 1]

  if (!first || !last) {
    return {
      startingPay: NaN,
      latestPay: NaN,
      inflationAdjustedPay: NaN,
      gapPercent: NaN,
      startingYear: NaN,
      latestYear: NaN,
    }
  }

  const start = first.actualPay
  const end = last.actualPay
  const adj = last.inflationAdjustedPay
  const gap = ((end - adj) / adj) * 100
  return {
    startingPay: start,
    latestPay: end,
    inflationAdjustedPay: adj,
    gapPercent: Math.round(gap * 10) / 10,
    startingYear: first.year,
    latestYear: last.year,
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
