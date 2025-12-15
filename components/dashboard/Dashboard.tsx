'use client'

import { Suspense, useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import MobileBottomDrawer from '@/components/layout/MobileBottomDrawer'
import MetricGrid from './MetricGrid'
import ChartSection from './ChartSection'
import RightPanel from './RightPanel'
import SalaryPointForm from './SalaryPointForm'
import OnboardingEmptyState from '@/features/onboarding/OnboardingEmptyState'
import { useSalaryData } from '@/features/salary/hooks/useSalaryData'
import { useDisplayMode } from '@/contexts/displayMode/DisplayModeContext'
import { DEMO_PAY_POINTS } from '@/features/onboarding/demoData'
import { calculateNetIncome } from '@/domain/tax'
import { validatePayPoint } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'
import type { PayChangeReason, PayPoint } from '@/domain/salary'
import { TEXT } from '@/lib/constants/text'
import { MetricGridSkeleton, ChartSkeleton } from '@/components/ui/skeletons'

interface DashboardProps {
  inflationData: InflationDataPoint[]
  currentYear: number
  isDrawerOpen: boolean
  onDrawerOpen: () => void
  onDrawerClose: () => void
}

export default function Dashboard({
  inflationData,
  currentYear,
  isDrawerOpen,
  onDrawerOpen,
  onDrawerClose,
}: DashboardProps) {
  const { payPoints, statistics, hasData, addPoint, removePoint, isLoading, error } = useSalaryData(
    inflationData,
    currentYear,
  )

  const { isNetMode, toggleMode } = useDisplayMode()
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingPoint, setEditingPoint] = useState<PayPoint | null>(null)

  // Form state
  const [newYear, setNewYear] = useState('')
  const [newPay, setNewPay] = useState('')
  const [newReason, setNewReason] = useState<PayChangeReason | ''>('adjustment')
  const [newNote, setNewNote] = useState('')
  const [validationError, setValidationError] = useState('')

  const minYear = 1900

  // Pre-fill the next logical year when user already has data and the field is empty
  useEffect(() => {
    if (!payPoints.length || newYear) return
    const existingYears = payPoints.map(p => p.year)
    const lastYear = Math.max(...existingYears)
    let candidate = Math.min(currentYear, lastYear + 1)

    const usedYears = new Set(existingYears)
    while (usedYears.has(candidate) && candidate <= currentYear) {
      candidate += 1
    }

    if (candidate <= currentYear && !usedYears.has(candidate)) {
      setNewYear(String(candidate))
    }
  }, [payPoints, newYear, currentYear])

  // Track if we have real user data
  useEffect(() => {
    // If user has data and we're in demo mode, exit demo mode
    if (hasData && isDemoMode) {
      setIsDemoMode(false)
    }
  }, [hasData, isDemoMode])

  // Clear editing state when overlays are closed
  useEffect(() => {
    if (!isDrawerOpen && !isFormModalOpen) {
      setEditingPoint(null)
    }
  }, [isDrawerOpen, isFormModalOpen])

  const handleLoadDemo = () => {
    // Clear any existing data first
    localStorage.removeItem('salary-calculator-points')
    // Load demo data
    DEMO_PAY_POINTS.forEach(point => addPoint(point))
    setIsDemoMode(true)
  }

  const handleAddPoint = () => {
    if (!newReason) {
      setValidationError(TEXT.forms.validation.required)
      return
    }

    const point: PayPoint = {
      year: Number(newYear),
      pay: Number(newPay.replace(/\s/g, '')),
      reason: newReason,
      note: newNote.trim() || undefined,
    }

    const existingForValidation = editingPoint
      ? payPoints.filter(p => !(p.year === editingPoint.year && p.pay === editingPoint.pay))
      : payPoints
    const validation = validatePayPoint(point, existingForValidation, inflationData)
    if (!validation.isValid) {
      const minAllowedYear = validation.details?.minYear ?? minYear
      const maxAllowedYear = validation.details?.maxYear ?? currentYear
      const message = (() => {
        switch (validation.errorCode) {
          case 'REQUIRED':
            return TEXT.forms.validation.required
          case 'PAY_POSITIVE':
            return TEXT.forms.validation.payPositive
          case 'INVALID_REASON':
            return TEXT.forms.validation.required
          case 'YEAR_RANGE':
            return TEXT.forms.validation.yearRange
              .replace('{min}', String(minAllowedYear))
              .replace('{max}', String(maxAllowedYear))
          case 'DUPLICATE_YEAR':
            return TEXT.forms.validation.yearExists
          default:
            return validation.errorMessage || TEXT.forms.validation.invalidInput
        }
      })()

      setValidationError(message)
      return
    }

    // If adding real data while in demo mode, clear demo data first
    if (isDemoMode) {
      localStorage.removeItem('salary-calculator-points')
      setIsDemoMode(false)
      // Note: The useSalaryData hook will automatically reload from localStorage
      // on the next render cycle, picking up the cleared state
    }

    // Replace original point if editing
    if (editingPoint) {
      removePoint(editingPoint.year, editingPoint.pay)
    }

    addPoint(point)
    const existingYears = new Set(payPoints.map(p => p.year))
    existingYears.add(point.year)
    let nextYear = point.year + 1
    while (existingYears.has(nextYear) && nextYear <= currentYear) {
      nextYear += 1
    }
    const nextYearValue = nextYear <= currentYear ? String(nextYear) : ''

    // Keep amount for quick consecutive entries; reset reason to default per guidance
    setNewYear(nextYearValue)
    setNewPay(newPay)
    setNewReason('adjustment')
    setNewNote('')
    setValidationError('')
    setEditingPoint(null)

    if (isFormModalOpen) {
      setIsFormModalOpen(false)
    }
  }

  const openForm = () => {
    // On mobile, reuse the drawer; on desktop, open the modal overlay
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onDrawerOpen()
    } else {
      setIsFormModalOpen(true)
    }
  }

  const handleEditPoint = (point: PayPoint) => {
    // Pre-fill the form with the selected point's data
    setNewYear(String(point.year))
    setNewPay(String(point.pay))
    setNewReason(point.reason)
    setNewNote(point.note ?? '')
    setValidationError('')
    setEditingPoint(point)

    openForm()
  }

  const handleRemovePoint = (year: number, pay: number) => {
    removePoint(year, pay)
  }

  const handleClearDemo = () => {
    localStorage.removeItem('salary-calculator-points')
    setIsDemoMode(false)
    // Clear all points - the useSalaryData hook will sync with localStorage
    payPoints.forEach(p => removePoint(p.year, p.pay))
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-base">{TEXT.common.loading}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-base text-red-600">{TEXT.common.error}</p>
      </div>
    )
  }

  // Right panel content - reused for both desktop sidebar and mobile drawer
  const rightPanelContent = (
    <RightPanel
      newYear={newYear}
      newPay={newPay}
      newNote={newNote}
      currentYear={currentYear}
      minYear={minYear}
      validationError={validationError}
      isNetMode={isNetMode}
      payPoints={payPoints}
      newReason={newReason}
      inflationData={inflationData}
      onYearChange={setNewYear}
      onPayChange={setNewPay}
      onReasonChange={value => setNewReason(value)}
      onNoteChange={setNewNote}
      onAdd={handleAddPoint}
      isMobileDrawer={isDrawerOpen}
    />
  )

  return (
    <>
      <MobileBottomDrawer
        isOpen={isDrawerOpen}
        onClose={onDrawerClose}
        dashboardContent={rightPanelContent}
        pointsCount={payPoints.length}
      />
      <DashboardLayout rightPanel={rightPanelContent}>
        {/* Main Dashboard Content */}
        <div className="flex min-h-full flex-col gap-6">
          {/* Header - hidden on mobile when showing welcome state */}
          <div className={`${!hasData ? 'hidden md:flex' : 'flex'} flex-col gap-1`}>
            <h1 className="text-2xl font-bold text-[var(--text-main)] md:text-3xl">
              {TEXT.dashboard.annualOverview}
            </h1>
            <p className="text-sm text-[var(--text-muted)] md:mt-1">
              {TEXT.dashboard.annualOverviewSubtitle}
            </p>
          </div>

          {/* Metrics Grid - only show when we have data */}
          {hasData && (
            <>
              {isDemoMode && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[24px] text-blue-600">
                        info
                      </span>
                      <p className="text-sm text-blue-900">{TEXT.onboarding.demoDataInfo}</p>
                    </div>
                    <button
                      onClick={handleClearDemo}
                      className="shrink-0 rounded-md border border-blue-300 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                    >
                      {TEXT.onboarding.clearDemoData}
                    </button>
                  </div>
                </div>
              )}
              {/* Compact mobile summary */}
              <div className="rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] md:hidden">
                <button
                  onClick={() => setIsMetricsExpanded(!isMetricsExpanded)}
                  className="flex w-full items-center justify-between px-4 py-3"
                >
                  <div className="flex flex-1 items-center justify-between">
                    <div className="flex-1">
                      <p className="text-[10px] font-medium text-[var(--text-muted)]">
                        {isNetMode
                          ? TEXT.metrics.totalAnnualNetSalary
                          : TEXT.metrics.totalAnnualSalary}
                      </p>
                      <p className="text-lg font-bold text-[var(--text-main)]">
                        {Math.round(
                          isNetMode
                            ? calculateNetIncome(statistics.latestPay, statistics.latestYear)
                            : statistics.latestPay,
                        ).toLocaleString('nb-NO')}
                      </p>
                    </div>
                    <div className="flex-1 border-l border-[var(--border-light)] pl-4">
                      <p className="text-[10px] font-medium text-[var(--text-muted)]">
                        {TEXT.metrics.vsInflation}
                      </p>
                      <p
                        className={`text-lg font-bold ${statistics.gapPercent >= 0 ? 'text-[#078838]' : 'text-red-600'}`}
                      >
                        {statistics.gapPercent >= 0 ? '+' : ''}
                        {statistics.gapPercent.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined ml-2 text-[20px] text-[var(--text-muted)]">
                    {isMetricsExpanded ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {isMetricsExpanded && (
                  <div className="border-t border-[var(--border-light)] px-4 py-3">
                    <div className="flex flex-col gap-3">
                      {/* Real Annual Value */}
                      <div>
                        <p className="text-[10px] font-medium text-[var(--text-muted)]">
                          {TEXT.metrics.realAnnualValue}
                        </p>
                        <p className="text-base font-bold text-[var(--text-main)]">
                          {Math.round(
                            isNetMode
                              ? calculateNetIncome(
                                  statistics.inflationAdjustedPay,
                                  statistics.latestYear,
                                )
                              : statistics.inflationAdjustedPay,
                          ).toLocaleString('nb-NO')}{' '}
                          {TEXT.common.pts}
                        </p>
                      </div>

                      {/* Yearly Change */}
                      <div>
                        <p className="text-[10px] font-medium text-[var(--text-muted)]">
                          {TEXT.metrics.yearlyChange}
                        </p>
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-base font-bold ${statistics.gapPercent >= 0 ? 'text-[#078838]' : 'text-red-600'}`}
                          >
                            {statistics.gapPercent >= 0 ? '+' : ''}
                            {statistics.gapPercent.toFixed(1)}%
                          </p>
                          <span className="text-xs text-[var(--text-muted)]">
                            ({statistics.gapPercent >= 0 ? '+' : ''}
                            {Math.round(
                              isNetMode
                                ? calculateNetIncome(statistics.latestPay, statistics.latestYear) -
                                    calculateNetIncome(
                                      statistics.inflationAdjustedPay,
                                      statistics.latestYear,
                                    )
                                : statistics.latestPay - statistics.inflationAdjustedPay,
                            ).toLocaleString('nb-NO')}{' '}
                            {TEXT.common.pts})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Full metrics grid - desktop only */}
              <div className="hidden md:block">
                <Suspense fallback={<MetricGridSkeleton />}>
                  <MetricGrid statistics={statistics} isNetMode={isNetMode} />
                </Suspense>
              </div>
            </>
          )}

          {/* Chart Section */}
          {hasData ? (
            <div className="flex min-h-[350px] flex-1">
              <Suspense
                fallback={<ChartSkeleton className="w-full rounded-xl bg-white shadow-sm" />}
              >
                <ChartSection
                  payPoints={payPoints}
                  inflationData={inflationData}
                  isNetMode={isNetMode}
                  onToggleMode={toggleMode}
                  onRequestAdd={openForm}
                  onEditPayPoint={handleEditPoint}
                  onRemovePayPoint={handleRemovePoint}
                />
              </Suspense>
            </div>
          ) : (
            <OnboardingEmptyState onLoadDemo={handleLoadDemo} onOpenDrawer={onDrawerOpen} />
          )}
        </div>
      </DashboardLayout>

      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-light)] px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--primary)]">add_circle</span>
                <h3 className="text-base font-bold text-[var(--text-main)]">
                  {TEXT.forms.logSalaryPoint}
                </h3>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="rounded-full p-2 text-[var(--text-muted)] hover:bg-gray-100"
                aria-label={TEXT.common.close}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto">
              <SalaryPointForm
                newYear={newYear}
                newPay={newPay}
                newReason={newReason}
                newNote={newNote}
                currentYear={currentYear}
                minYear={minYear}
                validationError={validationError}
                isNetMode={isNetMode}
                payPoints={payPoints}
                inflationData={inflationData}
                onYearChange={setNewYear}
                onPayChange={setNewPay}
                onReasonChange={value => setNewReason(value)}
                onNoteChange={setNewNote}
                onAdd={handleAddPoint}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
