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
    apiError,
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

  const hasReferenceSeries = isReferenceEnabled && referenceSeries.length > 0
  const testId = createTestId('chart-section')

  return (
    <div
      className="flex w-full flex-1 flex-col rounded-xl border border-[var(--border-light)] bg-[var(--surface-light)] shadow-sm"
      data-testid={testId()}
    >
      <div className="border-b border-[var(--border-light)] px-3 py-2.5 md:px-6 md:py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1 space-y-3">
            <h2 className="text-base leading-tight font-semibold text-[var(--text-main)] md:text-lg">
              <span>{TEXT.charts.chartTitle}</span>
            </h2>

            <ChartViewSwitcher viewMode={viewMode} options={viewOptions} onChange={setViewMode} />
          </div>
          <div className="flex items-start justify-end gap-2">
            <button
              type="button"
              onClick={openSettings}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-light)] bg-white px-3 py-2 text-xs font-semibold text-[var(--text-main)] shadow-sm transition hover:bg-[var(--color-gray-50)]"
              data-testid={testId('open-settings')}
            >
              <span className="material-symbols-outlined text-[18px] text-[var(--text-muted)]">
                tune
              </span>
              {TEXT.common.settings ?? 'Innstillinger'}
            </button>
          </div>
        </div>

        {apiError && (
          <div className="mt-3 rounded-md border border-yellow-300 bg-yellow-50 p-3">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[20px] text-yellow-700">warning</span>
              <p className="text-xs text-yellow-800 md:text-sm">{apiError}</p>
            </div>
          </div>
        )}
      </div>

      <div className="relative min-h-0 w-full flex-1 p-2 md:p-6">{renderContent()}</div>

      <ChartSettingsModal
        isOpen={isSettingsOpen}
        isNetMode={isNetMode}
        showEventBaselines={showEventBaselines}
        hasReferenceSeries={hasReferenceSeries}
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
