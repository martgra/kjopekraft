'use client'

import { useMemo, useState } from 'react'
import LoadingSpinner from '@/components/ui/common/LoadingSpinner'
import { buildSalaryTableRows, type PayPoint, type SalaryDataPoint } from '@/domain/salary'
import { calculateNetIncome } from '@/domain/tax'
import type { ReferenceDataPoint } from '@/domain/reference'
import { TEXT } from '@/lib/constants/text'
import type { SalaryTableRow } from '@/domain/salary'
import { SalaryTableDesktop } from './SalaryTableDesktop'
import { SalaryTableMobile } from './SalaryTableMobile'

interface SalaryTableViewProps {
  salaryData: SalaryDataPoint[]
  payPoints?: PayPoint[]
  referenceData?: ReferenceDataPoint[]
  isNetMode: boolean
  isLoading?: boolean
  powerMode?: 'absolute' | 'percent'
  onRequestAdd?: () => void
  onEditPayPoint?: (point: PayPoint) => void
  onRemovePayPoint?: (year: number, pay: number) => void
}

export function SalaryTableView({
  salaryData,
  payPoints = [],
  referenceData = [],
  isNetMode,
  isLoading = false,
  powerMode = 'percent',
  onRequestAdd,
  onEditPayPoint,
  onRemovePayPoint,
}: SalaryTableViewProps) {
  const [expandedYear, setExpandedYear] = useState<number | null>(null)

  const transformPay = useMemo(
    () =>
      isNetMode ? (value: number, year: number) => calculateNetIncome(value, year) : undefined,
    [isNetMode],
  )

  const rows: SalaryTableRow[] = useMemo(
    () =>
      buildSalaryTableRows({
        salaryData,
        referenceData,
        transformPay,
      }),
    [salaryData, referenceData, transformPay],
  )

  // Sorted helpers
  const ascendingRows = useMemo(() => [...rows].sort((a, b) => a.year - b.year), [rows])
  const baselineYear = ascendingRows[0]?.year ?? null
  const positivePowerYears = rows.filter(r => r.purchasingPowerDelta > 0).length
  const totalYears = rows.length

  const payPointByYear = useMemo(
    () => new Map<number, PayPoint>(payPoints.map(point => [point.year, point])),
    [payPoints],
  )

  const toggleExpansion = (year: number) =>
    setExpandedYear(current => (current === year ? null : year))

  if (isLoading) {
    return <LoadingSpinner text={TEXT.common.loadingChart} />
  }

  if (!rows.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] p-6 text-center">
        <p className="text-sm text-[var(--text-muted)]">{TEXT.dashboard.noDataSubtitle}</p>
        {onRequestAdd && (
          <button
            type="button"
            onClick={onRequestAdd}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
          >
            {TEXT.forms.logSalaryPoint}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4" data-testid="salary-table-view">
      <SalaryTableDesktop
        rows={rows}
        payPointByYear={payPointByYear}
        isNetMode={isNetMode}
        expandedYear={expandedYear}
        baselineYear={baselineYear}
        onToggleExpansion={toggleExpansion}
        powerMode={powerMode}
        positivePowerYears={positivePowerYears}
        totalYears={totalYears}
        _onEditPayPoint={onEditPayPoint}
        _onRemovePayPoint={onRemovePayPoint}
      />
      <SalaryTableMobile
        rows={rows}
        payPointByYear={payPointByYear}
        expandedYear={expandedYear}
        baselineYear={baselineYear}
        onToggleExpansion={toggleExpansion}
        powerMode={powerMode}
        positivePowerYears={positivePowerYears}
        totalYears={totalYears}
        onEditPayPoint={onEditPayPoint}
        onRemovePayPoint={onRemovePayPoint}
      />
    </div>
  )
}
