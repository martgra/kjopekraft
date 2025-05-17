'use client'

import { TEXT } from '@/lib/constants/text'

interface StatsCardProps {
  label: string
  value: number | string
}

function StatsCard({ label, value }: StatsCardProps) {
  // Format the value based on its type and value
  const formattedValue = (() => {
    if (value === '--' || value === undefined || value === null) return '--'
    if (typeof value === 'number') {
      if (isNaN(value)) return '--'
      return value.toLocaleString('nb-NO')
    }
    return value
  })()

  return (
    <div className="stat-card flex h-full flex-col rounded-xl bg-white p-3 shadow-md sm:p-4">
      <h3 className="mb-1 text-xs font-medium text-gray-500 sm:text-sm">{label}</h3>
      <div className="flex h-7 items-center sm:h-8">
        <p className="truncate text-lg font-semibold text-gray-900 sm:text-xl">{formattedValue}</p>
      </div>
    </div>
  )
}

interface SalaryStatsProps {
  startingPay: number | string
  latestPay: number | string
  inflationAdjustedPay: number | string
  gapPercent: number | string
}

export default function SalaryStats({
  startingPay,
  latestPay,
  inflationAdjustedPay,
  gapPercent,
}: SalaryStatsProps) {
  const cards = [
    { label: TEXT.stats.startingSalary, value: startingPay },
    { label: TEXT.stats.currentSalary, value: latestPay },
    { label: TEXT.stats.inflationAdjusted, value: inflationAdjustedPay },
    { label: TEXT.stats.gap, value: gapPercent },
  ]

  return (
    <div className="grid w-full max-w-5xl grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 md:gap-4">
      {cards.map(({ label, value }) => (
        <StatsCard key={label} label={label} value={value} />
      ))}
    </div>
  )
}
