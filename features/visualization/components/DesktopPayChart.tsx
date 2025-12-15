'use client'

import React, { useEffect, useRef } from 'react'
import Chart from '@/lib/chartjs'
import type { ChartConfiguration, ScatterDataPoint } from 'chart.js'
import type { OccupationKey } from '@/features/referenceSalary/occupations'
import type { PayPoint } from '@/domain/salary'
import { OCCUPATIONS } from '@/features/referenceSalary/occupations'
import { TEXT } from '@/lib/constants/text'
import { createReasonMarkerPlugin } from '../utils/chartMarkers'
import type { EventBaseline } from '../utils/eventBaselines'

interface DesktopPayChartProps {
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

export default function DesktopPayChart({
  actualSeries,
  inflSeries,
  referenceSeries,
  yearRange,
  displayNet,
  occupation,
  className = '',
  payPoints,
  eventBaselines,
}: DesktopPayChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart<'line', ScatterDataPoint[], unknown> | null>(null)

  // Generate dynamic reference label
  const referenceLabel = occupation ? `Referanse (${OCCUPATIONS[occupation].label})` : 'Referanse'

  useEffect(() => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    // Create year → reason map for tooltips
    const reasonMap = new Map(payPoints.map(p => [p.year, p.reason]))

    // Create emoji marker plugin
    const markerPlugin = createReasonMarkerPlugin(payPoints, 20)

    const config: ChartConfiguration<'line', ScatterDataPoint[], unknown> = {
      type: 'line',
      plugins: [markerPlugin],
      data: {
        datasets: [
          {
            label: displayNet ? TEXT.charts.showNet : TEXT.charts.showGross,
            data: actualSeries,
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: '#3b82f6',
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 7,
            spanGaps: true,
          },
          {
            label: TEXT.charts.inflationAdjustedLabel,
            data: inflSeries,
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: '#10b981',
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 7,
            spanGaps: true,
            borderDash: [5, 5],
          },
          ...(referenceSeries.length > 0
            ? [
                {
                  label: referenceLabel,
                  data: referenceSeries,
                  tension: 0.4,
                  fill: false,
                  backgroundColor: 'transparent',
                  borderColor: '#f59e0b',
                  borderWidth: 2,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  spanGaps: true,
                  borderDash: [3, 3],
                },
              ]
            : []),
          // Event baselines for promotion/newJob events
          ...eventBaselines.map(baseline => ({
            label: baseline.label,
            data: baseline.data,
            tension: 0.3,
            fill: false,
            backgroundColor: 'transparent',
            borderColor: baseline.reason === 'promotion' ? '#9333ea' : '#dc2626',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            spanGaps: true,
            borderDash: [8, 4],
          })),
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { top: 10 },
        },
        scales: {
          x: {
            type: 'linear',
            min: yearRange.minYear,
            max: yearRange.maxYear,
            ticks: {
              stepSize: 1,
              precision: 0,
              font: { size: 12 },
              maxRotation: 0,
              autoSkipPadding: 10,
              callback: value => String(value),
            },
            title: {
              display: true,
              text: TEXT.charts.xAxisLabel,
              font: { size: 12 },
            },
            grid: {
              display: true,
              drawOnChartArea: true,
            },
          },
          y: {
            beginAtZero: false,
            ticks: {
              callback: v => (typeof v === 'number' ? v.toLocaleString('nb-NO') : ''),
              font: { size: 12 },
              maxTicksLimit: 8,
            },
            title: {
              display: false,
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              drawTicks: true,
            },
          },
        },
        plugins: {
          tooltip: {
            mode: 'point',
            intersect: true,
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 12,
            bodyFont: { size: 13 },
            titleFont: { size: 14, weight: 'bold' },
            displayColors: false,
            callbacks: {
              title: items => TEXT.charts.yearPrefix + (items[0]?.parsed.x ?? ''),
              label: ctx => {
                const year = ctx.parsed.x ?? 0
                const reason = reasonMap.get(year)
                const reasonText = reason ? ` (${TEXT.activity.reasons[reason]})` : ''
                return `${ctx.dataset.label}: ${ctx.parsed.y?.toLocaleString('nb-NO', {
                  maximumFractionDigits: 0,
                })}${reasonText}`
              },
            },
          },
          legend: {
            display: true,
            position: 'top',
            align: 'center',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 15,
              font: { size: 12 },
              boxWidth: 8,
              boxHeight: 8,
            },
          },
          title: {
            display: false,
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
  }, [
    actualSeries,
    inflSeries,
    referenceSeries,
    yearRange,
    displayNet,
    referenceLabel,
    payPoints,
    eventBaselines,
  ])

  return <canvas ref={canvasRef} className={className} />
}
