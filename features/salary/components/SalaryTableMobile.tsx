import { useMemo } from 'react'
import type { PayPoint } from '@/domain/salary'
import type { SalaryTableRow } from '@/domain/salary'
import { SalaryTableRowMobile } from './SalaryTableRowMobile'

interface SalaryTableMobileProps {
  rows: SalaryTableRow[]
  payPointByYear: Map<number, PayPoint>
  expandedYear: number | null
  baselineYear: number | null
  onToggleExpansion: (year: number) => void
  powerMode?: 'absolute' | 'percent'
}

export function SalaryTableMobile({
  rows,
  payPointByYear,
  expandedYear,
  baselineYear,
  onToggleExpansion,
  powerMode = 'percent',
}: SalaryTableMobileProps) {
  const displayRows = useMemo(() => [...rows].sort((a, b) => b.year - a.year), [rows])

  return (
    <div className="grid gap-3 md:hidden">
      {displayRows.map(row => {
        const payPoint = payPointByYear.get(row.year)
        const isExpanded = expandedYear === row.year

        return (
          <SalaryTableRowMobile
            key={row.year}
            row={row}
            payPoint={payPoint}
            baselineYear={baselineYear}
            isExpanded={isExpanded}
            onToggle={() => onToggleExpansion(row.year)}
            powerMode={powerMode}
          />
        )
      })}
    </div>
  )
}
