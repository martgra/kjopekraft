import { Badge } from '@/components/ui/atoms'
import type { PayPoint, SalaryTableRow } from '@/domain/salary'
import { TEXT } from '@/lib/constants/text'
import {
  formatCurrencyWithUnit,
  formatDate,
  reasonToLabel,
  reasonVariant,
} from './salaryTableFormatting'
import { SalaryRowExpansion } from '@/components/ui/salary/SalaryRowExpansion'
import { SalaryRowPower } from '@/components/ui/salary/SalaryRowPower'

interface SalaryTableRowMobileProps {
  row: SalaryTableRow
  payPoint?: PayPoint
  baselineYear: number | null
  isExpanded: boolean
  onToggle: () => void
  powerMode?: 'absolute' | 'percent'
  positivePowerYears?: number
  totalYears?: number
}

export function SalaryTableRowMobile({
  row,
  payPoint,
  baselineYear,
  isExpanded,
  onToggle,
  powerMode = 'percent',
  positivePowerYears,
  totalYears,
}: SalaryTableRowMobileProps) {
  return (
    <div className="relative rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] p-4 shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="absolute top-3 right-3 rounded-full p-1.5 text-[var(--text-muted)] transition hover:text-[var(--primary)]"
        aria-expanded={isExpanded}
        aria-label={isExpanded ? TEXT.views.table.collapseDetails : TEXT.views.table.expandDetails}
      >
        <span className="material-symbols-outlined text-[18px]">
          {isExpanded ? 'expand_less' : 'expand_more'}
        </span>
      </button>
      <div className="flex items-start gap-3">
        <div className="w-12 pt-1 text-xs font-semibold text-[var(--text-muted)] uppercase">
          <span>{formatDate(row.year)}</span>
          {row.isInterpolated && (
            <Badge className="mt-1" size="sm" variant="info">
              {TEXT.views.table.interpolated}
            </Badge>
          )}
        </div>
        <div className="flex-1 space-y-3 pr-8">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <p className="text-xl leading-tight font-bold text-[var(--text-main)]">
                {formatCurrencyWithUnit(row.salary)}
              </p>
            </div>
            {payPoint?.reason && (
              <Badge
                size="sm"
                variant={reasonVariant(payPoint.reason)}
                withRing={false}
                className="self-start text-[10px] font-bold uppercase"
              >
                {reasonToLabel(payPoint.reason)}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)]">
            <SalaryRowPower row={row} mode={powerMode} className="text-[11px]" />
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="mt-2">
          <SalaryRowExpansion
            row={row}
            payPoint={payPoint}
            baselineYear={baselineYear}
            positivePowerYears={positivePowerYears}
            totalYears={totalYears}
          />
        </div>
      )}
    </div>
  )
}
