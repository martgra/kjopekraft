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
}

export function SalaryTableView({
  salaryData,
  payPoints = [],
  referenceData = [],
  isNetMode,
  isLoading = false,
  powerMode = 'percent',
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
      <div className="flex h-full items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] p-6 text-sm text-[var(--text-muted)]">
        {TEXT.dashboard.noDataSubtitle}
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
      />
    </div>
  )
}
