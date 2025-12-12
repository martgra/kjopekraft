'use client'

import { memo } from 'react'
import PaypointChart from '@/features/visualization/components/PaypointChart'
import type { PayPoint } from '@/lib/models/types'
import type { InflationDataPoint } from '@/lib/models/inflation'
import { Badge } from '@/components/ui/atoms'
import { useReferenceMode } from '@/contexts/referenceMode/ReferenceModeContext'
import { TEXT } from '@/lib/constants/text'

interface ChartSectionProps {
  payPoints: PayPoint[]
  inflationData: InflationDataPoint[]
  isNetMode: boolean
  onToggleMode: () => void
}

function ChartSection({ payPoints, inflationData, isNetMode, onToggleMode }: ChartSectionProps) {
  const { isReferenceEnabled, toggleReference } = useReferenceMode()

  return (
    <div className="flex w-full flex-1 flex-col rounded-xl border border-[var(--border-light)] bg-[var(--surface-light)] shadow-sm">
      {/* Header */}
      <div className="border-b border-[var(--border-light)] px-4 py-3 md:px-6 md:py-4">
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
          {isReferenceEnabled && (
            <Badge variant="warning">{TEXT.referenceSalary.enabledBadge}</Badge>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="relative min-h-0 w-full flex-1 p-4 md:p-6">
        <PaypointChart payPoints={payPoints} inflationData={inflationData} displayNet={isNetMode} />
      </div>

      {/* Controls - Below Chart */}
      <div className="border-t border-[var(--border-light)] bg-[var(--surface-subtle)] px-4 py-3 md:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase md:text-sm">
            {TEXT.charts.controlsLabel}
          </span>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
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
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={isReferenceEnabled}
                onChange={toggleReference}
                className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-600"
              />
              <span className="text-sm font-medium text-[var(--text-main)]">
                {TEXT.referenceSalary.toggleLabel}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(ChartSection)
