'use client'

import { useEffect } from 'react'
import DashboardMobile from './DashboardMobile'
import DashboardDesktop from './DashboardDesktop'
import { usePurchasingPower } from '@/features/salary/hooks/usePurchasingPower'
import { usePayPointFormState } from '@/features/salary/hooks/usePayPointFormState'
import { useDisplayMode } from '@/contexts/displayMode/DisplayModeContext'
import { useIsMobile } from '@/lib/hooks/useIsMobile'
import type { InflationDataPoint } from '@/domain/inflation'
import type { PayPoint } from '@/domain/salary'
import { TEXT } from '@/lib/constants/text'
import { useSalaryDataContext } from '@/features/salary/providers/SalaryDataProvider'

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

  const { payPoints, hasData, addPoint, removePoint, isLoading, error } = useSalaryDataContext()
  const { isNetMode, toggleMode } = useDisplayMode()
  const purchasingPower = usePurchasingPower(payPoints, inflationData, currentYear, {
    // Kjøpekraft calculations should be net-first when available
    useNet: true,
  })
  const {
    fields: { year: newYear, pay: newPay, reason: newReason, note: newNote },
    setters: { setYear, setPay, setReason, setNote, setValidationError },
    minYear,
    validationError,
    isSubmitDisabled,
    isFormModalOpen,
    openFormModal,
    closeFormModal,
    clearEditing,
    beginEditing,
    submitPoint,
    removePayPoint,
  } = usePayPointFormState({
    payPoints,
    currentYear,
    inflationData,
    addPoint,
    removePoint,
  })

  const displayStatistics = isNetMode
    ? (purchasingPower.net?.statistics ?? purchasingPower.statistics)
    : purchasingPower.statistics

  // Clear editing state when overlays are closed
  useEffect(() => {
    if (!isDrawerOpen && !isFormModalOpen) {
      clearEditing()
      setValidationError('')
    }
  }, [clearEditing, isDrawerOpen, isFormModalOpen, setValidationError])

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

  const commonProps = {
    payPoints,
    statistics: displayStatistics,
    inflationData,
    currentYear,
    hasData,
    isNetMode,
    newYear,
    newPay,
    newReason,
    newNote,
    minYear,
    validationError,
    isSubmitDisabled,
    onToggleMode: toggleMode,
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
