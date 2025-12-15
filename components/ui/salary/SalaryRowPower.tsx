import type { SalaryTableRow } from '@/domain/salary'
import { cn } from '@/lib/utils/cn'
import { TEXT } from '@/lib/constants/text'
import {
  formatPercent,
  formatSignedCurrency,
  purchasingPowerCopy,
  purchasingPowerSymbol,
} from '@/features/salary/components/salaryTableFormatting'

interface SalaryRowPowerProps {
  row: SalaryTableRow
  className?: string
  mode?: 'absolute' | 'percent'
}

export function SalaryRowPower({ row, className, mode = 'absolute' }: SalaryRowPowerProps) {
  const powerVariant =
    row.purchasingPowerDelta > 0 ? 'success' : row.purchasingPowerDelta < 0 ? 'error' : 'info'
  const purchasingPowerText = purchasingPowerCopy(row.purchasingPowerDelta)
  const icon = purchasingPowerSymbol(row.purchasingPowerDelta)
  const iconColor =
    powerVariant === 'success'
      ? 'text-[var(--primary)]'
      : powerVariant === 'error'
        ? 'text-red-600'
        : 'text-[var(--text-muted)]'

  const showAbsolute = mode === 'absolute'
  const showPercent = mode === 'percent'

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
          {`${formatSignedCurrency(row.purchasingPowerDelta)} ${TEXT.common.pts}`}
        </span>
      ) : (
        <span className="tabular-nums">{formatPercent(row.purchasingPowerPercent)}</span>
      )}
      <span className="h-1 w-1 rounded-full bg-[var(--border-light)]" />
      <span
        className={cn(
          'font-medium',
          powerVariant === 'error' ? 'text-red-600' : 'text-[var(--text-main)]',
        )}
      >
        {purchasingPowerText}
      </span>
    </div>
  )
}
