'use client'

import { memo, useEffect, useMemo, useRef } from 'react'
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
import { reasonToLabel } from '@/lib/formatters/salaryFormatting'
import { usePurchasingPowerBase } from '@/contexts/purchasingPower/PurchasingPowerBaseContext'
import { useToast } from '@/contexts/toast/ToastContext'
import { Card } from '@/components/ui/atoms'

interface ChartSectionProps {
  payPoints: PayPoint[]
  inflationData: InflationDataPoint[]
  currentYear: number
  isNetMode: boolean
  onToggleMode: () => void
  onRequestAdd?: () => void
  onEditPayPoint?: (point: PayPoint) => void
  onRemovePayPoint?: (year: number, pay: number) => void
}

const VIEW_OPTIONS: { value: ViewMode; label: string; description: string }[] = [
  { value: 'graph', label: TEXT.views.graphLabel, description: TEXT.views.graphDescription },
  { value: 'table', label: TEXT.views.tableLabel, description: TEXT.views.tableDescription },
  {
    value: 'analysis',
    label: TEXT.views.analysisLabel,
    description: TEXT.views.analysisDescription,
  },
]

function buildInflationBaseOptions(payPoints: PayPoint[]) {
  const options = [{ value: 'auto', label: TEXT.settings.inflationBaseAutoLabel }]
  const sorted = [...payPoints].sort((a, b) => a.year - b.year)
  const yearReasons = new Map<number, PayPoint['reason']>()
  for (const point of sorted) {
    yearReasons.set(point.year, point.reason)
  }
  yearReasons.forEach((reason, year) => {
    options.push({
      value: String(year),
      label: TEXT.settings.inflationBaseYearOption(year, reasonToLabel(reason)),
    })
  })
  return options
}

function normalizeReferenceError(referenceError: unknown): string | null {
  if (referenceError instanceof Error) return referenceError.message
  if (typeof referenceError === 'string') return referenceError
  if (referenceError == null) return null
  return String(referenceError)
}

function ChartSection({
  payPoints,
  inflationData,
  currentYear,
  isNetMode,
  onToggleMode,
  onRequestAdd,
  onEditPayPoint,
  onRemovePayPoint,
}: ChartSectionProps) {
  const { isReferenceEnabled, toggleReference } = useReferenceMode()
  const { showToast } = useToast()
  const lastReferenceErrorRef = useRef<string | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const {
    viewMode,
    setViewMode,
    isSettingsOpen,
    openSettings,
    closeSettings,
    selectedOccupation,
    handleOccupationChange,
    handleReferenceError,
    apiError,
  } = useChartControls({
    payPoints,
    isReferenceEnabled,
    toggleReference,
  })

  const inflationBaseOptions = useMemo(() => buildInflationBaseOptions(payPoints), [payPoints])

  const { baseSelection, setBaseSelection, baseYearOverride } = usePurchasingPowerBase()

  const {
    isLoading,
    actualSeries: rawActualSeries,
    inflSeries: rawInflSeries,
    referenceSeries,
    salaryData = [],
    referenceData = [],
    referenceMetadata,
    yearRange,
    referenceError,
  } = usePaypointChartData(
    payPoints,
    inflationData,
    currentYear,
    selectedOccupation,
    baseYearOverride,
  )

  useEffect(() => {
    handleReferenceError(normalizeReferenceError(referenceError))
  }, [handleReferenceError, referenceError])

  useEffect(() => {
    const normalized = normalizeReferenceError(referenceError)
    if (!normalized) return
    if (lastReferenceErrorRef.current === normalized) return
    lastReferenceErrorRef.current = normalized
    showToast(TEXT.referenceSalary.fetchError, { variant: 'error' })
  }, [referenceError, showToast])

  useEffect(() => {
    const target = contentRef.current
    if (!target) return

    const updateHeight = () => {
      const rect = target.getBoundingClientRect()
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight
      const bottomNavHeight =
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--mobile-bottom-nav-height'),
        ) || 0
      const available = Math.max(0, Math.floor(viewportHeight - rect.top - bottomNavHeight - 12))
      target.style.setProperty('--chart-dynamic-height', `${available}px`)
      target.style.height = `${available}px`
    }

    updateHeight()

    window.addEventListener('scroll', updateHeight, { passive: true })
    window.addEventListener('resize', updateHeight)
    window.visualViewport?.addEventListener('resize', updateHeight)
    window.visualViewport?.addEventListener('scroll', updateHeight)

    return () => {
      window.removeEventListener('scroll', updateHeight)
      window.removeEventListener('resize', updateHeight)
      window.visualViewport?.removeEventListener('resize', updateHeight)
      window.visualViewport?.removeEventListener('scroll', updateHeight)
    }
  }, [])

  // Filter reference data to the user's salary range
  const filteredReferenceData = useMemo(
    () =>
      yearRange
        ? filterReferenceByYearRange(referenceData, yearRange.minYear, yearRange.maxYear)
        : [],
    [referenceData, yearRange],
  )
  const referenceDataForView = isReferenceEnabled ? filteredReferenceData : []

  const renderTable = () => (
    <SalaryTableView
      salaryData={salaryData}
      payPoints={payPoints}
      referenceData={referenceDataForView}
      isNetMode={isNetMode}
      isLoading={isLoading}
      onRequestAdd={onRequestAdd}
      onEditPayPoint={onEditPayPoint}
      onRemovePayPoint={onRemovePayPoint}
    />
  )

  const renderAnalysis = () => (
    <SalaryAnalysisView
      salaryData={salaryData}
      referenceData={referenceDataForView}
      isNetMode={isNetMode}
      isLoading={isLoading}
    />
  )

  const renderChart = () => (
    <PaypointChart
      payPoints={payPoints}
      displayNet={isNetMode}
      grossActualSeries={rawActualSeries}
      grossInflationSeries={rawInflSeries}
      referenceSeries={referenceSeries}
      yearRange={yearRange}
      referenceLabel={selectedOccupation?.label ?? selectedOccupation?.code}
      isLoading={isLoading}
      inflationData={inflationData}
      showEventBaselines={false}
    />
  )

  const renderContent = () => {
    if (!yearRange) return null

    if (viewMode === 'table') {
      return renderTable()
    }

    if (viewMode === 'analysis') {
      return renderAnalysis()
    }

    return renderChart()
  }

  const testId = createTestId('chart-section')
  const referenceAlertMessage = useMemo(() => {
    const fallbackAlert = referenceMetadata?.alerts?.find(alert => alert.code === 'fallback')
    if (!fallbackAlert) return undefined
    return fallbackAlert.source === 'Stortinget'
      ? TEXT.referenceSalary.stortingFallbackNotice
      : TEXT.referenceSalary.fallbackNotice
  }, [referenceMetadata])

  return (
    <Card
      variant="default"
      padding="none"
      className="flex w-full flex-1 flex-col rounded-3xl border border-[var(--border-light)]/70 shadow-[0_18px_30px_-24px_rgba(15,23,42,0.45)]"
      data-testid={testId()}
    >
      <div className="border-b border-[var(--border-light)]/70 px-4 py-2.5 md:px-6 md:py-4">
        <div className="flex flex-col gap-2">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <h2 className="text-base leading-tight font-semibold text-[var(--text-main)] md:text-lg">
              {TEXT.charts.chartTitle}
            </h2>

            <button
              type="button"
              onClick={openSettings}
              className="inline-flex items-center justify-center rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--text-main)]"
              data-testid={testId('open-settings')}
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
            </button>
          </div>

          {/* View selector below */}
          <ChartViewSwitcher viewMode={viewMode} options={VIEW_OPTIONS} onChange={setViewMode} />
        </div>
      </div>

      <div ref={contentRef} className="relative min-h-0 w-full flex-1 p-2 md:p-6">
        {renderContent()}
      </div>

      <ChartSettingsModal
        isOpen={isSettingsOpen}
        isNetMode={isNetMode}
        inflationBaseValue={String(baseSelection)}
        inflationBaseOptions={inflationBaseOptions}
        selectedOccupation={selectedOccupation}
        referenceAlertMessage={referenceAlertMessage}
        referenceErrorMessage={apiError}
        onToggleMode={onToggleMode}
        onChangeInflationBase={value => setBaseSelection(value === 'auto' ? 'auto' : Number(value))}
        onOccupationChange={handleOccupationChange}
        onClose={closeSettings}
      />
    </Card>
  )
}

export default memo(ChartSection)
