// features/salary/hooks/usePaypointChartData.ts

import { PayPoint } from '@/lib/models/types'
import { InflationDataPoint } from '@/lib/models/inflation'
import { useSalaryCalculations } from '@/features/salary/hooks/useSalaryCalculations'
import type { ScatterDataPoint } from 'chart.js'

type RawPoint = { x: number; y: number | null }

function interpolateYearly(known: RawPoint[], minYear: number, maxYear: number): RawPoint[] {
  // Keep only non-null values for interpolation
  const valid = known.filter(p => p.y !== null && p.y !== undefined)
  const sorted = valid.slice().sort((a, b) => a.x - b.x)
  const out: RawPoint[] = []

  for (let year = minYear; year <= maxYear; year++) {
    const exact = sorted.find(p => p.x === year)
    if (exact) {
      out.push(exact)
    } else {
      const prev = sorted.filter(p => p.x < year).pop()
      const next = sorted.find(p => p.x > year)
      if (prev && next && prev.y != null && next.y != null) {
        const t = (year - prev.x) / (next.x - prev.x)
        out.push({ x: year, y: prev.y + t * (next.y - prev.y) })
      } else {
        out.push({ x: year, y: null })
      }
    }
  }

  return out
}

export function usePaypointChartData(payPoints: PayPoint[], inflationData: InflationDataPoint[]) {
  const {
    salaryData: adjustedPayData,
    yearRange,
    isLoading,
  } = useSalaryCalculations(payPoints, inflationData)

  // Build raw series
  const rawActual: RawPoint[] = payPoints.map(p => ({
    x: p.year,
    y: p.pay,
  }))
  const rawInfl: RawPoint[] = adjustedPayData.map(p => ({
    x: p.year,
    y: p.inflationAdjustedPay,
  }))

  // Interpolate to fill missing years
  const paddedActual = interpolateYearly(rawActual, yearRange.minYear, yearRange.maxYear)
  const paddedInfl = interpolateYearly(rawInfl, yearRange.minYear, yearRange.maxYear)

  // Filter out nulls and cast to ScatterDataPoint
  const actualSeries: ScatterDataPoint[] = paddedActual
    .filter((p): p is { x: number; y: number } => p.y != null)
    .map(p => ({ x: p.x, y: p.y }))

  const inflSeries: ScatterDataPoint[] = paddedInfl
    .filter((p): p is { x: number; y: number } => p.y != null)
    .map(p => ({ x: p.x, y: p.y }))

  return { isLoading, actualSeries, inflSeries, yearRange }
}
