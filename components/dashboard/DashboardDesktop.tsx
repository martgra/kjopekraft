'use client'

import AddSalaryModal from './AddSalaryModal'
import type { InflationDataPoint } from '@/domain/inflation'
import type { PayPoint, PayChangeReason, SalaryStatistics } from '@/domain/salary'
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

  // Editing
  editingPoint: PayPoint | null

  // Form state (kept for compatibility)
  newYear: string
  newPay: string
  newReason: PayChangeReason | ''
  newNote: string
  minYear: number
  validationError: string
  isSubmitDisabled: boolean

  // Handlers
  onOpenFormModal: () => void
  onCloseFormModal: () => void
  onToggleMode: () => void
  onEditPoint: (point: PayPoint) => void
  onRemovePoint: (year: number, pay: number) => void
  onSavePoint: (data: PayPoint) => void
  onDeletePoint: (point: PayPoint) => void

  // Legacy handlers (kept for compatibility)
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
  editingPoint,
  onOpenFormModal,
  onCloseFormModal,
  onToggleMode,
  onEditPoint,
  onRemovePoint,
  onSavePoint,
  onDeletePoint,
}: DashboardDesktopProps) {
  return (
    <>
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

      <AddSalaryModal
        open={isFormModalOpen}
        onClose={onCloseFormModal}
        onSave={onSavePoint}
        onDelete={onDeletePoint}
        editingPoint={editingPoint}
        payPoints={payPoints}
        currentYear={currentYear}
        isNetMode={isNetMode}
      />
    </>
  )
}
