'use client'

import React, { useState, useMemo, useEffect } from 'react'
import PayPointForm from '@/features/salary/components/PayPointForm'
import PayPointListItem from '@/features/salary/components/PayPointListItem'
import TaxSummary from '@/features/tax/components/TaxSummary'
import { TEXT } from '@/lib/constants/text'
import type { PayPoint } from '@/lib/models/salary'
import type { InflationDataPoint } from '@/lib/models/inflation'
import {
  calculateTax,
  calculateNetIncome,
  calculateGrossFromNet,
} from '@/features/tax/taxCalculator'
import { useDisplayMode } from '@/contexts/displayMode/DisplayModeContext'

interface ValidationResult {
  isValid: boolean
  errorMessage?: string
}

interface DataEntryGuideProps {
  payPoints: PayPoint[]
  onAdd: (pt: PayPoint) => ValidationResult
  onRemove: (pt: PayPoint) => void
  onEdit: (oldPoint: PayPoint, newPoint: PayPoint) => ValidationResult
  validatePoint: (pt: PayPoint) => ValidationResult
  inflationData: InflationDataPoint[]
}

export default function DataEntryGuide({
  payPoints,
  onAdd,
  onRemove,
  onEdit,
  validatePoint,
  inflationData,
}: DataEntryGuideProps) {
  const [year, setYear] = useState('')
  const [pay, setPay] = useState('')
  const [error, setError] = useState<string>()

  // Load/save display mode to localStorage
  const { isNetMode, toggleMode } = useDisplayMode()

  useEffect(() => {
    localStorage.setItem('salaryDisplayMode', isNetMode ? 'net' : 'gross')
  }, [isNetMode])

  const currentYear = new Date().getFullYear()
  const minYear = useMemo(() => Math.min(...inflationData.map(d => d.year)), [inflationData])

  const handleAdd = (): ValidationResult => {
    const yr = Number(year)
    const rawPay = Number(pay.replace(/\s/g, ''))
    const gross = isNetMode ? calculateGrossFromNet(yr, rawPay) : rawPay

    // prevent duplicate year
    if (payPoints.some(pt => pt.year === yr)) {
      const msg = `Du har allerede en post for året ${yr}.`
      setError(msg)
      return { isValid: false, errorMessage: msg }
    }

    // run your existing validation
    const validation = validatePoint({ year: yr, pay: gross })
    if (!validation.isValid) {
      setError(validation.errorMessage)
      return validation
    }

    setError(undefined)
    const result = onAdd({ year: yr, pay: gross })
    if (!result.isValid) {
      setError(result.errorMessage)
    } else {
      setYear('')
      setPay('')
    }
    return result
  }

  const handleEdit = (oldPt: PayPoint, newPt: PayPoint): ValidationResult => {
    const yr = newPt.year
    const rawPay = newPt.pay
    const gross = isNetMode ? calculateGrossFromNet(yr, rawPay) : rawPay

    // Create a new point with the ID preserved from the old point
    const pointToEdit = {
      ...newPt,
      id: oldPt.id, // Preserve the ID
      pay: gross,
      year: yr,
    }

    // Let the validatePoint function handle the duplicate year check
    // The validatePoint function correctly checks for duplicates excluding the current ID
    const validation = validatePoint(pointToEdit)
    if (!validation.isValid) {
      setError(validation.errorMessage)
      return validation
    }

    setError(undefined)
    const result = onEdit(oldPt, pointToEdit)
    if (!result.isValid) {
      setError(result.errorMessage)
    }
    return result
  }

  // Recompute whenever payPoints changes
  const taxData = useMemo(
    () =>
      payPoints.map(pt => {
        const gross = pt.pay
        const net = calculateNetIncome(pt.year, gross)
        return {
          year: pt.year,
          gross,
          net,
          tax: calculateTax(pt.year, gross),
        }
      }),
    [payPoints],
  )

  return (
    <section className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{TEXT.forms.yourPoints}</h2>
      </div>

      <p className="text-gray-600">{TEXT.forms.noPointsMessage}</p>

      <PayPointForm
        newYear={year}
        newPay={pay}
        currentYear={currentYear}
        minYear={minYear}
        validationError={error}
        onYearChange={setYear}
        onPayChange={setPay}
        onAdd={handleAdd}
        isNetMode={isNetMode} // now from context
      />

      <div className="space-y-2">
        {payPoints.map(pt => (
          <PayPointListItem
            key={`${pt.year}-${pt.pay}`}
            point={isNetMode ? { year: pt.year, pay: calculateNetIncome(pt.year, pt.pay) } : pt}
            onRemove={() => onRemove(pt)}
            onEdit={newPt => handleEdit(pt, newPt)}
            currentYear={currentYear}
            minYear={minYear}
            isNetMode={isNetMode} // now from context
          />
        ))}
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center justify-center space-x-2 rounded-lg bg-gray-50 p-3">
        <span className={`text-sm ${!isNetMode ? 'font-medium text-blue-600' : 'text-gray-500'}`}>
          Bruttolønn
        </span>
        <button
          onClick={toggleMode} // now from context
          className="relative inline-flex h-6 w-11 items-center rounded-full"
          aria-pressed={isNetMode}
        >
          <span className="sr-only">
            {isNetMode ? 'Bytt til bruttolønn' : 'Bytt til nettolønn'}
          </span>
          <div
            className={`absolute inset-0 rounded-full transition-colors duration-200 ${
              isNetMode ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
          <div
            className={`absolute h-4 w-4 transform rounded-full bg-white transition ${
              isNetMode ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>

        <span className={`text-sm ${isNetMode ? 'font-medium text-blue-600' : 'text-gray-500'}`}>
          Nettolønn
        </span>
      </div>

      <TaxSummary taxData={taxData} />
    </section>
  )
}
