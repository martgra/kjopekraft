'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { ModalShell } from '@/components/ui/atoms'
import SalaryPointForm from './SalaryPointForm'
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
  isSubmitDisabled: boolean

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
  inflationData,
  statistics,
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
  isSubmitDisabled,
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

  const renderForm = () => <SalaryPointForm {...formProps} />

  // Right panel content for desktop sidebar
  const rightPanelContent = (
    <div className="flex h-full flex-col" data-testid={dashboardTestId('right-panel')}>
      {renderForm()}
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
          isDemoMode={isDemoMode}
          isNetMode={isNetMode}
          onToggleMode={onToggleMode}
          onLoadDemo={onLoadDemo}
          onClearDemo={onClearDemo}
          onEditPoint={onEditPoint}
          onRemovePoint={onRemovePoint}
          onRequestAdd={onOpenFormModal}
        />
      </DashboardLayout>

      {/* Desktop Modal Overlay */}
      {isFormModalOpen && (
        <ModalShell
          onClose={onCloseFormModal}
          className="w-full max-w-lg overflow-hidden rounded-2xl"
          backdropClassName="z-50"
          wrapperClassName="z-[60]"
        >
          <div className="flex items-center justify-between border-b border-[var(--border-light)] px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--primary)]">add_circle</span>
              <h3 className="text-base font-bold text-[var(--text-main)]">
                {TEXT.forms.logSalaryPoint}
              </h3>
            </div>
            <button
              onClick={onCloseFormModal}
              className="rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--surface-subtle)]"
              aria-label={TEXT.common.close}
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <div className="max-h-[80vh] overflow-y-auto">{renderForm()}</div>
        </ModalShell>
      )}
    </>
  )
}
