'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
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
                isSubmitDisabled={isSubmitDisabled}
                isNetMode={isNetMode}
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
