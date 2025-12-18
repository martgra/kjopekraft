import type { ChartConfiguration, ScatterDataPoint } from 'chart.js'
import type { PayPoint } from '@/domain/salary'
import { TEXT } from '@/lib/constants/text'
import { createReasonMarkerPlugin } from './chartMarkers'
import type { EventBaseline } from './eventBaselines'

type PayChartVariant = 'desktop' | 'mobile'

interface PayChartConfigOptions {
  variant: PayChartVariant
  actualSeries: ScatterDataPoint[]
  inflSeries: ScatterDataPoint[]
  referenceSeries: ScatterDataPoint[]
  yearRange: { minYear: number; maxYear: number }
  displayNet: boolean
  referenceLabel?: string
  payPoints: PayPoint[]
  eventBaselines: EventBaseline[]
}

export function buildPayChartConfig({
  variant,
  actualSeries,
  inflSeries,
  referenceSeries,
  yearRange,
  displayNet,
  referenceLabel,
  payPoints,
  eventBaselines,
}: PayChartConfigOptions): ChartConfiguration<'line', ScatterDataPoint[], unknown> {
  const isMobile = variant === 'mobile'
  const markerFontSize = isMobile ? 16 : 20

  const resolvedReferenceLabel = referenceLabel ?? 'Referanse'
  const reasonMap = new Map(payPoints.map(p => [p.year, p.reason]))
  const markerPlugin = createReasonMarkerPlugin(payPoints, markerFontSize)

  const inflationLabel = isMobile ? TEXT.charts.inflationLabel : TEXT.charts.inflationAdjustedLabel

  const actualDataset = {
    label: displayNet ? TEXT.charts.showNet : TEXT.charts.showGross,
    data: actualSeries,
    tension: 0.4,
    fill: true,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3b82f6',
    borderWidth: isMobile ? 2 : 3,
    pointRadius: isMobile ? 4 : 5,
    pointHoverRadius: isMobile ? 6 : 7,
    spanGaps: true,
  }

  const inflationDataset = {
    label: inflationLabel,
    data: inflSeries,
    tension: 0.4,
    fill: true,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10b981',
    borderWidth: isMobile ? 2 : 3,
    pointRadius: isMobile ? 4 : 5,
    pointHoverRadius: isMobile ? 6 : 7,
    spanGaps: true,
    borderDash: [5, 5],
  }

  const referenceDataset = referenceSeries.length
    ? [
        {
          label: resolvedReferenceLabel,
          data: referenceSeries,
          tension: 0.4,
          fill: false,
          backgroundColor: 'transparent',
          borderColor: '#f59e0b',
          borderWidth: 2,
          pointRadius: isMobile ? 3 : 4,
          pointHoverRadius: isMobile ? 5 : 6,
          spanGaps: true,
          borderDash: [3, 3],
        },
      ]
    : []

  const eventBaselineDatasets = eventBaselines.map(baseline => ({
    label: baseline.label,
    data: baseline.data,
    tension: 0.3,
    fill: false,
    backgroundColor: 'transparent',
    borderColor: baseline.reason === 'promotion' ? '#9333ea' : '#dc2626',
    borderWidth: isMobile ? 1.5 : 2,
    pointRadius: 0,
    pointHoverRadius: isMobile ? 3 : 4,
    spanGaps: true,
    borderDash: isMobile ? [6, 3] : [8, 4],
  }))

  return {
    type: 'line',
    plugins: [markerPlugin],
    data: {
      datasets: [actualDataset, inflationDataset, ...referenceDataset, ...eventBaselineDatasets],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: isMobile ? { top: 5, bottom: 0, left: 0, right: 0 } : { top: 10 },
      },
      scales: {
        x: {
          type: 'linear',
          min: yearRange.minYear,
          max: yearRange.maxYear,
          ticks: {
            stepSize: 1,
            precision: 0,
            font: { size: isMobile ? 10 : 12 },
            maxRotation: 0,
            autoSkipPadding: isMobile ? 15 : 10,
            callback: value => String(value),
          },
          title: {
            display: !isMobile,
            text: TEXT.charts.xAxisLabel,
            font: { size: 12 },
          },
          grid: {
            display: !isMobile,
            drawOnChartArea: !isMobile,
          },
        },
        y: {
          beginAtZero: false,
          ticks: {
            callback: v =>
              typeof v === 'number'
                ? isMobile
                  ? `${Math.round(v / 1000)}k`
                  : v.toLocaleString('nb-NO')
                : '',
            font: { size: isMobile ? 10 : 12 },
            maxTicksLimit: isMobile ? 5 : 8,
          },
          title: {
            display: false,
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
            drawTicks: !isMobile,
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
          padding: isMobile ? 8 : 12,
          bodyFont: { size: isMobile ? 12 : 13 },
          titleFont: { size: isMobile ? 12 : 14, weight: 'bold' },
          displayColors: isMobile,
          callbacks: {
            title: items => {
              const year = items[0]?.parsed.x ?? ''
              return isMobile ? `År: ${year}` : TEXT.charts.yearPrefix + year
            },
            label: ctx => {
              const year = ctx.parsed.x ?? 0
              const reason = reasonMap.get(year)
              const reasonText = reason ? ` (${TEXT.activity.reasons[reason]})` : ''
              const label = isMobile ? ctx.dataset.label?.split(' ')[0] : ctx.dataset.label
              return `${label}: ${ctx.parsed.y?.toLocaleString('nb-NO', {
                maximumFractionDigits: 0,
              })}${reasonText}`
            },
          },
        },
        legend: {
          display: true,
          position: 'top',
          align: isMobile ? 'start' : 'center',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            padding: isMobile ? 6 : 15,
            font: { size: isMobile ? 10 : 12 },
            boxWidth: isMobile ? 5 : 8,
            boxHeight: isMobile ? 5 : 8,
          },
        },
        title: {
          display: false,
        },
      },
    },
  }
}
