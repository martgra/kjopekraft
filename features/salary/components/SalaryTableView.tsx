'use client'

import { useMemo } from 'react'
import { Badge } from '@/components/ui/atoms'
import LoadingSpinner from '@/components/ui/common/LoadingSpinner'
import { buildSalaryTableRows, type SalaryDataPoint } from '@/domain/salary'
import { calculateNetIncome } from '@/domain/tax'
import type { ReferenceDataPoint } from '@/domain/reference'
import { TEXT } from '@/lib/constants/text'
import { cn } from '@/lib/utils/cn'

interface SalaryTableViewProps {
  salaryData: SalaryDataPoint[]
  referenceData?: ReferenceDataPoint[]
  isNetMode: boolean
  isLoading?: boolean
}

const formatCurrency = (value: number | null) =>
  value === null ? TEXT.common.noData : Math.round(value).toLocaleString('nb-NO')

const formatPercent = (value: number | null) =>
  value === null ? TEXT.common.noData : `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`

export function SalaryTableView({
  salaryData,
  referenceData = [],
  isNetMode,
  isLoading = false,
}: SalaryTableViewProps) {
  const transformPay = useMemo(
    () =>
      isNetMode ? (value: number, year: number) => calculateNetIncome(value, year) : undefined,
    [isNetMode],
  )

  const rows = useMemo(
    () =>
      buildSalaryTableRows({
        salaryData,
        referenceData,
        transformPay,
      }),
    [salaryData, referenceData, transformPay],
  )

  if (isLoading) {
    return <LoadingSpinner text={TEXT.common.loadingChart} />
  }

  if (!rows.length) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] p-6 text-sm text-[var(--text-muted)]">
        {TEXT.dashboard.noDataSubtitle}
      </div>
    )
  }

  const renderReferenceGap = (gap: number | null, gapPercent: number | null) => {
    if (gap === null) return TEXT.common.noData
    const isPositive = gap >= 0
    return (
      <div className="flex flex-col gap-0.5">
        <span
          className={cn(
            'text-sm font-semibold',
            isPositive ? 'text-[var(--primary)]' : 'text-red-600',
          )}
        >
          {isPositive ? '+' : ''}
          {Math.round(gap).toLocaleString('nb-NO')} {TEXT.common.pts}
        </span>
        <span className="text-xs text-[var(--text-muted)]">{formatPercent(gapPercent)}</span>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4" data-testid="salary-table-view">
      {/* Desktop table */}
      <div className="hidden overflow-auto rounded-lg border border-[var(--border-light)] bg-white shadow-sm md:block">
        <table className="min-w-full table-auto text-sm text-[var(--text-main)]">
          <thead className="bg-[var(--surface-light)] text-left text-xs tracking-wide text-[var(--text-muted)] uppercase">
            <tr>
              <th className="px-4 py-3">{TEXT.views.table.columns.year}</th>
              <th className="px-4 py-3">
                {isNetMode ? TEXT.views.table.columns.netSalary : TEXT.views.table.columns.salary}
              </th>
              <th className="px-4 py-3">{TEXT.views.table.columns.yoyChange}</th>
              <th className="px-4 py-3">{TEXT.views.table.columns.inflationAdjusted}</th>
              <th className="px-4 py-3">{TEXT.views.table.columns.powerDelta}</th>
              <th className="px-4 py-3">{TEXT.views.table.columns.referenceGap}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const isPositivePower = row.purchasingPowerDelta >= 0
              const isPositiveYoY = (row.yoyAbsoluteChange ?? 0) >= 0
              return (
                <tr
                  key={row.year}
                  className="border-t border-[var(--border-light)] hover:bg-[var(--color-gray-50)]"
                >
                  <td className="px-4 py-3 font-semibold">{row.year}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>{formatCurrency(row.salary)}</span>
                      {row.isInterpolated && (
                        <Badge size="sm" variant="info">
                          {TEXT.views.table.interpolated}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          isPositiveYoY ? 'text-[var(--primary)]' : 'text-red-600',
                        )}
                      >
                        {row.yoyAbsoluteChange === null
                          ? TEXT.common.noData
                          : `${isPositiveYoY ? '+' : ''}${Math.round(row.yoyAbsoluteChange).toLocaleString('nb-NO')} ${TEXT.common.pts}`}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {formatPercent(row.yoyPercentChange)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{formatCurrency(row.inflationAdjusted)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          isPositivePower ? 'text-[var(--primary)]' : 'text-red-600',
                        )}
                      >
                        {row.purchasingPowerDelta >= 0 ? '+' : ''}
                        {Math.round(row.purchasingPowerDelta).toLocaleString('nb-NO')}{' '}
                        {TEXT.common.pts}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {formatPercent(row.purchasingPowerPercent)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {row.reference
                      ? renderReferenceGap(
                          row.reference.gap ?? null,
                          row.reference.gapPercent ?? null,
                        )
                      : TEXT.common.noData}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {rows.map(row => {
          const isPositivePower = row.purchasingPowerDelta >= 0
          const isPositiveYoY = (row.yoyAbsoluteChange ?? 0) >= 0
          return (
            <div
              key={row.year}
              className="rounded-lg border border-[var(--border-light)] bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[var(--text-main)]">{row.year}</p>
                  {row.isInterpolated && (
                    <Badge size="sm" variant="info">
                      {TEXT.views.table.interpolated}
                    </Badge>
                  )}
                </div>
                <Badge variant={isPositivePower ? 'success' : 'warning'} size="sm">
                  {isPositivePower ? TEXT.views.table.badgeGain : TEXT.views.table.badgeLoss}
                </Badge>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">
                    {isNetMode
                      ? TEXT.views.table.columns.netSalary
                      : TEXT.views.table.columns.salary}
                  </p>
                  <p className="font-semibold text-[var(--text-main)]">
                    {formatCurrency(row.salary)} {TEXT.common.pts}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">
                    {TEXT.views.table.columns.yoyChange}
                  </p>
                  <p
                    className={cn(
                      'font-semibold',
                      isPositiveYoY ? 'text-[var(--primary)]' : 'text-red-600',
                    )}
                  >
                    {row.yoyAbsoluteChange === null
                      ? TEXT.common.noData
                      : `${isPositiveYoY ? '+' : ''}${Math.round(row.yoyAbsoluteChange).toLocaleString('nb-NO')} ${TEXT.common.pts}`}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {formatPercent(row.yoyPercentChange)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">
                    {TEXT.views.table.columns.powerDelta}
                  </p>
                  <p
                    className={cn(
                      'font-semibold',
                      isPositivePower ? 'text-[var(--primary)]' : 'text-red-600',
                    )}
                  >
                    {row.purchasingPowerDelta >= 0 ? '+' : ''}
                    {Math.round(row.purchasingPowerDelta).toLocaleString('nb-NO')} {TEXT.common.pts}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {formatPercent(row.purchasingPowerPercent)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">
                    {TEXT.views.table.columns.referenceGap}
                  </p>
                  <div className="font-semibold text-[var(--text-main)]">
                    {row.reference
                      ? renderReferenceGap(
                          row.reference.gap ?? null,
                          row.reference.gapPercent ?? null,
                        )
                      : TEXT.common.noData}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
