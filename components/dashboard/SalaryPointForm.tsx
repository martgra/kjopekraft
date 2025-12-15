'use client'

import { useState, useEffect } from 'react'
import type { InflationDataPoint } from '@/domain/inflation'
import type { PayChangeReason, PayPoint } from '@/domain/salary'
import { TEXT } from '@/lib/constants/text'
import { Select, SelectOption } from '@/components/ui/atoms'

interface SalaryPointFormProps {
  newYear: string
  newPay: string
  newReason: PayChangeReason | ''
  newNote?: string
  currentYear: number
  minYear: number
  payPoints?: PayPoint[]
  validationError?: string
  isNetMode?: boolean
  inflationData?: InflationDataPoint[]
  onYearChange: (yearStr: string) => void
  onPayChange: (payStr: string) => void
  onReasonChange: (reason: PayChangeReason | '') => void
  onNoteChange?: (note: string) => void
  onAdd: () => void
}

export default function SalaryPointForm({
  newYear,
  newPay,
  newReason,
  newNote = '',
  currentYear,
  minYear,
  payPoints = [],
  validationError: externalValidationError,
  onYearChange,
  onPayChange,
  onReasonChange,
  onNoteChange,
  onAdd,
  isNetMode,
  inflationData,
}: SalaryPointFormProps) {
  const [internalValidationError, setInternalValidationError] = useState<string>('')
  const [showNote, setShowNote] = useState(() => Boolean(newNote))
  const validationError = externalValidationError || internalValidationError

  const yearNum = Number(newYear)
  const payNum = Number(newPay.replace(/\s/g, ''))

  const formatAmountInput = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '')
    if (!digitsOnly) return ''
    return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  // Determine inflation data range
  const inflationMinYear =
    inflationData && inflationData.length > 0
      ? Math.min(...inflationData.map(d => d.year))
      : minYear

  const isYearValid = !isNaN(yearNum) && yearNum >= minYear && yearNum <= currentYear
  const isYearInInflationRange = !isNaN(yearNum) && yearNum >= inflationMinYear
  const isPayValid = !isNaN(payNum) && payNum > 0
  const isReasonValid = Boolean(newReason)
  const isDuplicateYear = !isNaN(yearNum) && payPoints.some(point => point.year === yearNum)

  const disabled =
    !newYear ||
    !newPay ||
    !newReason ||
    !isYearValid ||
    !isPayValid ||
    !isYearInInflationRange ||
    isDuplicateYear

  useEffect(() => {
    if (newNote && !showNote) {
      setShowNote(true)
    }
  }, [newNote, showNote])

  useEffect(() => {
    if (isDuplicateYear) {
      setInternalValidationError(TEXT.forms.validation.yearExists)
    } else if (newYear && !isNaN(yearNum)) {
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
    isDuplicateYear,
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
              onChange={e => onPayChange(formatAmountInput(e.target.value))}
              placeholder="0"
              className="block w-full rounded-lg border-gray-300 bg-[var(--background-light)] py-2.5 pr-3 pl-10 text-base text-[var(--text-main)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)]"
            />
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {isNetMode ? TEXT.forms.netAmountHelp : TEXT.forms.grossAmountHelp}
          </p>
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
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={newYear}
            onChange={e => onYearChange(e.target.value.replace(/\D/g, ''))}
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
          <Select
            id="salary-reason"
            value={newReason}
            onChange={value => onReasonChange(value as PayChangeReason | '')}
            leftIcon="category"
            className="bg-[var(--background-light)] text-[var(--text-main)]"
          >
            <SelectOption value="">{TEXT.forms.reasonPlaceholder}</SelectOption>
            <SelectOption value="adjustment">{TEXT.forms.reasonOptions.adjustment}</SelectOption>
            <SelectOption value="promotion">{TEXT.forms.reasonOptions.promotion}</SelectOption>
            <SelectOption value="newJob">{TEXT.forms.reasonOptions.newJob}</SelectOption>
          </Select>
          <select
            aria-hidden="true"
            tabIndex={-1}
            className="sr-only"
            data-testid="salary-form-reason-select"
            value={newReason}
            onChange={e => onReasonChange(e.target.value as PayChangeReason | '')}
          >
            <option value="">{TEXT.forms.reasonPlaceholder}</option>
            <option value="adjustment">{TEXT.forms.reasonOptions.adjustment}</option>
            <option value="promotion">{TEXT.forms.reasonOptions.promotion}</option>
            <option value="newJob">{TEXT.forms.reasonOptions.newJob}</option>
          </select>
          <p className="mt-1 text-xs text-[var(--text-muted)]">{TEXT.forms.reasonHelp}</p>
        </div>

        {/* Optional note */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowNote(prev => !prev)}
            className="flex w-full items-center justify-between rounded-md border border-[var(--border-light)] bg-white px-3 py-2 text-sm font-semibold text-[var(--text-main)] transition hover:bg-[var(--background-light)]"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[var(--primary)]">
                edit_note
              </span>
              {showNote ? TEXT.forms.hideNote : TEXT.forms.addNote}
            </span>
            <span className="material-symbols-outlined text-[18px] text-[var(--text-muted)]">
              {showNote ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          {showNote && (
            <div className="space-y-1">
              <label
                htmlFor="salary-note"
                className="text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase"
              >
                {TEXT.forms.noteLabel}
              </label>
              <textarea
                id="salary-note"
                data-testid="salary-form-note-input"
                value={newNote}
                onChange={e => onNoteChange?.(e.target.value)}
                placeholder={TEXT.forms.notePlaceholder}
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-[var(--background-light)] px-3 py-2.5 text-sm text-[var(--text-main)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <p className="text-xs text-[var(--text-muted)]">{TEXT.forms.noteHelp}</p>
            </div>
          )}
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
