'use client'

import { Suspense } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import MetricGrid from './MetricGrid'
import ChartSection from './ChartSection'
import SalaryPointForm from './SalaryPointForm'
import DemoDataBanner from './DemoDataBanner'
import OnboardingEmptyState from '@/features/onboarding/OnboardingEmptyState'
import type { InflationDataPoint } from '@/domain/inflation'
import type { PayPoint, SalaryStatistics, PayChangeReason } from '@/domain/salary'
import { TEXT } from '@/lib/constants/text'
import { MetricGridSkeleton, ChartSkeleton } from '@/components/ui/skeletons'
import { createTestId } from '@/lib/testing/testIds'

interface DashboardDesktopProps {
  // Data
  payPoints: PayPoint[]
  statistics: SalaryStatistics
  inflationData: InflationDataPoint[]
  currentYear: number
  hasData: boolean
  isDemoMode: boolean

  // Display state
  isNetMode: boolean
  isFormModalOpen: boolean

  // Form state
  newYear: string
  newPay: string
  newReason: PayChangeReason | ''
  newNote: string
  minYear: number
  validationError: string

  // Handlers
  onOpenFormModal: () => void
  onCloseFormModal: () => void
  onToggleMode: () => void
  onLoadDemo: () => void
  onClearDemo: () => void
  onEditPoint: (point: PayPoint) => void
  onRemovePoint: (year: number, pay: number) => void
  onYearChange: (year: string) => void
  onPayChange: (pay: string) => void
  onReasonChange: (reason: PayChangeReason | '') => void
  onNoteChange: (note: string) => void
  onSubmitPoint: () => void
}

export default function DashboardDesktop({
  payPoints,
  statistics,
  inflationData,
  currentYear,
  hasData,
  isDemoMode,
  isNetMode,
  isFormModalOpen,
  newYear,
  newPay,
  newReason,
  newNote,
  minYear,
  validationError,
  onOpenFormModal,
  onCloseFormModal,
  onToggleMode,
  onLoadDemo,
  onClearDemo,
  onEditPoint,
  onRemovePoint,
  onYearChange,
  onPayChange,
  onReasonChange,
  onNoteChange,
  onSubmitPoint,
}: DashboardDesktopProps) {
  const dashboardTestId = createTestId('dashboard')

  // Right panel content for desktop sidebar
  const rightPanelContent = (
    <div className="flex h-full flex-col" data-testid={dashboardTestId('right-panel')}>
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
        onYearChange={onYearChange}
        onPayChange={onPayChange}
        onReasonChange={onReasonChange}
        onNoteChange={onNoteChange}
        onAdd={onSubmitPoint}
      />
    </div>
  )

  return (
    <>
      <DashboardLayout rightPanel={rightPanelContent}>
        {/* Main Dashboard Content */}
        <div className="flex min-h-full flex-col gap-6" data-testid={dashboardTestId('root')}>
          {/* Header */}
          <div className="flex flex-col gap-1">
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
              {isDemoMode && <DemoDataBanner onClearDemo={onClearDemo} />}
              <Suspense fallback={<MetricGridSkeleton />}>
                <MetricGrid statistics={statistics} isNetMode={isNetMode} />
              </Suspense>
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
                  onToggleMode={onToggleMode}
                  onRequestAdd={onOpenFormModal}
                  onEditPayPoint={onEditPoint}
                  onRemovePayPoint={onRemovePoint}
                />
              </Suspense>
            </div>
          ) : (
            <OnboardingEmptyState onLoadDemo={onLoadDemo} onOpenDrawer={onOpenFormModal} />
          )}
        </div>
      </DashboardLayout>

      {/* Desktop Modal Overlay */}
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
                onClick={onCloseFormModal}
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
                onYearChange={onYearChange}
                onPayChange={onPayChange}
                onReasonChange={onReasonChange}
                onNoteChange={onNoteChange}
                onAdd={onSubmitPoint}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
