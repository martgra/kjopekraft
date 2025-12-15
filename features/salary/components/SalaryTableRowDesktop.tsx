import { Badge } from '@/components/ui/atoms'
import type { SalaryTableRow, PayPoint } from '@/domain/salary'
import { TEXT } from '@/lib/constants/text'
import { cn } from '@/lib/utils/cn'
import {
  formatCurrencyWithUnit,
  formatDate,
  formatPercent,
  formatRelativeYear,
  formatSignedCurrency,
  reasonToLabel,
  reasonVariant,
} from './salaryTableFormatting'
import { SalaryRowExpansion } from '@/components/ui/salary/SalaryRowExpansion'
import { SalaryRowPower } from '@/components/ui/salary/SalaryRowPower'

interface SalaryTableRowDesktopProps {
  row: SalaryTableRow
  payPoint?: PayPoint
  isNetMode: boolean
  baselineYear: number | null
  isExpanded: boolean
  onToggle: () => void
  powerMode?: 'absolute' | 'percent'
  positivePowerYears?: number
  totalYears?: number
}

export function SalaryTableRowDesktop({
  row,
  payPoint,
  isNetMode,
  baselineYear,
  isExpanded,
  onToggle,
  powerMode = 'percent',
  positivePowerYears,
  totalYears,
}: SalaryTableRowDesktopProps) {
  const isPositiveYoY = (row.yoyAbsoluteChange ?? 0) >= 0
  return (
    <tr className="hover:bg-[var(--color-gray-50)]/60">
      <td className="px-5 py-4 align-top">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-[var(--text-main)]">
              {formatDate(row.year)}
            </span>
            {row.isInterpolated && (
              <Badge size="sm" variant="info">
                {TEXT.views.table.interpolated}
              </Badge>
            )}
          </div>
          <span className="text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase">
            {formatRelativeYear(row.year)}
          </span>
        </div>
      </td>
      <td className="px-5 py-4 align-top">
        {payPoint?.reason ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge size="sm" variant={reasonVariant(payPoint.reason)}>
              {reasonToLabel(payPoint.reason)}
            </Badge>
          </div>
        ) : (
          <span className="text-xs text-[var(--text-muted)]">&nbsp;</span>
        )}
      </td>
      <td className="px-5 py-4 align-top">
        <div className="flex flex-col gap-1">
          <span className="text-base font-semibold text-[var(--text-main)] tabular-nums">
            {formatCurrencyWithUnit(row.salary)}
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            {isNetMode ? TEXT.views.table.columns.netSalary : TEXT.views.table.columns.salary}
          </span>
        </div>
      </td>
      <td className="px-5 py-4 align-top">
        <div className="flex flex-col gap-2">
          {row.yoyAbsoluteChange === null ? (
            <span className="text-sm text-[var(--text-muted)]">{TEXT.views.table.firstYear}</span>
          ) : (
            <>
              <span
                className={cn(
                  'text-base font-semibold tabular-nums',
                  isPositiveYoY ? 'text-[var(--primary)]' : 'text-red-600',
                )}
              >
                {`${formatSignedCurrency(row.yoyAbsoluteChange)} ${TEXT.common.pts}`}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {formatPercent(row.yoyPercentChange)}
              </span>
            </>
          )}
          <SalaryRowPower row={row} mode={powerMode} />
          <div className="pt-1">
            <button
              type="button"
              onClick={onToggle}
              className="text-xs font-semibold text-[var(--primary)] hover:underline"
              aria-expanded={isExpanded}
            >
              {isExpanded ? TEXT.views.table.collapseDetails : TEXT.views.table.expandDetails}
            </button>
            {isExpanded && (
              <SalaryRowExpansion
                row={row}
                payPoint={payPoint}
                baselineYear={baselineYear}
                positivePowerYears={positivePowerYears}
                totalYears={totalYears}
              />
            )}
          </div>
        </div>
      </td>
    </tr>
  )
}
