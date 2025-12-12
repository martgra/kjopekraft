'use client'

import { memo, useState } from 'react'
import PaypointChart from '@/features/visualization/components/PaypointChart'
import type { PayPoint } from '@/lib/models/types'
import type { InflationDataPoint } from '@/lib/models/inflation'
import { Badge, Select, Toggle } from '@/components/ui/atoms'
import { useReferenceMode } from '@/contexts/referenceMode/ReferenceModeContext'
import { TEXT } from '@/lib/constants/text'
import { OCCUPATIONS, DEFAULT_OCCUPATION } from '@/features/referenceSalary/occupations'

interface ChartSectionProps {
  payPoints: PayPoint[]
  inflationData: InflationDataPoint[]
  isNetMode: boolean
  onToggleMode: () => void
}

function ChartSection({ payPoints, inflationData, isNetMode, onToggleMode }: ChartSectionProps) {
  const { isReferenceEnabled, toggleReference } = useReferenceMode()
  const [selectedOccupation, setSelectedOccupation] = useState('none')

  const handleOccupationChange = (value: string) => {
    setSelectedOccupation(value)
    // Toggle reference based on selection
    if (value === 'none' && isReferenceEnabled) {
      toggleReference()
    } else if (value !== 'none' && !isReferenceEnabled) {
      toggleReference()
    }
  }

  return (
    <div className="flex w-full flex-1 flex-col rounded-xl border border-[var(--border-light)] bg-[var(--surface-light)] shadow-sm">
      {/* Header */}
      <div className="border-b border-[var(--border-light)] px-4 py-4 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--text-main)] md:gap-3 md:text-lg">
              {TEXT.charts.chartTitle}
              <Badge variant="info" size="sm">
                {isNetMode ? TEXT.charts.modeBadgeNet : TEXT.charts.modeBadgeGross}
              </Badge>
              {isReferenceEnabled && (
                <Badge variant="warning" size="sm">
                  {TEXT.referenceSalary.enabledBadge}
                </Badge>
              )}
            </h2>
            <p className="mt-1 hidden text-sm text-[var(--text-muted)] md:block">
              {TEXT.charts.chartSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative min-h-0 w-full flex-1 p-4 md:p-6">
        <PaypointChart payPoints={payPoints} inflationData={inflationData} displayNet={isNetMode} />
      </div>

      {/* Controls - Below Chart */}
      <div className="border-t border-[var(--border-light)] bg-gray-50 px-3 py-3 md:px-6 md:py-4">
        <div className="flex flex-col gap-3 md:gap-4">
          {/* Title */}
          <span className="text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase">
            {TEXT.charts.controlsLabel}
          </span>

          {/* Controls Grid */}
          <div className="flex flex-col gap-3 md:gap-4">
            {/* Occupation Selector */}
            <div className="flex flex-col gap-2">
              <label
                className="text-xs font-medium text-gray-700 md:text-sm"
                htmlFor="reference-occupation"
              >
                {TEXT.charts.compareWithOccupation}
              </label>
              <div className="w-full">
                <Select
                  id="reference-occupation"
                  value={selectedOccupation}
                  onChange={handleOccupationChange}
                >
                  <option value={DEFAULT_OCCUPATION}>
                    {OCCUPATIONS[DEFAULT_OCCUPATION].label} (Gjennomsnitt)
                  </option>
                  <option value="none">Ingen referanse</option>
                </Select>
              </div>
            </div>

            {/* Toggle Controls */}
            <div className="flex flex-col gap-2.5">
              <Toggle
                checked={isNetMode}
                onChange={onToggleMode}
                label={TEXT.charts.modeToggleLabel}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(ChartSection)
