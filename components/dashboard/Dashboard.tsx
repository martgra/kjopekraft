'use client'

import { useEffect, useCallback } from 'react'
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

  const { payPoints, hasData, addPoint, editPoint, removePoint, isLoading, error } =
    useSalaryDataContext()
  const { isNetMode, toggleMode } = useDisplayMode()
  const purchasingPower = usePurchasingPower(payPoints, inflationData, currentYear, {
    useNet: true,
  })
  const {
    fields: { year: newYear, pay: newPay, reason: newReason, note: newNote },
    setters: { setYear, setPay, setReason, setNote, setValidationError },
    minYear,
    validationError,
    isSubmitDisabled,
    isFormModalOpen,
    editingPoint,
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
    if (isMobile) {
      onDrawerOpen()
    } else {
      openFormModal()
    }
  }

  const handleRemovePoint = (year: number, pay: number) => {
    removePayPoint(year, pay)
  }

  // New unified save handler used by the new modal/sheet components
  const handleSavePoint = useCallback(
    (data: PayPoint) => {
      if (editingPoint) {
        const updated: PayPoint = { ...data, id: editingPoint.id }
        editPoint(editingPoint.year, editingPoint.pay, updated)
      } else {
        const { id: _id, ...pointData } = data
        addPoint(pointData)
      }
      if (isMobile) {
        onDrawerClose()
      } else {
        closeFormModal()
      }
      clearEditing()
    },
    [editingPoint, editPoint, addPoint, isMobile, onDrawerClose, closeFormModal, clearEditing],
  )

  const handleDeletePoint = useCallback(
    (point: PayPoint) => {
      removePoint(point.year, point.pay)
      clearEditing()
    },
    [removePoint, clearEditing],
  )

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
    editingPoint,
    onToggleMode: toggleMode,
    onEditPoint: handleEditPoint,
    onRemovePoint: handleRemovePoint,
    onYearChange: setYear,
    onPayChange: setPay,
    onReasonChange: setReason,
    onNoteChange: setNote,
    onSubmitPoint: submitPoint,
    onSavePoint: handleSavePoint,
    onDeletePoint: handleDeletePoint,
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
