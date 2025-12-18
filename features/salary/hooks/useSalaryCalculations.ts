import { useMemo } from 'react'
import { adjustSalaries, calculateYearRange, computeStatistics } from '@/domain/salary'
import type { PayPoint } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'

/**
 * Hook to derive a per-year salary series + summary stats
 */
export function useSalaryCalculations(
  payPoints: PayPoint[],
  inflationData: InflationDataPoint[],
  currentYear: number,
  baseYearOverride?: number,
) {
  // 1. Build the adjusted per-year salary series
  const salaryData = useMemo(
    () => adjustSalaries(payPoints, inflationData, currentYear, baseYearOverride),
    [payPoints, inflationData, currentYear, baseYearOverride],
  )

  // 2. Compute summary statistics from that series
  const statistics = useMemo(() => computeStatistics(salaryData), [salaryData])

  // 3. Derive the full year range for chart axes
  const yearRange = useMemo(
    () => calculateYearRange(salaryData, currentYear),
    [salaryData, currentYear],
  )

  // 4. Loading flag: we consider the hook "done" once salaryData is built
  const isLoading = false

  // hasData: true when salaryData has real numbers
  const hasData = salaryData.length > 0 && !Number.isNaN(statistics.startingPay)

  return {
    salaryData,
    statistics,
    yearRange,
    hasData,
    isLoading,
  }
}
