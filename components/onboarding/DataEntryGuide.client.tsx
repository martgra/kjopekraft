'use client'

import React, { useState, useMemo, useEffect } from 'react'
import PayPointForm from '@/components/forms/PayPointForm'
import PayPointListItem from '@/components/forms/PayPointListItem'
import TaxSummary from '@/components/taxation/TaxSummary'
import { TEXT } from '@/lib/constants/text'
import type { PayPoint } from '@/lib/models/salary'
import type { InflationDataPoint } from '@/lib/models/inflation'
import {
  calculateTax,
  calculateNetIncome,
  calculateGrossFromNet,
} from '@/lib/taxation/taxCalculator'

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

  // Initialize from localStorage if available, or default to true (nettolønn)
  const [isNetMode, setIsNetMode] = useState(() => {
    // Only run in the browser, not during SSR
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('salaryDisplayMode')
      return savedMode === null ? true : savedMode === 'net'
    }
    return true
  })

  // Save to localStorage whenever mode changes
  useEffect(() => {
    localStorage.setItem('salaryDisplayMode', isNetMode ? 'net' : 'gross')
  }, [isNetMode])

  const currentYear = new Date().getFullYear()
  const minYear = useMemo(() => Math.min(...inflationData.map(d => d.year)), [inflationData])

  const toggleMode = () => {
    setIsNetMode(m => !m)
    setError(undefined)
    setYear('')
    setPay('')
  }

  const handleAdd = (): ValidationResult => {
    const yr = Number(year)
    const rawPay = Number(pay.replace(/\s/g, ''))
    const gross = isNetMode ? calculateGrossFromNet(yr, rawPay) : rawPay

    // 1) duplicate-year guard
    if (payPoints.some(pt => pt.year === yr)) {
      const msg = `Du har allerede en post for året ${yr}.`
      setError(msg)
      return { isValid: false, errorMessage: msg }
    }

    // 2) your existing validation
    const validation = validatePoint({ year: yr, pay: gross })
    if (!validation.isValid) {
      setError(validation.errorMessage)
      return validation
    }

    setError(undefined)
    // 3) call handler
    const result = onAdd({ year: yr, pay: gross })
    if (!result.isValid) setError(result.errorMessage)
    else {
      setYear('')
      setPay('')
    }
    return result
  }

  const handleEdit = (oldPt: PayPoint, newPt: PayPoint): ValidationResult => {
    const yr = newPt.year
    const rawPay = newPt.pay
    const gross = isNetMode ? calculateGrossFromNet(yr, rawPay) : rawPay

    // duplicate-year guard (ignore oldPt)
    if (yr !== oldPt.year && payPoints.some(pt => pt.year === yr)) {
      const msg = `Du har allerede en post for året ${yr}.`
      setError(msg)
      return { isValid: false, errorMessage: msg }
    }

    const validation = validatePoint({ year: yr, pay: gross })
    if (!validation.isValid) {
      setError(validation.errorMessage)
      return validation
    }

    setError(undefined)
    const result = onEdit(oldPt, { year: yr, pay: gross })
    if (!result.isValid) setError(result.errorMessage)
    return result
  }

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
        {/* Reset button removed */}
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
        isNetMode={isNetMode}
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
            isNetMode={isNetMode}
          />
        ))}
      </div>

      {/* Mode Toggle Switch - Moved here above TaxSummary */}
      <div className="flex items-center justify-center space-x-2 rounded-lg bg-gray-50 p-3">
        <span className={`text-sm ${!isNetMode ? 'font-medium text-blue-600' : 'text-gray-500'}`}>
          Bruttolønn
        </span>

        <button
          onClick={toggleMode}
          className="relative inline-flex h-6 w-11 items-center rounded-full"
          aria-pressed={isNetMode}
        >
          <span className="sr-only">
            {isNetMode ? 'Bytt til bruttolønn' : 'Bytt til nettolønn'}
          </span>
          <div
            className={` ${isNetMode ? 'bg-blue-600' : 'bg-gray-300'} absolute inset-0 rounded-full transition-colors duration-200`}
          />
          <div
            className={` ${isNetMode ? 'translate-x-5' : 'translate-x-1'} absolute h-4 w-4 transform rounded-full bg-white transition duration-200`}
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
