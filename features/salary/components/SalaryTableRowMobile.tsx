'use client'

import { useRef, useState } from 'react'
import type { TouchEvent } from 'react'
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
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const longPressTimer = useRef<number | null>(null)

  const hasActions = Boolean(payPoint && (onEditPayPoint || onRemovePayPoint))

  const openActions = () => {
    if (!hasActions) return
    setIsActionMenuOpen(true)
  }

  const closeActions = () => {
    setIsActionMenuOpen(false)
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (!hasActions || e.touches.length !== 1) return
    touchStartX.current = e.touches[0]?.clientX ?? null
    // Long-press to reveal actions
    longPressTimer.current = window.setTimeout(() => {
      openActions()
    }, 450)
  }

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!hasActions || touchStartX.current === null) return
    const currentX = e.touches[0]?.clientX
    if (currentX === undefined) return
    const deltaX = currentX - touchStartX.current
    // Swipe left to reveal actions
    if (deltaX < -40) {
      setIsActionMenuOpen(true)
      if (longPressTimer.current) {
        window.clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
    }
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    touchStartX.current = null
  }

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      closeActions()
    }
  }

  return (
    <div
      className="relative rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] p-4 shadow-sm"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onBlur={handleBlur}
      tabIndex={-1}
    >
      <div className="absolute top-3 right-3 flex items-center gap-2">
        {hasActions && (
          <button
            type="button"
            onClick={() => setIsActionMenuOpen(open => !open)}
            className="rounded-full p-1.5 text-[var(--text-muted)] transition hover:text-[var(--primary)]"
            aria-label="Åpne handlinger"
          >
            <span className="material-symbols-outlined text-[18px]">more_vert</span>
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
      {isActionMenuOpen && hasActions && (
        <div className="absolute top-10 right-2 z-10 w-36 rounded-lg border border-[var(--border-light)] bg-white p-2 shadow-lg">
          {onEditPayPoint && (
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-semibold text-[var(--text-main)] hover:bg-[var(--color-gray-50)]"
              onClick={() => {
                onEditPayPoint(payPoint!)
                closeActions()
              }}
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              {TEXT.common.edit}
            </button>
          )}
          {onRemovePayPoint && (
            <button
              type="button"
              className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-semibold text-red-600 hover:bg-[var(--color-gray-50)]"
              onClick={() => {
                onRemovePayPoint(payPoint!.year, payPoint!.pay)
                closeActions()
              }}
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              {TEXT.common.remove}
            </button>
          )}
        </div>
      )}
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
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)]">
            <SalaryRowPower row={row} mode={powerMode} className="text-[11px]" />
          </div>
          {payPoint?.reason && (
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
