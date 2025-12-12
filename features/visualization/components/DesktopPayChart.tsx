'use client'

import React, { useEffect, useRef } from 'react'
import Chart from '@/lib/chartjs'
import type { ChartConfiguration, ScatterDataPoint } from 'chart.js'
import { TEXT } from '@/lib/constants/text'

interface DesktopPayChartProps {
  actualSeries: ScatterDataPoint[]
  inflSeries: ScatterDataPoint[]
  referenceSeries: ScatterDataPoint[]
  yearRange: { minYear: number; maxYear: number }
  displayNet: boolean
  className?: string
}

export default function DesktopPayChart({
  actualSeries,
  inflSeries,
  referenceSeries,
  yearRange,
  displayNet,
  className = '',
}: DesktopPayChartProps) {
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
                  label: TEXT.referenceSalary?.chartLabel ?? 'Referanse',
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
              title: items => TEXT.charts.yearPrefix + items[0].parsed.x,
              label: ctx => {
                return `${ctx.dataset.label}: ${ctx.parsed.y?.toLocaleString('nb-NO', {
                  maximumFractionDigits: 0,
                })}`
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
  }, [actualSeries, inflSeries, referenceSeries, yearRange, displayNet])

  return <canvas ref={canvasRef} className={className} />
}
