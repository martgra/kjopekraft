'use client'

import { Badge } from '@/components/ui/atoms'
import type { PayPoint, SalaryTableRow } from '@/domain/salary'
import { TEXT } from '@/lib/constants/text'
import { useSalaryRowActions } from '@/features/salary/hooks/useSalaryRowActions'
import {
  formatCurrencyWithUnit,
  formatDate,
  reasonToLabel,
  reasonVariant,
} from '@/lib/formatters/salaryFormatting'
import { SalaryRowExpansion } from '@/components/ui/salary/SalaryRowExpansion'
import { SalaryRowPower } from '@/components/ui/salary/SalaryRowPower'
import { SalaryRowActionButtons } from './SalaryRowActionButtons'

interface SalaryTableRowMobileProps {
  row: SalaryTableRow
  payPoint?: PayPoint
  baselineYear: number | null
  isExpanded: boolean
  onToggle: () => void
  powerMode?: 'absolute' | 'percent'
  positivePowerYears?: number
  totalYears?: number
  onEditPayPoint?: (point: PayPoint) => void
  onRemovePayPoint?: (year: number, pay: number) => void
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
  onEditPayPoint,
  onRemovePayPoint,
}: SalaryTableRowMobileProps) {
  const {
    hasActions,
    isActionMenuOpen,
    menuRef,
    rowRef,
    toggleActions,
    closeActions,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleBlur,
  } = useSalaryRowActions({
    payPoint,
    onEditPayPoint,
    onRemovePayPoint,
  })

  return (
    <div
      ref={rowRef}
      className="relative rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] p-4 shadow-sm"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onBlur={handleBlur}
      tabIndex={-1}
    >
      <div className="absolute top-3 right-3 flex items-center gap-1">
        {hasActions && (
          <button
            type="button"
            onClick={toggleActions}
            className="rounded-full p-1.5 text-[var(--text-muted)] transition hover:text-[var(--primary)]"
            aria-label="Flere valg"
          >
            <span className="material-symbols-outlined text-[18px]">more_horiz</span>
          </button>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="rounded-full p-1.5 text-[var(--text-muted)] transition hover:text-[var(--primary)]"
          aria-expanded={isExpanded}
          aria-label={
            isExpanded ? TEXT.views.table.collapseDetails : TEXT.views.table.expandDetails
          }
        >
          <span className="material-symbols-outlined text-[18px]">
            {isExpanded ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      </div>
      {hasActions && isActionMenuOpen && (
        <div
          ref={menuRef}
          className="absolute top-10 right-2 z-10 w-36 rounded-lg border border-[var(--border-light)] bg-white p-2 shadow-lg dark:bg-gray-800"
        >
          {payPoint && (
            <SalaryRowActionButtons
              payPoint={payPoint}
              variant="mobile"
              onEditPayPoint={onEditPayPoint}
              onRemovePayPoint={onRemovePayPoint}
              onAfterAction={closeActions}
            />
          )}
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="w-14 pt-1 text-xs font-semibold text-[var(--text-muted)] uppercase">
          <span className="tabular-nums">{formatDate(row.year)}</span>
          {row.isInterpolated && (
            <Badge className="mt-1" size="sm" variant="info">
              {TEXT.views.table.interpolated}
            </Badge>
          )}
        </div>
        <div className="flex-1 space-y-2 pr-10">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-lg leading-tight font-bold text-[var(--text-main)] tabular-nums">
              {formatCurrencyWithUnit(row.salary)}
            </p>
            <SalaryRowPower
              row={row}
              mode={powerMode}
              showDescription={false}
              showSeparator={false}
              srDescription
              className="text-[11px]"
            />
          </div>
          {payPoint?.reason && isExpanded && (
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <Badge
                size="sm"
                variant={reasonVariant(payPoint.reason)}
                withRing={false}
                className="text-[10px] font-bold uppercase"
              >
                {reasonToLabel(payPoint.reason)}
              </Badge>
            </div>
          )}
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
