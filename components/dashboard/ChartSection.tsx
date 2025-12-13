'use client'

import { memo, useState, useEffect } from 'react'
import PaypointChart from '@/features/visualization/components/PaypointChart'
import type { PayPoint } from '@/lib/models/types'
import type { InflationDataPoint } from '@/lib/models/inflation'
import { Select, SelectOption, Toggle } from '@/components/ui/atoms'
import { useReferenceMode } from '@/contexts/referenceMode/ReferenceModeContext'
import { TEXT } from '@/lib/constants/text'
import {
  OCCUPATIONS,
  DEFAULT_OCCUPATION,
  type OccupationKey,
} from '@/features/referenceSalary/occupations'

interface ChartSectionProps {
  payPoints: PayPoint[]
  inflationData: InflationDataPoint[]
  isNetMode: boolean
  onToggleMode: () => void
}

function ChartSection({ payPoints, inflationData, isNetMode, onToggleMode }: ChartSectionProps) {
  const { isReferenceEnabled, toggleReference } = useReferenceMode()
  const [selectedOccupation, setSelectedOccupation] = useState<OccupationKey | 'none'>('none')
  const [apiError, setApiError] = useState<string | null>(null)

  const handleOccupationChange = (value: string) => {
    setSelectedOccupation(value as OccupationKey | 'none')
    // Clear error when changing occupation
    setApiError(null)
    // Toggle reference based on selection
    if (value === 'none' && isReferenceEnabled) {
      toggleReference()
    } else if (value !== 'none' && !isReferenceEnabled) {
      toggleReference()
    }
  }

  // Callback to handle API errors from the chart
  const handleApiError = (error: Error | null) => {
    if (error) {
      setApiError('Kunne ikke laste referansedata. Referansesammenligningen er deaktivert.')
      // Auto-disable reference when API fails
      setSelectedOccupation('none')
      if (isReferenceEnabled) {
        toggleReference()
      }
    }
  }

  // Get the occupation key to pass to the chart (null if 'none')
  const occupationKey: OccupationKey | undefined =
    selectedOccupation === 'none' ? undefined : selectedOccupation

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
              {Object.entries(OCCUPATIONS).map(([key, occupation]) => (
                <SelectOption key={key} value={key}>
                  {occupation.label} ({TEXT.charts.averageLabel})
                </SelectOption>
              ))}
              <SelectOption value="none">{TEXT.charts.noReference}</SelectOption>
            </Select>
          </div>
        </div>
        {/* API Error Warning */}
        {apiError && (
          <div className="mt-3 rounded-md border border-yellow-300 bg-yellow-50 p-3">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[20px] text-yellow-700">warning</span>
              <p className="text-xs text-yellow-800 md:text-sm">{apiError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="relative min-h-0 w-full flex-1 p-2 md:p-6">
        <PaypointChart
          payPoints={payPoints}
          inflationData={inflationData}
          displayNet={isNetMode}
          occupation={occupationKey}
          onApiError={handleApiError}
        />
      </div>
    </div>
  )
}

export default memo(ChartSection)
