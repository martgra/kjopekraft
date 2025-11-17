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
  const stats = [
    {
      key: 'startingPay',
      label: TEXT.stats.startingPay,
      value: typeof startingPay === 'number' ? startingPay.toLocaleString('nb-NO') : startingPay,
    },
    {
      key: 'latestPay',
      label: TEXT.stats.latestPay,
      value: typeof latestPay === 'number' ? latestPay.toLocaleString('nb-NO') : latestPay,
    },
    {
      key: 'inflationAdjustedPay',
      label: TEXT.stats.inflationAdjustedPay,
      value:
        typeof inflationAdjustedPay === 'number'
          ? inflationAdjustedPay.toLocaleString('nb-NO')
          : inflationAdjustedPay,
    },
    {
      key: 'gapPercent',
      label: TEXT.stats.gapPercent,
      value: typeof gapPercent === 'number' ? `${gapPercent.toFixed(1)}%` : gapPercent,
    },
  ]

  return (
    <dl className="grid w-full grid-cols-2 gap-4 text-center md:grid-cols-4 md:gap-6">
      {stats.map(({ key, label, value }) => (
        <div
          key={key}
          className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:p-5"
        >
          <dt className="text-xs font-medium text-neutral-600 sm:text-sm">{label}</dt>
          <dd className="mt-2 text-xl font-bold text-neutral-900 sm:text-2xl">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
