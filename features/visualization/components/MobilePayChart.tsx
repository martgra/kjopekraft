'use client'

import React, { useEffect, useRef } from 'react'
import Chart from '@/lib/chartjs'
import type { ChartConfiguration, ScatterDataPoint } from 'chart.js'
import { TEXT } from '@/lib/constants/text'

interface MobilePayChartProps {
  actualSeries: ScatterDataPoint[]
  inflSeries: ScatterDataPoint[]
  yearRange: { minYear: number; maxYear: number }
  displayNet: boolean
  className?: string
}

export default function MobilePayChart({
  actualSeries,
  inflSeries,
  yearRange,
  displayNet,
  className = '',
}: MobilePayChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart<'line', ScatterDataPoint[], unknown> | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
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
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            spanGaps: true,
          },
          {
            label: TEXT.charts.inflationLabel,
            data: inflSeries,
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: '#10b981',
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            spanGaps: true,
            borderDash: [5, 5],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { top: 10, bottom: 5, left: 5, right: 5 },
        },
        scales: {
          x: {
            type: 'linear',
            min: yearRange.minYear,
            max: yearRange.maxYear,
            ticks: {
              stepSize: 1,
              precision: 0,
              font: { size: 10 },
              maxRotation: 0,
              autoSkipPadding: 15,
            },
            title: {
              display: false,
            },
            grid: {
              display: false,
              drawOnChartArea: false,
            },
          },
          y: {
            beginAtZero: false,
            ticks: {
              callback: v => (typeof v === 'number' ? `${Math.round(v / 1000)}k` : ''),
              font: { size: 10 },
              maxTicksLimit: 5,
            },
            title: {
              display: false,
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              drawTicks: false,
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
            padding: 8,
            bodyFont: { size: 12 },
            titleFont: { size: 12, weight: 'bold' },
            displayColors: true,
            callbacks: {
              title: items => `År: ${items[0].parsed.x}`,
              label: ctx => {
                const label = ctx.dataset.label?.split(' ')[0]
                return `${label}: ${ctx.parsed.y?.toLocaleString('nb-NO', {
                  maximumFractionDigits: 0,
                })}`
              },
            },
          },
          legend: {
            display: true,
            position: 'top',
            align: 'start',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 8,
              font: { size: 11 },
              boxWidth: 6,
              boxHeight: 6,
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
  }, [actualSeries, inflSeries, yearRange, displayNet])

  return <canvas ref={canvasRef} className={className} />
}
