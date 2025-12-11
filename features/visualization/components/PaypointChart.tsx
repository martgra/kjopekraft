'use client'

import React, { useEffect, useRef, useMemo } from 'react'
import Chart from '@/lib/chartjs'
import type { ChartConfiguration, ScatterDataPoint } from 'chart.js'
import LoadingSpinner from '@/components/ui/common/LoadingSpinner'
import { calculateNetIncome } from '@/features/tax/taxCalculator'
import { usePaypointChartData } from '@/features/salary/hooks/usePaypointChartData'
import type { PayPoint } from '@/lib/models/types'
import type { InflationDataPoint } from '@/lib/models/inflation'
import { TEXT } from '@/lib/constants/text'

interface PaypointChartProps {
  payPoints: PayPoint[]
  inflationData: InflationDataPoint[]
  displayNet: boolean
  className?: string
}

export default function PaypointChart({
  payPoints,
  inflationData,
  displayNet,
  className = '',
}: PaypointChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart<'line', ScatterDataPoint[], unknown> | null>(null)

  // Grab the raw (gross) series from your hook
  const {
    isLoading,
    actualSeries: rawSeries,
    inflSeries: rawInflSeries,
    yearRange,
  } = usePaypointChartData(payPoints, inflationData)

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

  useEffect(() => {
    if (isLoading || payPoints.length < 2 || !canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    const config: ChartConfiguration<'line', ScatterDataPoint[], unknown> = {
      type: 'line',
      data: {
        datasets: [
          {
            label: displayNet ? TEXT.charts.showNet : TEXT.charts.showGross,
            data: actualSeries,
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: '#3b82f6',
            spanGaps: true,
          },
          {
            label: TEXT.charts.inflationAdjustedLabel,
            data: inflSeries,
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: '#10b981',
            spanGaps: true,
            borderDash: [5, 5],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'linear',
            min: yearRange.minYear,
            max: yearRange.maxYear,
            ticks: { stepSize: 1, precision: 0 },
            title: { display: true, text: TEXT.charts.xAxisLabel },
          },
          y: {
            beginAtZero: false,
            ticks: {
              callback: v => (typeof v === 'number' ? v.toLocaleString('nb-NO') : ''),
            },
            title: { display: true, text: TEXT.charts.yAxisLabel },
          },
        },
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              title: items => TEXT.charts.yearPrefix + items[0].parsed.x,
              label: ctx =>
                `${ctx.dataset.label}: ${ctx.parsed.y?.toLocaleString(
                  'nb-NO',
                )} ${TEXT.common.currency}`,
            },
          },
          legend: { position: 'top', align: 'center' },
          title: {
            display: true,
            text: TEXT.charts.payDevelopmentTitle,
            font: { size: 16, weight: 'bold' },
            padding: { top: 0, bottom: 8 },
          },
        },
      },
    }

    const instance = new Chart(ctx, config)
    chartRef.current = instance
    return () => {
      instance.destroy()
      chartRef.current = null
    }
  }, [isLoading, actualSeries, inflSeries, yearRange, payPoints.length, displayNet])

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

  return <canvas ref={canvasRef} className={className} />
}
