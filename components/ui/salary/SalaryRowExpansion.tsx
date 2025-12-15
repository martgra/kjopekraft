import { Badge } from '@/components/ui/atoms'
import type { PayPoint, SalaryTableRow } from '@/domain/salary'
import { TEXT } from '@/lib/constants/text'
import {
  formatPercent,
  longTermSummary,
  reasonToLabel,
} from '@/features/salary/components/salaryTableFormatting'

interface SalaryRowExpansionProps {
  row: SalaryTableRow
  payPoint?: PayPoint
  baselineYear: number | null
}

export function SalaryRowExpansion({ row, payPoint, baselineYear }: SalaryRowExpansionProps) {
  const summary = longTermSummary(baselineYear, row.cumulativeChange, row.cumulativePercent)
  const badgeLabel = formatPercent(row.cumulativePercent) || TEXT.views.table.purchasingPowerFlat

  return (
    <div className="mt-2 rounded-lg bg-[var(--color-gray-50)] p-3 text-xs">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-[var(--text-main)]">
          {TEXT.views.table.longTermLabel}
        </span>
        <Badge size="sm" variant={row.cumulativeChange >= 0 ? 'success' : 'error'} withRing={false}>
          {badgeLabel}
        </Badge>
      </div>
      <p className="mt-1 text-[var(--text-muted)]">{summary}</p>
      {payPoint?.reason && (
        <p className="mt-1 text-[var(--text-muted)]">
          {TEXT.views.table.eventDetailLabel}: {reasonToLabel(payPoint.reason)}
        </p>
      )}
    </div>
  )
}
