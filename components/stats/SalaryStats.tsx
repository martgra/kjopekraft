// components/stats/SalaryStats.tsx
'use client'

import React from 'react'
import { TEXT } from '@/lib/constants/text'

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
  // Build a list of the stats with explicit keys
  const stats = [
    {
      key: 'startingPay',
      label: TEXT.stats.startingPay, // updated
      value: typeof startingPay === 'number' ? startingPay.toLocaleString('nb-NO') : startingPay,
    },
    {
      key: 'latestPay',
      label: TEXT.stats.latestPay, // updated
      value: typeof latestPay === 'number' ? latestPay.toLocaleString('nb-NO') : latestPay,
    },
    {
      key: 'inflationAdjustedPay',
      label: TEXT.stats.inflationAdjustedPay, // updated
      value:
        typeof inflationAdjustedPay === 'number'
          ? inflationAdjustedPay.toLocaleString('nb-NO')
          : inflationAdjustedPay,
    },
    {
      key: 'gapPercent',
      label: TEXT.stats.gapPercent, // updated
      value: typeof gapPercent === 'number' ? `${gapPercent.toFixed(1)}%` : gapPercent,
    },
  ]

  return (
    <dl className="grid grid-cols-2 gap-6 text-center">
      {stats.map(({ key, label, value }) => (
        <div key={key} className="rounded-lg bg-white p-4 shadow">
          <dt className="text-sm font-medium text-gray-500">{label}</dt>
          <dd className="mt-1 text-xl font-semibold text-gray-900">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
