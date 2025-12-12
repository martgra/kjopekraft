'use client'

import { memo } from 'react'
import PaypointChart from '@/features/visualization/components/PaypointChart'
import type { PayPoint } from '@/lib/models/types'
import type { InflationDataPoint } from '@/lib/models/inflation'
import { Badge } from '@/components/ui/atoms'
import { TEXT } from '@/lib/constants/text'

interface ChartSectionProps {
  payPoints: PayPoint[]
  inflationData: InflationDataPoint[]
  isNetMode: boolean
  onToggleMode: () => void
}

function ChartSection({ payPoints, inflationData, isNetMode, onToggleMode }: ChartSectionProps) {
  return (
    <div className="flex w-full flex-1 flex-col rounded-xl border border-[var(--border-light)] bg-[var(--surface-light)] p-4 shadow-sm md:p-6">
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 md:mb-4 md:gap-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div>
            <h2 className="text-base font-bold text-[var(--text-main)] md:text-lg">
              {TEXT.charts.chartTitle}
            </h2>
            <p className="hidden text-sm text-[var(--text-muted)] md:block">
              {TEXT.charts.chartSubtitle}
            </p>
          </div>
          <Badge variant={isNetMode ? 'info' : 'default'}>
            {isNetMode ? TEXT.charts.modeBadgeNet : TEXT.charts.modeBadgeGross}
          </Badge>
        </div>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={isNetMode}
            onChange={onToggleMode}
            className="h-4 w-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
          />
          <span className="text-sm font-medium text-[var(--text-main)]">
            {TEXT.charts.modeToggleLabel}
          </span>
        </label>
      </div>

      {/* Chart */}
      <div className="relative min-h-0 w-full flex-1">
        <PaypointChart payPoints={payPoints} inflationData={inflationData} displayNet={isNetMode} />
      </div>
    </div>
  )
}

export default memo(ChartSection)
