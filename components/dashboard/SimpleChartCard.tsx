'use client'

import { useMemo } from 'react'
import PaypointChart from '@/features/visualization/components/PaypointChart'
import { usePaypointChartData } from '@/features/salary/hooks/usePaypointChartData'
import { SERIF } from '@/lib/constants/designTokens'
import type { PayPoint } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'

interface SimpleChartCardProps {
  payPoints: PayPoint[]
  inflationData: InflationDataPoint[]
  currentYear: number
  isNetMode: boolean
  height?: number
  padding?: string
}

export default function SimpleChartCard({
  payPoints,
  inflationData,
  currentYear,
  isNetMode,
  height = 260,
  padding = '24px',
}: SimpleChartCardProps) {
  const {
    isLoading,
    actualSeries,
    inflSeries,
    referenceSeries,
    yearRange,
  } = usePaypointChartData(payPoints, inflationData, currentYear)

  const fallbackYearRange = useMemo(() => {
    if (yearRange) return yearRange
    if (!payPoints.length) return { minYear: currentYear - 1, maxYear: currentYear }
    const years = payPoints.map(p => p.year)
    return { minYear: Math.min(...years), maxYear: Math.max(...years) }
  }, [yearRange, payPoints, currentYear])

  return (
    <div style={{
      background: 'var(--card)',
      borderRadius: 'var(--radius-lg)',
      padding,
      border: '1px solid var(--line)',
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', fontFamily: SERIF }}>
            Lønnsutvikling
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 12, height: 2, background: 'var(--primary)', borderRadius: 1 }} />
              Nominell
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 12, height: 0, borderTop: '2px dashed var(--danger)' }} />
              Reell (inflasjonsjustert)
            </span>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', height, width: '100%', overflow: 'hidden' }}>
        <PaypointChart
          payPoints={payPoints}
          displayNet={isNetMode}
          grossActualSeries={actualSeries}
          grossInflationSeries={inflSeries}
          referenceSeries={referenceSeries}
          yearRange={fallbackYearRange}
          isLoading={isLoading}
          inflationData={inflationData}
          showEventBaselines={false}
        />
      </div>
    </div>
  )
}
