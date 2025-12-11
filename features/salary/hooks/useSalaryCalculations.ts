import { useMemo } from 'react'
import { adjustSalaries, computeStatistics } from '@/features/inflation/inflationCalc'
import type { PayPoint } from '@/lib/models/types'
import type { InflationDataPoint } from '@/lib/models/inflation'

/**
 * Hook to derive a per-year salary series + summary stats
 */
export function useSalaryCalculations(payPoints: PayPoint[], inflationData: InflationDataPoint[]) {
  // 1. Build the adjusted per-year salary series
  const salaryData = useMemo(
    () => adjustSalaries(payPoints, inflationData),
    [payPoints, inflationData],
  )

  // 2. Compute summary statistics from that series
  const statistics = useMemo(() => computeStatistics(salaryData), [salaryData])

  // 3. Derive the full year range for chart axes
  const yearRange = useMemo(() => {
    if (!salaryData.length) {
      const current = new Date().getFullYear()
      return { minYear: current - 5, maxYear: current }
    }
    const yrs = salaryData.map(p => p.year)
    return { minYear: Math.min(...yrs), maxYear: Math.max(...yrs) }
  }, [salaryData])

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
