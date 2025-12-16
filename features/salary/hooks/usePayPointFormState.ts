import { useCallback, useEffect, useState } from 'react'
import { validatePayPoint } from '@/domain/salary'
import type { PayChangeReason, PayPoint } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'
import { TEXT } from '@/lib/constants/text'

const MIN_YEAR = 1900

interface UsePayPointFormStateOptions {
  payPoints: PayPoint[]
  currentYear: number
  inflationData: InflationDataPoint[]
  hasData: boolean
  addPoint: (point: PayPoint) => void
  removePoint: (year: number, pay: number) => void
}

function mapValidationToMessage(
  validation: ReturnType<typeof validatePayPoint>,
  fallbackYear: number,
) {
  const minAllowedYear = validation.details?.minYear ?? MIN_YEAR
  const maxAllowedYear = validation.details?.maxYear ?? fallbackYear

  switch (validation.errorCode) {
    case 'REQUIRED':
      return TEXT.forms.validation.required
    case 'PAY_POSITIVE':
      return TEXT.forms.validation.payPositive
    case 'INVALID_REASON':
      return TEXT.forms.validation.required
    case 'YEAR_RANGE':
      return TEXT.forms.validation.yearRange
        .replace('{min}', String(minAllowedYear))
        .replace('{max}', String(maxAllowedYear))
    case 'DUPLICATE_YEAR':
      return TEXT.forms.validation.yearExists
    default:
      return validation.errorMessage || TEXT.forms.validation.invalidInput
  }
}

export function usePayPointFormState({
  payPoints,
  currentYear,
  inflationData,
  hasData,
  addPoint,
  removePoint,
}: UsePayPointFormStateOptions) {
  const [newYear, setNewYear] = useState('')
  const [newPay, setNewPay] = useState('')
  const [newReason, setNewReason] = useState<PayChangeReason | ''>('adjustment')
  const [newNote, setNewNote] = useState('')
  const [validationError, setValidationError] = useState('')
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingPoint, setEditingPoint] = useState<PayPoint | null>(null)

  // Pre-fill the next logical year when user already has data and the field is empty
  useEffect(() => {
    if (!payPoints.length || newYear) return

    const existingYears = payPoints.map(p => p.year)
    const lastYear = Math.max(...existingYears)
    let candidate = Math.min(currentYear, lastYear + 1)

    const usedYears = new Set(existingYears)
    while (usedYears.has(candidate) && candidate <= currentYear) {
      candidate += 1
    }

    if (candidate <= currentYear && !usedYears.has(candidate)) {
      setNewYear(String(candidate))
    }
  }, [payPoints, newYear, currentYear])

  // Exit demo mode if the user now has real data
  useEffect(() => {
    if (hasData && isDemoMode) {
      setIsDemoMode(false)
    }
  }, [hasData, isDemoMode])

  const clearEditing = useCallback(() => {
    setEditingPoint(null)
    setValidationError('')
  }, [])

  const openFormModal = useCallback(() => setIsFormModalOpen(true), [])
  const closeFormModal = useCallback(() => setIsFormModalOpen(false), [])

  const formatAmountInput = useCallback((value: string) => {
    const digitsOnly = value.replace(/\D/g, '')
    if (!digitsOnly) return ''
    return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }, [])

  const beginEditing = useCallback((point: PayPoint) => {
    setNewYear(String(point.year))
    setNewPay(String(point.pay))
    setNewReason(point.reason)
    setNewNote(point.note ?? '')
    setValidationError('')
    setEditingPoint(point)
  }, [])

  const submitPoint = useCallback(() => {
    if (!newReason) {
      setValidationError(TEXT.forms.validation.required)
      return false
    }

    const point: PayPoint = {
      year: Number(newYear),
      pay: Number(newPay.replace(/\s/g, '')),
      reason: newReason,
      note: newNote.trim() || undefined,
      id: editingPoint?.id,
    }

    // When editing, filter out the point being edited by ID (or by reference if ID is not available)
    const existingForValidation = editingPoint
      ? payPoints.filter(p => {
          // If both have IDs, compare by ID
          if (p.id && editingPoint.id) {
            return p.id !== editingPoint.id
          }
          // Otherwise compare by reference or year+pay combination
          return p !== editingPoint && !(p.year === editingPoint.year && p.pay === editingPoint.pay)
        })
      : payPoints
    const validation = validatePayPoint(point, existingForValidation, inflationData)
    if (!validation.isValid) {
      setValidationError(mapValidationToMessage(validation, currentYear))
      return false
    }

    // If adding real data while in demo mode, clear demo data first
    if (isDemoMode) {
      localStorage.removeItem('salary-calculator-points')
      setIsDemoMode(false)
    }

    // Replace original point if editing
    if (editingPoint) {
      removePoint(editingPoint.year, editingPoint.pay)
    }

    addPoint(point)

    const existingYears = new Set(payPoints.map(p => p.year))
    existingYears.add(point.year)
    let nextYear = point.year + 1
    while (existingYears.has(nextYear) && nextYear <= currentYear) {
      nextYear += 1
    }
    const nextYearValue = nextYear <= currentYear ? String(nextYear) : ''

    // Keep amount for quick consecutive entries; reset reason to default per guidance
    setNewYear(nextYearValue)
    setNewPay(newPay)
    setNewReason('adjustment')
    setNewNote('')
    setValidationError('')
    setEditingPoint(null)

    if (isFormModalOpen) {
      setIsFormModalOpen(false)
    }

    return true
  }, [
    newReason,
    newYear,
    newPay,
    newNote,
    editingPoint,
    payPoints,
    inflationData,
    currentYear,
    isDemoMode,
    addPoint,
    removePoint,
    isFormModalOpen,
  ])

  const removePayPoint = useCallback(
    (year: number, pay: number) => {
      removePoint(year, pay)
    },
    [removePoint],
  )

  const loadDemoData = useCallback(
    (demoPoints: PayPoint[]) => {
      localStorage.removeItem('salary-calculator-points')
      demoPoints.forEach(point => addPoint(point))
      setIsDemoMode(true)
    },
    [addPoint],
  )

  const clearDemoData = useCallback(() => {
    localStorage.removeItem('salary-calculator-points')
    setIsDemoMode(false)
    payPoints.forEach(p => removePoint(p.year, p.pay))
  }, [payPoints, removePoint])

  return {
    fields: {
      year: newYear,
      pay: newPay,
      reason: newReason,
      note: newNote,
    },
    setters: {
      setYear: setNewYear,
      setPay: (value: string) => setNewPay(formatAmountInput(value)),
      setReason: setNewReason,
      setNote: setNewNote,
      setValidationError,
    },
    minYear: MIN_YEAR,
    validationError,
    isDemoMode,
    isFormModalOpen,
    editingPoint,
    openFormModal,
    closeFormModal,
    clearEditing,
    beginEditing,
    submitPoint,
    removePayPoint,
    loadDemoData,
    clearDemoData,
  }
}
