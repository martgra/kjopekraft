'use client'

import React, { useMemo } from 'react'
import LoadingSpinner from '@/components/ui/common/LoadingSpinner'
import { calculateNetIncome } from '@/domain/tax'
import type { PayPoint, YearRange } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'
import type { ScatterDataPoint } from 'chart.js'
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
  referenceLabel?: string
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
  referenceLabel,
  inflationData,
  showEventBaselines = false,
}: PaypointChartProps) {
  // 1) Build the displayed actual series (gross or net):
  const actualSeries: ScatterDataPoint[] = useMemo(
    () =>
      grossActualSeries.map(pt => ({
        x: pt.x,
        y: displayNet ? calculateNetIncome(pt.y as number, pt.x as number) : (pt.y as number),
      })),
    [grossActualSeries, displayNet],
  )

  // 2) Rescale the rawInflSeries so it starts at the *display* base pay:
  //    multiplier = rawInflAtYear / rawActualAtBaseYear
  //    then inflAtYear = multiplier * displayBasePay
  const inflSeries: ScatterDataPoint[] = useMemo(() => {
    if (grossInflationSeries.length === 0) {
      return []
    }
    const basePoint = grossInflationSeries[0]
    if (!basePoint) return []
    const baseGross = basePoint.y as number
    const baseYear = basePoint.x as number
    const baseDisplay = displayNet ? calculateNetIncome(baseGross, baseYear) : baseGross
    if (!Number.isFinite(baseGross) || baseGross <= 0 || !Number.isFinite(baseDisplay)) {
      return []
    }
    return grossInflationSeries.map(pt => ({
      x: pt.x,
      y: ((pt.y as number) / baseGross) * baseDisplay,
    }))
  }, [grossInflationSeries, displayNet])

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
      referenceLabel={referenceLabel}
      className={className}
      payPoints={payPoints}
      inflationData={inflationData}
      showEventBaselines={showEventBaselines}
    />
  )
}
