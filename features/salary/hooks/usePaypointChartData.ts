// features/salary/hooks/usePaypointChartData.ts

import { PayPoint } from '@/lib/models/types'
import { InflationDataPoint } from '@/lib/models/inflation'
import { useSalaryCalculations } from '@/features/salary/hooks/useSalaryCalculations'
import { useReferenceSalary } from '@/features/referenceSalary/hooks/useReferenceSalary'
import { useReferenceMode } from '@/contexts/referenceMode/ReferenceModeContext'
import { useDisplayMode } from '@/contexts/displayMode/DisplayModeContext'
import { filterReferenceByYearRange } from '@/features/referenceSalary/referenceCalculator'
import { calculateNetIncome } from '@/features/tax/taxCalculator'
import type { ScatterDataPoint } from 'chart.js'
import type { OccupationKey } from '@/features/referenceSalary/occupations'

export function usePaypointChartData(
  payPoints: PayPoint[],
  inflationData: InflationDataPoint[],
  occupation?: OccupationKey,
) {
  const {
    salaryData: adjustedPayData,
    yearRange,
    isLoading,
  } = useSalaryCalculations(payPoints, inflationData)

  const { isReferenceEnabled } = useReferenceMode()
  const { isNetMode } = useDisplayMode()

  // Fetch reference salary data (only when enabled and occupation is selected)
  const {
    data: referenceData,
    isLoading: isReferenceLoading,
    error: referenceError,
  } = useReferenceSalary({
    occupation,
    fromYear: 2015,
    enabled: isReferenceEnabled && !!occupation,
  })

  // Build series from actual data points only (no interpolation)
  const actualSeries: ScatterDataPoint[] = payPoints.map(p => ({
    x: p.year,
    y: p.pay,
  }))

  const inflSeries: ScatterDataPoint[] = adjustedPayData.map(p => ({
    x: p.year,
    y: p.inflationAdjustedPay,
  }))

  // Build reference series (pre-calculated yearly, filtered to user's year range)
  const referenceSeries: ScatterDataPoint[] =
    isReferenceEnabled && referenceData.length > 0 && yearRange
      ? filterReferenceByYearRange(referenceData, yearRange.minYear, yearRange.maxYear).map(
          point => ({
            x: point.year,
            y:
              point.value === null
                ? null
                : isNetMode
                  ? calculateNetIncome(point.year, point.value)
                  : point.value,
          }),
        )
      : []

  return {
    isLoading: isLoading || (isReferenceEnabled && isReferenceLoading),
    actualSeries,
    inflSeries,
    referenceSeries,
    yearRange,
    referenceError,
  }
}
