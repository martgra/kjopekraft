'use client'

import React, { useEffect, useRef, useState } from 'react'
import LoadingSpinner from '@/components/ui/common/LoadingSpinner'
import { TEXT } from '@/lib/constants/text'
import type { Chart as ChartJS, ScatterDataPoint } from 'chart.js'
import type { PayPoint } from '@/domain/salary'
import type { EventBaseline } from '../utils/eventBaselines'
import { buildPayChartConfig } from '../utils/payChartConfig'

type PayChartVariant = 'desktop' | 'mobile'

interface PayChartProps {
  variant: PayChartVariant
  actualSeries: ScatterDataPoint[]
  inflSeries: ScatterDataPoint[]
  referenceSeries: ScatterDataPoint[]
  yearRange: { minYear: number; maxYear: number }
  displayNet: boolean
  referenceLabel?: string
  className?: string
  payPoints: PayPoint[]
  eventBaselines: EventBaseline[]
}

export type PayChartBaseProps = Omit<PayChartProps, 'variant'>

type ChartModule = typeof import('chart.js')

let chartModulePromise: Promise<ChartModule> | null = null
let chartRegistered = false

async function loadChartJs() {
  if (!chartModulePromise) {
    chartModulePromise = import('chart.js')
  }
  const chartModule = await chartModulePromise
  if (!chartRegistered) {
    chartModule.Chart.register(
      chartModule.LineController,
      chartModule.LineElement,
      chartModule.PointElement,
      chartModule.LinearScale,
      chartModule.Title,
      chartModule.Tooltip,
      chartModule.Legend,
      chartModule.CategoryScale,
    )
    chartRegistered = true
  }
  return chartModule.Chart
}

export default function PayChart({
  variant,
  actualSeries,
  inflSeries,
  referenceSeries,
  yearRange,
  displayNet,
  referenceLabel,
  className = '',
  payPoints,
  eventBaselines,
}: PayChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<ChartJS<'line', ScatterDataPoint[], unknown> | null>(null)
  const [isChartReady, setIsChartReady] = useState(chartRegistered)

  useEffect(() => {
    let isActive = true
    if (!chartRegistered) {
      setIsChartReady(false)
    }

    const initChart = async () => {
      if (!canvasRef.current) return
      const ctx = canvasRef.current.getContext('2d')
      if (!ctx) return

      const Chart = await loadChartJs()
      if (!isActive) return

      const config = buildPayChartConfig({
        variant,
        actualSeries,
        inflSeries,
        referenceSeries,
        yearRange,
        displayNet,
        referenceLabel,
        payPoints,
        eventBaselines,
      })

      const instance = new Chart(ctx, config)
      chartRef.current = instance
      setIsChartReady(true)
    }

    initChart()

    return () => {
      isActive = false
      if (!chartRef.current) return
      chartRef.current.destroy()
      chartRef.current = null
    }
  }, [
    variant,
    actualSeries,
    inflSeries,
    referenceSeries,
    yearRange,
    displayNet,
    referenceLabel,
    payPoints,
    eventBaselines,
  ])

  return (
    <div className="relative">
      <canvas ref={canvasRef} className={className} style={{ touchAction: 'manipulation' }} />
      {!isChartReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="large" text={TEXT.common.loadingChart} />
        </div>
      )}
    </div>
  )
}
