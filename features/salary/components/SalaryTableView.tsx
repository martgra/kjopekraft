'use client'

import { useMemo } from 'react'
import { Badge } from '@/components/ui/atoms'
import LoadingSpinner from '@/components/ui/common/LoadingSpinner'
import { buildSalaryTableRows, type PayPoint, type SalaryDataPoint } from '@/domain/salary'
import { calculateNetIncome } from '@/domain/tax'
import type { ReferenceDataPoint } from '@/domain/reference'
import { TEXT } from '@/lib/constants/text'
import { cn } from '@/lib/utils/cn'

interface SalaryTableViewProps {
  salaryData: SalaryDataPoint[]
  payPoints?: PayPoint[]
  referenceData?: ReferenceDataPoint[]
  isNetMode: boolean
  isLoading?: boolean
}

const formatCurrency = (value: number | null) =>
  value === null ? TEXT.common.noData : Math.round(value).toLocaleString('nb-NO')

const formatPercent = (value: number | null) =>
  value === null ? '' : `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`

export function SalaryTableView({
  salaryData,
  payPoints = [],
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

  const formatCurrencyWithUnit = (value: number | null) =>
    value === null ? TEXT.common.noData : `${formatCurrency(value)} ${TEXT.common.pts}`

  // Show latest year first for easier scanning
  const displayRows = useMemo(() => [...rows].sort((a, b) => b.year - a.year), [rows])
  const ascendingRows = useMemo(() => [...rows].sort((a, b) => a.year - b.year), [rows])
  const previousRowByYear = useMemo(() => {
    const map = new Map<number, (typeof ascendingRows)[number]>()
    ascendingRows.forEach((row, index) => {
      if (index === 0) return
      const previous = ascendingRows[index - 1]
      if (previous) {
        map.set(row.year, previous)
      }
    })
    return map
  }, [ascendingRows])

  const payPointByYear = useMemo(
    () => new Map<number, PayPoint>(payPoints.map(point => [point.year, point])),
    [payPoints],
  )

  const formatDate = (year: number) => String(year)

  const formatRelativeYear = (year: number) => {
    const currentYear = new Date().getFullYear()
    const diff = currentYear - year
    if (diff === 0) return TEXT.activity.thisYear
    if (diff === 1) return TEXT.activity.lastYear
    return TEXT.activity.yearsAgo(diff)
  }

  const reasonToLabel = (reason: PayPoint['reason'] | undefined) =>
    reason ? TEXT.activity.reasons[reason] : ''

  const reasonVariant = (reason: PayPoint['reason'] | undefined) => {
    if (reason === 'newJob') return 'info'
    if (reason === 'promotion') return 'primary'
    if (reason === 'adjustment') return 'default'
    return 'default'
  }

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

  return (
    <div className="flex h-full flex-col gap-4" data-testid="salary-table-view">
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-[var(--border-light)] bg-[var(--surface-light)] shadow-sm md:block">
        <table className="min-w-full border-separate border-spacing-0 text-sm text-[var(--text-main)]">
          <thead className="bg-[var(--color-gray-50)] text-left text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase">
            <tr>
              <th className="px-5 py-4">{TEXT.views.table.columns.date}</th>
              <th className="px-5 py-4">{TEXT.views.table.columns.event}</th>
              <th className="px-5 py-4">
                {isNetMode ? TEXT.views.table.columns.netSalary : TEXT.views.table.columns.salary}
              </th>
              <th className="px-5 py-4">{TEXT.views.table.columns.yoyChange}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-light)] bg-white">
            {displayRows.map(row => {
              const isPositiveYoY = (row.yoyAbsoluteChange ?? 0) >= 0
              const point = payPointByYear.get(row.year)
              const previousRow = previousRowByYear.get(row.year)
              const prevInflationAdjusted = previousRow?.inflationAdjusted ?? null
              const inflationGap =
                prevInflationAdjusted !== null ? row.salary - prevInflationAdjusted : null
              const inflationGapPercent =
                prevInflationAdjusted && prevInflationAdjusted !== 0
                  ? (inflationGap! / prevInflationAdjusted) * 100
                  : null

              return (
                <tr key={row.year} className="hover:bg-[var(--color-gray-50)]/60">
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
                    {point?.reason ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge size="sm" variant={reasonVariant(point.reason)}>
                          {reasonToLabel(point.reason)}
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
                        {isNetMode
                          ? TEXT.views.table.columns.netSalary
                          : TEXT.views.table.columns.salary}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-col gap-1">
                      {row.yoyAbsoluteChange === null ? (
                        <span className="text-sm text-[var(--text-muted)]">&nbsp;</span>
                      ) : (
                        <>
                          <span
                            className={cn(
                              'text-base font-semibold tabular-nums',
                              isPositiveYoY ? 'text-[var(--primary)]' : 'text-red-600',
                            )}
                          >
                            {`${isPositiveYoY ? '+' : ''}${Math.round(row.yoyAbsoluteChange).toLocaleString('nb-NO')} ${TEXT.common.pts}`}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">
                            {formatPercent(row.yoyPercentChange)}
                          </span>
                          <div className="flex flex-wrap items-center gap-1 text-xs text-[var(--text-muted)]">
                            <span>{TEXT.views.table.inflationVsPrev}:</span>
                            <span
                              className={cn(
                                'font-semibold tabular-nums',
                                (inflationGap ?? 0) >= 0 ? 'text-[var(--primary)]' : 'text-red-600',
                              )}
                            >
                              {inflationGap === null
                                ? ''
                                : `${inflationGap >= 0 ? '+' : ''}${Math.round(inflationGap).toLocaleString('nb-NO')} ${TEXT.common.pts}`}
                            </span>
                            <span>{formatPercent(inflationGapPercent)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {displayRows.map(row => {
          const isPositiveYoY = (row.yoyAbsoluteChange ?? 0) >= 0
          const point = payPointByYear.get(row.year)
          const previousRow = previousRowByYear.get(row.year)
          const prevInflationAdjusted = previousRow?.inflationAdjusted ?? null
          const inflationGap =
            prevInflationAdjusted !== null ? row.salary - prevInflationAdjusted : null
          const inflationGapPercent =
            prevInflationAdjusted && prevInflationAdjusted !== 0
              ? (inflationGap! / prevInflationAdjusted) * 100
              : null

          return (
            <div
              key={row.year}
              className="rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[var(--text-main)]">
                    {formatDate(row.year)}
                  </p>
                  {row.isInterpolated && (
                    <Badge size="sm" variant="info">
                      {TEXT.views.table.interpolated}
                    </Badge>
                  )}
                </div>
                <span className="text-[11px] font-semibold tracking-wide text-[var(--text-muted)] uppercase">
                  {formatRelativeYear(row.year)}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-xs font-medium tracking-wide text-[var(--text-muted)] uppercase">
                    {TEXT.views.table.columns.event}
                  </p>
                  {point?.reason ? (
                    <Badge size="sm" variant={reasonVariant(point.reason)} withRing={false}>
                      {reasonToLabel(point.reason)}
                    </Badge>
                  ) : (
                    <span className="text-xs text-[var(--text-muted)]">&nbsp;</span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium tracking-wide text-[var(--text-muted)] uppercase">
                    {isNetMode
                      ? TEXT.views.table.columns.netSalary
                      : TEXT.views.table.columns.salary}
                  </p>
                  <p className="text-base font-semibold text-[var(--text-main)] tabular-nums">
                    {formatCurrencyWithUnit(row.salary)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium tracking-wide text-[var(--text-muted)] uppercase">
                    {TEXT.views.table.columns.yoyChange}
                  </p>
                  <p
                    className={cn(
                      'text-base font-semibold tabular-nums',
                      isPositiveYoY ? 'text-[var(--primary)]' : 'text-red-600',
                    )}
                  >
                    {row.yoyAbsoluteChange === null
                      ? ''
                      : `${isPositiveYoY ? '+' : ''}${Math.round(row.yoyAbsoluteChange).toLocaleString('nb-NO')} ${TEXT.common.pts}`}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {formatPercent(row.yoyPercentChange)}
                  </p>
                  {row.yoyAbsoluteChange !== null ? (
                    <div className="flex flex-wrap items-center gap-1 text-[11px] text-[var(--text-muted)]">
                      <span>{TEXT.views.table.inflationVsPrev}:</span>
                      <span
                        className={cn(
                          'font-semibold tabular-nums',
                          (inflationGap ?? 0) >= 0 ? 'text-[var(--primary)]' : 'text-red-600',
                        )}
                      >
                        {inflationGap === null
                          ? ''
                          : `${inflationGap >= 0 ? '+' : ''}${Math.round(inflationGap).toLocaleString('nb-NO')} ${TEXT.common.pts}`}
                      </span>
                      <span>{formatPercent(inflationGapPercent)}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-[var(--text-muted)]">&nbsp;</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
