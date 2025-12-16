'use client'

import { Suspense } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import MobileBottomDrawer from '@/components/layout/MobileBottomDrawer'
import ChartSection from './ChartSection'
import SalaryPointForm from './SalaryPointForm'
import DemoDataBanner from './DemoDataBanner'
import StatusBanner from './StatusBanner'
import OnboardingEmptyState from '@/features/onboarding/OnboardingEmptyState'
import type { InflationDataPoint } from '@/domain/inflation'
import type { PayPoint, SalaryStatistics, PayChangeReason } from '@/domain/salary'
import { TEXT } from '@/lib/constants/text'
import { ChartSkeleton } from '@/components/ui/skeletons'
import { createTestId } from '@/lib/testing/testIds'

interface DashboardMobileProps {
  // Data
  payPoints: PayPoint[]
  statistics: SalaryStatistics
  inflationData: InflationDataPoint[]
  currentYear: number
  hasData: boolean
  isDemoMode: boolean

  // Display state
  isNetMode: boolean
  isDrawerOpen: boolean

  // Form state
  newYear: string
  newPay: string
  newReason: PayChangeReason | ''
  newNote: string
  minYear: number
  validationError: string
  editingPoint: PayPoint | null

  // Handlers
  onDrawerOpen: () => void
  onDrawerClose: () => void
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

export default function DashboardMobile({
  payPoints,
  statistics,
  inflationData,
  currentYear,
  hasData,
  isDemoMode,
  isNetMode,
  isDrawerOpen,
  newYear,
  newPay,
  newReason,
  newNote,
  minYear,
  validationError,
  editingPoint,
  onDrawerOpen,
  onDrawerClose,
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
}: DashboardMobileProps) {
  const dashboardTestId = createTestId('dashboard')

  // Drawer content for mobile
  const drawerContent = (
    <div className="flex flex-col">
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
        editingPoint={editingPoint}
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
      <MobileBottomDrawer
        isOpen={isDrawerOpen}
        onClose={onDrawerClose}
        dashboardContent={drawerContent}
        pointsCount={payPoints.length}
      />
      <DashboardLayout>
        <div className="flex min-h-full flex-col gap-6" data-testid={dashboardTestId('root')}>
          {/* Header - only show when we have data on mobile */}
          {hasData && (
            <div className="flex flex-col gap-1 font-medium text-[var(--text-muted)]">
              {TEXT.app.name}
            </div>
          )}

          {/* Metrics - only show when we have data */}
          {hasData && (
            <>
              {isDemoMode && <DemoDataBanner onClearDemo={onClearDemo} />}
              <StatusBanner statistics={statistics} />
            </>
          )}

          {/* Chart Section */}
          {hasData ? (
            <div className="mb-8 flex min-h-[350px] flex-1">
              <Suspense
                fallback={<ChartSkeleton className="w-full rounded-xl bg-white shadow-sm" />}
              >
                <ChartSection
                  payPoints={payPoints}
                  inflationData={inflationData}
                  isNetMode={isNetMode}
                  onToggleMode={onToggleMode}
                  onRequestAdd={onDrawerOpen}
                  onEditPayPoint={onEditPoint}
                  onRemovePayPoint={onRemovePoint}
                />
              </Suspense>
            </div>
          ) : (
            <OnboardingEmptyState onLoadDemo={onLoadDemo} onOpenDrawer={onDrawerOpen} />
          )}
        </div>
      </DashboardLayout>
    </>
  )
}
