'use client'

import React, { useMemo } from 'react'
import LoadingSpinner from '@/components/ui/common/LoadingSpinner'
import { calculateNetIncome } from '@/features/tax/taxCalculator'
import { usePaypointChartData } from '@/features/salary/hooks/usePaypointChartData'
import type { PayPoint } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'
import type { ScatterDataPoint } from 'chart.js'
import type { OccupationKey } from '@/features/referenceSalary/occupations'
import { TEXT } from '@/lib/constants/text'
import ResponsiveChartWrapper from './ResponsiveChartWrapper'

interface PaypointChartProps {
  payPoints: PayPoint[]
  inflationData: InflationDataPoint[]
  displayNet: boolean
  occupation?: OccupationKey
  className?: string
  onApiError?: (error: Error | null) => void
}

export default function PaypointChart({
  payPoints,
  inflationData,
  displayNet,
  occupation,
  className = '',
  onApiError,
}: PaypointChartProps) {
  // Grab the raw (gross) series from your hook
  const {
    isLoading,
    actualSeries: rawSeries,
    inflSeries: rawInflSeries,
    referenceSeries: rawReferenceSeries,
    yearRange,
    referenceError,
  } = usePaypointChartData(payPoints, inflationData, occupation)

  // Notify parent of API errors
  React.useEffect(() => {
    if (onApiError && referenceError) {
      onApiError(referenceError)
    }
  }, [referenceError, onApiError])

  // 1) Build the displayed actual series (gross or net):
  const actualSeries: ScatterDataPoint[] = rawSeries.map(pt => ({
    x: pt.x,
    y: displayNet ? calculateNetIncome(pt.x as number, pt.y as number) : (pt.y as number),
  }))

  // 2) Rescale the rawInflSeries so it starts at the *display* base pay:
  //    multiplier = rawInflAtYear / rawActualAtBaseYear
  //    then inflAtYear = multiplier * displayBasePay
  const inflSeries: ScatterDataPoint[] = useMemo(() => {
    if (rawSeries.length === 0 || rawInflSeries.length === 0) {
      return []
    }
    const baseGross = rawSeries[0].y as number
    const baseDisplay = actualSeries[0].y as number
    return rawInflSeries.map(pt => ({
      x: pt.x,
      y: ((pt.y as number) / baseGross) * baseDisplay,
    }))
  }, [rawSeries, rawInflSeries, actualSeries])

  // Reference series is already net/gross adjusted in the hook
  const referenceSeries: ScatterDataPoint[] = rawReferenceSeries

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingSpinner size="large" text={TEXT.common.loadingChart} />
      </div>
    )
  }

  if (payPoints.length < 2) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
        <p className="text-sm text-gray-500">{TEXT.charts.minPointsRequired}</p>
      </div>
    )
  }

  return (
    <ResponsiveChartWrapper
      actualSeries={actualSeries}
      inflSeries={inflSeries}
      referenceSeries={referenceSeries}
      yearRange={yearRange}
      displayNet={displayNet}
      occupation={occupation}
      className={className}
    />
  )
}
