'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import MobileAddSheet from './MobileAddSheet'
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

  // Display state
  isNetMode: boolean
  isDrawerOpen: boolean

  // Form state
  newYear: string
  newPay: string
  newReason: PayChangeReason | ''
  newNote: string
  validationError: string
  isSubmitDisabled: boolean
  editingPoint: PayPoint | null

  // Handlers
  onDrawerOpen: () => void
  onDrawerClose: () => void
  onToggleMode: () => void
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
  isNetMode,
  isDrawerOpen,
  newYear,
  newPay,
  newReason,
  newNote,
  validationError,
  isSubmitDisabled,
  editingPoint,
  onDrawerOpen,
  onDrawerClose,
  onToggleMode,
  onEditPoint,
  onRemovePoint,
  onYearChange,
  onPayChange,
  onReasonChange,
  onNoteChange,
  onSubmitPoint,
}: DashboardMobileProps) {
  const handleDelete = (point: PayPoint) => {
    onRemovePoint(point.year, point.pay)
  }

  return (
    <>
      {/* Full-screen add/edit sheet */}
      <MobileAddSheet
        open={isDrawerOpen}
        onClose={onDrawerClose}
        newYear={newYear}
        newPay={newPay}
        newReason={newReason}
        newNote={newNote}
        currentYear={currentYear}
        validationError={validationError}
        isSubmitDisabled={isSubmitDisabled}
        isNetMode={isNetMode}
        payPoints={payPoints}
        editingPoint={editingPoint}
        inflationData={inflationData}
        onYearChange={onYearChange}
        onPayChange={onPayChange}
        onReasonChange={onReasonChange}
        onNoteChange={onNoteChange}
        onAdd={onSubmitPoint}
        onDelete={handleDelete}
      />

      <DashboardLayout>
        <DashboardContent
          payPoints={payPoints}
          statistics={statistics}
          inflationData={inflationData}
          currentYear={currentYear}
          hasData={hasData}
          isNetMode={isNetMode}
          onToggleMode={onToggleMode}
          onEditPoint={onEditPoint}
          onRemovePoint={onRemovePoint}
          onRequestAdd={onDrawerOpen}
          showHeader={false}
          showMetricGrid={false}
          chartWrapperClassName="mb-4"
        />
      </DashboardLayout>
    </>
  )
}
