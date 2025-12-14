'use client'

import { memo, useEffect, useMemo, useState } from 'react'
import { parseAsStringLiteral, useQueryState } from 'nuqs'
import PaypointChart from '@/features/visualization/components/PaypointChart'
import { SalaryTableView } from '@/features/salary/components/SalaryTableView'
import { SalaryAnalysisView } from '@/features/salary/components/SalaryAnalysisView'
import { usePaypointChartData } from '@/features/salary/hooks/usePaypointChartData'
import type { PayPoint } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'
import { Select, SelectOption, Toggle } from '@/components/ui/atoms'
import { useReferenceMode } from '@/contexts/referenceMode/ReferenceModeContext'
import { TEXT } from '@/lib/constants/text'
import { viewModes, type ViewMode } from '@/lib/searchParams'
import { OCCUPATIONS, type OccupationKey } from '@/features/referenceSalary/occupations'
import { cn } from '@/lib/utils/cn'
import { filterReferenceByYearRange } from '@/domain/reference'

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
  const [showEventBaselines, setShowEventBaselines] = useState(() => {
    // Load from localStorage, default to false
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('salary-show-event-baselines')
      return stored === 'true'
    }
    return false
  })
  const [viewMode, setViewMode] = useQueryState<ViewMode>(
    'view',
    parseAsStringLiteral(viewModes).withDefault('graph'),
  )

  // Persist event baselines toggle to localStorage
  useEffect(() => {
    localStorage.setItem('salary-show-event-baselines', String(showEventBaselines))
  }, [showEventBaselines])

  const {
    isLoading,
    actualSeries: rawActualSeries,
    inflSeries: rawInflSeries,
    referenceSeries,
    salaryData = [],
    referenceData = [],
    yearRange,
    referenceError,
  } = usePaypointChartData(
    payPoints,
    inflationData,
    selectedOccupation === 'none' ? undefined : selectedOccupation,
  )

  // Filter reference data to the user's salary range
  const filteredReferenceData = useMemo(
    () =>
      yearRange
        ? filterReferenceByYearRange(referenceData, yearRange.minYear, yearRange.maxYear)
        : [],
    [referenceData, yearRange],
  )

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

  // Handle reference API errors once
  useEffect(() => {
    if (referenceError) {
      setApiError('Kunne ikke laste referansedata. Referansesammenligningen er deaktivert.')
      setSelectedOccupation('none')
      if (isReferenceEnabled) {
        toggleReference()
      }
    }
  }, [referenceError, isReferenceEnabled, toggleReference])

  const occupationKey: OccupationKey | undefined =
    selectedOccupation === 'none' ? undefined : selectedOccupation

  const viewOptions: { value: ViewMode; label: string; description: string }[] = [
    { value: 'graph', label: TEXT.views.graphLabel, description: TEXT.views.graphDescription },
    { value: 'table', label: TEXT.views.tableLabel, description: TEXT.views.tableDescription },
    {
      value: 'analysis',
      label: TEXT.views.analysisLabel,
      description: TEXT.views.analysisDescription,
    },
  ]

  const renderContent = () => {
    if (!yearRange) return null

    if (viewMode === 'table') {
      return (
        <SalaryTableView
          salaryData={salaryData}
          payPoints={payPoints}
          referenceData={isReferenceEnabled ? filteredReferenceData : []}
          isNetMode={isNetMode}
          isLoading={isLoading}
        />
      )
    }

    if (viewMode === 'analysis') {
      return (
        <SalaryAnalysisView
          salaryData={salaryData}
          referenceData={isReferenceEnabled ? filteredReferenceData : []}
          isNetMode={isNetMode}
          isLoading={isLoading}
        />
      )
    }

    return (
      <PaypointChart
        payPoints={payPoints}
        displayNet={isNetMode}
        grossActualSeries={rawActualSeries}
        grossInflationSeries={rawInflSeries}
        referenceSeries={referenceSeries}
        yearRange={yearRange}
        occupation={occupationKey}
        isLoading={isLoading}
        inflationData={inflationData}
        showEventBaselines={showEventBaselines}
      />
    )
  }

  const currentDescription =
    viewOptions.find(option => option.value === viewMode)?.description ?? TEXT.charts.chartSubtitle

  return (
    <div
      className="flex w-full flex-1 flex-col rounded-xl border border-[var(--border-light)] bg-[var(--surface-light)] shadow-sm"
      data-testid="chart-section"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-light)] px-3 py-2.5 md:px-6 md:py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
              {currentDescription}
            </p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
            {/* View switcher */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium tracking-wide text-[var(--text-muted)] uppercase">
                {TEXT.views.switcherLabel}
              </span>
              <div className="inline-flex rounded-lg bg-[var(--color-gray-50)] p-1 shadow-inner">
                {viewOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      'rounded-md px-3 py-1.5 text-xs font-semibold transition',
                      viewMode === option.value
                        ? 'bg-white text-[var(--primary)] shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]',
                    )}
                    aria-pressed={viewMode === option.value}
                    onClick={() => setViewMode(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference selector */}
            <div className="w-full md:w-auto md:min-w-[220px]">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-muted)]">
                  <span>{TEXT.charts.compareWithOccupation}</span>
                  <span
                    className="material-symbols-outlined text-[16px] text-[var(--text-muted)]"
                    aria-label={TEXT.charts.referenceHelp}
                    title={TEXT.charts.referenceHelp}
                  >
                    info
                  </span>
                </div>
                <Select
                  id="reference-occupation"
                  aria-label={TEXT.charts.compareWithOccupation}
                  value={selectedOccupation}
                  onChange={handleOccupationChange}
                  className="text-xs md:text-sm"
                >
                  {Object.entries(OCCUPATIONS).map(([key, occupation]) => {
                    const isStortinget =
                      (occupation as unknown as { provider?: string }).provider === 'stortinget'
                    return (
                      <SelectOption key={key} value={key}>
                        {occupation.label}
                        {isStortinget ? '' : ` (${TEXT.charts.averageLabel})`}
                      </SelectOption>
                    )
                  })}
                  <SelectOption value="none">{TEXT.charts.noReference}</SelectOption>
                </Select>
                <p className="text-[11px] leading-snug text-[var(--text-muted)] md:text-xs">
                  {TEXT.charts.referenceHelp}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Event Baselines Toggle */}
        {viewMode === 'graph' && (
          <div
            className="mt-3 flex items-center gap-2 border-t border-[var(--border-light)] pt-3"
            data-testid="chart-event-baselines-section"
          >
            <label
              className="flex cursor-pointer items-center gap-2"
              htmlFor="chart-event-baselines-toggle"
            >
              <input
                id="chart-event-baselines-toggle"
                data-testid="chart-event-baselines-toggle"
                type="checkbox"
                checked={showEventBaselines}
                onChange={e => setShowEventBaselines(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]"
              />
              <span className="text-sm font-medium text-[var(--text-main)]">
                {TEXT.charts.showEventBaselines}
              </span>
            </label>
            <span className="text-xs text-[var(--text-muted)]">
              {TEXT.charts.eventBaselinesHelp}
            </span>
          </div>
        )}

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

      {/* Content */}
      <div className="relative min-h-0 w-full flex-1 p-2 md:p-6">{renderContent()}</div>
    </div>
  )
}

export default memo(ChartSection)
