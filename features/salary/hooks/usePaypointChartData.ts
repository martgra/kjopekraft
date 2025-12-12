// features/salary/hooks/usePaypointChartData.ts

import { PayPoint } from '@/lib/models/types'
import { InflationDataPoint } from '@/lib/models/inflation'
import { useSalaryCalculations } from '@/features/salary/hooks/useSalaryCalculations'
import type { ScatterDataPoint } from 'chart.js'

export function usePaypointChartData(payPoints: PayPoint[], inflationData: InflationDataPoint[]) {
  const {
    salaryData: adjustedPayData,
    yearRange,
    isLoading,
  } = useSalaryCalculations(payPoints, inflationData)

  // Build series from actual data points only (no interpolation)
  const actualSeries: ScatterDataPoint[] = payPoints.map(p => ({
    x: p.year,
    y: p.pay,
  }))

  const inflSeries: ScatterDataPoint[] = adjustedPayData.map(p => ({
    x: p.year,
    y: p.inflationAdjustedPay,
  }))

  return { isLoading, actualSeries, inflSeries, yearRange }
}
