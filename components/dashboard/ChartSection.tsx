'use client'

import { useState } from 'react'
import TimeRangeToggle, { type TimeRange } from './TimeRangeToggle'
import PaypointChart from '@/features/visualization/components/PaypointChart'
import type { PayPoint } from '@/lib/models/salary'
import type { InflationDataPoint } from '@/lib/models/inflation'

interface ChartSectionProps {
  payPoints: PayPoint[]
  inflationData: InflationDataPoint[]
  isNetMode: boolean
}

export default function ChartSection({ payPoints, inflationData, isNetMode }: ChartSectionProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y')

  // Filter payPoints based on time range
  const currentYear = new Date().getFullYear()
  const yearsToInclude = timeRange === '1Y' ? 1 : timeRange === '3Y' ? 3 : 999
  const cutoffYear = timeRange === 'ALL' ? 0 : currentYear - yearsToInclude

  const filteredPayPoints = payPoints.filter(p => p.year >= cutoffYear)

  return (
    <div className="flex min-h-[400px] flex-1 flex-col rounded-xl border border-[var(--border-light)] bg-[var(--surface-light)] p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-main)]">
            Yearly Salary Growth vs. Inflation
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Tracking your annual salary points against real purchasing power.
          </p>
        </div>

        {/* Time Range Toggle */}
        <TimeRangeToggle selected={timeRange} onChange={setTimeRange} />
      </div>

      {/* Chart */}
      <div className="relative flex w-full flex-1 flex-col">
        <PaypointChart
          payPoints={filteredPayPoints}
          inflationData={inflationData}
          displayNet={isNetMode}
        />
      </div>
    </div>
  )
}
