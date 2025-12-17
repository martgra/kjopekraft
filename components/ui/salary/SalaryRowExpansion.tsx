import { Badge } from '@/components/ui/atoms'
import type { PayPoint, SalaryTableRow } from '@/domain/salary'
import { TEXT } from '@/lib/constants/text'
import {
  formatCurrencyWithUnit,
  formatPercent,
  longTermSummary,
  reasonToLabel,
} from '@/lib/formatters/salaryFormatting'

interface SalaryRowExpansionProps {
  row: SalaryTableRow
  payPoint?: PayPoint
  baselineYear: number | null
  positivePowerYears?: number
  totalYears?: number
  onChangeReference?: () => void
}

export function SalaryRowExpansion({
  row,
  payPoint,
  baselineYear,
  positivePowerYears,
  totalYears,
  onChangeReference,
}: SalaryRowExpansionProps) {
  const summary = longTermSummary(baselineYear, row.cumulativeChange, row.cumulativePercent)
  const badgeLabel = formatPercent(row.cumulativePercent) || TEXT.views.table.purchasingPowerFlat
  const hasReference = row.reference && row.reference.value !== null

  return (
    <div className="mt-2 space-y-3 text-xs">
      <section className="rounded-lg border border-[var(--border-light)] bg-white p-3">
        <div className="text-[11px] font-semibold tracking-wide text-[var(--text-muted)] uppercase">
          {TEXT.views.table.explanationTitle}
        </div>
        <div className="mt-2 space-y-1.5">
          <div className="flex items-start justify-between gap-3">
            <span className="text-[var(--text-muted)]">{TEXT.views.table.primaryDriver}</span>
            <span className="font-semibold text-[var(--text-main)]">
              {payPoint?.reason ? reasonToLabel(payPoint.reason) : TEXT.common.noData}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-[var(--text-muted)]">{TEXT.views.table.reasonNote}</span>
            <span className="text-right text-[var(--text-main)]">
              {payPoint?.note ?? TEXT.common.noData}
            </span>
          </div>
        </div>
      </section>

      {hasReference && row.reference?.value !== null && row.reference && (
        <section className="rounded-lg border border-[var(--border-light)] bg-white p-3">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold tracking-wide text-[var(--text-muted)] uppercase">
              {TEXT.views.table.referenceTitle}
            </div>
            {onChangeReference && (
              <button
                type="button"
                onClick={onChangeReference}
                className="text-[11px] font-semibold text-[var(--primary)] hover:underline"
              >
                {TEXT.common.edit}
              </button>
            )}
          </div>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-start justify-between gap-3">
              <span className="text-[var(--text-muted)]">{TEXT.views.table.referenceLabel}</span>
              <span className="text-right text-[var(--text-main)]">
                {row.reference.type === 'official'
                  ? TEXT.views.table.referenceOfficial
                  : TEXT.views.table.referenceEstimated}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-[var(--text-muted)]">{TEXT.views.table.referencePosition}</span>
              <span className="text-right font-semibold text-[var(--text-main)]">
                {row.reference.gapPercent !== null
                  ? formatPercent(row.reference.gapPercent)
                  : TEXT.common.noData}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3 text-[var(--text-muted)]">
              <span>{TEXT.views.table.referenceValue}</span>
              <span className="text-right text-[var(--text-main)]">
                {formatCurrencyWithUnit(row.reference.value)}
              </span>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-lg border border-[var(--border-light)] bg-white p-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold tracking-wide text-[var(--text-muted)] uppercase">
            {TEXT.views.table.longTermLabel}
          </span>
          <Badge
            size="sm"
            variant={row.cumulativeChange >= 0 ? 'success' : 'error'}
            withRing={false}
          >
            {badgeLabel}
          </Badge>
        </div>
        <p className="mt-1 text-[var(--text-main)]">{summary}</p>
        {positivePowerYears !== undefined && totalYears !== undefined && totalYears > 0 && (
          <p className="mt-1 text-[var(--text-muted)]">
            {TEXT.views.table.consistencyLabel(positivePowerYears, totalYears)}
          </p>
        )}
      </section>
    </div>
  )
}
