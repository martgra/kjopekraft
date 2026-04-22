'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import SalaryPointForm from './SalaryPointForm'
import DesktopAddModal from './DesktopAddModal'
import type { InflationDataPoint } from '@/domain/inflation'
import type { PayPoint, PayChangeReason, SalaryStatistics } from '@/domain/salary'
import { TEXT } from '@/lib/constants/text'
import { createTestId } from '@/lib/testing/testIds'
import DashboardContent from './DashboardContent'

interface DashboardDesktopProps {
  // Data
  payPoints: PayPoint[]
  statistics: SalaryStatistics
  inflationData: InflationDataPoint[]
  currentYear: number
  hasData: boolean

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
  isSubmitDisabled: boolean
  editingPoint: PayPoint | null

  // Handlers
  onOpenFormModal: () => void
  onCloseFormModal: () => void
  onToggleMode: () => void
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
  inflationData,
  statistics,
  currentYear,
  hasData,
  isNetMode,
  isFormModalOpen,
  newYear,
  newPay,
  newReason,
  newNote,
  minYear,
  validationError,
  isSubmitDisabled,
  editingPoint,
  onOpenFormModal,
  onCloseFormModal,
  onToggleMode,
  onEditPoint,
  onRemovePoint,
  onYearChange,
  onPayChange,
  onReasonChange,
  onNoteChange,
  onSubmitPoint,
}: DashboardDesktopProps) {
  const dashboardTestId = createTestId('dashboard')

  const formProps = {
    newYear,
    newPay,
    newReason,
    newNote,
    currentYear,
    minYear,
    validationError,
    isSubmitDisabled,
    isNetMode,
    onYearChange,
    onPayChange,
    onReasonChange,
    onNoteChange,
    onAdd: onSubmitPoint,
  }

  // Right panel sidebar (always visible on desktop)
  const rightPanelContent = (
    <div className="flex h-full flex-col" data-testid={dashboardTestId('right-panel')}>
      <SalaryPointForm {...formProps} />
    </div>
  )

  return (
    <>
      <DashboardLayout rightPanel={rightPanelContent}>
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
          onRequestAdd={onOpenFormModal}
        />
      </DashboardLayout>

      {/* Two-column desktop modal */}
      <DesktopAddModal
        open={isFormModalOpen}
        onClose={onCloseFormModal}
        newYear={newYear}
        newPay={newPay}
        newReason={newReason}
        newNote={newNote}
        currentYear={currentYear}
        minYear={minYear}
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
      />
    </>
  )
}
