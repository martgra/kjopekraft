'use client'

import { useState, useEffect } from 'react'
import type { InflationDataPoint } from '@/domain/inflation'
import type { PayChangeReason } from '@/domain/salary'
import { TEXT } from '@/lib/constants/text'

interface SalaryPointFormProps {
  newYear: string
  newPay: string
  newReason: PayChangeReason | ''
  currentYear: number
  minYear: number
  validationError?: string
  isNetMode?: boolean
  inflationData?: InflationDataPoint[]
  onYearChange: (yearStr: string) => void
  onPayChange: (payStr: string) => void
  onReasonChange: (reason: PayChangeReason | '') => void
  onAdd: () => void
}

export default function SalaryPointForm({
  newYear,
  newPay,
  newReason,
  currentYear,
  minYear,
  validationError: externalValidationError,
  onYearChange,
  onPayChange,
  onReasonChange,
  onAdd,
  isNetMode,
  inflationData,
}: SalaryPointFormProps) {
  const [internalValidationError, setInternalValidationError] = useState<string>('')
  const validationError = externalValidationError || internalValidationError

  const yearNum = Number(newYear)
  const payNum = Number(newPay.replace(/\s/g, ''))

  // Determine inflation data range
  const inflationMinYear =
    inflationData && inflationData.length > 0
      ? Math.min(...inflationData.map(d => d.year))
      : minYear

  const isYearValid = !isNaN(yearNum) && yearNum >= minYear && yearNum <= currentYear
  const isYearInInflationRange = !isNaN(yearNum) && yearNum >= inflationMinYear
  const isPayValid = !isNaN(payNum) && payNum > 0
  const isReasonValid = Boolean(newReason)
  const disabled =
    !newYear || !newPay || !newReason || !isYearValid || !isPayValid || !isYearInInflationRange

  useEffect(() => {
    if (newYear && !isNaN(yearNum)) {
      if (!isYearValid) {
        setInternalValidationError(
          TEXT.forms.validation.yearRange
            .replace('{min}', String(minYear))
            .replace('{max}', String(currentYear)),
        )
      } else if (!isYearInInflationRange) {
        setInternalValidationError(
          TEXT.forms.validation.inflationDataUnavailable.replace(
            '{minYear}',
            String(inflationMinYear),
          ),
        )
      } else {
        setInternalValidationError('')
      }
    } else if (newPay && !isNaN(payNum) && !isPayValid) {
      setInternalValidationError(TEXT.forms.validation.payPositive)
    } else if (newReason && !isReasonValid) {
      setInternalValidationError(TEXT.forms.validation.required)
    } else {
      setInternalValidationError('')
    }
  }, [
    newYear,
    newPay,
    newReason,
    yearNum,
    payNum,
    isYearValid,
    isYearInInflationRange,
    isPayValid,
    isReasonValid,
    minYear,
    currentYear,
    inflationMinYear,
  ])

  return (
    <div className="border-b border-[var(--border-light)] p-6" data-testid="salary-form-container">
      <div className="mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[var(--primary)]">add_circle</span>
        <h3 className="text-base font-bold text-[var(--text-main)]">{TEXT.forms.logSalaryPoint}</h3>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={e => e.preventDefault()}
        data-testid="salary-form"
      >
        {/* Amount Field */}
        <div>
          <label
            htmlFor="salary-amount"
            className="mb-1.5 block text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase"
          >
            {isNetMode ? TEXT.forms.netAmount : TEXT.forms.grossAmount}
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="font-bold text-gray-500">kr</span>
            </div>
            <input
              id="salary-amount"
              data-testid="salary-form-amount-input"
              type="text"
              inputMode="numeric"
              value={newPay}
              onChange={e => onPayChange(e.target.value.replace(/[^\d\s]/g, ''))}
              placeholder="0"
              className="block w-full rounded-lg border-gray-300 bg-[var(--background-light)] py-2.5 pr-3 pl-10 text-base text-[var(--text-main)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)]"
            />
          </div>
        </div>

        {/* Year Field */}
        <div>
          <label
            htmlFor="salary-year"
            className="mb-1.5 block text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase"
          >
            {TEXT.forms.yearRange
              .replace('{min}', String(minYear))
              .replace('{max}', String(currentYear))}
          </label>
          <input
            id="salary-year"
            data-testid="salary-form-year-input"
            type="number"
            min={minYear}
            max={currentYear}
            value={newYear}
            onChange={e => onYearChange(e.target.value)}
            placeholder={String(currentYear)}
            className="block w-full rounded-lg border-gray-300 bg-[var(--background-light)] px-3 py-2.5 text-base text-[var(--text-main)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)]"
          />
        </div>

        {/* Reason Field */}
        <div>
          <label
            htmlFor="salary-reason"
            className="mb-1.5 block text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase"
          >
            {TEXT.forms.reasonLabel}
          </label>
          <select
            id="salary-reason"
            data-testid="salary-form-reason-select"
            value={newReason}
            onChange={e => onReasonChange(e.target.value as PayChangeReason | '')}
            className="block w-full rounded-lg border-gray-300 bg-[var(--background-light)] px-3 py-2.5 text-base text-[var(--text-main)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)]"
          >
            <option value="">{TEXT.forms.reasonPlaceholder}</option>
            <option value="adjustment">{TEXT.forms.reasonOptions.adjustment}</option>
            <option value="promotion">{TEXT.forms.reasonOptions.promotion}</option>
            <option value="newJob">{TEXT.forms.reasonOptions.newJob}</option>
          </select>
          <p className="mt-1 text-xs text-[var(--text-muted)]">{TEXT.forms.reasonHelp}</p>
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
          data-testid="salary-form-submit-button"
          onClick={onAdd}
          disabled={disabled}
          className="mt-2 flex w-full justify-center rounded-lg border border-transparent bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-600 focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:outline-none disabled:opacity-50"
        >
          {TEXT.forms.saveLog}
        </button>
      </form>
    </div>
  )
}
