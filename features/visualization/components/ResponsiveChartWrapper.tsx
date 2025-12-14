'use client'

import { useState, useEffect, useMemo } from 'react'
import type { ScatterDataPoint } from 'chart.js'
import type { OccupationKey } from '@/features/referenceSalary/occupations'
import type { PayPoint } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'
import MobilePayChart from './MobilePayChart'
import DesktopPayChart from './DesktopPayChart'
import { calculateEventBaselines } from '../utils/eventBaselines'

interface ResponsiveChartWrapperProps {
  actualSeries: ScatterDataPoint[]
  inflSeries: ScatterDataPoint[]
  referenceSeries: ScatterDataPoint[]
  yearRange: { minYear: number; maxYear: number }
  displayNet: boolean
  occupation?: OccupationKey
  className?: string
  payPoints: PayPoint[]
  inflationData: InflationDataPoint[]
  showEventBaselines?: boolean
}

export default function ResponsiveChartWrapper({
  actualSeries,
  inflSeries,
  referenceSeries,
  yearRange,
  displayNet,
  occupation,
  className = '',
  payPoints,
  inflationData,
  showEventBaselines = true,
}: ResponsiveChartWrapperProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Calculate event baselines for promotion/newJob events (only if enabled)
  const eventBaselines = useMemo(() => {
    if (!showEventBaselines || !payPoints.length || !inflationData.length) return []
    return calculateEventBaselines(payPoints, inflationData, yearRange.maxYear, displayNet)
  }, [showEventBaselines, payPoints, inflationData, yearRange.maxYear, displayNet])

  if (isMobile) {
    return (
      <MobilePayChart
        actualSeries={actualSeries}
        inflSeries={inflSeries}
        referenceSeries={referenceSeries}
        yearRange={yearRange}
        displayNet={displayNet}
        occupation={occupation}
        className={className}
        payPoints={payPoints}
        eventBaselines={eventBaselines}
      />
    )
  }

  return (
    <DesktopPayChart
      actualSeries={actualSeries}
      inflSeries={inflSeries}
      referenceSeries={referenceSeries}
      yearRange={yearRange}
      displayNet={displayNet}
      occupation={occupation}
      className={className}
      payPoints={payPoints}
      eventBaselines={eventBaselines}
    />
  )
}
