'use client'

import { memo } from 'react'
import PaypointChart from '@/features/visualization/components/PaypointChart'
import type { PayPoint } from '@/lib/models/salary'
import type { InflationDataPoint } from '@/lib/models/inflation'
import { TEXT } from '@/lib/constants/text'

interface ChartSectionProps {
  payPoints: PayPoint[]
  inflationData: InflationDataPoint[]
  isNetMode: boolean
}

function ChartSection({ payPoints, inflationData, isNetMode }: ChartSectionProps) {
  return (
    <div className="flex w-full flex-1 flex-col rounded-xl border border-[var(--border-light)] bg-[var(--surface-light)] p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-main)]">{TEXT.charts.chartTitle}</h2>
          <p className="text-sm text-[var(--text-muted)]">{TEXT.charts.chartSubtitle}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative min-h-0 w-full flex-1">
        <PaypointChart payPoints={payPoints} inflationData={inflationData} displayNet={isNetMode} />
      </div>
    </div>
  )
}

export default memo(ChartSection)
