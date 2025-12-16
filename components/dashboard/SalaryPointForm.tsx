'use client'

import { useState, useEffect } from 'react'
import type { InflationDataPoint } from '@/domain/inflation'
import type { PayChangeReason, PayPoint } from '@/domain/salary'
import { TEXT } from '@/lib/constants/text'
import { Select, SelectOption } from '@/components/ui/atoms'
import { createTestId } from '@/lib/testing/testIds'

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
  const testId = createTestId('salary-form')

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
    <div className="space-y-6 p-6" data-testid={testId('container')}>
      <div className="mb-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-2xl text-[var(--primary)]">
          add_circle_outline
        </span>
        <h2 className="text-lg font-semibold text-[var(--text-main)]">
          {TEXT.forms.logSalaryPoint}
        </h2>
      </div>

      <form className="space-y-6" onSubmit={e => e.preventDefault()} data-testid={testId()}>
        {/* Amount Field */}
        <div className="space-y-2">
          <label
            htmlFor="salary-amount"
            className="block text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase"
          >
            {isNetMode ? TEXT.forms.netAmount : TEXT.forms.grossAmount}
          </label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <span className="text-lg font-medium text-gray-500">kr</span>
            </div>
            <input
              id="salary-amount"
              data-testid={testId('amount-input')}
              type="text"
              inputMode="numeric"
              value={newPay}
              onChange={e => onPayChange(formatAmountInput(e.target.value))}
              placeholder="0"
              className="block w-full rounded-xl border border-transparent bg-[var(--background-light)] py-3.5 pr-4 pl-12 text-lg font-medium text-[var(--text-main)] placeholder-gray-400 shadow-sm transition-all focus:border-[var(--primary)] focus:ring-0"
            />
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            {isNetMode ? TEXT.forms.netAmountHelp : TEXT.forms.grossAmountHelp}
          </p>
        </div>

        {/* Year Field */}
        <div className="space-y-2">
          <label
            htmlFor="salary-year"
            className="block text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase"
          >
            {TEXT.forms.yearRange
              .replace('{min}', String(minYear))
              .replace('{max}', String(currentYear))}
          </label>
          <input
            id="salary-year"
            data-testid={testId('year-input')}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={newYear}
            onChange={e => onYearChange(e.target.value.replace(/\D/g, ''))}
            placeholder={String(currentYear)}
            className="block w-full rounded-xl border border-transparent bg-[var(--background-light)] px-4 py-3.5 text-lg font-medium text-[var(--text-main)] shadow-sm transition-all focus:border-[var(--primary)] focus:ring-0"
          />
        </div>

        {/* Reason Field */}
        <div className="space-y-2">
          <label
            htmlFor="salary-reason"
            className="block text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase"
          >
            {TEXT.forms.reasonLabel}
          </label>
          <div className="relative">
            <Select
              id="salary-reason"
              value={newReason}
              onChange={value => onReasonChange(value as PayChangeReason | '')}
              leftIcon="category"
              className="text-base font-medium"
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
              data-testid={testId('reason-select')}
              value={newReason}
              onChange={e => onReasonChange(e.target.value as PayChangeReason | '')}
            >
              <option value="">{TEXT.forms.reasonPlaceholder}</option>
              <option value="adjustment">{TEXT.forms.reasonOptions.adjustment}</option>
              <option value="promotion">{TEXT.forms.reasonOptions.promotion}</option>
              <option value="newJob">{TEXT.forms.reasonOptions.newJob}</option>
            </select>
          </div>
          <p className="text-xs text-[var(--text-muted)]">{TEXT.forms.reasonHelp}</p>
        </div>

        {/* Optional note */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowNote(prev => !prev)}
            className="group flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-left shadow-sm transition-all hover:border-[var(--primary)]/50"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[var(--primary)]">notes</span>
              <span className="text-base font-medium text-[var(--text-main)]">
                {showNote ? TEXT.forms.hideNote : TEXT.forms.addNote}
              </span>
            </div>
            <span className="material-symbols-outlined text-gray-400 transition-colors group-hover:text-[var(--primary)]">
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
                data-testid={testId('note-input')}
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
        <div className="pt-4 pb-20">
          <button
            type="button"
            data-testid={testId('submit-button')}
            onClick={onAdd}
            disabled={disabled}
            className="w-full rounded-xl bg-[var(--primary)] py-4 text-lg font-bold text-white shadow-sm transition-all hover:bg-[var(--primary-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {TEXT.forms.saveLog}
          </button>
        </div>
      </form>
    </div>
  )
}
