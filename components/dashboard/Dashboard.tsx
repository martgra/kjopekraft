'use client'

import { useEffect } from 'react'
import DashboardMobile from './DashboardMobile'
import DashboardDesktop from './DashboardDesktop'
import { useSalaryData } from '@/features/salary/hooks/useSalaryData'
import { usePayPointFormState } from '@/features/salary/hooks/usePayPointFormState'
import { useDisplayMode } from '@/contexts/displayMode/DisplayModeContext'
import { useIsMobile } from '@/lib/hooks/useIsMobile'
import { DEMO_PAY_POINTS } from '@/features/onboarding/demoData'
import type { InflationDataPoint } from '@/domain/inflation'
import type { PayPoint } from '@/domain/salary'
import { TEXT } from '@/lib/constants/text'

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
  const isMobile = useIsMobile()

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
    isSubmitDisabled,
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

  const handleEditPoint = (point: PayPoint) => {
    beginEditing(point)
    // On mobile, use drawer; on desktop, use modal
    if (isMobile) {
      onDrawerOpen()
    } else {
      openFormModal()
    }
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

  // Shared props for both mobile and desktop
  const commonProps = {
    payPoints,
    statistics,
    inflationData,
    currentYear,
    hasData,
    isDemoMode,
    isNetMode,
    newYear,
    newPay,
    newReason,
    newNote,
    minYear,
    validationError,
    isSubmitDisabled,
    onToggleMode: toggleMode,
    onLoadDemo: handleLoadDemo,
    onClearDemo: handleClearDemo,
    onEditPoint: handleEditPoint,
    onRemovePoint: handleRemovePoint,
    onYearChange: setYear,
    onPayChange: setPay,
    onReasonChange: setReason,
    onNoteChange: setNote,
    onSubmitPoint: submitPoint,
  }

  return isMobile ? (
    <DashboardMobile
      {...commonProps}
      isDrawerOpen={isDrawerOpen}
      onDrawerOpen={onDrawerOpen}
      onDrawerClose={onDrawerClose}
    />
  ) : (
    <DashboardDesktop
      {...commonProps}
      isFormModalOpen={isFormModalOpen}
      onOpenFormModal={openFormModal}
      onCloseFormModal={closeFormModal}
    />
  )
}
