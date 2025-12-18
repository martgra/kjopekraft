'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import MobileBottomDrawer from '@/components/layout/MobileBottomDrawer'
import SalaryPointForm from './SalaryPointForm'
import type { InflationDataPoint } from '@/domain/inflation'
import type { PayPoint, PayChangeReason, SalaryStatistics } from '@/domain/salary'
import DashboardContent from './DashboardContent'

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
  isSubmitDisabled: boolean

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
  inflationData,
  statistics,
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
  isSubmitDisabled,
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
        isSubmitDisabled={isSubmitDisabled}
        isNetMode={isNetMode}
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
        <DashboardContent
          payPoints={payPoints}
          statistics={statistics}
          inflationData={inflationData}
          currentYear={currentYear}
          hasData={hasData}
          isDemoMode={isDemoMode}
          isNetMode={isNetMode}
          onToggleMode={onToggleMode}
          onLoadDemo={onLoadDemo}
          onClearDemo={onClearDemo}
          onEditPoint={onEditPoint}
          onRemovePoint={onRemovePoint}
          onRequestAdd={onDrawerOpen}
          showHeader={false}
          showMetricGrid={false}
          chartWrapperClassName="mb-8"
        />
      </DashboardLayout>
    </>
  )
}
