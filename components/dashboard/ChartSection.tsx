'use client'

import { memo, useEffect, useMemo } from 'react'
import PaypointChart from '@/features/visualization/components/PaypointChart'
import { SalaryTableView } from '@/features/salary/components/SalaryTableView'
import { SalaryAnalysisView } from '@/features/salary/components/SalaryAnalysisView'
import { usePaypointChartData } from '@/features/salary/hooks/usePaypointChartData'
import type { PayPoint } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'
import { useReferenceMode } from '@/contexts/referenceMode/ReferenceModeContext'
import { TEXT } from '@/lib/constants/text'
import { filterReferenceByYearRange } from '@/domain/reference'
import type { ViewMode } from '@/lib/searchParams'
import { ChartViewSwitcher } from './ChartViewSwitcher'
import { ChartSettingsModal } from './ChartSettingsModal'
import { useChartControls } from './hooks/useChartControls'
import { createTestId } from '@/lib/testing/testIds'

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
  const {
    viewMode,
    setViewMode,
    showEventBaselines,
    setShowEventBaselines,
    isSettingsOpen,
    openSettings,
    closeSettings,
    selectedOccupation,
    occupationKey,
    handleOccupationChange,
    handleReferenceError,
  } = useChartControls({
    payPoints,
    isReferenceEnabled,
    toggleReference,
  })

  const {
    isLoading,
    actualSeries: rawActualSeries,
    inflSeries: rawInflSeries,
    referenceSeries,
    salaryData = [],
    referenceData = [],
    yearRange,
    referenceError,
  } = usePaypointChartData(payPoints, inflationData, occupationKey)

  useEffect(() => {
    const normalizedError =
      referenceError instanceof Error ? referenceError.message : (referenceError ?? null)
    handleReferenceError(normalizedError)
  }, [handleReferenceError, referenceError])

  // Filter reference data to the user's salary range
  const filteredReferenceData = useMemo(
    () =>
      yearRange
        ? filterReferenceByYearRange(referenceData, yearRange.minYear, yearRange.maxYear)
        : [],
    [referenceData, yearRange],
  )

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

  const testId = createTestId('chart-section')

  return (
    <div
      className="flex w-full flex-1 flex-col rounded-xl border border-[var(--border-light)] bg-[var(--surface-light)] shadow-sm"
      data-testid={testId()}
    >
      <div className="border-b border-[var(--border-light)] px-3 py-2.5 md:px-6 md:py-4">
        <div className="flex flex-col gap-3">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <h2 className="text-base leading-tight font-semibold text-[var(--text-main)] md:text-lg">
              {TEXT.charts.chartTitle}
            </h2>

            <button
              type="button"
              onClick={openSettings}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[var(--text-main)] transition hover:bg-[var(--color-gray-50)] dark:bg-gray-800 dark:hover:bg-gray-700"
              data-testid={testId('open-settings')}
            >
              <span className="material-symbols-outlined text-[18px] text-[var(--text-muted)]">
                tune
              </span>
            </button>
          </div>

          {/* View selector below */}
          <ChartViewSwitcher viewMode={viewMode} options={viewOptions} onChange={setViewMode} />
        </div>
      </div>

      <div className="relative min-h-0 w-full flex-1 p-2 md:p-6">{renderContent()}</div>

      <ChartSettingsModal
        isOpen={isSettingsOpen}
        isNetMode={isNetMode}
        showEventBaselines={showEventBaselines}
        selectedOccupation={selectedOccupation}
        onToggleMode={onToggleMode}
        onToggleEventBaselines={setShowEventBaselines}
        onOccupationChange={handleOccupationChange}
        onClose={closeSettings}
      />
    </div>
  )
}

export default memo(ChartSection)
