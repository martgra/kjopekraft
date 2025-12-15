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
import InfoTooltip from '@/components/ui/atoms/InfoTooltip'

interface ChartSectionProps {
  payPoints: PayPoint[]
  inflationData: InflationDataPoint[]
  isNetMode: boolean
  onToggleMode: () => void
  onRequestAdd?: () => void
  onEditPayPoint?: (point: PayPoint) => void
  onRemovePayPoint?: (year: number, pay: number) => void
}

function ChartSection({
  payPoints,
  inflationData,
  isNetMode,
  onToggleMode,
  onRequestAdd,
  onEditPayPoint,
  onRemovePayPoint,
}: ChartSectionProps) {
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
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
          onRequestAdd={onRequestAdd}
          onEditPayPoint={onEditPayPoint}
          onRemovePayPoint={onRemovePayPoint}
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
  const hasReferenceSeries = isReferenceEnabled && referenceSeries.length > 0
  const hasEventReasons = payPoints.some(
    point => point.reason === 'promotion' || point.reason === 'newJob',
  )

  return (
    <div
      className="flex w-full flex-1 flex-col rounded-xl border border-[var(--border-light)] bg-[var(--surface-light)] shadow-sm"
      data-testid="chart-section"
    >
      {/* Header */}
      <div className="border-b border-[var(--border-light)] px-3 py-2.5 md:px-6 md:py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1 space-y-3">
            <h2 className="text-base leading-tight font-semibold text-[var(--text-main)] md:text-lg">
              <span>{TEXT.charts.chartTitle}</span>
            </h2>

            {/* View switcher directly under title */}
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-[var(--color-gray-50)] p-1 shadow-inner md:inline-flex md:w-fit md:gap-0">
              {viewOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    'w-full rounded-md px-2.5 py-2 text-xs font-semibold transition md:w-auto md:px-3 md:py-1.5',
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
          <div className="flex items-start justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-light)] bg-white px-3 py-2 text-xs font-semibold text-[var(--text-main)] shadow-sm transition hover:bg-[var(--color-gray-50)]"
            >
              <span className="material-symbols-outlined text-[18px] text-[var(--text-muted)]">
                tune
              </span>
              {TEXT.common.settings ?? 'Innstillinger'}
            </button>
          </div>
        </div>

        {/* Quick controls row */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Toggle
              checked={isNetMode}
              onChange={onToggleMode}
              label={isNetMode ? TEXT.charts.modeBadgeNet : TEXT.charts.modeBadgeGross}
              className="scale-90 md:scale-100"
              labelClassName="min-w-[110px] text-center whitespace-nowrap text-[11px] md:text-xs"
            />
            {viewMode === 'graph' && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  data-testid="chart-event-baselines-toggle"
                  checked={showEventBaselines}
                  onChange={e => setShowEventBaselines(e.target.checked)}
                  className="relative h-6 w-11 cursor-pointer appearance-none rounded-full bg-gray-200 transition before:absolute before:top-0.5 before:left-0.5 before:h-5 before:w-5 before:rounded-full before:bg-white before:shadow before:transition before:content-[''] checked:bg-[var(--primary)] checked:before:translate-x-5 focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
                  aria-label={TEXT.charts.showEventBaselines}
                />
                <span className="text-[11px] font-medium text-[var(--text-main)] md:text-xs">
                  {TEXT.charts.showEventBaselines}
                </span>
              </label>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="w-full min-w-[180px] md:w-auto md:min-w-[220px]">
              <Select
                id="reference-occupation"
                aria-label={TEXT.charts.compareWithOccupation}
                value={selectedOccupation}
                onChange={handleOccupationChange}
                className="text-sm md:text-sm"
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
            </div>
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

      {/* Content */}
      <div className="relative min-h-0 w-full flex-1 p-2 md:p-6">{renderContent()}</div>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-2xl md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--primary)]">tune</span>
                <h3 className="text-base font-bold text-[var(--text-main)]">
                  {TEXT.common.settings ?? 'Innstillinger'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--color-gray-50)]"
                aria-label={TEXT.common.close}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] px-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-main)]">
                    {TEXT.charts.modeBadgeGross} / {TEXT.charts.modeBadgeNet}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {TEXT.views.analysisDescription}
                  </p>
                </div>
                <Toggle
                  checked={isNetMode}
                  onChange={onToggleMode}
                  label={isNetMode ? TEXT.charts.modeBadgeNet : TEXT.charts.modeBadgeGross}
                  className="scale-90 md:scale-100"
                  labelClassName="min-w-[110px] text-center whitespace-nowrap text-[11px] md:text-xs"
                />
              </div>

              <div className="rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-main)]">
                      {TEXT.charts.showEventBaselines}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Gjelder grafvisning; markerer hendelser som forfremmelser.
                    </p>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      data-testid="chart-event-baselines-toggle"
                      checked={showEventBaselines}
                      onChange={e => setShowEventBaselines(e.target.checked)}
                      className="relative h-6 w-11 cursor-pointer appearance-none rounded-full bg-gray-200 transition before:absolute before:top-0.5 before:left-0.5 before:h-5 before:w-5 before:rounded-full before:bg-white before:shadow before:transition before:content-[''] checked:bg-[var(--primary)] checked:before:translate-x-5 focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
                      aria-label={TEXT.charts.showEventBaselines}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--text-main)]">
                      {TEXT.charts.compareWithOccupation}
                    </span>
                    <InfoTooltip label={TEXT.charts.referenceHelp} />
                  </div>
                  {hasReferenceSeries && (
                    <span className="rounded-full bg-[var(--primary)]/10 px-2 py-1 text-[11px] font-semibold text-[var(--primary)]">
                      {TEXT.charts.referenceEnabled}
                    </span>
                  )}
                </div>
                <Select
                  id="reference-occupation"
                  aria-label={TEXT.charts.compareWithOccupation}
                  value={selectedOccupation}
                  onChange={handleOccupationChange}
                  className="text-sm md:text-sm"
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
                <p className="text-xs text-[var(--text-muted)]">
                  Velg referanselønn uavhengig av visning – brukes i graf, tabell og analyse.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(ChartSection)
