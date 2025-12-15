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
}

export function SalaryTableRowMobile({
  row,
  payPoint,
  baselineYear,
  isExpanded,
  onToggle,
  powerMode = 'percent',
}: SalaryTableRowMobileProps) {
  return (
    <div className="rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-12 pt-1 text-xs font-semibold text-[var(--text-muted)] uppercase">
          <span>{formatDate(row.year)}</span>
          {row.isInterpolated && (
            <Badge className="mt-1" size="sm" variant="info">
              {TEXT.views.table.interpolated}
            </Badge>
          )}
        </div>
        <div className="flex-1 space-y-3">
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
      <div className="mt-2">
        <button
          type="button"
          onClick={onToggle}
          className="text-[11px] font-semibold text-[var(--primary)] hover:underline"
          aria-expanded={isExpanded}
        >
          {isExpanded ? TEXT.views.table.collapseDetails : TEXT.views.table.expandDetails}
        </button>
        {isExpanded && (
          <SalaryRowExpansion row={row} payPoint={payPoint} baselineYear={baselineYear} />
        )}
      </div>
    </div>
  )
}
