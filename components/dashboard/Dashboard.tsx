'use client'

import { Suspense, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import MobileBottomDrawer from '@/components/layout/MobileBottomDrawer'
import MetricGrid from './MetricGrid'
import ChartSection from './ChartSection'
import RightPanel from './RightPanel'
import SalaryPointForm from './SalaryPointForm'
import DemoDataBanner from './DemoDataBanner'
import MobileMetricsSummary from './MobileMetricsSummary'
import OnboardingEmptyState from '@/features/onboarding/OnboardingEmptyState'
import { useSalaryData } from '@/features/salary/hooks/useSalaryData'
import { usePayPointFormState } from '@/features/salary/hooks/usePayPointFormState'
import { useDisplayMode } from '@/contexts/displayMode/DisplayModeContext'
import { DEMO_PAY_POINTS } from '@/features/onboarding/demoData'
import type { InflationDataPoint } from '@/domain/inflation'
import type { PayPoint } from '@/domain/salary'
import { TEXT } from '@/lib/constants/text'
import { MetricGridSkeleton, ChartSkeleton } from '@/components/ui/skeletons'
import { createTestId } from '@/lib/testing/testIds'

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
  const {
    fields: { year: newYear, pay: newPay, reason: newReason, note: newNote },
    setters: { setYear, setPay, setReason, setNote, setValidationError },
    minYear,
    validationError,
    isDemoMode,
    isFormModalOpen,
    openFormModal,
    closeFormModal,
    clearEditing,
    beginEditing,
    submitPoint,
    removePayPoint,
    loadDemoData,
    clearDemoData,
  } = usePayPointFormState({
    payPoints,
    currentYear,
    inflationData,
    hasData,
    addPoint,
    removePoint,
  })

  const dashboardTestId = createTestId('dashboard')

  // Clear editing state when overlays are closed
  useEffect(() => {
    if (!isDrawerOpen && !isFormModalOpen) {
      clearEditing()
      setValidationError('')
    }
  }, [clearEditing, isDrawerOpen, isFormModalOpen, setValidationError])

  const handleLoadDemo = () => {
    loadDemoData(DEMO_PAY_POINTS)
  }

  const openForm = () => {
    // On mobile, reuse the drawer; on desktop, open the modal overlay
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onDrawerOpen()
    } else {
      openFormModal()
    }
  }

  const handleEditPoint = (point: PayPoint) => {
    beginEditing(point)
    openForm()
  }

  const handleRemovePoint = (year: number, pay: number) => {
    removePayPoint(year, pay)
  }

  const handleClearDemo = () => {
    clearDemoData()
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
      onYearChange={setYear}
      onPayChange={setPay}
      onReasonChange={setReason}
      onNoteChange={setNote}
      onAdd={submitPoint}
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
        <div className="flex min-h-full flex-col gap-6" data-testid={dashboardTestId('root')}>
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
              {isDemoMode && <DemoDataBanner onClearDemo={handleClearDemo} />}
              <MobileMetricsSummary statistics={statistics} isNetMode={isNetMode} />
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
                onClick={closeFormModal}
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
                onYearChange={setYear}
                onPayChange={setPay}
                onReasonChange={setReason}
                onNoteChange={setNote}
                onAdd={submitPoint}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
