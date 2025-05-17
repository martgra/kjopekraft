// components/charts/PaypointChart.tsx
'use client'

import React, { useEffect, useRef } from 'react'
import Chart from '@/lib/chartjs'
import type { ChartConfiguration, ScatterDataPoint } from 'chart.js'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { PayPoint } from '@/lib/models/salary'
import { InflationDataPoint } from '@/lib/models/inflation'
import { usePaypointChartData } from '@/features/paypoints/hooks/usePaypointChartData'

interface PaypointChartProps {
  payPoints: PayPoint[]
  inflationData: InflationDataPoint[]
  className?: string
}

export default function PaypointChart({
  payPoints,
  inflationData,
  className = '',
}: PaypointChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart<'line', ScatterDataPoint[], unknown> | null>(null)

  const { isLoading, actualSeries, inflSeries, yearRange } = usePaypointChartData(
    payPoints,
    inflationData,
  )

  useEffect(() => {
    if (isLoading || payPoints.length < 2 || !canvasRef.current) return

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    // Build typed chart config
    const config: ChartConfiguration<'line', ScatterDataPoint[], unknown> = {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Faktisk lønn',
            data: actualSeries,
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: '#3b82f6',
            spanGaps: true,
          },
          {
            label: 'Inflasjonsjustert',
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
        layout: {
          padding: { top: 8, right: 16, bottom: 8, left: 16 },
        },
        scales: {
          x: {
            type: 'linear',
            min: yearRange.minYear,
            max: yearRange.maxYear,
            ticks: { stepSize: 1, precision: 0 },
            title: { display: true, text: 'År' },
          },
          y: {
            beginAtZero: false,
            ticks: {
              callback: v => (typeof v === 'number' ? v.toLocaleString('nb-NO') : ''),
            },
            title: { display: true, text: 'Lønn (NOK)' },
          },
        },
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              title: items => `År: ${items[0].parsed.x}`,
              label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y?.toLocaleString('nb-NO')} NOK`,
            },
          },
          legend: { position: 'top', align: 'center' },
          title: {
            display: true,
            text: 'Lønnsutvikling vs. Inflasjon',
            font: { size: 16, weight: 'bold' },
            padding: { top: 0, bottom: 8 },
          },
        },
      },
    }

    // Capture this chart instance for stable cleanup
    const instance = new Chart(ctx, config)
    chartRef.current = instance

    return () => {
      instance.destroy()
      chartRef.current = null
    }
  }, [isLoading, actualSeries, inflSeries, yearRange, payPoints.length])

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingSpinner size="large" text="Laster graf…" />
      </div>
    )
  }

  if (payPoints.length < 2) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
        <p className="text-sm text-gray-500">Legg til minst to lønnspunkter for å vise graf.</p>
      </div>
    )
  }

  return <canvas ref={canvasRef} className={className} />
}
