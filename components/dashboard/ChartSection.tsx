'use client'

import { memo, useState } from 'react'
import PaypointChart from '@/features/visualization/components/PaypointChart'
import type { PayPoint } from '@/lib/models/types'
import type { InflationDataPoint } from '@/lib/models/inflation'
import { Select, Toggle } from '@/components/ui/atoms'
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
      <div className="border-b border-[var(--border-light)] px-3 py-2.5 md:px-6 md:py-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <h2 className="flex flex-wrap items-center gap-2 text-base font-semibold text-[var(--text-main)] md:gap-3 md:text-lg">
              <span className="whitespace-nowrap">{TEXT.charts.chartTitle}</span>
              <Toggle
                checked={isNetMode}
                onChange={onToggleMode}
                label={isNetMode ? TEXT.charts.modeBadgeNet : TEXT.charts.modeBadgeGross}
                className="scale-90 md:scale-100"
              />
            </h2>
            <p className="mt-1 hidden text-sm text-[var(--text-muted)] md:block">
              {TEXT.charts.chartSubtitle}
            </p>
          </div>
          {/* Compact Occupation Selector */}
          <div className="w-full md:w-auto md:min-w-[200px]">
            <Select
              id="reference-occupation"
              value={selectedOccupation}
              onChange={handleOccupationChange}
              className="text-xs md:text-sm"
            >
              <option value={DEFAULT_OCCUPATION}>
                {OCCUPATIONS[DEFAULT_OCCUPATION].label} (Gj.snitt)
              </option>
              <option value="none">Ingen referanse</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative min-h-0 w-full flex-1 p-2 md:p-6">
        <PaypointChart payPoints={payPoints} inflationData={inflationData} displayNet={isNetMode} />
      </div>
    </div>
  )
}

export default memo(ChartSection)
