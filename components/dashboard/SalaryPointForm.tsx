'use client'

import type { PayChangeReason } from '@/domain/salary'
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
  validationError?: string
  isSubmitDisabled?: boolean
  isNetMode?: boolean
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
  newNote: _newNote = '',
  currentYear,
  minYear,
  validationError,
  isSubmitDisabled = false,
  onYearChange,
  onPayChange,
  onReasonChange,
  onNoteChange: _onNoteChange,
  onAdd,
  isNetMode,
}: SalaryPointFormProps) {
  const testId = createTestId('salary-form')

  const disabled = isSubmitDisabled
  const amountLabel = isNetMode ? TEXT.forms.netAmount : TEXT.forms.grossAmount
  const yearRangeLabel = TEXT.forms.yearRange
    .replace('{min}', String(minYear))
    .replace('{max}', String(currentYear))

  const handleYearInput = (value: string) => {
    onYearChange(value.replace(/\D/g, ''))
  }

  return (
    <div className="space-y-4 px-2 pt-40" data-testid={testId('container')}>
      <form className="space-y-4" onSubmit={e => e.preventDefault()} data-testid={testId()}>
        {/* Amount Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="salary-amount"
            className="block text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase"
          >
            {amountLabel}
          </label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <span className="text-base font-medium text-gray-500 dark:text-gray-400">kr</span>
            </div>
            <input
              id="salary-amount"
              data-testid={testId('amount-input')}
              type="text"
              inputMode="numeric"
              value={newPay}
              onChange={e => onPayChange(e.target.value)}
              placeholder="0"
              className="block w-full rounded-xl border border-transparent bg-[var(--background-light)] py-3 pr-4 pl-12 text-base font-medium text-[var(--text-main)] placeholder-gray-400 shadow-sm transition-all focus:border-[var(--primary)] focus:ring-0"
            />
          </div>
        </div>

        {/* Year and Reason Fields - Side by side */}
        <div className="grid grid-cols-2 gap-3">
          {/* Year Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="salary-year"
              className="block text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase"
            >
              {yearRangeLabel}
            </label>
            <input
              id="salary-year"
              data-testid={testId('year-input')}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={newYear}
              onChange={e => handleYearInput(e.target.value)}
              placeholder={String(currentYear)}
              className="block w-full rounded-xl border border-transparent bg-[var(--background-light)] px-4 py-3 text-base font-medium text-[var(--text-main)] shadow-sm transition-all focus:border-[var(--primary)] focus:ring-0"
            />
          </div>

          {/* Reason Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="salary-reason"
              className="block text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase"
            >
              Årsak
            </label>
            <div className="relative">
              <Select
                id="salary-reason"
                value={newReason}
                onChange={value => onReasonChange(value as PayChangeReason | '')}
                className="text-sm font-medium"
                placement="up"
              >
                <SelectOption value="">{TEXT.forms.reasonPlaceholder}</SelectOption>
                <SelectOption value="adjustment">
                  {TEXT.forms.reasonOptions.adjustment}
                </SelectOption>
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
          </div>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="rounded-md border border-red-200 bg-red-50 p-2 text-xs font-medium text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {validationError}
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="button"
            data-testid={testId('submit-button')}
            onClick={onAdd}
            disabled={disabled}
            className="w-full rounded-xl bg-[var(--primary)] py-3.5 text-base font-bold text-white shadow-sm transition-all hover:bg-[var(--primary-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {TEXT.forms.saveLog}
          </button>
        </div>
      </form>
    </div>
  )
}
