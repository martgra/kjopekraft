import type { SalaryTableRow } from '@/domain/salary'
import { cn } from '@/lib/utils/cn'
import { TEXT } from '@/lib/constants/text'
import {
  formatPercent,
  formatSignedCurrency,
  purchasingPowerCopy,
  purchasingPowerSymbol,
} from '@/lib/formatters/salaryFormatting'

interface SalaryRowPowerProps {
  row: SalaryTableRow
  className?: string
  mode?: 'absolute' | 'percent'
  /**
   * Hide verbose copy (e.g. "Kjøpekraften økte") when embedding in tight layouts.
   */
  showDescription?: boolean
  /**
   * Hide the middle separator dot when description is hidden.
   */
  showSeparator?: boolean
  /**
   * Render description as screen-reader only text when hidden visually.
   */
  srDescription?: boolean
}

export function SalaryRowPower({
  row,
  className,
  mode = 'absolute',
  showDescription = true,
  showSeparator = true,
  srDescription = false,
}: SalaryRowPowerProps) {
  const powerVariant =
    row.purchasingPowerDelta > 0 ? 'success' : row.purchasingPowerDelta < 0 ? 'error' : 'info'
  const hasPriorData = row.yoyAbsoluteChange !== null
  const purchasingPowerText = hasPriorData
    ? purchasingPowerCopy(row.purchasingPowerDelta)
    : TEXT.views.table.firstYear
  const icon = hasPriorData ? purchasingPowerSymbol(row.purchasingPowerDelta) : 'trending_flat'
  const iconColor =
    powerVariant === 'success'
      ? 'text-[var(--primary)]'
      : powerVariant === 'error'
        ? 'text-red-600'
        : 'text-[var(--text-muted)]'

  const showAbsolute = mode === 'absolute'
  const valueText = hasPriorData ? null : TEXT.views.table.notAvailable

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]',
        className,
      )}
    >
      <span className={cn('material-symbols-outlined text-[16px]', iconColor)}>{icon}</span>
      {showAbsolute ? (
        <span className="text-[var(--text-main)] tabular-nums">
          {valueText ?? `${formatSignedCurrency(row.purchasingPowerDelta)} ${TEXT.common.pts}`}
        </span>
      ) : (
        <span className="tabular-nums">
          {valueText ?? formatPercent(row.purchasingPowerPercent)}
        </span>
      )}
      {showDescription && (
        <>
          {showSeparator && <span className="h-1 w-1 rounded-full bg-[var(--border-light)]" />}
          <span
            className={cn(
              'font-medium',
              powerVariant === 'error' ? 'text-red-600' : 'text-[var(--text-main)]',
            )}
          >
            {purchasingPowerText}
          </span>
        </>
      )}
      {!showDescription && srDescription && (
        <span className="sr-only">
          {hasPriorData
            ? `${purchasingPowerText} (${formatPercent(row.purchasingPowerPercent)})`
            : purchasingPowerText}
        </span>
      )}
    </div>
  )
}
