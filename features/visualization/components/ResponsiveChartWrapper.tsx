'use client'

import { useState, useEffect } from 'react'
import type { ScatterDataPoint } from 'chart.js'
import MobilePayChart from './MobilePayChart'
import DesktopPayChart from './DesktopPayChart'

interface ResponsiveChartWrapperProps {
  actualSeries: ScatterDataPoint[]
  inflSeries: ScatterDataPoint[]
  referenceSeries: ScatterDataPoint[]
  yearRange: { minYear: number; maxYear: number }
  displayNet: boolean
  className?: string
}

export default function ResponsiveChartWrapper({
  actualSeries,
  inflSeries,
  referenceSeries,
  yearRange,
  displayNet,
  className = '',
}: ResponsiveChartWrapperProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (isMobile) {
    return (
      <MobilePayChart
        actualSeries={actualSeries}
        inflSeries={inflSeries}
        referenceSeries={referenceSeries}
        yearRange={yearRange}
        displayNet={displayNet}
        className={className}
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
      className={className}
    />
  )
}
