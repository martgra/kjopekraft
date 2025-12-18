// features/salary/hooks/usePaypointChartData.ts

import type { PayPoint } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'
import { useMemo } from 'react'
import { useSalaryCalculations } from '@/features/salary/hooks/useSalaryCalculations'
import { useReferenceSalary } from '@/features/referenceSalary/hooks/useReferenceSalary'
import { useReferenceMode } from '@/contexts/referenceMode/ReferenceModeContext'
import { useDisplayMode } from '@/contexts/displayMode/DisplayModeContext'
import { filterReferenceByYearRange } from '@/domain/reference'
import { adjustSalaries, resolvePurchasingPowerBaseYear } from '@/domain/salary'
import { calculateNetIncome } from '@/domain/tax'
import type { ScatterDataPoint } from 'chart.js'
import type { ReferenceOccupationSelection } from '@/features/referenceSalary/occupations'

export function usePaypointChartData(
  payPoints: PayPoint[],
  inflationData: InflationDataPoint[],
  currentYear: number,
  occupation?: ReferenceOccupationSelection | null,
  baseYearOverride?: number,
) {
  const {
    salaryData: adjustedPayData,
    yearRange,
    isLoading,
  } = useSalaryCalculations(payPoints, inflationData, currentYear, baseYearOverride)

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

  const chartBaseYear = useMemo(
    () => resolvePurchasingPowerBaseYear(payPoints, currentYear, baseYearOverride),
    [payPoints, currentYear, baseYearOverride],
  )

  const inflSeries: ScatterDataPoint[] = useMemo(() => {
    if (chartBaseYear == null) return []
    const chartSeries = adjustSalaries(payPoints, inflationData, currentYear, chartBaseYear)
    return chartSeries
      .filter(point => point.year >= chartBaseYear)
      .map(point => ({
        x: point.year,
        y: point.inflationAdjustedPay,
      }))
  }, [chartBaseYear, payPoints, inflationData, currentYear])

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
                  ? calculateNetIncome(point.value, point.year)
                  : point.value,
          }),
        )
      : []

  return {
    isLoading: isLoading || (isReferenceEnabled && isReferenceLoading),
    actualSeries,
    inflSeries,
    referenceSeries,
    salaryData: adjustedPayData,
    referenceData,
    yearRange,
    referenceError,
  }
}
