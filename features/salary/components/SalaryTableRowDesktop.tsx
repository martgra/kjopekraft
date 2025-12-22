import { Badge } from '@/components/ui/atoms'
import type { SalaryTableRow, PayPoint } from '@/domain/salary'
import { TEXT } from '@/lib/constants/text'
import {
  formatCurrencyWithUnit,
  formatDate,
  formatRelativeYear,
} from '@/lib/formatters/salaryFormatting'
import { SalaryRowExpansion } from '@/components/ui/salary/SalaryRowExpansion'
import { SalaryRowPower } from '@/components/ui/salary/SalaryRowPower'

interface SalaryTableRowDesktopProps {
  row: SalaryTableRow
  payPoint?: PayPoint
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
  baselineYear,
  isExpanded,
  onToggle,
  powerMode = 'percent',
  positivePowerYears,
  totalYears,
}: SalaryTableRowDesktopProps) {
  return (
    <tr className="hover:bg-[var(--color-gray-50)]/60">
      <td className="px-5 py-4 align-top">
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
      </td>
      <td className="px-5 py-4 align-top">
        <span className="text-xs text-[var(--text-muted)]">&nbsp;</span>
      </td>
      <td className="px-5 py-4 align-top">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-base font-semibold text-[var(--text-main)] tabular-nums">
                {formatCurrencyWithUnit(row.salary)}
              </span>
              {row.yoyAbsoluteChange !== null && (
                <SalaryRowPower
                  row={row}
                  mode={powerMode}
                  showDescription={false}
                  showSeparator={false}
                  srDescription
                />
              )}
            </div>
            <button
              type="button"
              onClick={onToggle}
              className="text-xs font-semibold text-[var(--primary)] hover:underline"
              aria-expanded={isExpanded}
            >
              {isExpanded ? TEXT.views.table.collapseDetails : TEXT.views.table.expandDetails}
            </button>
          </div>
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
      </td>
    </tr>
  )
}
