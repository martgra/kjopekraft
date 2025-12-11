'use client'

import { useState, useEffect } from 'react'
import { TEXT } from '@/lib/constants/text'

interface SalaryPointFormProps {
  newYear: string
  newPay: string
  currentYear: number
  minYear: number
  validationError?: string
  isNetMode?: boolean
  onYearChange: (yearStr: string) => void
  onPayChange: (payStr: string) => void
  onAdd: () => void
}

export default function SalaryPointForm({
  newYear,
  newPay,
  currentYear,
  minYear,
  validationError: externalValidationError,
  onYearChange,
  onPayChange,
  onAdd,
  isNetMode,
}: SalaryPointFormProps) {
  const [internalValidationError, setInternalValidationError] = useState<string>('')
  const validationError = externalValidationError || internalValidationError

  const yearNum = Number(newYear)
  const payNum = Number(newPay.replace(/\s/g, ''))

  const isYearValid = !isNaN(yearNum) && yearNum >= minYear && yearNum <= currentYear
  const isPayValid = !isNaN(payNum) && payNum > 0
  const disabled = !newYear || !newPay || !isYearValid || !isPayValid

  useEffect(() => {
    if (newYear && !isNaN(yearNum) && !isYearValid) {
      setInternalValidationError(
        TEXT.forms.validation.yearRange
          .replace('{min}', String(minYear))
          .replace('{max}', String(currentYear)),
      )
    } else if (newPay && !isNaN(payNum) && !isPayValid) {
      setInternalValidationError(TEXT.forms.validation.payPositive)
    } else {
      setInternalValidationError('')
    }
  }, [newYear, newPay, yearNum, payNum, isYearValid, isPayValid, minYear, currentYear])

  return (
    <div className="border-b border-[var(--border-light)] p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[var(--primary)]">add_circle</span>
        <h3 className="text-base font-bold text-[var(--text-main)]">Log Salary Point</h3>
      </div>

      <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
        {/* Amount Field */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase">
            {isNetMode ? 'Net Amount' : 'Gross Amount'}
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="font-bold text-gray-500">kr</span>
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={newPay}
              onChange={e => onPayChange(e.target.value.replace(/[^\d\s]/g, ''))}
              placeholder="0"
              className="block w-full rounded-lg border-gray-300 bg-[var(--background-light)] py-2.5 pr-3 pl-10 text-sm text-[var(--text-main)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)]"
            />
          </div>
        </div>

        {/* Year Field */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase">
            Year ({minYear}-{currentYear})
          </label>
          <input
            type="number"
            min={minYear}
            max={currentYear}
            value={newYear}
            onChange={e => onYearChange(e.target.value)}
            placeholder={String(currentYear)}
            className="block w-full rounded-lg border-gray-300 bg-[var(--background-light)] px-3 py-2.5 text-sm text-[var(--text-main)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)]"
          />
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="rounded-md border border-red-200 bg-red-50 p-2 text-xs font-medium text-red-600">
            {validationError}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="button"
          onClick={onAdd}
          disabled={disabled}
          className="mt-2 flex w-full justify-center rounded-lg border border-transparent bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-600 focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:outline-none disabled:opacity-50"
        >
          Save Log
        </button>
      </form>
    </div>
  )
}
