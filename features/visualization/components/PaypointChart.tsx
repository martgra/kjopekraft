'use client'

import React, { useMemo } from 'react'
import LoadingSpinner from '@/components/ui/common/LoadingSpinner'
import { calculateNetIncome } from '@/features/tax/taxCalculator'
import type { PayPoint, YearRange } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'
import type { ScatterDataPoint } from 'chart.js'
import type { OccupationKey } from '@/features/referenceSalary/occupations'
import { TEXT } from '@/lib/constants/text'
import ResponsiveChartWrapper from './ResponsiveChartWrapper'

interface PaypointChartProps {
  payPoints: PayPoint[]
  displayNet: boolean
  grossActualSeries: ScatterDataPoint[]
  grossInflationSeries: ScatterDataPoint[]
  referenceSeries: ScatterDataPoint[]
  yearRange: YearRange
  className?: string
  isLoading?: boolean
  occupation?: OccupationKey
  inflationData: InflationDataPoint[]
  showEventBaselines?: boolean
}

export default function PaypointChart({
  payPoints,
  displayNet,
  grossActualSeries,
  grossInflationSeries,
  referenceSeries: rawReferenceSeries,
  yearRange,
  className = '',
  isLoading = false,
  occupation,
  inflationData,
  showEventBaselines = true,
}: PaypointChartProps) {
  // 1) Build the displayed actual series (gross or net):
  const actualSeries: ScatterDataPoint[] = grossActualSeries.map(pt => ({
    x: pt.x,
    y: displayNet ? calculateNetIncome(pt.x as number, pt.y as number) : (pt.y as number),
  }))

  // 2) Rescale the rawInflSeries so it starts at the *display* base pay:
  //    multiplier = rawInflAtYear / rawActualAtBaseYear
  //    then inflAtYear = multiplier * displayBasePay
  const inflSeries: ScatterDataPoint[] = useMemo(() => {
    if (grossActualSeries.length === 0 || grossInflationSeries.length === 0) {
      return []
    }
    const firstRaw = grossActualSeries[0]
    const firstActual = actualSeries[0]
    if (!firstRaw || !firstActual) return []
    const baseGross = firstRaw.y as number
    const baseDisplay = firstActual.y as number
    return grossInflationSeries.map(pt => ({
      x: pt.x,
      y: ((pt.y as number) / baseGross) * baseDisplay,
    }))
  }, [grossActualSeries, grossInflationSeries, actualSeries])

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
      referenceSeries={rawReferenceSeries}
      yearRange={yearRange}
      displayNet={displayNet}
      occupation={occupation}
      className={className}
      payPoints={payPoints}
      inflationData={inflationData}
      showEventBaselines={showEventBaselines}
    />
  )
}
