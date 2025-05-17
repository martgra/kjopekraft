'use client'

import React, { useState, useEffect } from 'react'
import PayPointForm from '@/components/forms/PayPointForm'
import PayPointListItem from '@/components/forms/PayPointListItem'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { DEFAULT_SALARY } from '@/lib/constants'
import { TEXT } from '@/lib/constants/text'
import type { PayPoint } from '@/lib/models/salary'
import type { InflationDataPoint } from '@/lib/models/inflation'

export default function PayPointsManager({
  payPoints,
  onAdd,
  onRemove,
  onEdit,
  onReset,
  isLoading: ptsLoading,
  inflationData = [],
}: {
  payPoints: PayPoint[]
  onAdd: (pt: PayPoint) => { isValid: boolean; errorMessage?: string }
  onRemove: (year: number, pay: number) => void
  onEdit: (
    oldYear: number,
    oldPay: number,
    newPoint: PayPoint,
  ) => { isValid: boolean; errorMessage?: string }
  onReset: (defaultPoints: PayPoint[]) => void
  validatePoint: (pt: PayPoint) => { isValid: boolean; errorMessage?: string }
  isLoading?: boolean
  inflationData?: InflationDataPoint[]
}) {
  // Sorted points
  const sorted = ptsLoading ? [] : [...payPoints].sort((a, b) => a.year - b.year)
  const currentYear = new Date().getFullYear()

  // Determine minimum year from inflation data
  const [minYear, setMinYear] = useState<number>(currentYear)
  useEffect(() => {
    if (inflationData.length > 0) {
      setMinYear(Math.min(...inflationData.map((d: InflationDataPoint) => d.year)))
    } else {
      setMinYear(currentYear)
    }
  }, [inflationData, currentYear])

  // New point form state
  const [newYear, setNewYear] = useState<string>('')
  const [newPay, setNewPay] = useState<string>('')
  const [validationError, setValidationError] = useState<string>('')

  const handleAdd = () => {
    const y = Number(newYear)
    const p = Number(newPay.replace(/\s/g, ''))
    const result = onAdd({ year: y, pay: p })
    if (result.isValid) {
      setNewYear('')
      setNewPay('')
      setValidationError('')
    } else {
      setValidationError(result.errorMessage || '')
    }
  }

  const handleReset = () => {
    if (confirm(TEXT.common.confirmReset)) {
      const freshMin =
        inflationData.length > 0 ? Math.min(...inflationData.map(d => d.year)) : currentYear
      const defaults: PayPoint[] = [
        { year: freshMin, pay: DEFAULT_SALARY },
        { year: currentYear, pay: DEFAULT_SALARY },
      ]
      onReset(defaults)
    }
  }

  // Loading state
  const loading = ptsLoading

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-gray-500 sm:text-sm">
          {TEXT.forms.yourPoints} ({loading ? '...' : sorted.length})
        </h4>
        {!loading && sorted.length > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-gray-500 underline hover:text-red-600"
          >
            {TEXT.common.reset}
          </button>
        )}
      </div>

      {/* Existing points */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="small" text={TEXT.common.loadingData} />
          </div>
        ) : sorted.length > 0 ? (
          sorted.map((point, idx) => (
            <PayPointListItem
              key={`${point.year}-${point.pay}-${idx}`}
              point={point}
              currentYear={currentYear}
              minYear={minYear}
              onRemove={() => onRemove(point.year, point.pay)}
              onEdit={newPoint => onEdit(point.year, point.pay, newPoint)}
            />
          ))
        ) : (
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700 sm:p-4 sm:text-sm">
            <p>{TEXT.forms.noPointsMessage}</p>
          </div>
        )}
      </div>

      {/* New point form */}
      {!loading && (
        <PayPointForm
          newYear={newYear}
          newPay={newPay}
          currentYear={currentYear}
          minYear={minYear}
          validationError={validationError}
          onYearChange={setNewYear}
          onPayChange={setNewPay}
          onAdd={handleAdd}
        />
      )}
    </div>
  )
}
