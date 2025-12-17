'use client'

import React, { useEffect, useRef } from 'react'
import Chart from '@/lib/chartjs'
import type { ScatterDataPoint } from 'chart.js'
import type { OccupationKey } from '@/features/referenceSalary/occupations'
import type { PayPoint } from '@/domain/salary'
import type { EventBaseline } from '../utils/eventBaselines'
import { buildPayChartConfig } from '../utils/payChartConfig'

type PayChartVariant = 'desktop' | 'mobile'

export interface PayChartProps {
  variant: PayChartVariant
  actualSeries: ScatterDataPoint[]
  inflSeries: ScatterDataPoint[]
  referenceSeries: ScatterDataPoint[]
  yearRange: { minYear: number; maxYear: number }
  displayNet: boolean
  occupation?: OccupationKey
  className?: string
  payPoints: PayPoint[]
  eventBaselines: EventBaseline[]
}

export type PayChartBaseProps = Omit<PayChartProps, 'variant'>

export default function PayChart({
  variant,
  actualSeries,
  inflSeries,
  referenceSeries,
  yearRange,
  displayNet,
  occupation,
  className = '',
  payPoints,
  eventBaselines,
}: PayChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart<'line', ScatterDataPoint[], unknown> | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    const config = buildPayChartConfig({
      variant,
      actualSeries,
      inflSeries,
      referenceSeries,
      yearRange,
      displayNet,
      occupation,
      payPoints,
      eventBaselines,
    })

    const instance = new Chart(ctx, config)
    chartRef.current = instance
    return () => {
      instance.destroy()
      chartRef.current = null
    }
  }, [
    variant,
    actualSeries,
    inflSeries,
    referenceSeries,
    yearRange,
    displayNet,
    occupation,
    payPoints,
    eventBaselines,
  ])

  return <canvas ref={canvasRef} className={className} />
}
