import { useMemo } from 'react'
import type { PayPoint } from '@/domain/salary'
import type { SalaryTableRow } from '@/domain/salary'
import { TEXT } from '@/lib/constants/text'
import { SalaryTableRowDesktop } from './SalaryTableRowDesktop'

interface SalaryTableDesktopProps {
  rows: SalaryTableRow[]
  payPointByYear: Map<number, PayPoint>
  isNetMode: boolean
  expandedYear: number | null
  baselineYear: number | null
  onToggleExpansion: (year: number) => void
  powerMode?: 'absolute' | 'percent'
  positivePowerYears?: number
  totalYears?: number
  onEditPayPoint?: (point: PayPoint) => void
  onRemovePayPoint?: (year: number, pay: number) => void
}

export function SalaryTableDesktop({
  rows,
  payPointByYear,
  isNetMode,
  expandedYear,
  baselineYear,
  onToggleExpansion,
  powerMode = 'percent',
  positivePowerYears,
  totalYears,
  onEditPayPoint,
  onRemovePayPoint,
}: SalaryTableDesktopProps) {
  const displayRows = useMemo(() => [...rows].sort((a, b) => b.year - a.year), [rows])

  return (
    <div className="hidden overflow-hidden rounded-xl border border-[var(--border-light)] bg-[var(--surface-light)] shadow-sm md:block">
      <table className="min-w-full border-separate border-spacing-0 text-sm text-[var(--text-main)]">
        <thead className="bg-[var(--color-gray-50)] text-left text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase">
          <tr>
            <th className="px-5 py-4">{TEXT.views.table.columns.date}</th>
            <th className="px-5 py-4">{TEXT.views.table.columns.event}</th>
            <th className="px-5 py-4">
              {isNetMode ? TEXT.views.table.columns.netSalary : TEXT.views.table.columns.salary}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-light)] bg-[var(--surface-light)]">
          {displayRows.map(row => {
            const payPoint = payPointByYear.get(row.year)
            return (
              <SalaryTableRowDesktop
                key={row.year}
                row={row}
                payPoint={payPoint}
                baselineYear={baselineYear}
                isExpanded={expandedYear === row.year}
                onToggle={() => onToggleExpansion(row.year)}
                powerMode={powerMode}
                positivePowerYears={positivePowerYears}
                totalYears={totalYears}
              />
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
